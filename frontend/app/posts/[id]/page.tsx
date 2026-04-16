export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PostActions from "@/components/post-actions";

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

type PostImage = {
  id: number;
  image_url: string;
  sort_order: number;
};

function formatDate(value: string | null) {
  if (!value) return "日時未設定";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日時不明";
  return date.toLocaleString("ja-JP");
}

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

  const [
    { data: post, error: postError },
    { data: comments },
    { data: reads },
    { data: images },
  ] = await Promise.all([
    supabase.from("post_summary").select("*").eq("id", postId).single(),
    supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", postId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("post_reads")
      .select("id, reader_name, created_at, read_at")
      .eq("post_id", postId)
      .order("created_at", { ascending: true }),
    supabase
      .from("post_images")
      .select("*")
      .eq("post_id", postId)
      .order("sort_order", { ascending: true }),
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
  const safeImages = (images ?? []) as PostImage[];
  const deadlineStatus = getDeadlineStatus(safePost.required, safePost.required_deadline);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <div style={styles.topRow}>
          <Link href="/" style={styles.backLink}>
            ← 一覧へ戻る
          </Link>

          <div style={styles.topActions}>
            <Link href={`/admin/edit/${safePost.id}`} style={styles.editLink}>
              編集
            </Link>
            <Link href="/admin/new" style={styles.adminLink}>
              新規投稿
            </Link>
          </div>
        </div>

        <article style={styles.article}>
          {safeImages.length > 0 ? (
            <div style={styles.gallery}>
              {safeImages.map((img, index) => (
                <div key={img.id} style={styles.galleryItem}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt={`${safePost.title}-${index + 1}`} style={styles.image} />
                </div>
              ))}
            </div>
          ) : safePost.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
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
              <span>公開日: {formatDate(safePost.published_at)}</span>
              <span>更新日: {formatDate(safePost.updated_at)}</span>
              {safePost.required && safePost.required_deadline ? (
                <span>必読期限: {formatDate(safePost.required_deadline)}</span>
              ) : null}
            </div>

            {deadlineStatus === "expired" ? (
              <div style={styles.alertExpired}>この必読投稿は期限切れです。</div>
            ) : null}

            {deadlineStatus === "active" ? (
              <div style={styles.alertActive}>
                この投稿は必読です。期限は {formatDate(safePost.required_deadline)} です。
              </div>
            ) : null}

            {deadlineStatus === "required" ? (
              <div style={styles.alertRequired}>この投稿は必読です。</div>
            ) : null}

            <p style={styles.body}>{safePost.body}</p>
          </div>
        </article>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>アクション</h2>
          <PostActions
            postId={safePost.id}
            initialReactionCount={safePost.reaction_count ?? 0}
            initialReadCount={safePost.actual_read_count ?? safePost.read_count ?? 0}
            currentReaderName="山田"
            currentCommentAuthor="社員"
          />
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>既読者</h2>
          {safeReads.length === 0 ? (
            <p style={styles.empty}>まだ既読者はいません。</p>
          ) : (
            <div style={styles.readList}>
              {safeReads.map((read) => (
                <div key={read.id} style={styles.readItem}>
                  <strong>{read.reader_name}</strong>
                  <span>{formatDate(read.read_at ?? read.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>コメント</h2>
          {safeComments.length === 0 ? (
            <p style={styles.empty}>コメントはまだありません。</p>
          ) : (
            <div style={styles.commentList}>
              {safeComments.map((comment) => (
                <div key={comment.id} style={styles.commentItem}>
                  <div style={styles.commentHead}>
                    <strong>{comment.author}</strong>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                  <p style={styles.commentBody}>{comment.body}</p>
                </div>
              ))}
            </div>
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
    maxWidth: "960px",
    margin: "0 auto",
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
    color: "#2563eb",
    fontWeight: 700,
  },
  adminLink: {
    textDecoration: "none",
    color: "#111",
    background: "#fff",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 700,
  },
  editLink: {
    textDecoration: "none",
    color: "#fff",
    background: "#111827",
    padding: "10px 14px",
    borderRadius: "10px",
    fontWeight: 700,
  },
  article: {
    background: "#fff",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    marginBottom: "24px",
  },
  gallery: {
    display: "grid",
    gap: "8px",
    padding: "8px",
    background: "#f3f4f6",
  },
  galleryItem: {
    overflow: "hidden",
    borderRadius: "12px",
    background: "#fff",
  },
  image: {
    width: "100%",
    maxHeight: "420px",
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
  expired: {
    background: "#dc2626",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  deadlineActive: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  title: {
    fontSize: "32px",
    margin: "0 0 16px",
  },
  meta: {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    color: "#666",
    fontSize: "14px",
    marginBottom: "20px",
  },
  alertExpired: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
    marginBottom: "18px",
  },
  alertActive: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
    marginBottom: "18px",
  },
  alertRequired: {
    background: "#eef2ff",
    color: "#1e3a8a",
    padding: "12px 14px",
    borderRadius: "12px",
    fontWeight: 700,
    marginBottom: "18px",
  },
  body: {
    fontSize: "16px",
    lineHeight: 1.9,
    whiteSpace: "pre-wrap",
  },
  section: {
    background: "#fff",
    borderRadius: "18px",
    padding: "24px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: "0 0 16px",
    fontSize: "22px",
  },
  readList: {
    display: "grid",
    gap: "10px",
  },
  readItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "12px 14px",
  },
  commentList: {
    display: "grid",
    gap: "12px",
  },
  commentItem: {
    background: "#f9fafb",
    borderRadius: "12px",
    padding: "14px 16px",
  },
  commentHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#444",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  commentBody: {
    margin: 0,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  },
  empty: {
    color: "#666",
    margin: 0,
  },
  error: {
    color: "#b91c1c",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "12px",
  },
};
