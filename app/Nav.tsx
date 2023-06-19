import React from "react";
import BurgerMenu from "./BurgerMenuEdit";
import { Oi } from "next/font/google";

type Props = {};

const oi = Oi({
  weight: "400",
  subsets: ["latin"],
});

const Nav = (props: Props) => {
  return (
    <nav className={` `}>
      <h1
        className={
          `text-mainYellow text-center text-3xl tracking-widest ${oi.className}`
        }
      >
        Summer Is Ours
      </h1>
    </nav>
  );
};

export default Nav;
