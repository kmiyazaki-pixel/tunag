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

function backendBaseUrl(): string {
  const hostport = process.env.BACKEND_HOSTPORT;
  if (!hostport) {
    throw new Error("BACKEND_HOSTPORT is not defined");
  }
  // https対応
  if (hostport.startsWith("http")) {
    return hostport;
  }
  return `https://${hostport}`;
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${backendBaseUrl()}/api/posts`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${backendBaseUrl()}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${backendBaseUrl()}/api/dashboard/summary`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch summary");
  return res.json();
}
