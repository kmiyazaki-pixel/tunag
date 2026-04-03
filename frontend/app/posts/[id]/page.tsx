import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchPost } from "@/lib/api";

function backendBaseUrl(): string {
  const hostport = process.env.BACKEND_HOSTPORT;
  if (!hostport) {
    throw new Error("BACKEND_HOSTPORT is not defined");
  }
  return `http://${hostport}`;
}

async function markRead(id: string) {
  "use server";

  await fetch(`${backendBaseUrl()}/api/posts/${id}/read`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ readerName: "ゲスト閲覧者" }),
    cache: "no-store",
  });
}

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await fetchPost(id);

  return (
    <main className="container">
      <Header />
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <span className={`badge ${post.required ? "required" : ""}`}>
            {post.required ? "必読" : post.category}
          </span>
          <span className="muted">既読 {post.readCount}</span>
        </div>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>{post.author}</span>
          <span>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
          <span>{post.category}</span>
        </div>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8, marginTop: 24 }}>{post.body}</p>
        <form action={markRead.bind(null, id)} style={{ marginTop: 24 }}>
          <button className="button" type="submit">既読にする</button>
        </form>
        <div style={{ marginTop: 16 }}>
          <Link href="/" className="muted">← 一覧に戻る</Link>
        </div>
      </div>
    </main>
  );
}
