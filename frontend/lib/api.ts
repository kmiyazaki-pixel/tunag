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

const siteBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || "https://tunag.vercel.app").replace(/\/$/, "");

async function fetchWithRetry(url: string, init?: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 25000);

      const res = await fetch(url, {
        cache: "no-store",
        ...init,
        signal: controller.signal,
      });

      clearTimeout(timer);
      return res;
    } catch (e) {
      if (i === retries - 1) throw e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  throw new Error("fetch failed after retries");
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetchWithRetry(`${siteBaseUrl()}/api/posts`);
  if (!res.ok) throw new Error(`fetchPosts failed: ${res.status}`);
  const data = await res.json();

  return (data ?? []).map((post: any) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    required: post.required,
    author: post.author,
    publishedAt: post.published_at ?? post.publishedAt,
    readCount: post.read_count ?? post.readCount ?? 0,
  }));
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetchWithRetry(`${siteBaseUrl()}/api/posts/${id}`);
  if (!res.ok) throw new Error(`fetchPost failed: ${res.status}`);
  const post = await res.json();

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    required: post.required,
    author: post.author,
    publishedAt: post.published_at ?? post.publishedAt,
    readCount: post.read_count ?? post.readCount ?? 0,
  };
}

export async function fetchSummary(): Promise<Summary> {
  const res = await fetchWithRetry(`${siteBaseUrl()}/api/dashboard/summary`);
  if (!res.ok) throw new Error(`fetchSummary failed: ${res.status}`);
  return res.json();
}
