import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "웰컴맵 - 모두를 위한 접근성 지도",
  description: "엘리베이터, 음성 키오스크, 계단 단차 정보를 한 눈에 — 장애인·노인·임산부를 위한 접근성 지도",
  openGraph: {
    title: "웰컴맵",
    description: "모두를 위한 접근성 지도",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`}>
      <body className="h-full font-sans antialiased">{children}</body>
    </html>
  );
}
