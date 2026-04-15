import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { fetchPost } from "@/lib/api";

export const dynamic = "force-dynamic";

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

  if (!response.ok) {
    throw new Error(`markRead failed: ${response.status}`);
  }

  redirect(`/posts/${id}`);
}

async function addReaction(id: string) {
  "use server";

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

  const response = await fetch(`${baseUrl}/api/posts/${id}/reactions`, {
    method: "POST",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`addReaction failed: ${response.status}`);
  }

  redirect(`/posts/${id}`);
}

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

  if (!response.ok) {
    throw new Error(`addComment failed: ${response.status}`);
  }

  redirect(`/posts/${id}`);
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  const publishedAt = new Date(post.publishedAt).toLocaleString("ja-JP");

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      <Header />

      <div style={{ margin: "16px 0 24px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            color: "#4b5563",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          ← 一覧に戻る
        </Link>
      </div>

      <article
        className="card"
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: 32,
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 14px",
                borderRadius: 9999,
                fontSize: 14,
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
                  padding: "8px 14px",
                  borderRadius: 9999,
                  fontSize: 14,
                  fontWeight: 600,
                  background: "#f3f4f6",
                  color: "#374151",
                }}
              >
                {post.category}
              </span>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              fontSize: 16,
              fontWeight: 700,
              color: "#64748b",
              whiteSpace: "nowrap",
            }}
          >
            <span>既読 {post.readCount}</span>
            <span>👍 {post.reactionCount ?? 0}</span>
            <span>💬 {post.comments?.length ?? 0}</span>
          </div>
        </div>

        {post.imageUrl && (
          <div
            style={{
              marginBottom: 24,
              borderRadius: 20,
              overflow: "hidden",
              background: "#e5e7eb",
              maxHeight: 420,
            }}
          >
            <img
              src={post.imageUrl}
              alt={post.title}
              style={{
                width: "100%",
                height: "100%",
                maxHeight: 420,
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        )}

        <h1
          style={{
            fontSize: 42,
            lineHeight: 1.2,
            margin: "0 0 20px",
            color: "#0f172a",
            fontWeight: 800,
          }}
        >
          {post.title}
        </h1>

        <div
          style={{
            display: "flex",
            gap: 18,
            flexWrap: "wrap",
            color: "#64748b",
            fontSize: 15,
            marginBottom: 32,
            paddingBottom: 20,
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <span>投稿者: {post.author}</span>
          <span>公開日: {publishedAt}</span>
          <span>カテゴリ: {post.category}</span>
        </div>

        <section
          style={{
            fontSize: 20,
            lineHeight: 1.95,
            color: "#111827",
            whiteSpace: "pre-wrap",
            minHeight: 180,
          }}
        >
          {post.body}
        </section>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginTop: 40,
            paddingTop: 24,
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <form action={markRead.bind(null, id)} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                name="readerName"
                type="text"
                placeholder="名前を入力"
                required
                style={{
                  padding: "12px 14px",
                  borderRadius: 9999,
                  border: "1px solid #d1d5db",
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
                  fontSize: 16,
                  padding: "14px 24px",
                  cursor: "pointer",
                }}
              >
                既読にする
              </button>
            </form>

            <form action={addReaction.bind(null, id)}>
              <button
                type="submit"
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: 9999,
                  background: "#ffffff",
                  color: "#111827",
                  fontWeight: 700,
                  fontSize: 16,
                  padding: "14px 24px",
                  cursor: "pointer",
                }}
              >
                👍 いいね
              </button>
            </form>

            <Link
              href={`/admin/edit/${id}`}
              style={{
                textDecoration: "none",
                padding: "14px 24px",
                borderRadius: 9999,
                border: "1px solid #d1d5db",
                color: "#111827",
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              編集する
            </Link>
          </div>

          <Link
            href="/"
            style={{
              color: "#475569",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            投稿一覧へ戻る
          </Link>
        </div>
      </article>

      <section
        className="card"
        style={{
          maxWidth: 960,
          margin: "24px auto 0",
          padding: 32,
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16 }}>既読者</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {(post.readers ?? []).length === 0 ? (
            <p style={{ margin: 0, color: "#64748b" }}>まだ既読者はいません。</p>
          ) : (
            (post.readers ?? []).map((reader) => (
              <span
                key={reader.id}
                style={{
                  padding: "8px 14px",
                  borderRadius: 9999,
                  background: "#f3f4f6",
                  color: "#374151",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {reader.name}
              </span>
            ))
          )}
        </div>

        <h2 style={{ marginTop: 0, marginBottom: 20 }}>コメント</h2>

        <form
          action={addComment.bind(null, id)}
          style={{
            display: "grid",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <input
            name="author"
            type="text"
            placeholder="名前"
            defaultValue="社員"
            style={{ padding: 12 }}
          />
          <textarea
            name="body"
            rows={4}
            placeholder="コメントを入力"
            required
            style={{ padding: 12 }}
          />
          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: 9999,
              background: "#111827",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              padding: "12px 20px",
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            コメントする
          </button>
        </form>

        <div style={{ display: "grid", gap: 16 }}>
          {(post.comments ?? []).length === 0 ? (
            <p style={{ margin: 0, color: "#64748b" }}>まだコメントはありません。</p>
          ) : (
            (post.comments ?? []).map((comment) => (
              <article
                key={comment.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  padding: 18,
                  background: "#f8fafc",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    marginBottom: 10,
                    color: "#475569",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  <span>{comment.author}</span>
                  <span>{new Date(comment.createdAt).toLocaleString("ja-JP")}</span>
                </div>
                <p
                  style={{
                    margin: 0,
                    color: "#111827",
                    lineHeight: 1.8,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {comment.body}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
