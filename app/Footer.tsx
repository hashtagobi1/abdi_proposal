import React from "react";
import { SocialIcon } from "react-social-icons";

type Props = {};

const Footer = (props: Props) => {
  return (
    <footer className="text-white justify-center items-center flex-col flex mt-10 font-LU_Medium lowercase">
      <p className="tracking-wider text-DT_Yellow">Be Outside.</p>

      <div className="flex justify-center items-center text-red-500">
        <span>
          <SocialIcon
            fgColor="#EEE97E"
            bgColor="none"
            url="https://twitter.com/jaketrent"
          />
        </span>

        <span className="text-DT_Orange">
          <SocialIcon
            fgColor="#EEE97E"
            bgColor="none"
            className="bg-none"
            url="https://instagram.com/jaketrent"
          />
        </span>
      </div>
    </footer>
  );
};

export default Footer;
