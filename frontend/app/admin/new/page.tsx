import { Header } from "@/components/Header";
import { redirect } from "next/navigation";

function backendBaseUrl(): string {
  const hostport = process.env.BACKEND_HOSTPORT;
  if (!hostport) {
    throw new Error("BACKEND_HOSTPORT is not defined");
  }
  return `http://${hostport}`;
}

async function createPost(formData: FormData) {
  "use server";

  const payload = {
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
    category: String(formData.get("category") ?? "お知らせ"),
    required: formData.get("required") === "on",
    author: String(formData.get("author") ?? "管理者"),
  };

  const response = await fetch(`${backendBaseUrl()}/api/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("投稿の作成に失敗しました");
  }

  redirect("/");
}

export default function AdminNewPage() {
  return (
    <main className="container">
      <Header />
      <div className="card">
        <h1 className="post-title">新規投稿</h1>
        <form action={createPost} className="form">
          <input name="title" className="input" placeholder="タイトル" required />
          <input name="author" className="input" placeholder="投稿者" defaultValue="管理者" required />
          <select name="category" className="select" defaultValue="お知らせ">
            <option value="お知らせ">お知らせ</option>
            <option value="社内報">社内報</option>
            <option value="ナレッジ">ナレッジ</option>
          </select>
          <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="checkbox" name="required" /> 必読にする
          </label>
          <textarea name="body" className="textarea" placeholder="本文" required />
          <button type="submit" className="button">投稿を保存</button>
        </form>
      </div>
    </main>
  );
}
