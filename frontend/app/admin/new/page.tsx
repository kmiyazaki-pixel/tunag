import { Header } from "@/components/Header";
import { redirect } from "next/navigation";

async function createPost(formData: FormData) {
  "use server";

  const payload = {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? "お知らせ"),
    required: String(formData.get("required") ?? "") === "on",
    author: String(formData.get("author") ?? "管理者"),
  };

  const base = process.env.RENDER_EXTERNAL_URL ?? "";
  const response = await fetch(`${base}/api/posts`, {
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
    <main className="container">
      <Header />
      <section className="card">
        <h1>新規投稿作成</h1>

        <form action={createPost} className="form-stack">
          <label>
            タイトル
            <input name="title" type="text" required />
          </label>

          <label>
            本文
            <textarea name="body" rows={10} required />
          </label>

          <label>
            カテゴリ
            <input name="category" type="text" defaultValue="お知らせ" />
          </label>

          <label>
            投稿者
            <input name="author" type="text" defaultValue="管理者" />
          </label>

          <label>
            <input name="required" type="checkbox" />
            必読
          </label>

          <button type="submit">投稿する</button>
        </form>
      </section>
    </main>
  );
}
