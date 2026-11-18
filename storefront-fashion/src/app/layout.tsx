import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { CartIcon } from "@/components/cart/CartIcon";
import { CartProvider } from "@/components/cart/CartProvider";
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
    default: "Lá Studio – Thời trang nữ mỗi ngày",
    template: "%s | Lá Studio",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col pb-12 min-[850px]:pb-0">
        <CartProvider>
          <TopBar />
          <Header cartSlot={<CartIcon />} />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingContacts />
          <MobileContactBar />
        </CartProvider>
      </body>
    </html>
  );
}
