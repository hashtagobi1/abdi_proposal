import { motion } from "framer-motion";
import React from "react";
import BurgerMenu from "./BurgerMenuEdit";
import { Oi } from "next/font/google";
import Link from "next/link";

type Props = {};

const oi = Oi({
  weight: "400",
  subsets: ["latin"],
});

const Nav = (props: Props) => {
  return (
    <nav className={` `}>
      <Link passHref href={"/"}>
        <h1
          className={`text-mainYellow text-center text-3xl tracking-widest ${oi.className}`}
        >
          Summer Is Ours
        </h1>
      </Link>
    </nav>
  );
};

export default Nav;
