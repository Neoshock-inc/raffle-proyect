// components/ImageCarousel.tsx
import React from "react";
import Slider from "react-slick";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    
  };

  return (
    <div className="w-full mb-6 max-h-[500px] overflow-hidden">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div key={index} className="">
            <Image
              src={src}
              alt={`Imagen ${index + 1}`}
              width={600}
              height={300}
              className="shadow-md w-full h-auto object-cover"
              layout="intrinsic"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageCarousel;
