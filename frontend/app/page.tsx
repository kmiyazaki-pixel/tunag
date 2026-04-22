export const dynamic = "force-dynamic";
export const revalidate = 0;

import { supabase } from "@/lib/supabase";
import PortalHomeShell from "@/components/portal-home-shell";

type PostSummary = {
  id: number;
  title: string;
  body: string;
  category: string;
  required: boolean;
  author: string;
  image_url: string | null;
  published_at: string | null;
  updated_at: string | null;
  status: string;
  required_deadline: string | null;
  is_pinned: boolean;
  read_count: number;
  reaction_count: number;
  comment_count: number;
  actual_read_count: number;
};

export default async function HomePage() {
  const { data, error } = await supabase
    .from("post_summary")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false });

  if (error) {
    return (
      <main style={{ padding: 24 }}>
        <p>データ取得に失敗しました: {error.message}</p>
      </main>
    );
  }

  const posts = ((data ?? []) as PostSummary[]).filter(
    (post) => post.status === "published"
  );

  return <PortalHomeShell posts={posts} />;
}
