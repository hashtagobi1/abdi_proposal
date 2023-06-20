import React from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import Marquee from "@/app/Marquee";
import PhotoCollection from "./PhotoCollection";

type Event = {
  title: string;
  date: Date;
  location: string;
};

const Event = () => {
  const TitleCard = ({ date, location, title }: Event) => (
    <div className="flex-col my-24 text-DT_Orange">
      <div className="justify-between items-center flex ">
        <h2 className="uppercase font-LU_Medium  tracking-widest text-2xl">
          {title}
        </h2>
        <p className="text-2xl uppercase font-LU_Medium">
          {date.toDateString()}
        </p>
      </div>
      <div className="flex mt-10 justify-center  font-LU_Regular text-center items-center">
        <p>{location}</p>
        <MapPinIcon height={20} width={20} />
      </div>
    </div>
  );
  return (
    <div className="flex-col items-center justify-center px-8">
      <TitleCard
        title={"PeakTV Block Party"}
        date={new Date()}
        location={"Stratford"}
      />
      <div className="my-8 uppercase  relative text-DT_Orange flex overflow-x-hidden font-LU_Regular">
        <div className="py-2  animate-marquee whitespace-nowrap">
          <p className="mx-10">who told you bad man don&apos;t dance?</p>
        </div>

        <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap">
          <p className="mx-10">who told you bad man don&apos;t dance?</p>
        </div>
      </div>

        <PhotoCollection />

      <div className="mt-10 flex items-center justify-center">
        <p className="max-w-xl text-justify">
          we ventured to east London, the heart of creativity in the english
          capital. we danced. we enjoyed. we made memories. these are a
          selection of some of my favourite moments. armed with my Nikkon Ultra,
          me & my team set out to capture the unlimited vibes that will last for
          future generations.
        </p>
      </div>
    </div>
  );
};

export default Event;
