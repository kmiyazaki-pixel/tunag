"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

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

type Props = {
  posts: PostSummary[];
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

function getDeadlineStatus(required: boolean, deadline: string | null) {
  if (!required) return "normal";
  if (!deadline) return "required";

  const now = new Date();
  const limit = new Date(deadline);

  if (Number.isNaN(limit.getTime())) return "required";
  if (limit.getTime() < now.getTime()) return "expired";

  return "active";
}

export default function PostListClient({ posts }: Props) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("すべて");
  const [requiredOnly, setRequiredOnly] = useState(false);

  const categories = useMemo(() => {
    const values = Array.from(new Set(posts.map((post) => post.category).filter(Boolean)));
    return ["すべて", ...values];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = keyword.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesKeyword =
        q === "" ||
        post.title.toLowerCase().includes(q) ||
        post.body.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q);

      const matchesCategory = category === "すべて" || post.category === category;
      const matchesRequired = !requiredOnly || post.required;

      return matchesKeyword && matchesCategory && matchesRequired;
    });
  }, [posts, keyword, category, requiredOnly]);

  return (
    <>
      <section style={styles.filterSection}>
        <div style={styles.filterGrid}>
          <label style={styles.label}>
            <span>キーワード検索</span>
            <input
              style={styles.input}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="タイトル・本文・投稿者で検索"
            />
          </label>

          <label style={styles.label}>
            <span>カテゴリ</span>
            <select
              style={styles.input}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label style={styles.checkLabel}>
          <input
            type="checkbox"
            checked={requiredOnly}
            onChange={(e) => setRequiredOnly(e.target.checked)}
          />
          <span>必読のみ表示</span>
        </label>

        <div style={styles.resultText}>表示件数: {filteredPosts.length} 件</div>
      </section>

      <section style={styles.listSection}>
        {filteredPosts.length === 0 ? (
          <div style={styles.emptyBox}>条件に一致する投稿がありません。</div>
        ) : (
          filteredPosts.map((post, index) => {
            const deadlineStatus = getDeadlineStatus(post.required, post.required_deadline);
            const cardStyle =
              index % 4 === 0
                ? styles.postCardPink
                : index % 4 === 1
                ? styles.postCardBlue
                : index % 4 === 2
                ? styles.postCardGreen
                : styles.postCardYellow;

            return (
              <article key={post.id} style={{ ...styles.postCard, ...cardStyle }}>
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} style={styles.image} />
                ) : null}

                <div style={styles.postBody}>
                  <div style={styles.metaRow}>
                    <span style={styles.category}>{post.category}</span>
                    {post.required ? <span style={styles.required}>必読</span> : null}
                    {post.is_pinned ? <span style={styles.pinned}>固定</span> : null}
                    {deadlineStatus === "expired" ? (
                      <span style={styles.expired}>期限切れ</span>
                    ) : null}
                    {deadlineStatus === "active" ? (
                      <span style={styles.deadlineActive}>期限あり</span>
                    ) : null}
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
                    {post.required && post.required_deadline ? (
                      <span>必読期限: {formatDate(post.required_deadline)}</span>
                    ) : null}
                  </div>

                  <div style={styles.linkRow}>
                    <Link href={`/posts/${post.id}`} style={styles.secondaryButton}>
                      詳細を見る
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  filterSection: {
    background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 10px 26px rgba(91, 98, 133, 0.10)",
    marginBottom: "24px",
    display: "grid",
    gap: "14px",
  },
  filterGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontWeight: 700,
    color: "#394067",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d8dcef",
    borderRadius: "12px",
    fontSize: "16px",
    boxSizing: "border-box",
    background: "#fff",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
    color: "#394067",
  },
  resultText: {
    color: "#5b6285",
    fontSize: "14px",
    fontWeight: 700,
  },
  listSection: {
    display: "grid",
    gap: "20px",
  },
  postCard: {
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 12px 28px rgba(91, 98, 133, 0.10)",
    border: "1px solid rgba(255,255,255,0.75)",
  },
  postCardPink: {
    background: "linear-gradient(180deg, #fff8fb 0%, #fff1f6 100%)",
  },
  postCardBlue: {
    background: "linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%)",
  },
  postCardGreen: {
    background: "linear-gradient(180deg, #f7fff9 0%, #ecfdf3 100%)",
  },
  postCardYellow: {
    background: "linear-gradient(180deg, #fffdf5 0%, #fef3c7 100%)",
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
  postTitle: {
    margin: "0 0 12px",
    fontSize: "26px",
  },
  postTitleLink: {
    color: "#1f2340",
    textDecoration: "none",
    fontWeight: 800,
  },
  postText: {
    color: "#3e466f",
    lineHeight: 1.8,
    marginBottom: "16px",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "8px",
    color: "#5b6285",
    fontSize: "14px",
    marginBottom: "16px",
    fontWeight: 600,
  },
  linkRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  secondaryButton: {
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
};
