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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setUserInfo(null);
        setLoading(false);
        return;
      }

      setUserInfo({
        email: session.user.email ?? null,
        name: (session.user.user_metadata?.name as string | undefined) ?? null,
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
    return <div style={styles.box}>読み込み中...</div>;
  }

  if (!userInfo) {
    return null;
  }

  return (
    <div style={styles.row}>
      <div style={styles.box}>{userInfo.name || userInfo.email || "ログイン中"}</div>
      <button type="button" onClick={handleLogout} style={styles.secondaryButton}>
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
  box: {
    background: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 700,
  },
  secondaryButton: {
    background: "#f3f4f6",
    color: "#111",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
};
