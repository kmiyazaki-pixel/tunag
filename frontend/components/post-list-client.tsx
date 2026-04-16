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
          filteredPosts.map((post) => (
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
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  filterSection: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
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
    fontWeight: 600,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "16px",
    boxSizing: "border-box",
  },
  checkLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
  },
  resultText: {
    color: "#555",
    fontSize: "14px",
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
};
