import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { fetchPost } from "@/lib/api";

async function updatePost(id: string, formData: FormData) {
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

  const response = await fetch(`${baseUrl}/api/posts/${id}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`updatePost failed: ${response.status}`);
  }

  redirect(`/posts/${id}`);
}

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await fetchPost(id);

  return (
    <main className="container" style={{ paddingBottom: 56 }}>
      <Header />

      <section
        style={{
          marginTop: 24,
          marginBottom: 24,
          display: "grid",
          gap: 10,
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#6366f1",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.02em",
          }}
        >
          社内報管理
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: 36,
            lineHeight: 1.2,
            color: "#0f172a",
          }}
        >
          投稿を編集
        </h1>

        <p
          style={{
            margin: 0,
            color: "#64748b",
            fontSize: 15,
            lineHeight: 1.8,
            maxWidth: 720,
          }}
        >
          既存の投稿内容を修正します。タイトル・本文・カテゴリ・画像・必読設定を更新できます。
        </p>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 0.8fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section
          className="card"
          style={{
            padding: 32,
            borderRadius: 24,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          }}
        >
          <form action={updatePost.bind(null, id)} style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="title" style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                タイトル
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={post.title}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="body" style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                本文
              </label>
              <textarea
                id="body"
                name="body"
                rows={12}
                required
                defaultValue={post.body}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                  lineHeight: 1.8,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="category" style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                  カテゴリ
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue={post.category}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #d1d5db",
                    fontSize: 15,
                    background: "#fff",
                  }}
                >
                  <option value="お知らせ">お知らせ</option>
                  <option value="重要">重要</option>
                  <option value="イベント">イベント</option>
                  <option value="制度">制度</option>
                  <option value="福利厚生">福利厚生</option>
                </select>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <label htmlFor="author" style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                  投稿者
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  defaultValue={post.author}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #d1d5db",
                    fontSize: 15,
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label htmlFor="imageUrl" style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>
                画像URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                defaultValue={post.imageUrl ?? ""}
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            <label
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                padding: 16,
                borderRadius: 16,
                border: "1px solid #fecaca",
                background: "#fef2f2",
              }}
            >
              <input name="required" type="checkbox" defaultChecked={post.required} />
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "#991b1b",
                    fontSize: 15,
                  }}
                >
                  必読投稿にする
                </div>
                <div
                  style={{
                    color: "#b91c1c",
                    fontSize: 13,
                    marginTop: 2,
                  }}
                >
                  重要なお知らせとして強調表示されます
                </div>
              </div>
            </label>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
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
                更新する
              </button>

              <a
                href={`/posts/${id}`}
                style={{
                  textDecoration: "none",
                  padding: "14px 20px",
                  borderRadius: 9999,
                  border: "1px solid #d1d5db",
                  color: "#374151",
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                詳細へ戻る
              </a>
            </div>
          </form>
        </section>

        <aside
          className="card"
          style={{
            padding: 24,
            borderRadius: 24,
            background: "#ffffff",
            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
            display: "grid",
            gap: 18,
          }}
        >
          <div>
            <h2 style={{ margin: "0 0 8px", fontSize: 20, color: "#0f172a" }}>
              編集のヒント
            </h2>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              更新後はすぐに一覧や詳細画面へ反映されます。タイトルやカテゴリ変更は一覧での見え方に大きく影響します。
            </p>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              padding: 18,
            }}
          >
            <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 8 }}>
              現在の投稿情報
            </div>
            <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.8 }}>
              <div>カテゴリ: {post.category}</div>
              <div>投稿者: {post.author}</div>
              <div>必読: {post.required ? "はい" : "いいえ"}</div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
