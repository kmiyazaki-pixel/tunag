"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function sanitizeFileName(name: string) {
  return name.replace(/[^\w.\-]/g, "_");
}

type PostStatus = "draft" | "published" | "archived";
type MyProfile = {
  id: string;
  name: string;
  role: "member" | "editor" | "admin";
};

export default function NewPostPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("お知らせ");
  const [status, setStatus] = useState<PostStatus>("published");
  const [required, setRequired] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [requiredDeadline, setRequiredDeadline] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const canPost = profile?.role === "admin" || profile?.role === "editor";

  const isValid = useMemo(() => {
    return title.trim() !== "" && body.trim() !== "";
  }, [title, body]);

  async function uploadImageIfNeeded() {
    if (!imageFile) return null;

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!isValid || saving || !profile || !canPost) return;

    setSaving(true);
    setMessage(null);

    try {
      const uploadedImageUrl = await uploadImageIfNeeded();

      const payload = {
        title: title.trim(),
        body: body.trim(),
        category: category.trim() || "お知らせ",
        required,
        author: profile.name,
        author_profile_id: profile.id,
        image_url: uploadedImageUrl || null,
        status,
        is_pinned: isPinned,
        required_deadline:
          required && requiredDeadline ? new Date(requiredDeadline).toISOString() : null,
      };

      const { data, error } = await supabase
        .from("posts")
        .insert([payload])
        .select("id,status")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (data?.id) {
        router.refresh();

        if (data.status === "published") {
          router.push(`/posts/${data.id}`);
          return;
        }

        router.push("/admin");
        return;
      }

      router.push("/admin");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "保存に失敗しました。";
      setMessage(`保存に失敗しました: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) {
    return <main style={styles.main}><div style={styles.container}><div style={styles.card}>読み込み中...</div></div></main>;
  }

  if (!profile) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.card}>
            <p>投稿作成にはログインが必要です。</p>
            <Link href="/login" style={styles.submitButton}>ログインする</Link>
          </div>
        </div>
      </main>
    );
  }

  if (!canPost) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.card}>
            <p>このアカウントには投稿権限がありません。</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href="/admin" style={styles.backLink}>
            ← 投稿管理へ戻る
          </Link>
        </div>

        <div style={styles.card}>
          <h1 style={styles.title}>新規投稿作成</h1>
          <p style={styles.subtitle}>ログイン中: {profile.name} / {profile.role}</p>

          <form onSubmit={handleSubmit} style={styles.form}>
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
                <span>公開状態</span>
                <select style={styles.input} value={status} onChange={(e) => setStatus(e.target.value as PostStatus)}>
                  <option value="draft">下書き</option>
                  <option value="published">公開</option>
                  <option value="archived">アーカイブ</option>
                </select>
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

            <div style={styles.noteBox}>
              現在の状態:{" "}
              <strong>{status === "draft" ? "下書き" : status === "published" ? "公開" : "アーカイブ"}</strong>
            </div>

            <div style={styles.buttonRow}>
              <button type="submit" style={styles.submitButton} disabled={!isValid || saving}>
                {saving ? "保存中..." : "保存する"}
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
  card: { background: "#fff", borderRadius: "18px", padding: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  title: { margin: "0 0 8px", fontSize: "30px" },
  subtitle: { margin: "0 0 20px", color: "#666" },
  form: { display: "grid", gap: "18px" },
  label: { display: "grid", gap: "8px", fontWeight: 600 },
  input: { width: "100%", padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "16px", boxSizing: "border-box" },
  textarea: { width: "100%", padding: "12px 14px", border: "1px solid #d1d5db", borderRadius: "10px", fontSize: "16px", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" },
  preview: { width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "12px", border: "1px solid #e5e7eb" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" },
  checkRow: { display: "flex", gap: "20px", flexWrap: "wrap" },
  checkLabel: { display: "flex", alignItems: "center", gap: "8px", fontWeight: 600 },
  noteBox: { background: "#f3f4f6", borderRadius: "10px", padding: "12px 14px", color: "#111" },
  buttonRow: { display: "flex", justifyContent: "flex-end" },
  submitButton: { display: "inline-block", background: "#111827", color: "#fff", textDecoration: "none", border: "none", borderRadius: "10px", padding: "12px 18px", fontWeight: 700, cursor: "pointer" },
  message: { margin: 0, color: "#111", background: "#f3f4f6", padding: "12px 14px", borderRadius: "10px" },
};
