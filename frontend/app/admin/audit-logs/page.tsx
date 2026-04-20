"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { formatDateJST } from "@/lib/format-date";

type AuditLogRow = {
  id: number;
  created_at: string;
  user_id: string;
  user_name: string;
  action: string;
  target_type: string;
  target_id: string | null;
  detail: Record<string, unknown> | null;
};

function formatAction(action: string) {
  switch (action) {
    case "login":
      return "ログイン";
    case "post_create":
      return "投稿作成";
    case "post_update":
      return "投稿更新";
    case "post_delete":
      return "投稿削除";
    case "post_read":
      return "既読";
    case "post_like":
      return "いいね";
    case "comment_create":
      return "コメント作成";
    case "comment_update":
      return "コメント更新";
    case "comment_delete":
      return "コメント削除";
    default:
      return action;
  }
}

function formatTargetType(targetType: string) {
  switch (targetType) {
    case "auth":
      return "認証";
    case "post":
      return "投稿";
    case "comment":
      return "コメント";
    default:
      return targetType;
  }
}

function formatDetail(detail: Record<string, unknown> | null) {
  if (!detail) return "―";

  const entries = Object.entries(detail);
  if (entries.length === 0) return "―";

  const keyLabelMap: Record<string, string> = {
    email: "メールアドレス",
    title: "タイトル",
    status: "公開状態",
    category: "カテゴリ",
    isPinned: "固定表示",
    required: "必読",
    readerName: "既読者",
    reactionType: "リアクション種別",
    body: "本文",
    author: "投稿者",
  };

  const valueLabelMap: Record<string, string> = {
    published: "公開",
    draft: "下書き",
    archived: "アーカイブ",
    like: "いいね",
    true: "あり",
    false: "なし",
  };

  return entries
    .map(([key, value]) => {
      const label = keyLabelMap[key] ?? key;
      const rawValue = String(value);
      const displayValue = valueLabelMap[rawValue] ?? rawValue;
      return `${label}: ${displayValue}`;
    })
    .join(" / ");
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadLogs() {
      setLoading(true);
      setMessage(null);

      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (!mounted) return;

      if (error) {
        setMessage(`監査ログ取得に失敗しました: ${error.message}`);
        setLogs([]);
        setLoading(false);
        return;
      }

      setLogs((data ?? []) as AuditLogRow[]);
      setLoading(false);
    }

    loadLogs();

    return () => {
      mounted = false;
    };
  }, []);

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
          <div style={styles.kicker}>AUDIT LOGS</div>
          <h1 style={styles.title}>監査ログ一覧</h1>
          <p style={styles.subtitle}>ログイン・投稿・コメント・既読などの操作履歴です。</p>
        </section>

        <section style={styles.tableWrap}>
          {loading ? (
            <div style={styles.emptyBox}>読み込み中...</div>
          ) : message ? (
            <div style={styles.error}>{message}</div>
          ) : logs.length === 0 ? (
            <div style={styles.emptyBox}>監査ログはまだありません。</div>
          ) : (
            <div style={styles.tableScroll}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>日時</th>
                    <th style={styles.th}>ユーザー</th>
                    <th style={styles.th}>操作</th>
                    <th style={styles.th}>対象</th>
                    <th style={styles.th}>対象ID</th>
                    <th style={styles.th}>詳細</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.id} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.td}>{formatDateJST(log.created_at)}</td>
                      <td style={styles.td}>{log.user_name}</td>
                      <td style={styles.td}>
                        <span style={styles.actionBadge}>{formatAction(log.action)}</span>
                      </td>
                      <td style={styles.td}>{formatTargetType(log.target_type)}</td>
                      <td style={styles.td}>{log.target_id ?? "―"}</td>
                      <td style={styles.tdDetail}>{formatDetail(log.detail)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
    maxWidth: "1200px",
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
  tableWrap: {
    background: "linear-gradient(180deg, #ffffff 0%, #fffafb 100%)",
    borderRadius: "24px",
    padding: "18px",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.10)",
  },
  tableScroll: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "980px",
  },
  th: {
    textAlign: "left",
    padding: "14px 12px",
    fontSize: "14px",
    color: "#394067",
    borderBottom: "1px solid #e5e7eb",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#2d335a",
    verticalAlign: "top",
  },
  tdDetail: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#2d335a",
    verticalAlign: "top",
    minWidth: "260px",
    lineHeight: 1.7,
  },
  rowEven: {
    background: "rgba(255,255,255,0.7)",
  },
  rowOdd: {
    background: "rgba(248,250,252,0.9)",
  },
  actionBadge: {
    display: "inline-block",
    background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
    color: "#1d4ed8",
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },
  emptyBox: {
    background: "linear-gradient(180deg, #ffffff 0%, #faf5ff 100%)",
    borderRadius: "20px",
    padding: "32px",
    textAlign: "center",
    color: "#666",
  },
  error: {
    color: "#991b1b",
    background: "#fee2e2",
    padding: "16px",
    borderRadius: "14px",
  },
};
