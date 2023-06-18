import Image from "next/image";
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
      <p className="text-5xl font-LU_Heavy ">London</p>
      <p className="text-5xl font-LU_Bold ">London</p>
      <p className="text-5xl font-LU_Regular ">London</p>
      <p className="text-5xl font-LU_Medium ">London</p>
    </div>
  );
};

export default Hero;
