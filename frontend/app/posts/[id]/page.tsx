import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchPost } from "@/lib/api";

export const dynamic = "force-dynamic";

async function markRead(id: string) {
  "use server";

  await fetch(`${process.env.RENDER_EXTERNAL_URL ?? ""}/api/posts/${id}/read`, {
    method: "POST",
    cache: "no-store",
  });
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  return (
    <main className="container">
      <Header />

      <article className="card">
        <div className="post-meta">
          <span className={`badge ${post.required ? "required" : ""}`}>
            {post.required ? "必読" : post.category}
          </span>
          <span>{post.author}</span>
          <span>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
          <span>既読 {post.readCount}</span>
        </div>

        <h1>{post.title}</h1>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{post.body}</p>

        <form action={markRead.bind(null, id)}>
          <button type="submit">既読にする</button>
        </form>

        <div style={{ marginTop: 16 }}>
          <Link href="/">一覧に戻る</Link>
        </div>
      </article>
    </main>
  );
}
