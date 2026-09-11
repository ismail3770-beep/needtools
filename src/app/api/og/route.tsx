import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "NeedTools";
    const desc =
      searchParams.get("desc") ||
      "100% Free & Private Online Utilities directly in your browser.";
    const category = searchParams.get("category") || "PDF Tools";
    const badge = searchParams.get("badge") || "100% Free & No Sign-up";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#0b0f19",
            backgroundImage:
              "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.05) 2%, transparent 0%), linear-gradient(135deg, #0b0f19 0%, #1e1b4b 60%, #311042 100%)",
            backgroundSize: "100px 100px, 100px 100px, 100% 100%",
            padding: "56px 64px",
            fontFamily: "system-ui, sans-serif",
            color: "#ffffff",
          }}
        >
          {/* Header with Brand and Category */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "26px",
                  fontWeight: "800",
                  color: "#ffffff",
                  boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
                }}
              >
                N
              </div>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: "800",
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                NeedTools<span style={{ color: "#818cf8" }}>.app</span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "999px",
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(129, 140, 248, 0.3)",
                color: "#c7d2fe",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              <span>{category}</span>
            </div>
          </div>

          {/* Central Title & Description */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              marginTop: "auto",
              marginBottom: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "6px 14px",
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(52, 211, 153, 0.4)",
                color: "#6ee7b7",
                fontSize: "16px",
                fontWeight: "700",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {badge}
            </div>

            <div
              style={{
                fontSize: title.length > 32 ? "52px" : "64px",
                fontWeight: "900",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                color: "#ffffff",
                textShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              {title}
            </div>

            <div
              style={{
                fontSize: "24px",
                color: "#94a3b8",
                maxWidth: "960px",
                lineHeight: 1.4,
              }}
            >
              {desc}
            </div>
          </div>

          {/* Bottom Social Proof & Value Props */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "24px",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#fbbf24", fontSize: "20px" }}>★★★★★</span>
                <span style={{ fontSize: "17px", fontWeight: "600", color: "#e2e8f0" }}>
                  4.9/5 Rating
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#34d399", fontSize: "18px" }}>✓</span>
                <span style={{ fontSize: "17px", fontWeight: "500", color: "#cbd5e1" }}>
                  100% Client-Side Privacy
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#38bdf8", fontSize: "18px" }}>⚡</span>
                <span style={{ fontSize: "17px", fontWeight: "500", color: "#cbd5e1" }}>
                  Instant & Zero Watermark
                </span>
              </div>
            </div>

            <div
              style={{
                fontSize: "17px",
                fontWeight: "700",
                color: "#a5b4fc",
              }}
            >
              needtools.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal Server Error";
    return new Response(`Failed to generate the image: ${message}`, {
      status: 500,
    });
  }
}
