import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <div>
        <div className="brand">Tunag Lite</div>
        <div className="muted">社内報・お知らせ・必読確認のMVP</div>
      </div>
      <nav className="nav">
        <Link href="/">ホーム</Link>
        <Link href="/admin/new">投稿作成</Link>
      </nav>
    </header>
  );
}
