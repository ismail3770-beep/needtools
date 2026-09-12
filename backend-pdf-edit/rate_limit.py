"""
In-memory per-IP rate limiting middleware.

Why this exists
---------------
The /api/edit-pdf endpoint runs CPU-heavy PyMuPDF work. Without a gate, a
single script can saturate the dyno and run up the hosting bill. The
client-side limiter in src/lib/rateLimit.ts is a UX nicety only -- it is
trivially bypassed by calling the API directly, so the real gate lives here.

Design notes
------------
- Sliding window, kept in process memory. No Redis dependency.
- State is per-worker, so with multiple workers the effective limit scales with
  worker count. Acceptable for abuse prevention.
- Registered INSIDE CORSMiddleware (added before it in main.py) so that 429
  responses still carry CORS headers and the browser can read the message.

Tuning via env vars:
  RATE_LIMIT_MAX_REQUESTS     requests allowed per window per IP (default 20)
  RATE_LIMIT_WINDOW_SECONDS   window length in seconds (default 60)
  RATE_LIMIT_ENABLED          set to "false" to disable entirely
"""

import os
import time
from collections import deque
from threading import Lock
from typing import Deque, Dict

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

MAX_REQUESTS = int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "20"))
WINDOW_SECONDS = int(os.getenv("RATE_LIMIT_WINDOW_SECONDS", "60"))
ENABLED = os.getenv("RATE_LIMIT_ENABLED", "true").strip().lower() != "false"

EXEMPT_PATHS = {"/", "/docs", "/redoc", "/openapi.json", "/favicon.ico"}

_STALE_AFTER = WINDOW_SECONDS * 10


class _Store:
    """Thread-safe sliding-window counter keyed by client identifier."""

    def __init__(self) -> None:
        self._hits: Dict[str, Deque[float]] = {}
        self._lock = Lock()
        self._last_sweep = time.monotonic()

    def _sweep(self, now: float) -> None:
        if now - self._last_sweep < _STALE_AFTER:
            return
        self._last_sweep = now
        dead = [k for k, q in self._hits.items() if not q or now - q[-1] > _STALE_AFTER]
        for k in dead:
            self._hits.pop(k, None)

    def check(self, key: str) -> tuple[bool, int, int]:
        """Record a hit; returns (allowed, remaining, retry_after_seconds)."""
        now = time.monotonic()
        cutoff = now - WINDOW_SECONDS

        with self._lock:
            self._sweep(now)
            q = self._hits.setdefault(key, deque())

            while q and q[0] < cutoff:
                q.popleft()

            if len(q) >= MAX_REQUESTS:
                retry_after = max(1, int(WINDOW_SECONDS - (now - q[0])) + 1)
                return False, 0, retry_after

            q.append(now)
            return True, MAX_REQUESTS - len(q), 0


_store = _Store()


def _client_key(request: Request) -> str:
    """Left-most X-Forwarded-For entry is the original client behind the proxy."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        first = forwarded.split(",")[0].strip()
        if first:
            return first

    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip.strip()

    return request.client.host if request.client else "unknown"


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if not ENABLED or request.method == "OPTIONS" or request.url.path in EXEMPT_PATHS:
            return await call_next(request)

        allowed, remaining, retry_after = _store.check(_client_key(request))

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={
                    "detail": (
                        f"Too many requests. Limit is {MAX_REQUESTS} per "
                        f"{WINDOW_SECONDS} seconds. Try again in {retry_after}s."
                    )
                },
                headers={
                    "Retry-After": str(retry_after),
                    "X-RateLimit-Limit": str(MAX_REQUESTS),
                    "X-RateLimit-Remaining": "0",
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(MAX_REQUESTS)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
