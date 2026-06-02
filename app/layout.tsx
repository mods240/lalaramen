import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ラ・ラ・ラーメン - ラーメン店ナビ",
  description: "全国のラーメン・つけ麺・担々麺などの麺料理店を地図で見つけるアプリ。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ラ・ラ・ラーメン",
  },
  icons: { apple: "/ramen-icon-192.png" },
  openGraph: {
    title: "ラ・ラ・ラーメン🍜 - ラーメン店ナビ",
    description: "全国のラーメン・つけ麺・担々麺などの麺料理店を地図で見つけるアプリ。",
    url: "https://ramen.vercel.app",
    siteName: "ラ・ラ・ラーメン",
    images: [{ url: "https://ramen.vercel.app/ramen-icon-512.png", width: 512, height: 512 }],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "ラ・ラ・ラーメン🍜 - ラーメン店ナビ",
    description: "全国のラーメン・つけ麺・担々麺などの麺料理店を地図で見つけるアプリ。",
    images: ["https://ramen.vercel.app/ramen-icon-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ラ・ラ・ラーメン" />
        <link rel="icon" href="/ramen-icon-192.png" type="image/png" />
        <link rel="apple-touch-icon" href="/ramen-icon-192.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0822883607725147" crossOrigin="anonymous"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
