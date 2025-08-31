import { BlessedNumber, Raffle, RaffleEntry, RaffleMedia, Tenant } from "./database";
import { CalculatedTicketPackage, TenantConfig } from "./template";

export interface RaffleService {
    getRaffleById: (id: string) => Promise<Raffle>;
    getRaffleByTenant: (tenantSlug: string) => Promise<Raffle>;
    getRaffleMedia: (raffleId: string) => Promise<RaffleMedia[]>;
    getTicketPackages: (raffleId: string) => Promise<CalculatedTicketPackage[]>;
    getSoldTicketsCount: (raffleId: string) => Promise<number>;
    getBlessedNumbers: (raffleId: string) => Promise<BlessedNumber[]>;
}

export interface TenantService {
    getTenantBySlug: (slug: string) => Promise<Tenant>;
    getTenantConfig: (tenantId: string) => Promise<TenantConfig>;
}

export interface TicketService {
    purchaseTickets: (data: {
        raffleId: string;
        packageId: string;
        participantEmail: string;
        quantity?: number;
        referralCode?: string;
    }) => Promise<{ success: boolean; sessionId?: string }>;

    searchTickets: (email: string, raffleId: string) => Promise<RaffleEntry[]>;
}