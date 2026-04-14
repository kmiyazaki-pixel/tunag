import { redirect } from "next/navigation";
import { Header } from "@/components/Header";

async function createPost(formData: FormData) {
  "use server";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

  const payload = {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? "お知らせ"),
    required: String(formData.get("required") ?? "") === "on",
    author: String(formData.get("author") ?? "管理者"),
    imageUrl: String(formData.get("imageUrl") ?? ""),
  };

  const response = await fetch(`${baseUrl}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`createPost failed: ${response.status}`);
  }

  redirect("/");
}

export default function AdminNewPage() {
  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <Header />

      <section
        className="card"
        style={{
          maxWidth: 900,
          margin: "24px auto 0",
          padding: 32,
          borderRadius: 24,
          background: "#ffffff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <h1 style={{ marginTop: 0, marginBottom: 24 }}>新規投稿作成</h1>

        <form action={createPost} style={{ display: "grid", gap: 18 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span>タイトル</span>
            <input name="title" type="text" required />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span>本文</span>
            <textarea name="body" rows={10} required />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span>カテゴリ</span>
            <input name="category" type="text" defaultValue="お知らせ" />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span>投稿者</span>
            <input name="author" type="text" defaultValue="管理者" />
          </label>

          <label style={{ display: "grid", gap: 8 }}>
            <span>画像URL</span>
            <input name="imageUrl" type="text" placeholder="https://..." />
          </label>

          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input name="required" type="checkbox" />
            <span>必読</span>
          </label>

          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: 9999,
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              padding: "14px 24px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            投稿する
          </button>
        </form>
      </section>
    </main>
  );
}
