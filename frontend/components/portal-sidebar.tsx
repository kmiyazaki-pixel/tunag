"use client";

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

const SCHEDULER_APP_URL =
  process.env.NEXT_PUBLIC_SCHEDULER_APP_URL || "https://vital-scheduler.vercel.app";

type UserInfo = {
  name: string;
  email: string | null;
} | null;

type PortalSidebarProps = {
  mobileOpen?: boolean;
  onClose?: () => void;
};

export default function PortalSidebar({
  mobileOpen = false,
  onClose,
}: PortalSidebarProps) {
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setUserInfo(null);
        return;
      }

      const name =
        (user.user_metadata?.name as string | undefined)?.trim() ||
        user.email?.split("@")[0] ||
        "ユーザー";

      setUserInfo({
        name,
        email: user.email ?? null,
      });
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

    window.location.href = bridgeUrl;
  }

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <aside
      style={{
        ...styles.sidebar,
        ...(mobileOpen ? styles.sidebarMobileOpen : {}),
      }}
    >
      <div>
        <div style={styles.kicker}>PORTAL</div>
        <div style={styles.brand}>社内ポータル</div>

        <div style={styles.userCard}>
          ログイン中: {userInfo?.name || userInfo?.email || "ゲスト"}
        </div>

        <nav style={styles.nav}>
          <Link href="/admin/new" style={styles.navLinkBlue} onClick={onClose}>
            新規投稿
          </Link>

          <Link href="/admin/audit-logs" style={styles.navLinkGreen} onClick={onClose}>
            監査ログ
          </Link>

          <button
            type="button"
            onClick={async () => {
              onClose?.();
              await handleSchedulerClick();
            }}
            style={styles.navLinkOrange}
          >
            スケジュール
          </button>
        </nav>
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        style={loggingOut ? styles.logoutDisabled : styles.logoutButton}
      >
        {loggingOut ? "ログアウト中..." : "ログアウト"}
      </button>
    </aside>
  );
}

const baseLink: React.CSSProperties = {
  display: "block",
  width: "100%",
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
    width: "260px",
    minWidth: "260px",
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
  sidebarMobileOpen: {
    transform: "translateX(0)",
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
  userCard: {
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
    color: "#166534",
    padding: "14px 16px",
    borderRadius: "14px",
    fontWeight: 800,
    marginBottom: "20px",
  },
  nav: {
    display: "grid",
    gap: "12px",
  },
  navLinkBlue: {
    ...baseLink,
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    color: "#1d4ed8",
  },
  navLinkGreen: {
    ...baseLink,
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
    color: "#166534",
  },
  navLinkOrange: {
    ...baseLink,
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    color: "#9a3412",
  },
  logoutButton: {
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "14px 16px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(99, 102, 241, 0.22)",
    fontSize: "16px",
  },
  logoutDisabled: {
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    padding: "14px 16px",
    cursor: "not-allowed",
    fontWeight: 800,
    opacity: 0.6,
    fontSize: "16px",
  },
};
