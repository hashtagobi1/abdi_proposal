"use client";


import { AnimatePresence, motion } from "framer-motion";
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

  const listItem = {
    transition: {
      ease: "easeInOut",
      duration: 0.5,
    },
    variants: {
      hidden: { x: 50, opacity: 0, filter: "blur(15px)" },
      show: { x: 0, opacity: 1, filter: "blur(0px)" },
      exit: { x: 50, opacity: 0, filter: "blur(15px)"}
    },
  };

  const listContainer = {
    variants: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          // delayChildren: 0.5,
        },
      },
    },
  };

  return (
    <header className="">
      <HamburgerDrawer useFocusBounder={true}>
        <nav className=" h-screen  font-LU_Heavy bg-black text-DT_Orange">
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
                <AnimatePresence>
                  <motion.ul
                    exit={{ opacity: 0 }}
                    variants={listContainer.variants}
                    animate="show"
                    initial="hidden"
                    className=""
                  >
                    {/* TODO: add animation */}
                    <motion.li
                      variants={listItem.variants}
                      className=" my-4 text-DT_Yellow text-sm "
                    >
                      <Link href={"/events/PeakTV"}>
                        <p>Peak TV</p>
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={listItem.variants}
                      className=" my-4 text-DT_Yellow text-sm "
                    >
                      <Link href={"/events/Play Piem"}>
                        <p>Play Piem</p>
                      </Link>
                    </motion.li>
                    <motion.li
                      variants={listItem.variants}
                      className=" my-4  text-DT_Yellow text-sm "
                    >
                      <Link href={"/events/DLT Malta"}>
                        <p>DLT Malta</p>
                      </Link>
                    </motion.li>
                  </motion.ul>
                </AnimatePresence>
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
