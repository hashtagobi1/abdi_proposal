import React from "react";
import { MapPinIcon } from "@heroicons/react/24/solid";
import Marquee from "@/app/Marquee";

type Event = {
  title: string;
  date: Date;
  location: string;
};

const Event = () => {
  const TitleCard = ({ date, location, title }: Event) => (
    <div className="flex-col text-DT_Orange">
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
    <div className="flex-col">
      <TitleCard
        title={"PeakTV Block Party"}
        date={new Date()}
        location={"Stratford"}
      />
      <div className="my-2 uppercase relative text-DT_Orange flex overflow-x-hidden font-LU_Regular">
        <div className="py-2  animate-marquee whitespace-nowrap">
          <p className="mx-10">
            Please Mind the Gap between the good & bad vibes :))))
          </p>
        </div>

        <div className="absolute top-0 py-2 animate-marquee2 whitespace-nowrap">
          <p className="mx-10">
            Please Mind the Gap between the good & bad vibes :))))
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-center">
        <p className="max-w-xl text-justify">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industrys standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
      </div>
    </div>
  );
};

export default Event;
