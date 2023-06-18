import Image from "next/image";
import Nav from "./Nav";
import BurgerMenu from "./BurgerMenu";
import Hero from "./Hero";

export default function Home() {
  return (
    <>
      <BurgerMenu />
      <main id="page-wrap" className="uppercase">
        <Nav />
        <Hero/>
        <p className="text-5xl font-LU_Heavy ">London</p>
        <p className="text-5xl font-LU_Bold ">London</p>
        <p className="text-5xl font-LU_Regular ">London</p>
        <p className="text-5xl font-LU_Medium ">London</p>
      </main>
    </>
  );
}
