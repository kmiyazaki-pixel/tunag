"use client";

import { supabase } from "@/lib/supabase";

const SCHEDULER_APP_URL =
  process.env.NEXT_PUBLIC_SCHEDULER_APP_URL || "https://vital-scheduler.vercel.app";

type PortalSidebarProps = {
  onClose?: () => void;
};

export default function PortalSidebar({ onClose }: PortalSidebarProps) {
  async function handleSchedulerClick() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token || !session?.refresh_token) {
      window.location.href = "/login";
      return;
    }

    const bridgeUrl =
      `${SCHEDULER_APP_URL.replace(/\/$/, "")}/auth/bridge` +
      `#access_token=${encodeURIComponent(session.access_token)}` +
      `&refresh_token=${encodeURIComponent(session.refresh_token)}` +
      `&next=${encodeURIComponent("/calendar/month")}`;

    onClose?.();
    window.location.href = bridgeUrl;
  }

  return (
    <aside style={styles.sidebar}>
      <div>
        <div style={styles.kicker}>PORTAL</div>
        <div style={styles.brand}>社内ポータル</div>

        <nav style={styles.nav}>
          <button type="button" onClick={handleSchedulerClick} style={styles.navLinkOrange}>
            スケジュール
          </button>
        </nav>
      </div>
    </aside>
  );
}

const baseLink: React.CSSProperties = {
  display: "block",
  width: "220px",
  maxWidth: "100%",
  boxSizing: "border-box",
  textAlign: "left",
  textDecoration: "none",
  border: "none",
  padding: "14px 16px",
  borderRadius: "14px",
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(91, 98, 133, 0.08)",
  fontSize: "16px",
};

const styles: Record<string, React.CSSProperties> = {
  sidebar: {
    width: "240px",
    minWidth: "240px",
    minHeight: "100vh",
    padding: "20px 16px",
    background: "rgba(255,255,255,0.78)",
    backdropFilter: "blur(10px)",
    borderRight: "1px solid rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "20px",
    position: "relative",
    zIndex: 30,
  },
  kicker: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "12px",
  },
  brand: {
    fontSize: "18px",
    fontWeight: 800,
    color: "#1f2340",
    marginBottom: "16px",
  },
  nav: {
    display: "grid",
    gap: "12px",
  },
  navLinkOrange: {
    ...baseLink,
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    color: "#9a3412",
  },
};
