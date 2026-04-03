import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tunag Lite",
  description: "TUNAG風 社内ポータル MVP",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
