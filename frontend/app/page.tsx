export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDateJST } from "@/lib/format-date";
import PostListClient from "@/components/post-list-client";
import PortalSidebar from "@/components/portal-sidebar";

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
      <main style={styles.page}>
        <div style={styles.bgCircle1} />
        <div style={styles.bgCircle2} />
        <div style={styles.bgCircle3} />

        <PortalSidebar />

        <div style={styles.mainArea}>
          <div style={styles.container}>
            <section style={styles.heroCard}>
              <div style={styles.kicker}>INTERNAL PORTAL</div>
              <h1 style={styles.title}>社内ポータル</h1>
              <p style={styles.error}>データ取得に失敗しました: {error.message}</p>
            </section>
          </div>
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
    <main style={styles.page}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <PortalSidebar />

      <div style={styles.mainArea}>
        <div style={styles.container}>
          <section style={styles.heroCard}>
            <div style={styles.kicker}>INTERNAL PORTAL</div>
            <h1 style={styles.title}>社内ポータル</h1>
            <p style={styles.subtitle}>お知らせ・必読・コメントをまとめて確認</p>
          </section>

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
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background:
      "linear-gradient(180deg, #f8f7ff 0%, #eef4ff 45%, #fdfcff 100%)",
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
  mainArea: {
    flex: 1,
    minWidth: 0,
    padding: "24px",
    position: "relative",
    zIndex: 1,
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  heroCard: {
    background: "linear-gradient(180deg, #ffffff 0%, #fffafb 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.10)",
    marginBottom: "24px",
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
  listWrap: {
    borderRadius: "24px",
  },
  error: {
    color: "#991b1b",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "14px",
    marginTop: "12px",
  },
};
