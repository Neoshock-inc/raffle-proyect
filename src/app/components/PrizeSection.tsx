// components/PrizeSection.tsx
import ImageCarousel from './ImageCarousel';

interface PrizeSectionProps {
  imageUrls: string[];
}

export function PrizeSection({ imageUrls }: PrizeSectionProps) {
  return (
    <>
      <section className="text-center mb-4">
        <h2 className="text-2xl sm:text-4xl font-bold leading-tight">
          Gana un Mazda 6 Full
        </h2>
        <p className="text-2xl sm:text-4xl font-semibold">
          <strong>Yamaha MT 03, 2025 0KM</strong>
        </p>
        <p className="text-2xl sm:text-4xl font-semibold">
          <strong>+ De $3,000 Mil Dólares en Premios</strong>
        </p>
      </section>

      <div className="w-full mb-6">
        <div className="w-full">
          <ImageCarousel images={imageUrls} />
        </div>
      </div>

      <section className="text-center mb-6">
        <p>Participa comprando uno o más boletos. <strong>¡Mientras más compres, más chances tienes!</strong></p>
      </section>
    </>
  );
}