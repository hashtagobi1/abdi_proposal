"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import Lightbox from "react-spring-lightbox";

type Props = {};

const PhotoCollection = (props: Props) => {
  const [currentImageIndex, setCurrentIndex] = React.useState(0);
  const [showImages, setShowImages] = React.useState<boolean>(false);

  const imageList = [
    {
      src: "/images/blockParty/1.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/2.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/3.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/4.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/5.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/6.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/7.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/9.jpg",
      alt: "image",
    },
    {
      src: "/images/blockParty/8.jpg",
      alt: "image",
    },
  ];

  const gotoPrevious = () =>
    currentImageIndex > 0 && setCurrentIndex(currentImageIndex - 1);

  const gotoNext = () =>
    currentImageIndex + 1 < imageList.length &&
    setCurrentIndex(currentImageIndex + 1);

  // TODO: replace all images with Peak TV
  // TODO: make arrows work properly
  // TODO: fix column arrangement in nav bar.

  const CustomHeader = () => <h1 className="text-white text-5xl">Header</h1>;

  const handleClose = () => {
    setShowImages(false);
  };

  return (
    <div className="p-2 w-full h-full flex justify-center items-center ">
      <button
        onClick={() => setShowImages(true)}
        className="border hover:border-DT_Orange hover:text-DT_Yellow transition-all border-DT_Yellow font-LU_Heavy p-3 rounded-md"
      >
        View Images
      </button>
      <Lightbox
        isOpen={showImages}
        // inline
        onPrev={gotoPrevious}
        onNext={gotoNext}
        images={imageList}
        currentIndex={currentImageIndex}
        renderHeader={() => <CustomHeader />}
        singleClickToZoom
        onClose={handleClose}
      />
    </div>
  );
};

export default PhotoCollection;
