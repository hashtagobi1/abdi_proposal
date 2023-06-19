"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

type Props = {};

const imageIds = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30,
];

const PhotoCollection = (props: Props) => {
  const [selectedImage, setSelectedImage] = React.useState<
    number | undefined | null
  >(null);

  const openImage = (id: number) => {
    setSelectedImage(id);
  };

  return (
    <motion.div
      transition={{ duration: 0.4, type: "spring" }}
      className="flex flex-wrap gap-1 relative w-full"
    >
      {imageIds.map((i) => {
        return (
          <motion.div className="w-24 h-24" key={i}>
            <motion.img
              layoutId={`img-${i}`}
              src={`https://picsum.photos/id/${i}/800`}
              onClick={() => openImage(i)}
            />
          </motion.div>
        );
      })}

      {selectedImage ? (
        <div className="">
          <motion.img
            layoutId={`img-${selectedImage}`}
            src={`https://picsum.photos/id/${selectedImage}/800`}
            className="absolute top-0 right-0 left-0 w-full h-full"
            onClick={() => setSelectedImage(null)}
          />
          {/* <ChevronRightIcon
            height={36}
            width={36}
            className="absolute cursor-pointer " */}
          {/* /> */}
        </div>
      ) : null}
      <ChevronLeftIcon
        height={36}
        onClick={() =>
          setSelectedImage((prev) => {
            if (prev) {
              return prev - 1;
            }
          })
        }
        width={36}
        className="absolute top-0  right-4 cursor-pointer "
      />
    </motion.div>
  );
};

export default PhotoCollection;
