export type Post = {
  id: number;
  title: string;
  body: string;
  category: string;
  required: boolean;
  author: string;
  publishedAt: string;
  readCount: number;
};

export type Summary = {
  totalPosts: number;
  requiredPosts: number;
  totalReads: number;
};

function baseUrl(): string {
  if (typeof window === "undefined") {
    const host = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 10000}`;
    return host;
  }
  return "";
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${baseUrl()}/api/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchPosts failed: ${res.status}`);
  return res.json();
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${baseUrl()}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchPost failed: ${res.status}`);
  return res.json();
}

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${baseUrl()}/api/dashboard/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetchSummary failed: ${res.status}`);
  return res.json();
}
