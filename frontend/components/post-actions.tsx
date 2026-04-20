"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/use-auth-user";
import { toJapaneseErrorMessage } from "@/lib/error-message";
import { writeAuditLog } from "@/lib/audit-log";

type Props = {
  postId: number;
  initialReactionCount: number;
  initialReadCount: number;
};

export default function PostActions({
  postId,
  initialReactionCount,
  initialReadCount,
}: Props) {
  const router = useRouter();
  const { userInfo, loadingUser } = useAuthUser();

  const [reactionCount, setReactionCount] = useState(initialReactionCount ?? 0);
  const [readCount, setReadCount] = useState(initialReadCount ?? 0);
  const [commentBody, setCommentBody] = useState("");
  const [loadingLike, setLoadingLike] = useState(false);
  const [loadingRead, setLoadingRead] = useState(false);
  const [loadingComment, setLoadingComment] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const autoReadDoneRef = useRef(false);

  const canSubmitComment = useMemo(() => {
    return !!userInfo && commentBody.trim() !== "";
  }, [userInfo, commentBody]);

  async function registerRead(silent = false) {
    if (!userInfo) {
      if (!silent) setMessage("ログインしてください。");
      return false;
    }
    if (loadingRead) return false;

    setLoadingRead(true);
    if (!silent) setMessage(null);

    const { error } = await supabase.from("post_reads").upsert(
      [
        {
          post_id: postId,
          reader_name: userInfo.name,
        },
      ],
      {
        onConflict: "post_id,reader_name",
      }
    );

    setLoadingRead(false);

    if (error) {
      if (!silent) {
        setMessage(`既読登録に失敗しました: ${toJapaneseErrorMessage(error.message)}`);
      }
      return false;
    }

    await writeAuditLog({
      action: "post_read",
      targetType: "post",
      targetId: postId,
      detail: {
        readerName: userInfo.name,
      },
    });

    setReadCount((prev) => prev + 1);
    if (!silent) {
      setMessage("既読登録しました。");
    }
    router.refresh();
    return true;
  }

  useEffect(() => {
    if (loadingUser) return;
    if (!userInfo) return;
    if (autoReadDoneRef.current) return;

    autoReadDoneRef.current = true;
    void registerRead(true);
  }, [loadingUser, userInfo, postId]);

  async function handleLike() {
    if (!userInfo) {
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
      },
    ]);

    setLoadingLike(false);

    if (error) {
      setMessage(`いいねに失敗しました: ${toJapaneseErrorMessage(error.message)}`);
      return;
    }

    await writeAuditLog({
      action: "post_like",
      targetType: "post",
      targetId: postId,
      detail: {
        reactionType: "like",
      },
    });

    setReactionCount((prev) => prev + 1);
    setMessage("いいねしました。");
    router.refresh();
  }

  async function handleRead() {
    await registerRead(false);
  }

  async function handleCommentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userInfo) {
      setMessage("ログインしてください。");
      return;
    }
    if (!canSubmitComment || loadingComment) return;

    setLoadingComment(true);
    setMessage(null);

    const bodyText = commentBody.trim();

    const { error } = await supabase.from("post_comments").insert([
      {
        post_id: postId,
        author: userInfo.name,
        body: bodyText,
      },
    ]);

    setLoadingComment(false);

    if (error) {
      setMessage(`コメント投稿に失敗しました: ${toJapaneseErrorMessage(error.message)}`);
      return;
    }

    await writeAuditLog({
      action: "comment_create",
      targetType: "post",
      targetId: postId,
      detail: {
        author: userInfo.name,
        body: bodyText,
      },
    });

    setCommentBody("");
    setMessage("コメントを投稿しました。");
    router.refresh();
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.countRow}>
        <div style={{ ...styles.countCard, ...styles.countBlue }}>
          <div style={styles.countLabel}>既読数</div>
          <div style={styles.countValue}>{readCount}</div>
        </div>
        <div style={{ ...styles.countCard, ...styles.countPink }}>
          <div style={styles.countLabel}>いいね数</div>
          <div style={styles.countValue}>{reactionCount}</div>
        </div>
      </div>

      {loadingUser ? <div style={styles.infoBox}>ログイン状態を確認中...</div> : null}

      {!loadingUser && !userInfo ? (
        <div style={styles.loginBox}>
          アクションにはログインが必要です。{" "}
          <Link href="/login" style={styles.link}>
            ログインする
          </Link>
        </div>
      ) : null}

      {!loadingUser && userInfo ? (
        <div style={styles.currentUserBox}>ログイン中: {userInfo.name}</div>
      ) : null}

      <div style={styles.actionRow}>
        <button
          type="button"
          onClick={handleRead}
          disabled={loadingRead || !userInfo}
          style={styles.readButton}
        >
          {loadingRead ? "登録中..." : "確認しました"}
        </button>

        <button
          type="button"
          onClick={handleLike}
          disabled={loadingLike || !userInfo}
          style={styles.likeButton}
        >
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
            placeholder={userInfo ? "コメントを入力してください" : "ログインするとコメントできます"}
            rows={5}
            disabled={!userInfo}
          />
        </label>

        <div style={styles.submitRow}>
          <button
            type="submit"
            disabled={!canSubmitComment || loadingComment}
            style={styles.commentButton}
          >
            {loadingComment ? "投稿中..." : "コメントを投稿"}
          </button>
        </div>

        {message ? <p style={styles.message}>{message}</p> : null}
      </form>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "grid", gap: "20px" },
  countRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "12px",
  },
  countCard: {
    borderRadius: "18px",
    padding: "18px",
    boxShadow: "0 10px 24px rgba(91, 98, 133, 0.10)",
  },
  countBlue: {
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
  },
  countPink: {
    background: "linear-gradient(135deg, #fff0f5 0%, #ffe1ec 100%)",
  },
  countLabel: {
    fontSize: "13px",
    color: "#5b6285",
    marginBottom: "6px",
    fontWeight: 700,
  },
  countValue: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f2340",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  form: {
    display: "grid",
    gap: "14px",
    background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 12px 28px rgba(91, 98, 133, 0.10)",
  },
  formTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#1f2340",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: 700,
    color: "#394067",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d8dcef",
    borderRadius: "12px",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
  },
  submitRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  readButton: {
    background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(59, 130, 246, 0.22)",
  },
  likeButton: {
    background: "linear-gradient(90deg, #ec4899, #f43f5e)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(236, 72, 153, 0.22)",
  },
  commentButton: {
    background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(139, 92, 246, 0.22)",
  },
  message: {
    margin: 0,
    color: "#1f2340",
    background: "#fff",
    padding: "12px 14px",
    borderRadius: "12px",
  },
  loginBox: {
    background: "linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)",
    color: "#1e3a8a",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 800,
  },
  currentUserBox: {
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    color: "#9a3412",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 800,
  },
  infoBox: {
    background: "#f3f4f6",
    color: "#111",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
  },
};
