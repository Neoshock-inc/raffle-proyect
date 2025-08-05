// components/PrizeSection.tsx
import ImageCarousel from './ImageCarousel';
import { CountdownTimer } from './CountdownTimer';

interface PrizeSectionProps {
  imageUrls: string[];
  offerStartDate: Date;
  offerEndDate: Date;
}

export function PrizeSection({ imageUrls, offerStartDate, offerEndDate }: PrizeSectionProps) {
  return (
    <>
      <div className="w-full mb-6">
        <div className="w-full">
          <ImageCarousel images={imageUrls} />
        </div>
      </div>

      {/* Contador Regresivo */}
      <div className="mb-6">
        <CountdownTimer
          startDate={offerStartDate}
          endDate={offerEndDate}
          className="mx-auto max-w-md"
        />
      </div>

      <section className="text-center mb-3">
        <p>Participa comprando uno o más boletos. <strong>¡Mientras más compres, más chances tienes!</strong></p>
      </section>
    </>
  );
}