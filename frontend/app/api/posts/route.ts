import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ message: "env missing" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, anonKey);

  // 投稿一覧取得
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  // 各投稿のカウントを取得
  const results = await Promise.all(
    posts.map(async (post) => {
      const [{ count: readCount }, { count: reactionCount }, { count: commentCount }] =
        await Promise.all([
          supabase.from("post_reads").select("*", { count: "exact", head: true }).eq("post_id", post.id),
          supabase.from("post_reactions").select("*", { count: "exact", head: true }).eq("post_id", post.id),
          supabase.from("post_comments").select("*", { count: "exact", head: true }).eq("post_id", post.id),
        ]);

      return {
        ...post,
        read_count: readCount ?? 0,
        reaction_count: reactionCount ?? 0,
        comment_count: commentCount ?? 0,
      };
    })
  );

  return NextResponse.json(results);
}
