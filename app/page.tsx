import Image from "next/image";
import Nav from "./Nav";
import BurgerMenuEdit from "./BurgerMenuEdit";
import Hero from "./Hero";
import Footer from "./Footer";

export default function Home() {
  return (
    <>
      <BurgerMenuEdit />
      <main id="page-wrap" className="flex-col flex items-center justify-centeruppercase">
        <Nav />
        <Hero />
      </main>
      <Footer />
    </>
  );
}
