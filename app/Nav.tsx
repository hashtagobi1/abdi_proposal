import React from "react";
import { Oi } from "next/font/google";
import Link from "next/link";

type Props = {};

const oi = Oi({
  weight: "400",
  subsets: ["latin"],
});

const Nav = (props: Props) => {
  return (
    <nav className={`my-4`}>
      <Link passHref href={"/"}>
        <h1
          className={`text-mainYellow uppercase text-center text-5xl tracking-widest ${oi.className}`}
        >
          Summer Is Ours
        </h1>
      </Link>
    </nav>
  );
};

export default Nav;
