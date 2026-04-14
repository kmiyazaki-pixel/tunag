import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchPosts, fetchSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, summary] = await Promise.all([fetchPosts(), fetchSummary()]);

  return (
    <main className="container">
      <Header />

      <section className="summary-grid">
        <div className="card">
          <p>投稿数</p>
          <h2>{summary.totalPosts}</h2>
        </div>
        <div className="card">
          <p>必読投稿</p>
          <h2>{summary.requiredPosts}</h2>
        </div>
        <div className="card">
          <p>既読登録数</p>
          <h2>{summary.totalReads}</h2>
        </div>
      </section>

      <section className="post-list">
        {posts.map((post) => (
          <article key={post.id} className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span>{post.required ? "必読" : post.category}</span>
              <span>既読 {post.readCount}</span>
            </div>

            <h2 style={{ marginBottom: 12 }}>
              <Link
                href={`/posts/${post.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {post.title}
              </Link>
            </h2>

            <p style={{ marginBottom: 16 }}>
              {post.body.length > 110 ? `${post.body.slice(0, 110)}...` : post.body}
            </p>

            <div style={{ color: "#64748b", fontSize: 14 }}>
              {post.author} / {new Date(post.publishedAt).toLocaleString("ja-JP")} / {post.category}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
