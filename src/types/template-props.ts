import { CalculatedTicketPackage } from "./ticketPackages"; // Cambiar import
import { RaffleData, TenantConfig } from "./template";
import { TicketOption } from "@/admin/types/ticketPackage";

export interface BaseTemplateProps {
    raffleData: RaffleData;
    ticketOptions: TicketOption[];
    tenantConfig: TenantConfig;
    className?: string;
}

export interface LuxuryTemplateProps extends BaseTemplateProps {
    premiumFeatures?: {
        vipSection: boolean;
        exclusiveOffers: boolean;
    };
}

export interface DefaultTemplateProps extends BaseTemplateProps {
    simpleMode?: boolean;
}

export interface OffroadTemplateProps extends BaseTemplateProps {
    // Puedes agregar propiedades específicas para OffroadTemplate aquí si es necesario
}