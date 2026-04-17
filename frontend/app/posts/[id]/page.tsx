export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDateJST } from "@/lib/format-date";
import PostActions from "@/components/post-actions";
import CommentList from "@/components/comment-list";

type PageProps = {
  params: Promise<{ id: string }>;
};

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

type Comment = {
  id: number;
  post_id: number;
  author: string;
  body: string;
  created_at: string | null;
};

type ReadRow = {
  id: number;
  reader_name: string;
  created_at: string | null;
  read_at?: string | null;
};


function getDeadlineStatus(required: boolean, deadline: string | null) {
  if (!required) return "normal";
  if (!deadline) return "required";

  const now = new Date();
  const limit = new Date(deadline);

  if (Number.isNaN(limit.getTime())) return "required";
  if (limit.getTime() < now.getTime()) return "expired";

  return "active";
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <p>不正な投稿IDです。</p>
        </div>
      </main>
    );
  }

  const [{ data: post, error: postError }, { data: comments }, { data: reads }] =
    await Promise.all([
      supabase.from("post_summary").select("*").eq("id", postId).single(),
      supabase
        .from("post_comments")
        .select("id,post_id,author,body,created_at")
        .eq("post_id", postId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("post_reads")
        .select("id, reader_name, created_at, read_at")
        .eq("post_id", postId)
        .order("created_at", { ascending: true }),
    ]);

  if (postError || !post) {
    return (
      <main style={styles.main}>
        <div style={styles.container}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>
          <p style={styles.error}>投稿が見つかりませんでした。</p>
        </div>
      </main>
    );
  }

  const safePost = post as PostSummary;
  const safeComments = (comments ?? []) as Comment[];
  const safeReads = (reads ?? []) as ReadRow[];
  const deadlineStatus = getDeadlineStatus(safePost.required, safePost.required_deadline);

  return (
    <main style={styles.main}>
      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>

          <div style={styles.topActions}>
            <Link href={`/admin/edit/${safePost.id}`} style={styles.editLink}>
              編集
            </Link>
            <Link href="/admin/new" style={styles.newPostLink}>
              新規投稿
            </Link>
          </div>
        </div>

        <article style={styles.article}>
          {safePost.image_url ? (
            <img src={safePost.image_url} alt={safePost.title} style={styles.image} />
          ) : null}

          <div style={styles.articleBody}>
            <div style={styles.badges}>
              <span style={styles.category}>{safePost.category}</span>
              {safePost.required ? <span style={styles.required}>必読</span> : null}
              {safePost.is_pinned ? <span style={styles.pinned}>固定</span> : null}
              {deadlineStatus === "expired" ? <span style={styles.expired}>期限切れ</span> : null}
              {deadlineStatus === "active" ? <span style={styles.deadlineActive}>期限あり</span> : null}
            </div>

            <h1 style={styles.title}>{safePost.title}</h1>

            <div style={styles.meta}>
              <span>投稿者: {safePost.author}</span>
              <span>公開日: {formatDateJST(safePost.published_at)}</span>
              <span>更新日: {formatDateJST(safePost.updated_at)}</span>
              {safePost.required && safePost.required_deadline ? (
                <span>必読期限: {formatDateJST(safePost.required_deadline)}</span>
              ) : null}
            </div>

            <p style={styles.body}>{safePost.body}</p>
          </div>
        </article>

        <section style={styles.sectionBlue}>
          <h2 style={styles.sectionTitle}>アクション</h2>
          <PostActions
            postId={safePost.id}
            initialReactionCount={safePost.reaction_count ?? 0}
            initialReadCount={safePost.actual_read_count ?? safePost.read_count ?? 0}
          />
        </section>

        <section style={styles.sectionGreen}>
          <h2 style={styles.sectionTitle}>既読者</h2>
          {safeReads.length === 0 ? (
            <p style={styles.empty}>まだ既読者はいません。</p>
          ) : (
            <div style={styles.readList}>
              {safeReads.map((read) => (
                <div key={read.id} style={styles.readItem}>
                  <strong>{read.reader_name}</strong>
                  <span>{formatDateJST(read.read_at ?? read.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.sectionPink}>
          <h2 style={styles.sectionTitle}>コメント</h2>
          <CommentList comments={safeComments} />
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
    right: "-70px",
    width: "220px",
    height: "220px",
    borderRadius: "999px",
    background: "rgba(236, 72, 153, 0.12)",
  },
  bgCircle2: {
    position: "absolute",
    bottom: "-80px",
    left: "-40px",
    width: "240px",
    height: "240px",
    borderRadius: "999px",
    background: "rgba(59, 130, 246, 0.12)",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
    position: "relative",
    zIndex: 1,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "12px",
    flexWrap: "wrap",
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
  newPostLink: {
    textDecoration: "none",
    color: "#111",
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 6px 18px rgba(251, 146, 60, 0.18)",
  },
  editLink: {
    textDecoration: "none",
    color: "#fff",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    padding: "10px 14px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(99, 102, 241, 0.26)",
  },
  article: {
    background: "linear-gradient(180deg, #ffffff 0%, #fffafb 100%)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.10)",
    marginBottom: "24px",
    border: "1px solid rgba(255,255,255,0.7)",
  },
  image: {
    width: "100%",
    height: "320px",
    objectFit: "cover",
    display: "block",
  },
  articleBody: {
    padding: "24px",
  },
  badges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "16px",
  },
  category: {
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  required: {
    background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
    color: "#b91c1c",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  pinned: {
    background: "linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)",
    color: "#166534",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  expired: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  deadlineActive: {
    background: "linear-gradient(135deg, #fde68a 0%, #fcd34d 100%)",
    color: "#92400e",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  title: {
    fontSize: "40px",
    margin: "0 0 16px",
    color: "#1f2340",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    color: "#5b6285",
    fontSize: "14px",
    marginBottom: "20px",
  },
  body: {
    fontSize: "17px",
    lineHeight: 1.95,
    whiteSpace: "pre-wrap",
    color: "#2d335a",
  },
  sectionBlue: {
    background: "linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.08)",
    marginBottom: "20px",
  },
  sectionGreen: {
    background: "linear-gradient(180deg, #f6fff9 0%, #ecfdf3 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.08)",
    marginBottom: "20px",
  },
  sectionPink: {
    background: "linear-gradient(180deg, #fff8fb 0%, #fdf2f8 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.08)",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "24px",
    color: "#1f2340",
  },
  readList: {
    display: "grid",
    gap: "10px",
  },
  readItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    background: "#ffffffcc",
    borderRadius: "14px",
    padding: "12px 14px",
  },
  empty: {
    color: "#666",
    margin: 0,
  },
  error: {
    color: "#991b1b",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "14px",
  },
};
