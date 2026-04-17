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
        <div style={styles.container}>
          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    );
  }

  if (!userInfo) {
    return (
      <main style={styles.main}>
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
      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>
        </div>

        <div style={styles.card}>
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
              <label style={styles.checkLabel}>
                <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
                <span>必読にする</span>
              </label>

              <label style={styles.checkLabel}>
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
  main: { minHeight: "100vh", background: "#f5f7fb", padding: "32px 16px" },
  container: { maxWidth: "820px", margin: "0 auto" },
  topRow: { marginBottom: "20px" },
  backLink: { textDecoration: "none", color: "#2563eb", fontWeight: 700 },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  title: { margin: "0 0 8px", fontSize: "30px" },
  subtitle: { margin: "0 0 20px", color: "#666" },
  form: { display: "grid", gap: "18px" },
  label: { display: "grid", gap: "8px", fontWeight: 600 },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box",
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
  preview: {
    width: "100%",
    maxHeight: "280px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  checkRow: { display: "flex", gap: "20px", flexWrap: "wrap" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 },
  buttonRow: { display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" },
  submitButton: {
    display: "inline-block",
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  message: {
    margin: 0,
    color: "#111",
    background: "#f3f4f6",
    padding: "12px 14px",
    borderRadius: "10px",
  },
};
