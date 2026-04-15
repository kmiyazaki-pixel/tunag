import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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

  const { data, error } = await supabase
    .from("posts")
    .select(`
      id,
      title,
      body,
      category,
      required,
      author,
      published_at,
      image_url,
      post_reads(id, reader_name, created_at),
      post_reactions(count),
      post_comments(id, author, body, created_at)
    `)
    .eq("id", Number(id))
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 404 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    body: data.body,
    category: data.category,
    required: data.required,
    author: data.author,
    publishedAt: data.published_at,
    imageUrl: data.image_url,
    readCount: (data.post_reads ?? []).length,
    readers: (data.post_reads ?? []).map((read: any) => ({
      id: read.id,
      name: read.reader_name,
      createdAt: read.created_at,
    })),
    reactionCount: data.post_reactions?.[0]?.count ?? 0,
    comments: (data.post_comments ?? []).map((comment: any) => ({
      id: comment.id,
      author: comment.author,
      body: comment.body,
      createdAt: comment.created_at,
    })),
  });
}
