// components/PrizeSection.tsx - Actualizado
import ImageCarousel from './ImageCarousel';
import { CountdownTimer } from './CountdownTimer';

interface PrizeSectionProps {
  imageUrls: string[];
  offerStartDate: Date;
  offerEndDate: Date;
  isEventFinalized?: boolean; // Nueva prop opcional
}

export function PrizeSection({ 
  imageUrls, 
  offerStartDate, 
  offerEndDate,
  isEventFinalized = false 
}: PrizeSectionProps) {
  return (
    <>
      <div className="w-full">
        <div className="w-full">
          <ImageCarousel images={imageUrls} />
        </div>
      </div>

      {/* Contador Regresivo - solo mostrar si el evento NO está finalizado */}
      {!isEventFinalized && (
        <div className="mb-6">
          <CountdownTimer
            startDate={offerStartDate}
            endDate={offerEndDate}
            className="mx-auto max-w-md"
          />
        </div>
      )}

      {/* Titulo - Cambiar según el estado del evento */}
      <h2 className={`text-2xl md:text-4xl font-extrabold text-center mb-4 text-transparent bg-clip-text drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] ${
        isEventFinalized 
          ? 'bg-gradient-to-r from-red-500 via-orange-400 to-red-700'
          : 'bg-gradient-to-r from-blue-500 via-sky-400 to-blue-700'
      }`}>
        {isEventFinalized ? '🏆 ¡Sorteo Finalizado!' : 'Compra Tus Boletos Ahora 🚀'}
      </h2>

      {/* Mensaje adicional cuando está finalizado */}
      {isEventFinalized && (
        <div className="text-center mb-6">
          <p className="text-lg text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
            <strong>🎉 ¡Gracias por participar!</strong><br />
            El sorteo se realizará pronto y se notificarán a todos los ganadores.
          </p>
        </div>
      )}
    </>
  );
}