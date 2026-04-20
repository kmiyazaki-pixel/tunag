"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toJapaneseErrorMessage } from "@/lib/error-message";
import { writeAuditLog } from "@/lib/audit-log";

function isValidPassword(password: string) {
  return /^[A-Za-z0-9]{6,}$/.test(password);
}

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
        if (!isValidPassword(password)) {
          setMessage("パスワードは6文字以上の半角英数字で入力してください。");
          setLoading(false);
          return;
        }

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

        setMessage("登録しました。確認メールが必要な設定の場合はメールをご確認ください。");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        await writeAuditLog({
          action: "login",
          targetType: "auth",
          detail: {
            email: email.trim(),
          },
        });

        router.refresh();
        router.push("/");
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "認証に失敗しました。";
      setMessage(toJapaneseErrorMessage(raw));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.main}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <div style={styles.card}>
        <div style={styles.kicker}>{mode === "login" ? "LOGIN" : "SIGN UP"}</div>
        <h1 style={styles.title}>{mode === "login" ? "ログイン" : "新規登録"}</h1>
        <p style={styles.subtitle}>
          {mode === "login"
            ? "メールアドレスとパスワードでログインします。"
            : "表示名・メールアドレス・パスワードを入力してください。"}
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
              placeholder="6文字以上の半角英数字"
            />
          </label>

          {mode === "signup" ? (
            <div style={styles.ruleBox}>パスワードは6文字以上の半角英数字で入力してください。</div>
          ) : null}

          <button type="submit" style={styles.primaryButton} disabled={loading}>
            {loading ? "処理中..." : mode === "login" ? "ログイン" : "登録する"}
          </button>

          {message ? <p style={styles.message}>{message}</p> : null}
        </form>

        <div style={styles.switchWrap}>
          <button
            type="button"
            style={styles.switchButton}
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
    background: "linear-gradient(180deg, #f8f7ff 0%, #eef4ff 100%)",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    top: "-70px",
    left: "-60px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(236, 72, 153, 0.12)",
  },
  bgCircle2: {
    position: "absolute",
    top: "120px",
    right: "-70px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
  },
  bgCircle3: {
    position: "absolute",
    bottom: "-80px",
    left: "35%",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.12)",
  },
  card: {
    width: "100%",
    maxWidth: "520px",
    background: "linear-gradient(180deg, #ffffff 0%, #fffafb 100%)",
    borderRadius: "28px",
    padding: "28px",
    boxShadow: "0 16px 34px rgba(91, 98, 133, 0.12)",
    border: "1px solid rgba(255,255,255,0.8)",
    position: "relative",
    zIndex: 1,
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
  title: {
    margin: "0 0 8px",
    fontSize: "34px",
    color: "#1f2340",
  },
  subtitle: {
    margin: "0 0 22px",
    color: "#5b6285",
    fontWeight: 700,
    lineHeight: 1.7,
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: 700,
    color: "#394067",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d8dcef",
    borderRadius: "14px",
    fontSize: "16px",
    boxSizing: "border-box",
    background: "#fff",
  },
  ruleBox: {
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    color: "#1d4ed8",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  primaryButton: {
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(99, 102, 241, 0.24)",
  },
  message: {
    margin: 0,
    color: "#1f2340",
    background: "#fff",
    padding: "12px 14px",
    borderRadius: "12px",
    boxShadow: "0 8px 18px rgba(91, 98, 133, 0.08)",
  },
  switchWrap: {
    marginTop: "18px",
  },
  switchButton: {
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    border: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    color: "#1d4ed8",
    fontWeight: 800,
    cursor: "pointer",
  },
};
