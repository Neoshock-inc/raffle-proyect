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
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {images.map((src, index) => (
          <div
            key={index}
            className="w-full h-[150px] sm:h-[300px] md:h-[400px] lg:h-[500px] relative"
          >
            <Image
              src={src}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover w-full h-full"
              priority
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageCarousel;
