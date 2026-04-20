"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/use-auth-user";
import { toJapaneseErrorMessage } from "@/lib/error-message";
import { writeAuditLog } from "@/lib/audit-log";

type Comment = {
  id: number;
  post_id: number;
  author: string;
  body: string;
  created_at: string | null;
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
  const { userInfo, loadingUser } = useAuthUser();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editBody, setEditBody] = useState("");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function canManage(comment: Comment) {
    if (!userInfo) return false;
    return comment.author === userInfo.name;
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
    if (!userInfo) {
      setMessage("ログインしてください。");
      return;
    }

    if (!editBody.trim()) {
      setMessage("コメント本文を入力してください。");
      return;
    }

    setLoadingId(commentId);
    setMessage(null);

    const bodyText = editBody.trim();

    const { error } = await supabase
      .from("post_comments")
      .update({
        body: bodyText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId);

    setLoadingId(null);

    if (error) {
      setMessage(`コメント更新に失敗しました: ${toJapaneseErrorMessage(error.message)}`);
      return;
    }

    await writeAuditLog({
      action: "comment_update",
      targetType: "comment",
      targetId: commentId,
      detail: {
        body: bodyText,
      },
    });

    setEditingId(null);
    setEditBody("");
    setMessage("コメントを更新しました。");
    router.refresh();
  }

  async function deleteComment(commentId: number) {
    if (!userInfo) {
      setMessage("ログインしてください。");
      return;
    }

    const ok = window.confirm("このコメントを削除します。よろしいですか？");
    if (!ok) return;

    setLoadingId(commentId);
    setMessage(null);

    const { error } = await supabase.from("post_comments").delete().eq("id", commentId);

    setLoadingId(null);

    if (error) {
      setMessage(`コメント削除に失敗しました: ${toJapaneseErrorMessage(error.message)}`);
      return;
    }

    await writeAuditLog({
      action: "comment_delete",
      targetType: "comment",
      targetId: commentId,
    });

    setMessage("コメントを削除しました。");
    router.refresh();
  }

  if (comments.length === 0) {
    return <p style={styles.empty}>コメントはまだありません。</p>;
  }

  return (
    <div style={styles.wrapper}>
      {loadingUser ? <div style={styles.infoBox}>ログイン状態を確認中...</div> : null}

      {comments.map((comment, index) => {
        const isEditing = editingId === comment.id;
        const isLoading = loadingId === comment.id;
        const manageable = canManage(comment);

        const itemStyle =
          index % 4 === 0
            ? styles.commentPink
            : index % 4 === 1
            ? styles.commentBlue
            : index % 4 === 2
            ? styles.commentGreen
            : styles.commentYellow;

        return (
          <div key={comment.id} style={{ ...styles.commentItem, ...itemStyle }}>
            <div style={styles.commentHead}>
              <strong style={styles.author}>{comment.author}</strong>
              <span style={styles.date}>{formatDate(comment.created_at)}</span>
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
                  <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={cancelEdit}
                    disabled={isLoading}
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    style={styles.saveButton}
                    onClick={() => saveEdit(comment.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "保存中..." : "保存"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p style={styles.commentBody}>{comment.body}</p>
                {manageable ? (
                  <div style={styles.actionRow}>
                    <button
                      type="button"
                      style={styles.secondaryButton}
                      onClick={() => startEdit(comment)}
                      disabled={isLoading}
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      style={styles.deleteButton}
                      onClick={() => deleteComment(comment.id)}
                      disabled={isLoading}
                    >
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
    gap: "14px",
  },
  commentItem: {
    borderRadius: "18px",
    padding: "16px 18px",
    boxShadow: "0 10px 24px rgba(91, 98, 133, 0.10)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  commentPink: {
    background: "linear-gradient(180deg, #fff8fb 0%, #fdf2f8 100%)",
  },
  commentBlue: {
    background: "linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)",
  },
  commentGreen: {
    background: "linear-gradient(180deg, #f7fff9 0%, #ecfdf3 100%)",
  },
  commentYellow: {
    background: "linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%)",
  },
  commentHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "10px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  author: {
    color: "#1f2340",
    fontSize: "18px",
  },
  date: {
    color: "#5b6285",
    fontSize: "14px",
    fontWeight: 700,
  },
  commentBody: {
    margin: 0,
    lineHeight: 1.9,
    whiteSpace: "pre-wrap",
    color: "#2d335a",
    fontSize: "15px",
  },
  editArea: {
    display: "grid",
    gap: "10px",
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
  actionRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    marginTop: "14px",
    flexWrap: "wrap",
  },
  buttonRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  saveButton: {
    background: "linear-gradient(90deg, #8b5cf6, #6366f1)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(139, 92, 246, 0.22)",
  },
  secondaryButton: {
    background: "#fff",
    color: "#1f2340",
    border: "1px solid #d8dcef",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  deleteButton: {
    background: "linear-gradient(90deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 14px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(239, 68, 68, 0.22)",
  },
  message: {
    margin: 0,
    color: "#1f2340",
    background: "#fff",
    padding: "12px 14px",
    borderRadius: "12px",
    boxShadow: "0 8px 18px rgba(91, 98, 133, 0.08)",
  },
  empty: {
    color: "#666",
    margin: 0,
  },
  infoBox: {
    background: "linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)",
    color: "#1e3a8a",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 800,
  },
};
