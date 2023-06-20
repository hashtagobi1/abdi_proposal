import Image from "next/image";
import Link from "next/link";
import React from "react";

type Props = {};

const Hero = (props: Props) => {
  return (
    <div className="flex-col justify-center items-center">
      <div>
        <Image
          src={"/images/maps/londonBoroughs.png"}
          alt="Map of London with all Boroughs"
          className="hue-rotate-[50deg]"
          width={600}
          height={600}
        />
      </div>
      <div className="flex items-center justify-around m-4">
        <Link href={"/events/PeakTv"} passHref>
          <button
            className="
          border   hover:border-DT_Orange text-center 
          hover:text-DT_Yellow transition-all 
          border-DT_Yellow font-LU_Heavy p-2 rounded-md"
          >
            pree some pics
          </button>
        </Link>
        <p className=" font-LU_Medium ">
          a visual project by{" "}
          <a target="_blank" href={"htp://www.instagram.com/filmabdi"}>
            <span className="underline-offset-1 hover:text-DT_Orange text-DT_Yellow ">
              {" "}
              filmabdi.
            </span>
          </a>
        </p>
      </div>
    </div>
  );
};

export default Hero;
