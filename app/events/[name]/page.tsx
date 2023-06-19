import React from "react";
import Event from "./Event";

type URLParams = {
  params: { name: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

const EventName = ({ params, searchParams }: URLParams) => {
  return (
    <div>
      <Event />
    </div>
  );
};

export default EventName;
