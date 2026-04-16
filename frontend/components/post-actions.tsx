"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Props = {
  postId: number;
  initialReactionCount: number;
  initialReadCount: number;
};

type MyProfile = {
  id: string;
  name: string;
  role: "member" | "editor" | "admin";
};

export default function PostActions({
  postId,
  initialReactionCount,
  initialReadCount,
}: Props) {
  const router = useRouter();

  const [reactionCount, setReactionCount] = useState(initialReactionCount ?? 0);
  const [readCount] = useState(initialReadCount ?? 0);
  const [commentBody, setCommentBody] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingRead, setLoadingRead] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (!session?.user) {
        setProfile(null);
        setLoadingProfile(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id,name,role")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (!mounted) return;

      setProfile((data as MyProfile | null) ?? null);
      setLoadingProfile(false);
    }

    loadProfile();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const canSubmitComment = useMemo(() => {
    return !!profile && commentBody.trim() !== "";
  }, [profile, commentBody]);

  async function handleLike() {
    if (!profile) {
      setMessage("ログインしてください。");
      return;
    }
    if (loadingLike) return;

    setLoadingLike(true);
    setMessage(null);

    const { error } = await supabase.from("post_reactions").insert([
      {
        post_id: postId,
        reaction_type: "like",
        user_profile_id: profile.id,
      },
    ]);

    setLoadingLike(false);

    if (error) {
      setMessage(`いいねに失敗しました: ${error.message}`);
      return;
    }

    setReactionCount((prev) => prev + 1);
    setMessage("いいねしました。");
    router.refresh();
  }

  async function handleRead() {
    if (!profile) {
      setMessage("ログインしてください。");
      return;
    }
    if (loadingRead) return;

    setLoadingRead(true);
    setMessage(null);

    const { error } = await supabase.from("post_reads").upsert(
      [
        {
          post_id: postId,
          reader_name: profile.name,
          reader_profile_id: profile.id,
        },
      ],
      {
        onConflict: "post_id,reader_name",
      }
    );

    setLoadingRead(false);

    if (error) {
      setMessage(`既読登録に失敗しました: ${error.message}`);
      return;
    }

    setMessage("既読登録しました。");
    router.refresh();
  }

  async function handleCommentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!profile) {
      setMessage("ログインしてください。");
      return;
    }
    if (!canSubmitComment || loadingComment) return;

    setLoadingComment(true);
    setMessage(null);

    const { error } = await supabase.from("post_comments").insert([
      {
        post_id: postId,
        author: profile.name,
        author_profile_id: profile.id,
        body: commentBody.trim(),
      },
    ]);

    setLoadingComment(false);

    if (error) {
      setMessage(`コメント投稿に失敗しました: ${error.message}`);
      return;
    }

    setCommentBody("");
    setMessage("コメントを投稿しました。");
    router.refresh();
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.countRow}>
        <div style={styles.countCard}>
          <div style={styles.countLabel}>既読数</div>
          <div style={styles.countValue}>{readCount}</div>
        </div>
        <div style={styles.countCard}>
          <div style={styles.countLabel}>いいね数</div>
          <div style={styles.countValue}>{reactionCount}</div>
        </div>
      </div>

      {!loadingProfile && !profile ? (
        <div style={styles.loginBox}>
          アクションにはログインが必要です。{" "}
          <Link href="/login" style={styles.link}>
            ログインする
          </Link>
        </div>
      ) : null}

      <div style={styles.actionRow}>
        <button type="button" onClick={handleRead} disabled={loadingRead || !profile} style={styles.secondaryButton}>
          {loadingRead ? "登録中..." : "確認しました"}
        </button>

        <button type="button" onClick={handleLike} disabled={loadingLike || !profile} style={styles.primaryButton}>
          {loadingLike ? "送信中..." : "いいね"}
        </button>
      </div>

      <form onSubmit={handleCommentSubmit} style={styles.form}>
        <h3 style={styles.formTitle}>コメントを書く</h3>

        <label style={styles.label}>
          <span>コメント</span>
          <textarea
            style={styles.textarea}
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            placeholder={profile ? "コメントを入力してください" : "ログインするとコメントできます"}
            rows={5}
            disabled={!profile}
          />
        </label>

        <div style={styles.submitRow}>
          <button type="submit" disabled={!canSubmitComment || loadingComment} style={styles.primaryButton}>
            {loadingComment ? "投稿中..." : "コメントを投稿"}
          </button>
        </div>

        {message ? <p style={styles.message}>{message}</p> : null}
      </form>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "grid",
    gap: "20px",
  },
  countRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  countCard: {
    background: "#f9fafb",
    borderRadius: "14px",
    padding: "16px",
  },
  countLabel: {
    fontSize: "13px",
    color: "#666",
    marginBottom: "6px",
  },
  countValue: {
    fontSize: "24px",
    fontWeight: 700,
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  form: {
    display: "grid",
    gap: "14px",
    background: "#f9fafb",
    borderRadius: "16px",
    padding: "18px",
  },
  formTitle: {
    margin: 0,
    fontSize: "20px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: 600,
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  submitRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  primaryButton: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#fff",
    color: "#111",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    margin: 0,
    color: "#111",
    background: "#fff",
    padding: "12px 14px",
    borderRadius: "10px",
  },
  loginBox: {
    background: "#eef2ff",
    color: "#1e3a8a",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};
