// HomeContent.tsx - Solo las partes que cambian
'use client';
import { useState } from "react";

// Hooks personalizados
import { useRaffleData } from "./hooks/useRaffleData";
import { useTicketSearch } from "./hooks/useTicketSearch";
import { useReferralCode } from "./hooks/useReferralCode";
import { useProgressAnimation } from "./hooks/useProgressAnimation";
import { useCustomTicketPurchase } from "./hooks/useCustomTicketPurchase";
import { useTicketPackages } from "./hooks/useTicketPackages"; // NUEVO HOOK

// Componentes
import { Header } from "./components/Header";
import { PrizeSection } from "./components/PrizeSection";
import { ProgressBar } from "./components/ProgressBar";
import { BlessedNumbersSection } from "./components/BlessedNumbersSection";
import { InstructionsSection } from "./components/InstructionsSection";
import { TicketsGrid } from "./components/TicketsGrid";
import { CustomTicketSection } from "./components/CustomTicketSection";
import { TicketSearchSection } from "./components/TicketSearchSection";
import { Footer } from "./components/Footer";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { VideoModal } from './components/VideoModal';
import { TicketSearchModal } from "./components/TicketSearchModal";

// Tipos y servicios
import { TicketOption } from "./types/tickets";

const MARKETING_BOOST_PERCENTAGE = 56;

export default function HomeContent() {
  // Estados para modales
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Hooks personalizados
  const {
    soldTickets,
    blessedNumbers,
    loading: raffleLoading,
    error: raffleError,
    raffle,
    handleNumberClaimed
  } = useRaffleData();

  const {
    searchEmail,
    setSearchEmail,
    isModalOpen,
    ticketPurchases,
    searchLoading,
    searchError,
    handleSearchTickets,
    closeModal
  } = useTicketSearch();

  const referralCode = useReferralCode();

  // NUEVO: Hook para manejar los paquetes de tickets
  const {
    ticketPackages,
    ticketOptions,
    loading: packagesLoading,
    error: packagesError,
    refetch: refetchPackages
  } = useTicketPackages();

  // Cálculo del porcentaje de venta
  const soldPercentage = raffle && raffle.total_numbers > 0
    ? Math.min(((soldTickets / raffle.total_numbers) * 100) + MARKETING_BOOST_PERCENTAGE, 100)
    : 0;

  const animatedPercentage = useProgressAnimation(soldPercentage, raffleLoading);

  const {
    customAmount,
    setCustomAmount,
    handleCustomBuyWithToken
  } = useCustomTicketPurchase(
    referralCode,
    soldTickets,
    raffle?.total_numbers || 0
  );

  // Configuración de datos
  const imageUrls = [
    "/images/8.jpeg",
    "/images/7.png",
  ];

  const offerStart = new Date(); // Comienza ahora
  const offerEnd = new Date(Date.now() + 24 * 60 * 60 * 1000); // Termina en 24 horas

  // FALLBACK: Si no hay paquetes de la DB, usar el sistema anterior
  const baseAmounts = [20, 30, 40, 50, 75, 100];
  const fallbackTicketOptions: TicketOption[] = raffle
    ? baseAmounts.map((amount) => ({
      amount,
      price: amount * raffle.price,
    }))
    : [];

  // Determinar qué opciones usar
  const finalTicketOptions = ticketOptions.length > 0 ? ticketOptions : fallbackTicketOptions;
  const loading = raffleLoading || packagesLoading;
  const error = raffleError || packagesError;

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center p-4 max-w-4xl mx-auto">
          <div className="w-full text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-80 mb-6"></div>
              <div className="flex flex-wrap justify-center gap-3">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <main className="flex flex-col items-center p-4 max-w-4xl mx-auto">
          <div className="w-full text-center text-red-500">
            <p>{error}</p>
            <div className="space-y-2 mt-4">
              <button
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition mr-2"
                onClick={() => window.location.reload()}
              >
                Reintentar
              </button>
              {packagesError && (
                <button
                  className="px-4 py-2 bg-blue-200 rounded-md hover:bg-blue-300 transition"
                  onClick={refetchPackages}
                >
                  Recargar Paquetes
                </button>
              )}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <PrizeSection
        imageUrls={imageUrls}
        offerStartDate={offerStart}
        offerEndDate={offerEnd}
      />

      {/* Mostrar información de debug en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center mb-4 p-2 bg-yellow-100 rounded">
          <small className="text-gray-600">
            Debug: {ticketPackages.length} paquetes de DB, {fallbackTicketOptions.length} fallback
          </small>
        </div>
      )}

      <TicketsGrid
        ticketOptions={finalTicketOptions}
        referralCode={referralCode}
        isUsingPackages={ticketOptions.length > 0}
      />

      <section className="text-center mb-3">
        <p>Participa comprando uno o más boletos. <strong>¡Mientras más compres, más chances tienes!</strong></p>
      </section>

      <main className="flex flex-col items-center p-4 max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-4 text-center">
          ¿Estás listo para llevarte todos estos premios?
        </h3>

        {/* Youtube video Section */}
        <section className="w-full px-4 py-1 flex justify-center bg-gray-50">
          <div className="w-full max-w-2xl aspect-video rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/Jc4-t2fOWHU"
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </section>

        <ProgressBar
          soldPercentage={soldPercentage}
          animatedPercentage={animatedPercentage}
          soldTickets={soldTickets}
          totalNumbers={raffle?.total_numbers || 0}
        />

        {/* <BlessedNumbersSection
          blessedNumbers={blessedNumbers}
          onNumberClaimed={handleNumberClaimed}
        /> */}

        {/* <InstructionsSection
          onVideoClick={() => setIsVideoModalOpen(true)}
        /> */}

        <CustomTicketSection
          customAmount={customAmount}
          setCustomAmount={setCustomAmount}
          onCustomBuy={handleCustomBuyWithToken}
        />

        {/* Testimonial Section */}
        <section className="text-center mt-3">
          <h3 className="text-xl font-bold mb-2">Testimonios</h3>
          <p className="text-gray-600">
            "¡Participar en este sorteo fue una experiencia increíble! No puedo esperar a ver si gano."
          </p>
          <p className="text-gray-600">
            "Los premios son fantásticos y el proceso de compra fue muy fácil."
          </p>
        </section>

        <TicketSearchSection
          searchEmail={searchEmail}
          setSearchEmail={setSearchEmail}
          onSearchTickets={handleSearchTickets}
          searchLoading={searchLoading}
          searchError={searchError}
        />
      </main>

      {/* Modales */}
      <TicketSearchModal
        isOpen={isModalOpen}
        onClose={closeModal}
        tickets={ticketPurchases}
      />

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />

      <Footer />
      <WhatsAppButton />
    </>
  );
}