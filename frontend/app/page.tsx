export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PostListClient from "@/components/post-list-client";

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
      <main style={styles.main}>
        <div style={styles.container}>
          <h1 style={styles.title}>社内ポータル</h1>
          <p style={styles.error}>データ取得に失敗しました: {error.message}</p>
        </div>
      </main>
    );
  }

  const posts = ((data ?? []) as PostSummary[]).filter((post) => post.status === "published");

  const totalPosts = posts.length;
  const totalReads = posts.reduce((sum, post) => sum + (post.actual_read_count ?? 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count ?? 0), 0);
  const totalReactions = posts.reduce((sum, post) => sum + (post.reaction_count ?? 0), 0);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.title}>社内ポータル</h1>
            <p style={styles.subtitle}>TUNAG風の社内報MVP</p>
          </div>
          <div style={styles.headerActions}>
            <Link href="/admin/new" style={styles.primaryButton}>
              新規投稿を作成
            </Link>
          </div>
        </header>

        <section style={styles.dashboard}>
          <div style={styles.card}>
            <div style={styles.cardLabel}>投稿数</div>
            <div style={styles.cardValue}>{totalPosts}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>既読数合計</div>
            <div style={styles.cardValue}>{totalReads}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>コメント合計</div>
            <div style={styles.cardValue}>{totalComments}</div>
          </div>
          <div style={styles.card}>
            <div style={styles.cardLabel}>リアクション合計</div>
            <div style={styles.cardValue}>{totalReactions}</div>
          </div>
        </section>

        <PostListClient posts={posts} />
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "#f5f7fb",
    padding: "32px 16px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  headerActions: {
    display: "flex",
    gap: "12px",
  },
  title: {
    fontSize: "32px",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    margin: "8px 0 0",
    color: "#555",
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  cardLabel: {
    color: "#666",
    fontSize: "14px",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "28px",
    fontWeight: 700,
  },
  primaryButton: {
    display: "inline-block",
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "10px",
    fontWeight: 700,
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "12px",
  },
};
