import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { fetchPost } from "@/lib/api";

export const dynamic = "force-dynamic";

/* =========================
   既読
========================= */
async function markRead(id: string, formData: FormData) {
  "use server";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

  const payload = {
    readerName: String(formData.get("readerName") ?? "").trim(),
  };

  const response = await fetch(`${baseUrl}/api/posts/${id}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("markRead failed");

  redirect(`/posts/${id}`);
}

/* =========================
   いいね
========================= */
async function addReaction(id: string) {
  "use server";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/api/posts/${id}/reactions`, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) throw new Error("reaction failed");

  redirect(`/posts/${id}`);
}

/* =========================
   コメント
========================= */
async function addComment(id: string, formData: FormData) {
  "use server";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

  const payload = {
    author: String(formData.get("author") ?? "社員"),
    body: String(formData.get("body") ?? ""),
  };

  const response = await fetch(`${baseUrl}/api/posts/${id}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) throw new Error("comment failed");

  redirect(`/posts/${id}`);
}

/* =========================
   削除 ←これが今回の追加
========================= */
async function deletePost(id: string) {
  "use server";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

  const res = await fetch(`${baseUrl}/api/posts/${id}/delete`, {
    method: "POST",
    cache: "no-store",
  });

  if (!res.ok) throw new Error("delete failed");

  redirect("/");
}

/* =========================
   ページ本体
========================= */
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <Header />

      <Link href="/">← 一覧へ戻る</Link>

      <h1>{post.title}</h1>

      <p>
        {post.author} / {new Date(post.publishedAt).toLocaleString("ja-JP")}
      </p>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          style={{ width: "100%", maxHeight: 300, objectFit: "cover" }}
        />
      )}

      <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>

      {/* =========================
         ボタンエリア
      ========================= */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>

        {/* 既読 */}
        <form action={markRead.bind(null, id)}>
          <input name="readerName" placeholder="名前" required />
          <button type="submit">既読</button>
        </form>

        {/* いいね */}
        <form action={addReaction.bind(null, id)}>
          <button type="submit">👍 いいね</button>
        </form>

        {/* 編集 */}
        <Link href={`/admin/edit/${id}`}>
          <button>編集</button>
        </Link>

        {/* =========================
           削除ボタン（重要）
        ========================= */}
        <form
          action={deletePost.bind(null, id)}
          onSubmit={(e) => {
            if (!confirm("本当に削除しますか？")) {
              e.preventDefault();
            }
          }}
        >
          <button
            type="submit"
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            削除
          </button>
        </form>
      </div>

      {/* =========================
         コメント
      ========================= */}
      <h2>コメント</h2>

      <form action={addComment.bind(null, id)}>
        <input name="author" defaultValue="社員" />
        <textarea name="body" required />
        <button type="submit">投稿</button>
      </form>

      <div>
        {(post.comments ?? []).map((c) => (
          <div key={c.id}>
            <b>{c.author}</b>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
