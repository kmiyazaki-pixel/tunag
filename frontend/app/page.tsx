import Link from "next/link";
import { Header } from "@/components/Header";
import { fetchPosts, fetchSummary } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; q?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const selectedCategory = resolvedSearchParams?.category ?? "すべて";
  const keyword = (resolvedSearchParams?.q ?? "").trim();

  const [posts, summary] = await Promise.all([fetchPosts(), fetchSummary()]);

  const categories = ["すべて", ...Array.from(new Set(posts.map((post) => post.category)))];

  const filteredPosts = posts.filter((post) => {
    const matchCategory =
      selectedCategory === "すべて" || post.category === selectedCategory;

    const searchTarget = [
      post.title,
      post.body,
      post.category,
      post.author,
    ]
      .join(" ")
      .toLowerCase();

    const matchKeyword =
      keyword === "" || searchTarget.includes(keyword.toLowerCase());

    return matchCategory && matchKeyword;
  });

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <Header />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          margin: "24px 0 24px",
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
          <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>既読者数</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 32, color: "#0f172a" }}>
            {summary.totalReads}
          </h2>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 20,
            background: "#fff7ed",
            boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
            border: "1px solid #fdba74",
          }}
        >
          <p style={{ margin: 0, color: "#9a3412", fontSize: 14 }}>未読の必読投稿</p>
          <h2 style={{ margin: "8px 0 0", fontSize: 32, color: "#c2410c" }}>
            {summary.requiredUnreadEstimate}
          </h2>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 20,
          marginBottom: 28,
        }}
      >
        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 24,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 22 }}>人気投稿ランキング</h2>

          <div style={{ display: "grid", gap: 14 }}>
            {summary.topPosts.length === 0 ? (
              <p style={{ margin: 0, color: "#64748b" }}>投稿はまだありません。</p>
            ) : (
              summary.topPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #e5e7eb",
                    borderRadius: 18,
                    padding: 16,
                    display: "block",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#6366f1",
                          marginBottom: 6,
                        }}
                      >
                        #{index + 1} / {post.category}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "#0f172a",
                          lineHeight: 1.5,
                        }}
                      >
                        {post.title}
                      </div>
                    </div>

                    <div
                      style={{
                        whiteSpace: "nowrap",
                        color: "#475569",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      score {post.score}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 10,
                      color: "#64748b",
                      fontSize: 13,
                      fontWeight: 700,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>既読 {post.readCount}</span>
                    <span>👍 {post.reactionCount}</span>
                    <span>💬 {post.commentCount}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div
          className="card"
          style={{
            padding: 24,
            borderRadius: 24,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 22 }}>カテゴリ別投稿数</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {summary.categoryBreakdown.length === 0 ? (
              <p style={{ margin: 0, color: "#64748b" }}>カテゴリはまだありません。</p>
            ) : (
              summary.categoryBreakdown.map((item) => (
                <div
                  key={item.category}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: "1px solid #e5e7eb",
                    paddingBottom: 10,
                  }}
                >
                  <span style={{ fontWeight: 700, color: "#0f172a" }}>{item.category}</span>
                  <span style={{ color: "#64748b", fontWeight: 700 }}>{item.count}件</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section
        className="card"
        style={{
          padding: 20,
          borderRadius: 24,
          background: "#ffffff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          marginBottom: 24,
        }}
      >
        <form
          action="/"
          method="GET"
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input type="hidden" name="category" value={selectedCategory === "すべて" ? "" : selectedCategory} />

          <input
            name="q"
            defaultValue={keyword}
            placeholder="タイトル・本文・投稿者・カテゴリで検索"
            style={{
              flex: 1,
              minWidth: 280,
              padding: "12px 16px",
              borderRadius: 9999,
              border: "1px solid #d1d5db",
              fontSize: 14,
            }}
          />

          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: 9999,
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
              padding: "12px 18px",
              cursor: "pointer",
            }}
          >
            検索
          </button>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              padding: "12px 18px",
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              background: "#f3f4f6",
              color: "#374151",
              border: "1px solid #e5e7eb",
            }}
          >
            クリア
          </Link>
        </form>
      </section>

      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {categories.map((category) => {
            const active = selectedCategory === category;
            const href =
              category === "すべて"
                ? keyword
                  ? `/?q=${encodeURIComponent(keyword)}`
                  : "/"
                : keyword
                  ? `/?category=${encodeURIComponent(category)}&q=${encodeURIComponent(keyword)}`
                  : `/?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                href={href}
                style={{
                  textDecoration: "none",
                  padding: "10px 16px",
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 700,
                  background: active ? "#111827" : "#f3f4f6",
                  color: active ? "#ffffff" : "#374151",
                  border: active ? "1px solid #111827" : "1px solid #e5e7eb",
                }}
              >
                {category}
              </Link>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 12,
            color: "#64748b",
            fontSize: 14,
          }}
        >
          {keyword ? `「${keyword}」で検索中 / ` : ""}
          {selectedCategory === "すべて"
            ? `全 ${filteredPosts.length} 件`
            : `「${selectedCategory}」 ${filteredPosts.length} 件`}
        </div>
      </section>

      <section style={{ display: "grid", gap: 20 }}>
        {filteredPosts.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 32,
              borderRadius: 24,
              background: "#ffffff",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              color: "#64748b",
            }}
          >
            条件に合う投稿が見つかりませんでした。
          </div>
        ) : (
          filteredPosts.map((post) => (
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
              {post.imageUrl && (
                <Link
                  href={`/posts/${post.id}`}
                  style={{ display: "block", marginBottom: 18 }}
                >
                  <div
                    style={{
                      borderRadius: 18,
                      overflow: "hidden",
                      height: 220,
                      background: "#e5e7eb",
                    }}
                  >
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                </Link>
              )}

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

                <div
                  style={{
                    display: "flex",
                    gap: 14,
                    alignItems: "center",
                    color: "#475569",
                    fontSize: 14,
                    fontWeight: 700,
                    flexWrap: "wrap",
                  }}
                >
                  <span>👍 {post.reactionCount ?? 0}</span>
                  <span>💬 {post.commentCount ?? 0}</span>
                  <Link
                    href={`/admin/edit/${post.id}`}
                    style={{
                      textDecoration: "none",
                      color: "#6366f1",
                      fontWeight: 700,
                    }}
                  >
                    編集
                  </Link>
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
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
