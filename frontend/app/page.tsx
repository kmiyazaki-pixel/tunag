export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDateJST } from "@/lib/format-date";
import PostListClient from "@/components/post-list-client";
import AuthStatus from "@/components/auth-status";

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
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
        <div style={styles.container}>
          <h1 style={styles.title}>社内ポータル</h1>
          <p style={styles.error}>データ取得に失敗しました: {error.message}</p>
        </div>
      </main>
    );
  }

const schedulerUrl =
  (process.env.NEXT_PUBLIC_SCHEDULER_APP_URL || "https://vital-scheduler.vercel.app") +
  "/calendar/month";
  
  const posts = ((data ?? []) as PostSummary[]).filter((post) => post.status === "published");

  const totalPosts = posts.length;
  const totalReads = posts.reduce((sum, post) => sum + (post.actual_read_count ?? 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count ?? 0), 0);
  const totalReactions = posts.reduce((sum, post) => sum + (post.reaction_count ?? 0), 0);

  return (
    <main style={styles.main}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.kicker}>INTERNAL PORTAL</div>
            <h1 style={styles.title}>社内ポータル</h1>
            <p style={styles.subtitle}>お知らせ・必読・コメントをまとめて確認</p>
          </div>

          <div style={styles.headerActions}>
            <Link href={schedulerUrl} style={styles.secondaryButton}>
             スケジュール
             </Link>
            <Link href="/admin/new" style={styles.primaryButton}>
              新規投稿
            </Link>
            <Link href="/admin/audit-logs" style={styles.secondaryButton}>
             監査ログ
            </Link>
            <AuthStatus />
          </div>
        </header>

        <section style={styles.dashboard}>
          <div style={{ ...styles.card, ...styles.cardPink }}>
            <div style={styles.cardLabel}>投稿数</div>
            <div style={styles.cardValue}>{totalPosts}</div>
          </div>
          <div style={{ ...styles.card, ...styles.cardBlue }}>
            <div style={styles.cardLabel}>既読数合計</div>
            <div style={styles.cardValue}>{totalReads}</div>
          </div>
          <div style={{ ...styles.card, ...styles.cardGreen }}>
            <div style={styles.cardLabel}>コメント合計</div>
            <div style={styles.cardValue}>{totalComments}</div>
          </div>
          <div style={{ ...styles.card, ...styles.cardYellow }}>
            <div style={styles.cardLabel}>リアクション合計</div>
            <div style={styles.cardValue}>{totalReactions}</div>
          </div>
        </section>

        <div style={styles.listWrap}>
          <PostListClient posts={posts} />
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg, #f8f7ff 0%, #eef4ff 45%, #fdfcff 100%)",
    padding: "32px 16px",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    top: "-80px",
    left: "-80px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(255, 99, 132, 0.14)",
    filter: "blur(8px)",
  },
  bgCircle2: {
    position: "absolute",
    top: "120px",
    right: "-70px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.16)",
    filter: "blur(8px)",
  },
  bgCircle3: {
    position: "absolute",
    bottom: "-60px",
    left: "35%",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.12)",
    filter: "blur(10px)",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
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
    alignItems: "center",
    flexWrap: "wrap",
  },
  kicker: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #8b5cf6, #ec4899)",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    marginBottom: "12px",
  },
  title: {
    fontSize: "36px",
    fontWeight: 800,
    margin: 0,
    color: "#1f2340",
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#5b6285",
    fontSize: "15px",
  },
  dashboard: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  card: {
    borderRadius: "20px",
    padding: "22px",
    boxShadow: "0 12px 30px rgba(91, 98, 133, 0.10)",
    border: "1px solid rgba(255,255,255,0.7)",
  },
  cardPink: {
    background: "linear-gradient(135deg, #fff0f5 0%, #ffe1ec 100%)",
  },
  cardBlue: {
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
  },
  cardGreen: {
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
  },
  cardYellow: {
    background: "linear-gradient(135deg, #fff9e8 0%, #fde68a 100%)",
  },
  cardLabel: {
    color: "#5b6285",
    fontSize: "14px",
    marginBottom: "10px",
    fontWeight: 700,
  },
  cardValue: {
    fontSize: "30px",
    fontWeight: 800,
    color: "#1f2340",
  },
  primaryButton: {
    display: "inline-block",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    textDecoration: "none",
    padding: "12px 18px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.28)",
  },
  listWrap: {
    borderRadius: "24px",
  },
  error: {
    color: "#991b1b",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "14px",
  },
  secondaryButton: {
  display: "inline-block",
  background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
  color: "#9a3412",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  fontWeight: 800,
  boxShadow: "0 8px 18px rgba(251, 146, 60, 0.18)",
  },
};
