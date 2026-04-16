"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

export default function NewPostPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("お知らせ");
  const [author, setAuthor] = useState("管理者");
  const [required, setRequired] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [requiredDeadline, setRequiredDeadline] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isValid = useMemo(() => {
    return title.trim() !== "" && body.trim() !== "";
  }, [title, body]);

  async function uploadImageIfNeeded() {
    if (!imageFile) return null;

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isValid || saving) return;

    setSaving(true);
    setMessage(null);

    try {
      const uploadedImageUrl = await uploadImageIfNeeded();

      const payload = {
        title: title.trim(),
        body: body.trim(),
        category: category.trim() || "お知らせ",
        required,
        author: author.trim() || "管理者",
        image_url: uploadedImageUrl || null,
        status: "published",
        is_pinned: isPinned,
        required_deadline:
          required && requiredDeadline
            ? new Date(requiredDeadline).toISOString()
            : null,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([payload])
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data?.id) {
        router.refresh();
        router.push(`/posts/${data.id}`);
        return;
      }

      router.push("/");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "保存に失敗しました。";
      setMessage(`保存に失敗しました: ${message}`);
    } finally {
      setSaving(false);
    }
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
          <h1 style={styles.title}>新規投稿作成</h1>
          <p style={styles.subtitle}>画像アップロード付きで投稿します。</p>

          <form onSubmit={handleSubmit} style={styles.form}>
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
                  setPreviewUrl(file ? URL.createObjectURL(file) : "");
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
              <button type="submit" style={styles.submitButton} disabled={!isValid || saving}>
                {saving ? "保存中..." : "投稿を保存"}
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
    justifyContent: "flex-end",
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
  message: {
    margin: 0,
    color: "#111",
    background: "#f3f4f6",
    padding: "12px 14px",
    borderRadius: "10px",
  },
};
