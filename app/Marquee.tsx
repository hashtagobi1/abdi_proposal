import React from "react";



const Marquee = () => {
  return (
    <div className="my-36 relative flex overflow-x-hidden font-LU_Regular">
      <div className="py-24  animate-marquee whitespace-nowrap">
        <p className="mx-5">
          Please Mind the Gap between the good & bad vibes :))))
        </p>
      </div>

      <div className="absolute top-0 py-24 animate-marquee2 whitespace-nowrap">
        <p className="mx-5">
          Please Mind the Gap between the good & bad vibes :))))
        </p>
      </div>
    </div>
  );
};

export default Marquee;
