'use client';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function DownloadAppModal({
  isOpen,
  onClose,
  title = "Get the Resole App",
  description = "Making offers, proposing swaps, saving favorites, and managing listings are exclusive to the Resole Mobile App.",
}: DownloadAppModalProps) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 16,
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          padding: "32px 24px 24px",
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0px 20px 40px rgba(0,0,0,0.2)",
          position: "relative",
          animation: "fadeIn 0.2s ease-out",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#F3F4F6",
            border: "none",
            borderRadius: 9999,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#6B7280",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
        </button>

        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "#EFF6FF",
            color: "#2563EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>smartphone</span>
        </div>

        <h3 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 8px", color: "#191C1D" }}>
          {title}
        </h3>
        <p style={{ fontSize: 13.5, color: "#6B7280", margin: "0 0 24px", lineHeight: 1.5 }}>
          {description}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button
            onClick={() => {
              // TODO: Replace with your actual App Store / Play Store links
              window.open("https://resole.app", "_blank");
            }}
            style={{
              width: "100%",
              background: "#2563EB",
              color: "#FFFFFF",
              border: "none",
              borderRadius: 14,
              padding: "14px",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0px 4px 14px rgba(37,99,235,0.35)",
            }}
          >
            Download Mobile App
          </button>

          <button
            onClick={onClose}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              color: "#9CA3AF",
              padding: "8px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}