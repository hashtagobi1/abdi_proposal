import Footer from "./Footer";
import Nav from "./Nav";
import dynamic from "next/dynamic";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

const DynamicComponentWithNoSSR = dynamic(() => import("./BurgerMenuEdit"), {
  ssr: false,
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        {/* <BurgerMenuEdit /> */}
        <DynamicComponentWithNoSSR />
        <Nav />
        {children}
      </body>
      <Footer />
    </html>
  );
}
