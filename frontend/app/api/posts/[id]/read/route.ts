import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const readerName = (body.readerName ?? "").trim();
  if (!readerName) {
    return NextResponse.json(
      { message: "readerName is required" },
      { status: 400 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { error } = await supabase
    .from("post_reads")
    .upsert(
      {
        post_id: Number(id),
        reader_name: readerName,
      },
      {
        onConflict: "post_id,reader_name",
      }
    );

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const { count } = await supabase
    .from("post_reads")
    .select("*", { count: "exact", head: true })
    .eq("post_id", Number(id));

  return NextResponse.json({
    postId: Number(id),
    readCount: count ?? 0,
  });
}
