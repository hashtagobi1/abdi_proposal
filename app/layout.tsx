import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  metadataBase: new URL("https://gsselections.vercel.app"),
  title: "G's Selections · London this week",
  description: "G's weekly picks of London's creative scene, on a map.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Dark by default. The script runs before the page paints so a saved
    // "light" choice never flashes dark first.
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("theme")==="light")document.documentElement.classList.remove("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className={`${inter.className} bg-page text-fg`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
