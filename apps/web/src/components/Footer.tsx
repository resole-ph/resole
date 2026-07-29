// components/Footer.tsx
'use client';

import Link from "next/link";

const COLORS = {
  primary: "#2563EB",
  border: "#E5E7EB",
  textMuted: "#6B7280",
  textFaint: "#9CA3AF",
} as const;

export default function Footer() {
  return (
    <footer style={{ background: "#F3F4F5", borderTop: `1px solid ${COLORS.border}`, padding: "32px 24px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <Link href="/" style={{ fontWeight: 800, fontSize: 17, color: COLORS.primary, textDecoration: "none" }}>
            Resole
          </Link>
          <p style={{ fontSize: 12, color: COLORS.textFaint, margin: "6px 0 0", maxWidth: 280, lineHeight: 1.5 }}>
            © 2026 Resole Sneaker Marketplace. Circular commerce for a better planet. Authenticating the world's most desired kicks.
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 48, fontSize: 13 }}>
          {/* Platform Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Platform
            </span>
            <Link href="/sustainability" style={{ color: COLORS.textMuted, textDecoration: "none" }}>
              Sustainability Mission
            </Link>
            <Link href="/ai-valuation" style={{ color: COLORS.textMuted, textDecoration: "none" }}>
              AI Valuation Info
            </Link>
          </div>

          {/* Support Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.textFaint, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Support
            </span>
            <Link href="/terms" style={{ color: COLORS.primary, textDecoration: "none" }}>
              Seller Terms
            </Link>
            <Link href="/privacy" style={{ color: COLORS.primary, textDecoration: "none" }}>
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}