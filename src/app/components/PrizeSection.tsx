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
      <div className="w-full">
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

      {/* Titulo - Compra Tus Boletos Ahora */}
      <h2 className="text-2xl font-bold text-center mb-4">🚀 Compra Tus Boletos Ahora 🚀</h2>
    </>
  );
}