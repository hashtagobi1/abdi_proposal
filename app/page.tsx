import Image from "next/image";
import Nav from "./Nav";
import BurgerMenu from "./BurgerMenu";

export default function Home() {
  return (
    <>
      <BurgerMenu />
      <main id="page-wrap" className="">
        <Nav />
      </main>
    </>
  );
}
