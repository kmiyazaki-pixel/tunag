import { NextRequest, NextResponse } from "next/server";
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

  const { data, error } = await supabase
    .from("posts")
    .select("id, title, body, category, required, author, published_at, read_count, image_url")
    .order("published_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const posts = (data ?? []).map((post) => ({
    id: post.id,
    title: post.title,
    body: post.body,
    category: post.category,
    required: post.required,
    author: post.author,
    publishedAt: post.published_at,
    readCount: post.read_count,
    imageUrl: post.image_url,
  }));

  return NextResponse.json(posts);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

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
    .insert({
      title: body.title,
      body: body.body,
      category: body.category ?? "お知らせ",
      required: body.required ?? false,
      author: body.author ?? "管理者",
      image_url: body.imageUrl ?? null,
    })
    .select("id, title, body, category, required, author, published_at, read_count, image_url")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    title: data.title,
    body: data.body,
    category: data.category,
    required: data.required,
    author: data.author,
    publishedAt: data.published_at,
    readCount: data.read_count,
    imageUrl: data.image_url,
  });
}
