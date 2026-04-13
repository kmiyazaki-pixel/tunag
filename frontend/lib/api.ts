import { siteBaseUrl } from "@/lib/site";

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
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  throw new Error("fetch failed after retries");
}

export async function fetchPosts(): Promise<Post[]> {
  const res = await fetchWithRetry(`${siteBaseUrl()}/api/posts`);
  if (!res.ok) throw new Error(`fetchPosts failed: ${res.status}`);
  return res.json();
}

export async function fetchPost(id: string): Promise<Post> {
  const res = await fetchWithRetry(`${siteBaseUrl()}/api/posts/${id}`);
  if (!res.ok) throw new Error(`fetchPost failed: ${res.status}`);
  return res.json();
}

export async function fetchSummary(): Promise<Summary> {
  const res = await fetchWithRetry(`${siteBaseUrl()}/api/dashboard/summary`);
  if (!res.ok) throw new Error(`fetchSummary failed: ${res.status}`);
  return res.json();
}
