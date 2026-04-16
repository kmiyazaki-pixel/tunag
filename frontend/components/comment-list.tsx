"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Comment = {
  id: number;
  post_id: number;
  author: string;
  body: string;
  created_at: string | null;
  author_profile_id?: string | null;
};

type MyProfile = {
  id: string;
  role: "member" | "editor" | "admin";
};

type Props = {
  comments: Comment[];
};

function formatDate(value: string | null) {
  if (!value) return "日時未設定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return date.toLocaleString("ja-JP");
}

export default function CommentList({ comments }: Props) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
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
        .select("id,role")
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

  function canManage(comment: Comment) {
    if (!profile) return false;
    if (profile.role === "admin" || profile.role === "editor") return true;
    return !!comment.author_profile_id && comment.author_profile_id === profile.id;
  }

  function startEdit(comment: Comment) {
    setEditingId(comment.id);
    setEditBody(comment.body);
    setMessage(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  async function saveEdit(commentId: number) {
    if (!editBody.trim()) {
      setMessage("コメント本文を入力してください。");
      return;
    }

    setLoadingId(commentId);
    setMessage(null);

    const { error } = await supabase
      .from("post_comments")
      .update({
        body: editBody.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    setLoadingId(null);

    if (error) {
      setMessage(`コメント更新に失敗しました: ${error.message}`);
      return;
    }

    setEditingId(null);
    setEditBody("");
    setMessage("コメントを更新しました。");
    router.refresh();
  }

  async function deleteComment(commentId: number) {
    const ok = window.confirm("このコメントを削除します。よろしいですか？");
    if (!ok) return;

    setLoadingId(commentId);
    setMessage(null);

    const { error } = await supabase
      .from("post_comments")
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    setLoadingId(null);

    if (error) {
      setMessage(`コメント削除に失敗しました: ${error.message}`);
      return;
    }

    setMessage("コメントを削除しました。");
    router.refresh();
  }

  if (comments.length === 0) {
    return <p style={styles.empty}>コメントはまだありません。</p>;
  }

  return (
    <div style={styles.wrapper}>
      {!loadingProfile && !profile ? (
        <div style={styles.loginBox}>
          コメント編集・削除にはログインが必要です。{" "}
          <Link href="/login" style={styles.link}>
            ログインする
          </Link>
        </div>
      ) : null}

      {comments.map((comment) => {
        const isEditing = editingId === comment.id;
        const isLoading = loadingId === comment.id;
        const manageable = canManage(comment);

        return (
          <div key={comment.id} style={styles.commentItem}>
            <div style={styles.commentHead}>
              <strong>{comment.author}</strong>
              <span>{formatDate(comment.created_at)}</span>
            </div>

            {isEditing ? (
              <div style={styles.editArea}>
                <textarea
                  style={styles.textarea}
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={4}
                />
                <div style={styles.buttonRow}>
                  <button type="button" style={styles.secondaryButton} onClick={cancelEdit} disabled={isLoading}>
                    キャンセル
                  </button>
                  <button type="button" style={styles.primaryButton} onClick={() => saveEdit(comment.id)} disabled={isLoading}>
                    {isLoading ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={styles.commentBody}>{comment.body}</p>
                {manageable ? (
                  <div style={styles.actionRow}>
                    <button type="button" style={styles.secondaryButton} onClick={() => startEdit(comment)} disabled={isLoading}>
                      編集
                    </button>
                    <button type="button" style={styles.deleteButton} onClick={() => deleteComment(comment.id)} disabled={isLoading}>
                      {isLoading ? "削除中..." : "削除"}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        );
      })}

      {message ? <p style={styles.message}>{message}</p> : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "grid",
    gap: "12px",
  },
  commentItem: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "14px 16px",
  },
  commentHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#444",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  commentBody: {
    margin: 0,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  editArea: {
    display: "grid",
    gap: "10px",
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
  actionRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  primaryButton: {
    background: "#111827",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    background: "#fff",
    color: "#111",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
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
  empty: {
    color: "#666",
    margin: 0,
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
