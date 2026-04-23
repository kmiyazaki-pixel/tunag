"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PortalSidebar from "@/components/portal-sidebar";
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

type UserInfo = {
  name: string;
  email: string | null;
} | null;

export default function PortalHomeShell({
  posts,
}: {
  posts: PostSummary[];
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        setUserInfo(null);
        return;
      }

      const name =
        (user.user_metadata?.name as string | undefined)?.trim() ||
        user.email?.split("@")[0] ||
        "ユーザー";

      setUserInfo({
        name,
        email: user.email ?? null,
      });
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await supabase.auth.signOut();
    } finally {
      window.location.href = "/login";
    }
  }

  const totalPosts = posts.length;
  const totalReads = posts.reduce((sum, post) => sum + (post.actual_read_count ?? 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.comment_count ?? 0), 0);
  const totalReactions = posts.reduce((sum, post) => sum + (post.reaction_count ?? 0), 0);

  return (
    <main style={styles.page}>
      <style jsx>{`
        @media (max-width: 959px) {
          .portal-sidebar-mobile {
            position: fixed !important;
            top: 0;
            left: 0;
            bottom: 0;
            width: 82vw !important;
            min-width: 82vw !important;
            max-width: 82vw !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            z-index: 40;
          }

          .portal-main-mobile {
            padding: 16px !important;
          }

          .portal-menu-button {
            display: inline-flex !important;
          }

          .portal-top-actions {
            width: 100%;
            justify-content: flex-start !important;
          }
        }

        @media (min-width: 960px) {
          .portal-menu-button {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.bgCircle1} />
      <div style={styles.bgCircle2} />
      <div style={styles.bgCircle3} />

      {menuOpen && <div style={styles.backdrop} onClick={() => setMenuOpen(false)} />}

      <div
        className="portal-sidebar-mobile"
        style={{
          ...styles.sidebarWrap,
          ...(menuOpen ? styles.sidebarWrapOpen : {}),
        }}
      >
        <PortalSidebar onClose={() => setMenuOpen(false)} />
      </div>

      <div className="portal-main-mobile" style={styles.mainArea}>
        <div style={styles.container}>
          <div style={styles.mobileHeader}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="portal-menu-button"
              style={styles.menuButton}
            >
              ☰
            </button>
            <div style={styles.mobileHeaderTitle}>社内ポータル</div>
          </div>

          <section style={styles.heroCard}>
            <div style={styles.heroTop}>
              <div>
                <div style={styles.kicker}>INTERNAL PORTAL</div>
                <h1 style={styles.title}>社内ポータル</h1>
                <p style={styles.subtitle}>お知らせ・必読・コメントをまとめて確認</p>
              </div>

              <div className="portal-top-actions" style={styles.topActions}>
                <Link href="/admin/new" style={styles.primaryButton}>
                  新規投稿
                </Link>

                <Link href="/admin/audit-logs" style={styles.secondaryButton}>
                  監査ログ
                </Link>

                <div style={styles.userBadge}>
                  ログイン中: {userInfo?.name || userInfo?.email || "ゲスト"}
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  style={loggingOut ? styles.logoutDisabled : styles.logoutButton}
                >
                  {loggingOut ? "ログアウト中..." : "ログアウト"}
                </button>
              </div>
            </div>
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
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.30)",
    zIndex: 20,
  },
  sidebarWrap: {
    position: "relative",
    zIndex: 30,
  },
  sidebarWrapOpen: {
    transform: "translateX(0)",
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
  mobileHeader: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
  },
  mobileHeaderTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1f2340",
  },
  menuButton: {
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(99,102,241,0.16)",
    borderRadius: "12px",
    background: "#fff",
    width: "44px",
    height: "44px",
    cursor: "pointer",
    fontSize: "22px",
    fontWeight: 800,
  },
  heroCard: {
    background: "linear-gradient(180deg, #ffffff 0%, #fffafb 100%)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 14px 30px rgba(91, 98, 133, 0.10)",
    marginBottom: "24px",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
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
  topActions: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    justifyContent: "flex-end",
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
  secondaryButton: {
    display: "inline-block",
    background: "linear-gradient(135deg, #ecfdf3 0%, #d1fae5 100%)",
    color: "#166534",
    textDecoration: "none",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(16, 185, 129, 0.16)",
  },
  userBadge: {
    background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)",
    color: "#1d4ed8",
    padding: "12px 16px",
    borderRadius: "12px",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(59, 130, 246, 0.12)",
  },
  logoutButton: {
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    color: "#9a3412",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(251, 146, 60, 0.18)",
  },
  logoutDisabled: {
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)",
    color: "#9a3412",
    padding: "12px 16px",
    cursor: "not-allowed",
    fontWeight: 800,
    opacity: 0.6,
    boxShadow: "0 8px 18px rgba(251, 146, 60, 0.18)",
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
};
