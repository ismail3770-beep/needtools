import type { NextConfig } from "next";

/* 
  NOTE: Since we are using "output: 'export'" for Appwrite Hosting, 
  Next.js dynamic headers() won't work here.
  You should configure these security headers in Cloudflare or your Appwrite Dashboard:

  - X-Content-Type-Options: nosniff
  - X-Frame-Options: DENY
  - Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  - Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://www.googletagservices.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://pagead2.googlesyndication.com https://www.google.com; font-src 'self' data:; connect-src 'self' https://pagead2.googlesyndication.com; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
*/

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  reactStrictMode: true,
  poweredByHeader: false,
  // compress: true is not needed for static export, but we can leave it or remove it. 
  // It's ignored when output: 'export' is used.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
