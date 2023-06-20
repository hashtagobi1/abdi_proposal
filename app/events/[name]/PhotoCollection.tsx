"use client";

import React, { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Lightbox from "react-spring-lightbox";
import Gallery from "react-photo-gallery";
import { animated, useTransition } from "@react-spring/web";
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  XMarkIcon,
  ArrowLeftIcon,
  MinusSmallIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";

type Props = {};
const imageList = [
  {
    src: "/images/blockParty/1.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/2.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/3.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/4.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/5.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/6.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/7.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/9.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
  {
    src: "/images/blockParty/8.jpg",
    alt: "image",
    height: 400,
    width: 400,
  },
];

const PhotoCollection = (props: Props) => {
  const [currentImageIndex, setCurrentIndex] = React.useState(0);
  const [showImages, setShowImages] = React.useState<boolean>(false);
  const canPrev = currentImageIndex > 0;
  const canNext = currentImageIndex + 1 < imageList.length;

  const openLightbox = useCallback(
    (
      event: React.MouseEvent<Element, MouseEvent>,
      {
        photo,
        index,
      }: {
        photo: any;
        index: number;
      }
    ) => {
      console.log({ event, photo, index });
      setCurrentIndex(index);
      setShowImages(true);
    },
    []
  );

  const closeLightbox = () => {
    setCurrentIndex(0);
    setShowImages(false);
  };

  const gotoPrevious = () =>
    currentImageIndex > 0 && setCurrentIndex(currentImageIndex - 1);

  const gotoNext = () =>
    currentImageIndex + 1 < imageList.length &&
    setCurrentIndex(currentImageIndex + 1);

  const CustomHeader = () => (
    <div className="text-white text-xl flex justify-between font-LU_Heavy bg-black p-2">
      <h1 className="">Peak TV Block Party</h1>
      <XMarkIcon
        onClick={() => setShowImages(false)}
        height={36}
        width={36}
        className="hover:text-DT_Orange transition-all duration-500"
      />
    </div>
  );

  const ArrowButton = (
    className: string,
    disabled: boolean,
    _onClick: any,
    position: "left" | "right"
  ) => {
    const transitions = useTransition(!disabled, {
      enter: { opacity: 1 },
      from: { opacity: 0 },
      leave: { opacity: 0 },
    });
    return transitions(
      (props, item) =>
        item && (
          <div className="z-50">
            <button
              type="button"
              className={`top-0 bottom-0 ${position}`}
              onClick={_onClick}
            >
              {position === "left" ? (
                <ChevronLeftIcon
                  className="text-red-600"
                  height={24}
                  width={24}
                />
              ) : (
                <ChevronRightIcon
                  className="text-red-600"
                  height={24}
                  width={24}
                />
              )}
            </button>
          </div>
        )
    );
  };

  return (
    <div className="p-1 flex-col ">
      <div className="flex items-center mt-4 justify-between">
        <Link passHref href={"/"}>
          <span className="flex lowercase font-LU_Medium transition hover:animate-pulse hover:text-DT_Orange">
            <ArrowLeftIcon height={24} width={24} />
            <p className="ml-4">Back to London</p>
          </span>
        </Link>

        <button
          onClick={() => setShowImages(true)}
          className="
          border   hover:border-DT_Orange text-center 
          hover:text-DT_Yellow transition-all 
          border-DT_Yellow font-LU_Heavy p-2 rounded-md"
        >
          full screen da ting.
        </button>
      </div>
      <div className=" p-8">
        <Gallery onClick={openLightbox} photos={imageList} />
      </div>
      <Lightbox
        isOpen={showImages}
        className="bg-black"
        onPrev={gotoPrevious}
        onNext={gotoNext}
        images={imageList}
        // @ts-ignore
        renderNextButton={({ canNext }: any) => (
          <span className="z-50 p-1">
            {canNext && (
              <ChevronRightIcon
                onClick={gotoNext}
                height={40}
                width={40}
                className="text-white hover:text-DT_Orange transition-all duration-500"
              />
            )}
          </span>
        )}
        // @ts-ignore
        renderPrevButton={({ canPrev }: any) => (
          <span className="z-50 p-1">
            {canPrev && (
              <ChevronLeftIcon
                onClick={gotoPrevious}
                height={40}
                width={40}
                className="text-white hover:text-DT_Orange transition-all duration-500"
              />
            )}
          </span>
        )}
        currentIndex={currentImageIndex}
        renderHeader={() => <CustomHeader />}
        onClose={closeLightbox}
      />
    </div>
  );
};

export default PhotoCollection;
