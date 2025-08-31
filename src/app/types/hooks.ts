import { RaffleData } from "./template";
import { CalculatedTicketPackage } from "./ticketPackages";

export interface UseRaffleDataReturn {
  raffleData: RaffleData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseTicketPackagesReturn {
  ticketPackages: CalculatedTicketPackage[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseTicketPurchaseReturn {
  purchaseTicket: (packageId: string, quantity?: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}
