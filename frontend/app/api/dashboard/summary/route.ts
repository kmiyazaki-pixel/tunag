import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_SUPABASE_URL is not defined" },
      { status: 500 }
    );
  }

  if (!serviceRoleKey) {
    return NextResponse.json(
      { message: "SUPABASE_SERVICE_ROLE_KEY is not defined" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      category,
      required,
      published_at,
      post_reads(count),
      post_reactions(count),
      post_comments(count)
    `)
    .order("published_at", { ascending: false });

  if (postsError) {
    return NextResponse.json({ message: postsError.message }, { status: 500 });
  }

  const totalPosts = posts?.length ?? 0;
  const requiredPosts = (posts ?? []).filter((post: any) => post.required).length;
  const totalReads = (posts ?? []).reduce(
    (sum: number, post: any) => sum + (post.post_reads?.[0]?.count ?? 0),
    0
  );

  const categoryMap = new Map<string, number>();
  for (const post of posts ?? []) {
    const key = post.category ?? "未分類";
    categoryMap.set(key, (categoryMap.get(key) ?? 0) + 1);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  const topPosts = (posts ?? [])
    .map((post: any) => ({
      id: post.id,
      title: post.title,
      category: post.category,
      readCount: post.post_reads?.[0]?.count ?? 0,
      reactionCount: post.post_reactions?.[0]?.count ?? 0,
      commentCount: post.post_comments?.[0]?.count ?? 0,
      score:
        (post.post_reads?.[0]?.count ?? 0) * 3 +
        (post.post_reactions?.[0]?.count ?? 0) * 2 +
        (post.post_comments?.[0]?.count ?? 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const requiredUnreadEstimate = (posts ?? []).filter(
    (post: any) => post.required && (post.post_reads?.[0]?.count ?? 0) === 0
  ).length;

  return NextResponse.json({
    totalPosts,
    requiredPosts,
    totalReads,
    requiredUnreadEstimate,
    categoryBreakdown,
    topPosts,
  });
}
