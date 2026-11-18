import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { CtaBand } from "@/components/layout/CtaBand";
import { FloatingContacts } from "@/components/layout/FloatingContacts";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileContactBar } from "@/components/layout/MobileContactBar";
import { TopBar } from "@/components/layout/TopBar";

const roboto = Roboto({
  weight: ["400", "500", "600", "700", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: {
    default: "Vertex Sport – Đồ thể thao thiết kế theo yêu cầu",
    template: "%s | Vertex Sport",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-12 min-[850px]:pb-0">
        <TopBar />
        <Header />
        <main className="flex-1">{children}</main>
        <CtaBand />
        <Footer />
        <FloatingContacts />
        <MobileContactBar />
      </body>
    </html>
  );
}
