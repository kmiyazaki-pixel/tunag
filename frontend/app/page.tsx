import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchPosts, fetchSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, summary] = await Promise.all([fetchPosts(), fetchSummary()]);

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <Header />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          margin: "24px 0 32px",
        }}
      >
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 20,
            background: "#ffffff",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
          }}
        >
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>投稿数</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 32, color: "#0f172a" }}>
            {summary.totalPosts}
          </h2>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 20,
            background: "#ffffff",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
          }}
        >
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>必読投稿</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 32, color: "#b91c1c" }}>
            {summary.requiredPosts}
          </h2>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 20,
            background: "#ffffff",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
          }}
        >
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>既読登録数</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 32, color: "#0f172a" }}>
            {summary.totalReads}
          </h2>
        </div>
      </section>

      <section style={{ display: "grid", gap: 20 }}>
        {posts.map((post) => (
          <article
            key={post.id}
            className="card"
            style={{
              padding: 24,
              borderRadius: 24,
              background: "#ffffff",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              border: post.required ? "1px solid #fecaca" : "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                marginBottom: 14,
              }}
            >
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "7px 12px",
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 700,
                    background: post.required ? "#fee2e2" : "#eef2ff",
                    color: post.required ? "#b91c1c" : "#4338ca",
                  }}
                >
                  {post.required ? "必読" : post.category}
                </span>

                {!post.required && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      padding: "7px 12px",
                      borderRadius: 9999,
                      fontSize: 13,
                      fontWeight: 600,
                      background: "#f3f4f6",
                      color: "#374151",
                    }}
                  >
                    {post.category}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#64748b",
                }}
              >
                既読 {post.readCount}
              </span>
            </div>

            <h2
              style={{
                margin: "0 0 12px",
                fontSize: 28,
                lineHeight: 1.3,
                color: "#0f172a",
              }}
            >
              <Link
                href={`/posts/${post.id}`}
                style={{
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                {post.title}
              </Link>
            </h2>

            <p
              style={{
                margin: "0 0 18px",
                color: "#334155",
                fontSize: 16,
                lineHeight: 1.8,
              }}
            >
              {post.body.length > 140 ? `${post.body.slice(0, 140)}...` : post.body}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
                paddingTop: 14,
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  color: "#64748b",
                  fontSize: 14,
                }}
              >
                {post.author} / {new Date(post.publishedAt).toLocaleString("ja-JP")}
              </div>

              <Link
                href={`/posts/${post.id}`}
                style={{
                  textDecoration: "none",
                  color: "#111827",
                  fontWeight: 700,
                }}
              >
                続きを読む →
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
