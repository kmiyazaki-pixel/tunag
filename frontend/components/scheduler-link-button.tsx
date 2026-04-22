"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SCHEDULER_APP_URL =
  process.env.NEXT_PUBLIC_SCHEDULER_APP_URL || "https://vital-scheduler.vercel.app";

export default function SchedulerLinkButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    try {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token || !session?.refresh_token) {
        router.push("/login");
        return;
      }

      const bridgeUrl =
        `${SCHEDULER_APP_URL.replace(/\/$/, "")}/auth/bridge` +
        `#access_token=${encodeURIComponent(session.access_token)}` +
        `&refresh_token=${encodeURIComponent(session.refresh_token)}` +
        `&next=${encodeURIComponent("/calendar/month")}`;

      window.location.href = bridgeUrl;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={styles.button}
    >
      {loading ? "移動中..." : "スケジュール"}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    display: "inline-block",
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
    color: "#166534",
    border: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(16, 185, 129, 0.14)",
    cursor: "pointer",
  },
};
