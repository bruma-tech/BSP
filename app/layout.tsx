import "@/app/components/global.css";
import { inter } from "./components/ui/fonts";
import "./global.css";
import GlobalModal from "@/app/components/GlobalModal";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <GlobalModal />
        {children}
      </body>
    </html>
  );
}