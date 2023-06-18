"use client";
import { push as Menu } from "react-burger-menu";
import React, { useState } from "react";
import HamburgerDrawer from "react-hamburger-drawer";
import Link from "next/link";

const BurgerMenuEdit = () => {
  // const NavLink = (linkName: string) => {
  //   if (linkName === "home" || linkName === "Home") {
  //     return (
  //       <li>
  //         <Link className="capitalize" href={`/`}>
  //           {linkName}
  //         </Link>
  //       </li>
  //     );
  //   }

  //   return (
  //     <li>
  //       <Link className="capitalize" href={`${linkName}`}>
  //         {linkName}
  //       </Link>
  //     </li>
  //   );
  // };

  return (
    <header className="">
      <HamburgerDrawer useFocusBounder={true}>
        <nav className="flex-col  h-screen  font-LU_Regular bg-black text-DT_Orange">
          <ul className="">
            {/* <NavLink linkName="home" /> */}
            <li className="animate-pulse mt-5 text-center text-2xl">
              <Link href={"/"}>Home</Link>
            </li>
            <li className="animate-pulse mt-5 text-center text-2xl">
              <Link href={"/collections"}>Collections</Link>
            </li>
            <li className="animate-pulse mt-5 text-center text-2xl">
              <Link href={"/about"}>About</Link>
            </li>
            <li className="animate-pulse mt-5 text-center text-2xl">
              <Link href={"/contact"}>Contact</Link>
            </li>
          </ul>
        </nav>
      </HamburgerDrawer>
    </header>
  );
};

export default BurgerMenuEdit;
