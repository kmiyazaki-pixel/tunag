import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchPosts, fetchSummary } from "@/lib/api";

export default async function HomePage() {
  const [posts, summary] = await Promise.all([fetchPosts(), fetchSummary()]);

  return (
    <main className="container">
      <Header />

      <section className="hero">
        <div className="grid grid-3">
          <div className="card">
            <div className="muted">投稿数</div>
            <h2>{summary.totalPosts}</h2>
          </div>
          <div className="card">
            <div className="muted">必読投稿</div>
            <h2>{summary.requiredPosts}</h2>
          </div>
          <div className="card">
            <div className="muted">既読登録数</div>
            <h2>{summary.totalReads}</h2>
          </div>
        </div>
      </section>

      <section className="post-list">
        {posts.map((post) => (
          <Link key={post.id} href={`/posts/${post.id}`} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <span className={`badge ${post.required ? "required" : ""}`}>
                {post.required ? "必読" : post.category}
              </span>
              <span className="muted">既読 {post.readCount}</span>
            </div>
            <h2 className="post-title">{post.title}</h2>
            <p>{post.body.length > 110 ? `${post.body.slice(0, 110)}...` : post.body}</p>
            <div className="post-meta">
              <span>{post.author}</span>
              <span>{new Date(post.publishedAt).toLocaleString("ja-JP")}</span>
              <span>{post.category}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
