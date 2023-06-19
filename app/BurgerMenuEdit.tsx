"use client";

import React from "react";
import HamburgerDrawer from "react-hamburger-drawer";
import Link from "next/link";
import Marquee from "./Marquee";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

const BurgerMenuEdit = () => {
  const [showEvents, setShowEvents] = React.useState(false);
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

  const handleEvents = () => {};

  return (
    <header className="">
      <HamburgerDrawer useFocusBounder={true}>
        <nav className="flex-col justify-between items-center h-screen  font-LU_Heavy bg-black text-DT_Orange">
          <ul className="">
            {/* <NavLink linkName="home" /> */}
            <li className=" mt-5 text-center text-2xl">
              <Link href={"/"}>Home</Link>
            </li>
            <li className=" mt-5 text-center  items-center justify-center flex-col  text-2xl">
              <div className="flex justify-center items-center">
                <button onClick={() => setShowEvents(!showEvents)}>
                  Events
                </button>
                <ChevronDownIcon
                  className="cursor-pointer"
                  onClick={() => setShowEvents(!showEvents)}
                  height={24}
                  width={24}
                />
              </div>
              {showEvents && (
                <div className="flex-col gap-6 overflow-auto">
                  {/* TODO: add animation */}
                  <button className="border my-4 border-red-600 text-DT_Yellow text-sm ">
                    <Link href={"/events/PeakTV"}>
                      <p>Peak TV</p>
                    </Link>
                  </button>
                  <button className="border my-4 border-red-600 text-DT_Yellow text-sm ">
                    <Link href={"/events/Play Piem"}>
                      <p>Play Piem</p>
                    </Link>
                  </button>
                  <button className="border my-4 border-red-600 text-DT_Yellow text-sm ">
                    <Link href={"/events/DLT Malta"}>
                      <p>DLT Malta</p>
                    </Link>
                  </button>
                </div>
              )}
            </li>
            <li className=" mt-5 text-center text-2xl">
              <Link href={"/about"}>About</Link>
            </li>
            <li className=" mt-5 text-center text-2xl">
              <Link href={"/contact"}>Contact</Link>
            </li>
          </ul>
          <Marquee />
        </nav>
      </HamburgerDrawer>
    </header>
  );
};

export default BurgerMenuEdit;
