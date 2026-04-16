"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  name: string;
  email: string | null;
  role: "member" | "editor" | "admin";
};

export default function AuthStatus() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id,name,email,role")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      setProfile((data as Profile | null) ?? null);
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

  if (!profile) {
    return (
      <div style={styles.row}>
        <Link href="/login" style={styles.primaryButton}>
          ログイン
        </Link>
      </div>
    );
  }

  return (
    <div style={styles.row}>
      <div style={styles.box}>
        {profile.name} / {profile.role}
      </div>
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
  primaryButton: {
    display: "inline-block",
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
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
