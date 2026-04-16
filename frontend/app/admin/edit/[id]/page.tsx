"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("お知らせ");
  const [author, setAuthor] = useState("管理者");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [required, setRequired] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [requiredDeadline, setRequiredDeadline] = useState("");

  useEffect(() => {
    async function loadPost() {
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

      setTitle(data.title ?? "");
      setBody(data.body ?? "");
      setCategory(data.category ?? "お知らせ");
      setAuthor(data.author ?? "管理者");
      setImageUrl(data.image_url ?? "");
      setPreviewUrl(data.image_url ?? "");
      setRequired(Boolean(data.required));
      setIsPinned(Boolean(data.is_pinned));
      setRequiredDeadline(
        data.required_deadline
          ? new Date(data.required_deadline).toISOString().slice(0, 16)
          : ""
      );

      setLoading(false);
    }

    loadPost();
  }, [postId]);

  const isValid = useMemo(() => {
    return title.trim() !== "" && body.trim() !== "";
  }, [title, body]);

  async function uploadImageIfNeeded() {
    if (!imageFile) return imageUrl || null;

    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${Date.now()}-${sanitizeFileName(imageFile.name)}`;
    const filePath = `posts/${fileName}.${fileExt}`;

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
    if (!isValid || saving || Number.isNaN(postId)) return;

    setSaving(true);
    setMessage(null);

    try {
      const uploadedImageUrl = await uploadImageIfNeeded();

      const payload = {
        title: title.trim(),
        body: body.trim(),
        category: category.trim() || "お知らせ",
        author: author.trim() || "管理者",
        image_url: uploadedImageUrl,
        required,
        is_pinned: isPinned,
        required_deadline:
          required && requiredDeadline
            ? new Date(requiredDeadline).toISOString()
            : null,
        status: "published",
      };

      const { error } = await supabase.from("posts").update(payload).eq("id", postId);

      if (error) {
        throw new Error(error.message);
      }

      router.refresh();
      router.push(`/posts/${postId}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "更新に失敗しました。";
      setMessage(`更新に失敗しました: ${message}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
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

  if (loading) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.card}>読み込み中...</div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href={`/posts/${postId}`} style={styles.backLink}>
            ← 投稿詳細へ戻る
          </Link>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>投稿を編集</h1>
          <p style={styles.subtitle}>画像も差し替えできます。</p>

          <form onSubmit={handleSave} style={styles.form}>
            <label style={styles.label}>
              <span>タイトル</span>
              <input
                style={styles.input}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="タイトルを入力"
              />
            </label>

            <label style={styles.label}>
              <span>本文</span>
              <textarea
                style={styles.textarea}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="本文を入力"
                rows={10}
              />
            </label>

            <div style={styles.grid}>
              <label style={styles.label}>
                <span>カテゴリ</span>
                <select
                  style={styles.input}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="お知らせ">お知らせ</option>
                  <option value="重要">重要</option>
                  <option value="イベント">イベント</option>
                  <option value="制度">制度</option>
                  <option value="採用">採用</option>
                </select>
              </label>

              <label style={styles.label}>
                <span>投稿者</span>
                <input
                  style={styles.input}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="管理者"
                />
              </label>
            </div>

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

            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="preview" style={styles.preview} />
            ) : null}

            <div style={styles.checkRow}>
              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                />
                <span>必読にする</span>
              </label>

              <label style={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                />
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
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={styles.deleteButton}
              >
                {deleting ? "削除中..." : "削除"}
              </button>

              <button
                type="submit"
                disabled={!isValid || saving}
                style={styles.submitButton}
              >
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
    background: "#f5f7fb",
    padding: "32px 16px",
  },
  container: {
    maxWidth: "820px",
    margin: "0 auto",
  },
  topRow: {
    marginBottom: "20px",
  },
  backLink: {
    textDecoration: "none",
    color: "#2563eb",
    fontWeight: 700,
  },
  card: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
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
    gap: "18px",
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
  checkRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  submitButton: {
    background: "#111827",
    color: "#fff",
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
