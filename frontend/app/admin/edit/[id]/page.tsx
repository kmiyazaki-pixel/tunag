"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuthUser } from "@/hooks/use-auth-user";

type PostStatus = "draft" | "published" | "archived";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { userInfo, loadingUser } = useAuthUser();

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const postId = rawId ? Number(rawId) : NaN;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("お知らせ");
  const [author, setAuthor] = useState("管理者");
  const [status, setStatus] = useState<PostStatus>("published");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [required, setRequired] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [requiredDeadline, setRequiredDeadline] = useState("");

  useEffect(() => {
    async function loadPost() {
      if (!rawId) return;

      if (Number.isNaN(postId)) {
        setMessage("不正な投稿IDです。");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", postId)
        .single();

      if (error || !data) {
        setMessage(`投稿の取得に失敗しました: ${error?.message ?? "not found"}`);
        setLoading(false);
        return;
      }

      setMessage(null);
      setTitle(data.title ?? "");
      setBody(data.body ?? "");
      setCategory(data.category ?? "お知らせ");
      setAuthor(data.author ?? "管理者");
      setStatus((data.status as PostStatus) ?? "published");
      setImageUrl(data.image_url ?? "");
      setPreviewUrl(data.image_url ?? "");
      setRequired(Boolean(data.required));
      setIsPinned(Boolean(data.is_pinned));
      setRequiredDeadline(
        data.required_deadline ? new Date(data.required_deadline).toISOString().slice(0, 16) : ""
      );
      setLoading(false);
    }

    loadPost();
  }, [rawId, postId]);

  const isValid = useMemo(() => {
    return title.trim() !== "" && body.trim() !== "";
  }, [title, body]);

  async function uploadImageIfNeeded() {
    if (!imageFile) return imageUrl || null;

    const parts = imageFile.name.split(".");
    const ext = parts.length > 1 ? parts[parts.length - 1] : "jpg";
    const safeName = sanitizeFileName(imageFile.name.replace(/\.[^/.]+$/, ""));
    const filePath = `posts/${Date.now()}-${safeName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(filePath, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!userInfo) {
      setMessage("ログインしてください。");
      return;
    }
    if (!isValid || saving || Number.isNaN(postId)) return;

    setSaving(true);
    setMessage(null);

    try {
      const uploadedImageUrl = await uploadImageIfNeeded();

      const payload = {
        title: title.trim(),
        body: body.trim(),
        category: category.trim() || "お知らせ",
        author: author.trim() || userInfo.name,
        status,
        image_url: uploadedImageUrl,
        required,
        is_pinned: isPinned,
        required_deadline:
          required && requiredDeadline ? new Date(requiredDeadline).toISOString() : null,
      };

      const { error } = await supabase.from("posts").update(payload).eq("id", postId);

      if (error) {
        throw new Error(error.message);
      }

      router.refresh();

      if (status === "published") {
        router.push(`/posts/${postId}`);
        return;
      }

      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "更新に失敗しました。";
      setMessage(`更新に失敗しました: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!userInfo) {
      setMessage("ログインしてください。");
      return;
    }
    if (deleting || Number.isNaN(postId)) return;

    const ok = window.confirm("この投稿を削除します。よろしいですか？");
    if (!ok) return;

    setDeleting(true);
    setMessage(null);

    const { error } = await supabase.from("posts").delete().eq("id", postId);

    setDeleting(false);

    if (error) {
      setMessage(`削除に失敗しました: ${error.message}`);
      return;
    }

    router.refresh();
    router.push("/");
  }

  if (loadingUser || loading) {
    return (
      <main style={styles.main}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
        <div style={styles.container}>
          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    );
  }

  if (!userInfo) {
    return (
      <main style={styles.main}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
        <div style={styles.container}>
          <div style={styles.card}>
            <p style={styles.message}>編集にはログインが必要です。</p>
            <Link href="/login" style={styles.submitButton}>
              ログインする
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>
        </div>

        <div style={styles.card}>
          <div style={styles.kicker}>EDIT POST</div>
          <h1 style={styles.title}>投稿を編集</h1>
          <p style={styles.subtitle}>ログイン中: {userInfo.name}</p>

          <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>
              <span>タイトル</span>
              <input style={styles.input} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>

            <label style={styles.label}>
              <span>本文</span>
              <textarea style={styles.textarea} value={body} onChange={(e) => setBody(e.target.value)} rows={10} />
            </label>

            <div style={styles.grid}>
              <label style={styles.label}>
                <span>カテゴリ</span>
                <select style={styles.input} value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="お知らせ">お知らせ</option>
                  <option value="重要">重要</option>
                  <option value="イベント">イベント</option>
                  <option value="制度">制度</option>
                  <option value="採用">採用</option>
                </select>
              </label>

              <label style={styles.label}>
                <span>投稿者</span>
                <input style={styles.input} value={author} onChange={(e) => setAuthor(e.target.value)} />
              </label>
            </div>

            <label style={styles.label}>
              <span>公開状態</span>
              <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="archived">アーカイブ</option>
              </select>
            </label>

            <label style={styles.label}>
              <span>画像アップロード</span>
              <input
                type="file"
                accept="image/*"
                style={styles.input}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                  setPreviewUrl(file ? URL.createObjectURL(file) : imageUrl);
                }}
              />
            </label>

            {previewUrl ? <img src={previewUrl} alt="preview" style={styles.preview} /> : null}

            <div style={styles.checkRow}>
              <label style={styles.checkLabelBlue}>
                <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
                <span>必読にする</span>
              </label>

              <label style={styles.checkLabelGreen}>
                <input type="checkbox" checked={isPinned} onChange={(e) => setIsPinned(e.target.checked)} />
                <span>固定表示にする</span>
              </label>
            </div>

            {required ? (
              <label style={styles.label}>
                <span>必読期限</span>
                <input
                  type="datetime-local"
                  style={styles.input}
                  value={requiredDeadline}
                  onChange={(e) => setRequiredDeadline(e.target.value)}
                />
              </label>
            ) : null}

            <div style={styles.noteBox}>
              現在の状態: <strong>{status === "draft" ? "下書き" : status === "published" ? "公開" : "アーカイブ"}</strong>
            </div>

            <div style={styles.buttonRow}>
              <button type="button" onClick={handleDelete} disabled={deleting} style={styles.deleteButton}>
                {deleting ? "削除中..." : "削除"}
              </button>

              <button type="submit" disabled={!isValid || saving} style={styles.submitButton}>
                {saving ? "更新中..." : "更新する"}
              </button>
            </div>

            {message ? <p style={styles.message}>{message}</p> : null}
          </form>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8f7ff 0%, #eef4ff 100%)",
    padding: "32px 16px",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    top: "-60px",
    left: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(236, 72, 153, 0.12)",
  },
  bgCircle2: {
    position: "absolute",
    top: "100px",
    right: "-60px",
    width: "220px",
    height: "220px",
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
  container: {
    maxWidth: "860px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  topRow: {
    marginBottom: "20px",
  },
  backLink: {
    textDecoration: "none",
    color: "#4f46e5",
    fontWeight: 800,
  },
  card: {
    background: "linear-gradient(180deg, #ffffff 0%, #fffafb 100%)",
    borderRadius: "26px",
    padding: "28px",
    boxShadow: "0 16px 34px rgba(91, 98, 133, 0.10)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  kicker: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #6366f1, #3b82f6)",
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
  },
  form: {
    display: "grid",
    gap: "18px",
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
  textarea: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d8dcef",
    borderRadius: "14px",
    fontSize: "16px",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: "#fff",
  },
  preview: {
    width: "100%",
    maxHeight: "300px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 22px rgba(91, 98, 133, 0.08)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  checkRow: {
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
  },
  checkLabelBlue: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#1d4ed8",
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    padding: "10px 14px",
    borderRadius: "12px",
  },
  checkLabelGreen: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 800,
    color: "#166534",
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
    padding: "10px 14px",
    borderRadius: "12px",
  },
  noteBox: {
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    borderRadius: "14px",
    padding: "12px 14px",
    color: "#9a3412",
    fontWeight: 800,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  submitButton: {
    display: "inline-block",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    textDecoration: "none",
    border: "none",
    borderRadius: "14px",
    padding: "12px 20px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(99, 102, 241, 0.24)",
  },
  deleteButton: {
    background: "linear-gradient(90deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "12px 20px",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(239, 68, 68, 0.22)",
  },
  message: {
    margin: 0,
    color: "#1f2340",
    background: "#fff",
    padding: "12px 14px",
    borderRadius: "12px",
    boxShadow: "0 8px 18px rgba(91, 98, 133, 0.08)",
  },
};
