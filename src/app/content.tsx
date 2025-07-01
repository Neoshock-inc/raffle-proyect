'use client';
import { useState } from "react";

// Hooks personalizados
import { useRaffleData } from "./hooks/useRaffleData";
import { useTicketSearch } from "./hooks/useTicketSearch";
import { useReferralCode } from "./hooks/useReferralCode";
import { useProgressAnimation } from "./hooks/useProgressAnimation";
import { useCustomTicketPurchase } from "./hooks/useCustomTicketPurchase";

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

const MARKETING_BOOST_PERCENTAGE = 48;

export default function HomeContent() {
  // Estados para modales
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Hooks personalizados
  const {
    soldTickets,
    blessedNumbers,
    loading,
    error,
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

  // Cálculo del porcentaje de venta
  const soldPercentage = raffle && raffle.total_numbers > 0
    ? Math.min(((soldTickets / raffle.total_numbers) * 100) + MARKETING_BOOST_PERCENTAGE, 100)
    : 0;

  const animatedPercentage = useProgressAnimation(soldPercentage, loading);

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
    "/images/1.png",
    "/images/2.png",
    "/images/3.png",
    "/images/4.png",
    "/images/5.png",
    "/images/6.png",
  ];

  const baseAmounts = [20, 30, 40, 50, 75, 100];

  const ticketOptions: TicketOption[] = raffle
    ? baseAmounts.map((amount) => ({
      amount,
      price: amount * raffle.price,
    }))
    : [];

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
            <button
              className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="flex flex-col items-center p-4 max-w-4xl mx-auto">
        <PrizeSection imageUrls={imageUrls} />

        <ProgressBar
          soldPercentage={soldPercentage}
          animatedPercentage={animatedPercentage}
          soldTickets={soldTickets}
          totalNumbers={raffle?.total_numbers || 0}
        />

        <BlessedNumbersSection
          blessedNumbers={blessedNumbers}
          onNumberClaimed={handleNumberClaimed}
        />

        <InstructionsSection
          onVideoClick={() => setIsVideoModalOpen(true)}
        />

        <TicketsGrid
          ticketOptions={ticketOptions}
          referralCode={referralCode}
        />

        <CustomTicketSection
          customAmount={customAmount}
          setCustomAmount={setCustomAmount}
          onCustomBuy={handleCustomBuyWithToken}
        />

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