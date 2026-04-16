"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim() || email.trim().split("@")[0],
            },
          },
        });

        if (error) throw error;

        setMessage("登録しました。確認メールが必要な設定ならメールを確認してください。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        router.refresh();
        router.push("/");
      }
    } catch (err) {
      const text = err instanceof Error ? err.message : "認証に失敗しました。";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>
        </div>

        <h1 style={styles.title}>{mode === "login" ? "ログイン" : "新規登録"}</h1>
        <p style={styles.subtitle}>
          {mode === "login"
            ? "ログインするとコメント・既読・いいねができます。"
            : "登録後、必要なら admin 権限を付けて使います。"}
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {mode === "signup" ? (
            <label style={styles.label}>
              <span>表示名</span>
              <input
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="山田太郎"
              />
            </label>
          ) : null}

          <label style={styles.label}>
            <span>メールアドレス</span>
            <input
              type="email"
              style={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </label>

          <label style={styles.label}>
            <span>パスワード</span>
            <input
              type="password"
              style={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </label>

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "処理中..." : mode === "login" ? "ログイン" : "登録する"}
          </button>

          {message ? <p style={styles.message}>{message}</p> : null}
        </form>

        <div style={styles.switchRow}>
          <button
            type="button"
            style={styles.linkButton}
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setMessage(null);
            }}
          >
            {mode === "login" ? "新規登録へ切り替える" : "ログインへ切り替える"}
          </button>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: "#f5f7fb",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  topRow: {
    marginBottom: "12px",
  },
  backLink: {
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: 700,
  },
  title: {
    margin: "0 0 8px",
    fontSize: "30px",
  },
  subtitle: {
    margin: "0 0 20px",
    color: "#666",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  primaryButton: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 16px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    margin: 0,
    background: "#f3f4f6",
    padding: "12px 14px",
    borderRadius: "10px",
  },
  switchRow: {
    marginTop: "16px",
  },
  linkButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    color: "#2563eb",
    fontWeight: 700,
    cursor: "pointer",
  },
};
