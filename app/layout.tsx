import type { Metadata } from "next";
import { currentUser } from "@/lib/auth";
import { CartProvider } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import "./globals.css";
import "./refresh.css";
import "./auth.css";
import "./stores.css";
import "./store-website.css";
import { PlatformFooter } from "@/components/platform-footer";
export const metadata: Metadata = {
  title: {
    default: "TailUp — Chăm chút cho người bạn nhỏ",
    template: "%s | TailUp",
  },
  description:
    "Dịch vụ chăm sóc thú cưng, đồ dùng và hồ sơ của bé trong một nơi.",
};
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  return (
    <html lang="vi">
      <body>
        <CartProvider>
          <Header user={user} />
          {process.env.PREVIEW_MODE === "true" && (
            <div className="preview-banner">
              Bản xem giao diện · Kết nối MySQL để đăng nhập, lưu hồ sơ và đặt
              lịch.
            </div>
          )}
          <main id="main">{children}</main>
          <PlatformFooter>
            <Footer />
          </PlatformFooter>
        </CartProvider>
      </body>
    </html>
  );
}
