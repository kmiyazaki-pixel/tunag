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
  if (hostport.startsWith("http")) {
    return hostport;
  }
  return `https://${hostport}`;
}

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 10000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPosts(): Promise<Post[]> {
  const url = `${backendBaseUrl()}/api/posts`;
  console.log("[fetchPosts] url:", url);
  const res = await fetchWithTimeout(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("[fetchPosts] status:", res.status, res.statusText);
    throw new Error("Failed to fetch posts");
  }
  return res.json();
}

export async function fetchPost(id: string): Promise<Post> {
  const url = `${backendBaseUrl()}/api/posts/${id}`;
  console.log("[fetchPost] url:", url);
  const res = await fetchWithTimeout(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("[fetchPost] status:", res.status, res.statusText);
    throw new Error("Failed to fetch post");
  }
  return res.json();
}

export async function fetchSummary(): Promise<Summary> {
  const url = `${backendBaseUrl()}/api/dashboard/summary`;
  console.log("[fetchSummary] url:", url);
  const res = await fetchWithTimeout(url, { cache: "no-store" });
  if (!res.ok) {
    console.error("[fetchSummary] status:", res.status, res.statusText);
    throw new Error("Failed to fetch summary");
  }
  return res.json();
}
