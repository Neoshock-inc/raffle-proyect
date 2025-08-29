export interface Raffle {
    id: string;
    title: string;
    description: string;
    price: number;
    total_numbers: number;
    drawDate: string;
    isActive: boolean;
    MARKETING_BOOST_PERCENTAGE: number;
}