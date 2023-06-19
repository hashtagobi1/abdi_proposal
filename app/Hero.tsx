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
          width={300}
          height={300}
        />
      </div>
      <p className="text-md m-4 font-LU_Medium ">
        a visual project by{" "}
        <Link passHref href={"instagram.com/filmabdi"}>
          <span className="underline-offset-1 text-DT_Yellow ">filmabdi.</span>
        </Link>
      </p>
    </div>
  );
};

export default Hero;
