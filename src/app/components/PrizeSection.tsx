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
      <h2 className="text-2xl md:text-4xl font-extrabold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-sky-400 to-blue-700 drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)]">
        Compra Tus Boletos Ahora 🚀
      </h2>
    </>
  );
}