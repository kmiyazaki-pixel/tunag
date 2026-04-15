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
          新規投稿を作成
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
          お知らせ、必読連絡、社内イベントなどを投稿できます。
          タイトル・本文・カテゴリ・画像を設定して、一覧ページに掲載します。
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
          <form action={createPost} style={{ display: "grid", gap: 20 }}>
            <div style={{ display: "grid", gap: 8 }}>
              <label
                htmlFor="title"
                style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}
              >
                タイトル
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="例: 全社会議のお知らせ"
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              <label
                htmlFor="body"
                style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}
              >
                本文
              </label>
              <textarea
                id="body"
                name="body"
                rows={12}
                required
                placeholder="本文を入力してください"
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
                <label
                  htmlFor="category"
                  style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}
                >
                  カテゴリ
                </label>
                <select
                  id="category"
                  name="category"
                  defaultValue="お知らせ"
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
                <label
                  htmlFor="author"
                  style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}
                >
                  投稿者
                </label>
                <input
                  id="author"
                  name="author"
                  type="text"
                  defaultValue="管理者"
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
              <label
                htmlFor="imageUrl"
                style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}
              >
                画像URL
              </label>
              <input
                id="imageUrl"
                name="imageUrl"
                type="text"
                placeholder="https://..."
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  fontSize: 15,
                }}
              />
              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: 13,
                }}
              >
                記事一覧や詳細でヘッダー画像として表示されます。
              </p>
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
              <input name="required" type="checkbox" />
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

            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "center",
                paddingTop: 8,
              }}
            >
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
                投稿する
              </button>

              <a
                href="/"
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
                一覧へ戻る
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
            <h2
              style={{
                margin: "0 0 8px",
                fontSize: 20,
                color: "#0f172a",
              }}
            >
              投稿のポイント
            </h2>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              タイトルは短く分かりやすく、本文は結論から書くと読みやすくなります。
              必読指定は本当に重要な情報だけに使うと、一覧の視認性が上がります。
            </p>
          </div>

          <div
            style={{
              borderRadius: 20,
              background: "#f8fafc",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 160,
                background:
                  "linear-gradient(135deg, #e0e7ff 0%, #f8fafc 50%, #fee2e2 100%)",
              }}
            />

            <div style={{ padding: 18 }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "6px 10px",
                  borderRadius: 9999,
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontSize: 12,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                お知らせ
              </div>

              <h3
                style={{
                  margin: "0 0 10px",
                  fontSize: 20,
                  lineHeight: 1.4,
                  color: "#0f172a",
                }}
              >
                投稿プレビュー
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                入力した内容は、一覧カードと記事詳細ページに表示されます。
                画像URLを設定するとカードの印象がかなり良くなります。
              </p>
            </div>
          </div>

          <div
            style={{
              borderRadius: 18,
              background: "#fff7ed",
              border: "1px solid #fdba74",
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 700,
                color: "#9a3412",
                marginBottom: 6,
                fontSize: 14,
              }}
            >
              おすすめ運用
            </div>
            <p
              style={{
                margin: 0,
                color: "#9a3412",
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              「重要」や「制度」カテゴリは必読にしやすく、
              「イベント」や「福利厚生」は画像付きにすると見られやすくなります。
            </p>
          </div>
        </aside>
      </div>
    </main>
  );
}
