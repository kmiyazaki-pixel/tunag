"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

type ExistingImage = {
  id: number;
  image_url: string;
  sort_order: number;
};

type UploadPreview = {
  file: File;
  previewUrl: string;
};

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
  const [required, setRequired] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [requiredDeadline, setRequiredDeadline] = useState("");
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<UploadPreview[]>([]);

  useEffect(() => {
    async function loadPost() {
      if (Number.isNaN(postId)) {
        setMessage("不正な投稿IDです。");
        setLoading(false);
        return;
      }

      const [{ data, error }, { data: images, error: imagesError }] = await Promise.all([
        supabase.from("posts").select("*").eq("id", postId).single(),
        supabase.from("post_images").select("*").eq("post_id", postId).order("sort_order"),
      ]);

      if (error || !data) {
        setMessage(`投稿の取得に失敗しました: ${error?.message ?? "not found"}`);
        setLoading(false);
        return;
      }

      if (imagesError) {
        setMessage(`画像の取得に失敗しました: ${imagesError.message}`);
        setLoading(false);
        return;
      }

      setTitle(data.title ?? "");
      setBody(data.body ?? "");
      setCategory(data.category ?? "お知らせ");
      setAuthor(data.author ?? "管理者");
      setRequired(Boolean(data.required));
      setIsPinned(Boolean(data.is_pinned));
      setRequiredDeadline(
        data.required_deadline
          ? new Date(data.required_deadline).toISOString().slice(0, 16)
          : ""
      );
      setExistingImages((images ?? []) as ExistingImage[]);

      setLoading(false);
    }

    loadPost();
  }, [postId]);

  const isValid = useMemo(() => {
    return title.trim() !== "" && body.trim() !== "";
  }, [title, body]);

  function handleNewFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const next = files.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewImages((prev) => [...prev, ...next]);

    e.target.value = "";
  }

  function removeExistingImage(id: number) {
    setExistingImages((prev) => prev.filter((img) => img.id !== id));
  }

  function removeNewImage(index: number) {
    setNewImages((prev) => {
      const target = prev[index];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  async function uploadNewImages() {
    if (newImages.length === 0) return [];

    const urls: string[] = [];

    for (const item of newImages) {
      const originalName = item.file.name;
      const ext = originalName.includes(".")
        ? originalName.split(".").pop() || "jpg"
        : "jpg";
      const safeBase = sanitizeFileName(originalName.replace(/\.[^.]+$/, ""));
      const filePath = `posts/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${safeBase}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, item.file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from("post-images").getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isValid || saving || Number.isNaN(postId)) return;

    setSaving(true);
    setMessage(null);

    try {
      const uploadedNewUrls = await uploadNewImages();

      const finalUrls = [
        ...existingImages
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => img.image_url),
        ...uploadedNewUrls,
      ];

      const mainImageUrl = finalUrls[0] ?? null;

      const postPayload = {
        title: title.trim(),
        body: body.trim(),
        category: category.trim() || "お知らせ",
        author: author.trim() || "管理者",
        image_url: mainImageUrl,
        required,
        is_pinned: isPinned,
        required_deadline:
          required && requiredDeadline
            ? new Date(requiredDeadline).toISOString()
            : null,
        status: "published",
      };

      const { error: updatePostError } = await supabase
        .from("posts")
        .update(postPayload)
        .eq("id", postId);

      if (updatePostError) {
        throw new Error(updatePostError.message);
      }

      const { error: deleteImagesError } = await supabase
        .from("post_images")
        .delete()
        .eq("post_id", postId);

      if (deleteImagesError) {
        throw new Error(deleteImagesError.message);
      }

      if (finalUrls.length > 0) {
        const rows = finalUrls.map((url, index) => ({
          post_id: postId,
          image_url: url,
          sort_order: index,
        }));

        const { error: insertImagesError } = await supabase.from("post_images").insert(rows);

        if (insertImagesError) {
          throw new Error(insertImagesError.message);
        }
      }

      newImages.forEach((item) => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });

      router.refresh();
      router.push(`/posts/${postId}`);
    } catch (err) {
      const text = err instanceof Error ? err.message : "更新に失敗しました。";
      setMessage(`更新に失敗しました: ${text}`);
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
          <p style={styles.subtitle}>複数画像の追加・削除に対応しています。</p>

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
                <input
                  style={styles.input}
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="管理者"
                />
              </label>
            </div>

            <div style={styles.block}>
              <div style={styles.blockTitle}>現在の画像</div>
              {existingImages.length === 0 ? (
                <div style={styles.emptyText}>画像はありません。</div>
              ) : (
                <div style={styles.previewGrid}>
                  {existingImages.map((img, index) => (
                    <div key={img.id} style={styles.previewCard}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.image_url} alt={`existing-${index}`} style={styles.preview} />
                      <div style={styles.previewFooter}>
                        <span style={styles.previewText}>
                          {index === 0 ? "メイン画像" : `画像 ${index + 1}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(img.id)}
                          style={styles.removeButton}
                        >
                          外す
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={styles.label}>
              <span>画像追加（複数可・追加選択可）</span>
              <input
                type="file"
                accept="image/*"
                multiple
                style={styles.input}
                onChange={handleNewFilesChange}
              />
            </label>

            {newImages.length > 0 ? (
              <div style={styles.previewGrid}>
                {newImages.map((item, index) => (
                  <div key={`${item.file.name}-${index}`} style={styles.previewCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.previewUrl} alt={`new-${index}`} style={styles.preview} />
                    <div style={styles.previewFooter}>
                      <span style={styles.previewText}>追加画像 {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        style={styles.removeButton}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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
  block: {
    display: "grid",
    gap: "10px",
  },
  blockTitle: {
    fontWeight: 700,
  },
  emptyText: {
    color: "#666",
  },
  previewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  previewCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    background: "#fafafa",
  },
  preview: {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    display: "block",
  },
  previewFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    padding: "10px 12px",
  },
  previewText: {
    fontSize: "13px",
    fontWeight: 700,
  },
  removeButton: {
    background: "#fff",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
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
