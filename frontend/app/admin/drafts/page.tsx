export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";

type PostRow = {
  id: number;
  title: string;
  body: string;
  category: string;
  author: string;
  status: string | null;
  updated_at: string | null;
  published_at: string | null;
  required: boolean;
  is_pinned: boolean;
};

function formatDateJST(value: string | null) {
  if (!value) return "日時未設定";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";

  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function trimText(text: string, max = 120) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

export default async function DraftsPage() {
  const { data, error } = await supabase
    .from("posts")
    .select("id,title,body,category,author,status,updated_at,published_at,required,is_pinned")
    .eq("status", "draft")
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <div style={styles.topRow}>
            <Link href="/" style={styles.backLink}>
              ← 一覧へ戻る
            </Link>
          </div>
          <p style={styles.error}>下書き取得に失敗しました: {error.message}</p>
        </div>
      </main>
    );
  }

  const drafts = (data ?? []) as PostRow[];

  return (
    <main style={styles.main}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>

          <div style={styles.topActions}>
            <Link href="/admin/new" style={styles.primaryButton}>
              新規投稿
            </Link>
          </div>
        </div>

        <section style={styles.headerCard}>
          <div style={styles.kicker}>DRAFTS</div>
          <h1 style={styles.title}>下書き一覧</h1>
          <p style={styles.subtitle}>保存した下書きをここから編集できます。</p>
        </section>

        <section style={styles.listSection}>
          {drafts.length === 0 ? (
            <div style={styles.emptyBox}>下書きはまだありません。</div>
          ) : (
            drafts.map((post, index) => {
              const cardStyle =
                index % 4 === 0
                  ? styles.cardPink
                  : index % 4 === 1
                  ? styles.cardBlue
                  : index % 4 === 2
                  ? styles.cardGreen
                  : styles.cardYellow;

              return (
                <article key={post.id} style={{ ...styles.card, ...cardStyle }}>
                  <div style={styles.badges}>
                    <span style={styles.draftBadge}>下書き</span>
                    <span style={styles.categoryBadge}>{post.category || "未設定"}</span>
                    {post.required ? <span style={styles.requiredBadge}>必読</span> : null}
                    {post.is_pinned ? <span style={styles.pinnedBadge}>固定</span> : null}
                  </div>

                  <h2 style={styles.cardTitle}>{post.title || "無題"}</h2>

                  <p style={styles.cardBody}>{trimText(post.body || "", 160)}</p>

                  <div style={styles.metaGrid}>
                    <span>投稿者: {post.author || "不明"}</span>
                    <span>更新日: {formatDateJST(post.updated_at)}</span>
                    <span>公開日: {formatDateJST(post.published_at)}</span>
                  </div>

                  <div style={styles.actionRow}>
                    <Link href={`/admin/edit/${post.id}`} style={styles.editButton}>
                      編集する
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8f7ff 0%, #eef4ff 100%)",
    padding: "32px 16px",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "absolute",
    top: "-60px",
    left: "-40px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(236, 72, 153, 0.12)",
  },
  bgCircle2: {
    position: "absolute",
    top: "120px",
    right: "-70px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
  },
  bgCircle3: {
    position: "absolute",
    bottom: "-80px",
    left: "35%",
    width: "260px",
    height: "260px",
    borderRadius: "999px",
    background: "rgba(34, 197, 94, 0.12)",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  topActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  backLink: {
    textDecoration: "none",
    color: "#4f46e5",
    fontWeight: 800,
  },
  primaryButton: {
    display: "inline-block",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 20px rgba(99, 102, 241, 0.24)",
  },
  headerCard: {
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
    fontSize: "34px",
    fontWeight: 800,
    margin: 0,
    color: "#1f2340",
  },
  subtitle: {
    margin: "10px 0 0",
    color: "#5b6285",
    fontSize: "15px",
    fontWeight: 700,
  },
  listSection: {
    display: "grid",
    gap: "18px",
  },
  card: {
    borderRadius: "22px",
    padding: "22px",
    boxShadow: "0 12px 28px rgba(91, 98, 133, 0.10)",
    border: "1px solid rgba(255,255,255,0.8)",
  },
  cardPink: {
    background: "linear-gradient(180deg, #fff8fb 0%, #fdf2f8 100%)",
  },
  cardBlue: {
    background: "linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)",
  },
  cardGreen: {
    background: "linear-gradient(180deg, #f7fff9 0%, #ecfdf3 100%)",
  },
  cardYellow: {
    background: "linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%)",
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  draftBadge: {
    background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)",
    color: "#6d28d9",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  categoryBadge: {
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  requiredBadge: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#b91c1c",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  pinnedBadge: {
    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  cardTitle: {
    margin: "0 0 12px",
    fontSize: "26px",
    color: "#1f2340",
  },
  cardBody: {
    margin: "0 0 16px",
    color: "#3e466f",
    lineHeight: 1.8,
  },
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "8px",
    color: "#5b6285",
    fontSize: "14px",
    fontWeight: 700,
    marginBottom: "16px",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  editButton: {
    display: "inline-block",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    color: "#fff",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(99, 102, 241, 0.22)",
  },
  emptyBox: {
    background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
    borderRadius: "20px",
    padding: "32px",
    textAlign: "center",
    color: "#666",
    boxShadow: "0 10px 24px rgba(91, 98, 133, 0.08)",
  },
  error: {
    color: "#991b1b",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "14px",
  },
};
