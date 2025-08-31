import { CalculatedTicketPackage } from "./ticketPackages"; // Cambiar import
import { RaffleData, TenantConfig } from "./template";

export interface BaseTemplateProps {
    raffleData: RaffleData;
    ticketOptions: CalculatedTicketPackage[];
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