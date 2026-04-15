import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

function formatDate(value: string | null) {
  if (!value) return "日時未設定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return date.toLocaleString("ja-JP");
}

function trimText(text: string, max = 120) {
  if (text.length <= max) return text;
  return `${text.slice(0, max)}...`;
}

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

  const posts = (data ?? []).filter((post: PostSummary) => post.status === "published");

  const totalPosts = posts.length;
  const totalReads = posts.reduce((sum: number, post: PostSummary) => sum + (post.actual_read_count ?? 0), 0);
  const totalComments = posts.reduce((sum: number, post: PostSummary) => sum + (post.comment_count ?? 0), 0);
  const totalReactions = posts.reduce((sum: number, post: PostSummary) => sum + (post.reaction_count ?? 0), 0);

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

        <section style={styles.listSection}>
          {posts.length === 0 ? (
            <div style={styles.emptyBox}>投稿がまだありません。</div>
          ) : (
            posts.map((post: PostSummary) => (
              <article key={post.id} style={styles.postCard}>
                {post.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.image_url} alt={post.title} style={styles.image} />
                ) : null}

                <div style={styles.postBody}>
                  <div style={styles.metaRow}>
                    <span style={styles.category}>{post.category}</span>
                    {post.required ? <span style={styles.required}>必読</span> : null}
                    {post.is_pinned ? <span style={styles.pinned}>固定</span> : null}
                  </div>

                  <h2 style={styles.postTitle}>
                    <Link href={`/posts/${post.id}`} style={styles.postTitleLink}>
                      {post.title}
                    </Link>
                  </h2>

                  <p style={styles.postText}>{trimText(post.body, 140)}</p>

                  <div style={styles.infoGrid}>
                    <span>投稿者: {post.author}</span>
                    <span>公開日: {formatDate(post.published_at)}</span>
                    <span>既読: {post.actual_read_count ?? post.read_count ?? 0}</span>
                    <span>コメント: {post.comment_count ?? 0}</span>
                    <span>リアクション: {post.reaction_count ?? 0}</span>
                  </div>

                  <div style={styles.linkRow}>
                    <Link href={`/posts/${post.id}`} style={styles.secondaryButton}>
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </article>
            ))
          )}
        </section>
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
  listSection: {
    display: "grid",
    gap: "20px",
  },
  postCard: {
    background: "#fff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  image: {
    width: "100%",
    height: "240px",
    objectFit: "cover",
    display: "block",
  },
  postBody: {
    padding: "20px",
  },
  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  category: {
    background: "#eef2ff",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  required: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  pinned: {
    background: "#ecfccb",
    color: "#3f6212",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  postTitle: {
    margin: "0 0 12px",
    fontSize: "24px",
  },
  postTitleLink: {
    color: "#111",
    textDecoration: "none",
  },
  postText: {
    color: "#444",
    lineHeight: 1.7,
    marginBottom: "16px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "8px",
    color: "#666",
    fontSize: "14px",
    marginBottom: "16px",
  },
  linkRow: {
    display: "flex",
    justifyContent: "flex-end",
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
  secondaryButton: {
    display: "inline-block",
    background: "#f3f4f6",
    color: "#111",
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 700,
  },
  emptyBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "32px",
    textAlign: "center",
    color: "#666",
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "12px",
  },
};
