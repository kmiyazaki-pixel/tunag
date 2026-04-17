"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type UserInfo = {
  email: string | null;
  name: string | null;
};

export default function AuthStatus() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data, error } = await supabase.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        setUserInfo(null);
        setLoading(false);
        return;
      }

      setUserInfo({
        email: data.user.email ?? null,
        name: (data.user.user_metadata?.name as string | undefined) ?? null,
      });
      setLoading(false);
    }

    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) {
    return <div style={styles.loading}>読み込み中...</div>;
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div style={styles.row}>
      <div style={styles.userChip}>
        <span style={styles.dot} />
        {userInfo.name || userInfo.email || "ログイン中"}
      </div>
      <button type="button" onClick={handleLogout} style={styles.logoutButton}>
        ログアウト
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  row: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
    color: "#166534",
    padding: "10px 14px",
    borderRadius: "999px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(16, 185, 129, 0.14)",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "999px",
    background: "#10b981",
    display: "inline-block",
  },
  logoutButton: {
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(99, 102, 241, 0.22)",
  },
  loading: {
    background: "#fff",
    color: "#394067",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 700,
  },
};
