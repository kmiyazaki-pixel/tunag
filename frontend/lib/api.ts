export type Comment = {
  id: number;
  author: string;
  body: string;
  createdAt: string;
};

export type Reader = {
  id: number;
  name: string;
};

export type Post = {
  id: number;
  title: string;
  body: string;
  category: string;
  required: boolean;
  author: string;
  publishedAt: string;
  readCount: number;
  reactionCount: number;
  commentCount: number;
  imageUrl?: string | null;

  comments?: Comment[];
  readers?: Reader[];
};

export type Summary = {
  totalPosts: number;
  requiredPosts: number;
  totalReads: number;
  requiredUnreadEstimate: number;
  categoryBreakdown: {
    category: string;
    count: number;
  }[];
  topPosts: {
    id: number;
    title: string;
    category: string;
    readCount: number;
    reactionCount: number;
    commentCount: number;
    score: number;
  }[];
};

/* =========================
   共通
========================= */
const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://tunag.vercel.app";

/* =========================
   一覧
========================= */
export async function fetchPosts(): Promise<Post[]> {
  const res = await fetch(`${BASE_URL}/api/posts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("fetchPosts failed");
  }

  const data = await res.json();

  return data.map((post: any) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    required: post.required,
    author: post.author,
    publishedAt: post.published_at,
    readCount: post.read_count ?? 0,
    reactionCount: post.reaction_count ?? 0,
    commentCount: post.comment_count ?? 0,
    imageUrl: post.image_url ?? null,
  }));
}

/* =========================
   詳細
========================= */
export async function fetchPost(id: string): Promise<Post> {
  const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("fetchPost failed");
  }

  const post = await res.json();

  return {
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    required: post.required,
    author: post.author,
    publishedAt: post.published_at,
    readCount: post.read_count ?? 0,
    reactionCount: post.reaction_count ?? 0,
    commentCount: post.comment_count ?? 0,
    imageUrl: post.image_url ?? null,

    comments: (post.comments ?? []).map((c: any) => ({
      id: c.id,
      author: c.author,
      body: c.body,
      createdAt: c.created_at,
    })),

    readers: (post.readers ?? []).map((r: any) => ({
      id: r.id,
      name: r.name,
    })),
  };
}

/* =========================
   ダッシュボード
========================= */
export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${BASE_URL}/api/dashboard/summary`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("fetchSummary failed");
  }

  return res.json();
}
