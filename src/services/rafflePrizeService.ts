// src/services/rafflePrizeService.ts
import { supabase } from '@/lib/supabase';
import { RafflePrize, RafflePrizeSpecification, RafflePrizeImage, RafflePrizeComplete } from '@/types/database';

export class RafflePrizeService {
    // Obtener todos los premios de una rifa con sus relaciones
    static async getRafflePrizes(raffleId: string): Promise<RafflePrizeComplete[]> {
        try {
            // Obtener premios principales
            const { data: prizes, error: prizesError } = await supabase
                .from('raffle_prizes')
                .select('*')
                .eq('raffle_id', raffleId)
                .eq('is_active', true)
                .order('display_order', { ascending: true });

            if (prizesError) {
                console.error('Error fetching raffle prizes:', prizesError);
                return [];
            }

            if (!prizes || prizes.length === 0) {
                return [];
            }

            // Obtener especificaciones de todos los premios
            const prizeIds = prizes.map(p => p.id);
            const [specificationsData, imagesData] = await Promise.all([
                supabase
                    .from('raffle_prize_specifications')
                    .select('*')
                    .in('prize_id', prizeIds)
                    .order('display_order', { ascending: true }),
                supabase
                    .from('raffle_prize_images')
                    .select('*')
                    .in('prize_id', prizeIds)
                    .order('display_order', { ascending: true })
            ]);

            const specifications = specificationsData.data || [];
            const images = imagesData.data || [];

            // Construir premios completos
            const completePrizes: RafflePrizeComplete[] = prizes.map(prize => ({
                prize,
                specifications: specifications.filter(spec => spec.prize_id === prize.id),
                images: images.filter(img => img.prize_id === prize.id)
            }));

            return completePrizes;
        } catch (error) {
            console.error('Unexpected error in getRafflePrizes:', error);
            return [];
        }
    }

    // Obtener premios organizados por tipo
    static async getRafflePrizesByType(raffleId: string) {
        const allPrizes = await this.getRafflePrizes(raffleId);

        return {
            main: allPrizes.filter(p => p.prize.prize_type === 'main'),
            secondary: allPrizes.filter(p => p.prize.prize_type === 'secondary'),
            blessed: allPrizes.filter(p => p.prize.prize_type === 'blessed'),
            consolation: allPrizes.filter(p => p.prize.prize_type === 'consolation')
        };
    }

    // Obtener el premio principal
    static async getMainPrize(raffleId: string): Promise<RafflePrizeComplete | null> {
        const prizesByType = await this.getRafflePrizesByType(raffleId);
        return prizesByType.main[0] || null;
    }

    // Calcular valor total de todos los premios
    static calculateTotalPrizeValue(prizes: RafflePrizeComplete[]): number {
        return prizes.reduce((total, prizeComplete) => {
            const { prize } = prizeComplete;
            return total + (prize.value * prize.quantity);
        }, 0);
    }

    // Crear premios por defecto para una rifa sin premios configurados
    static createDefaultPrizes(raffle: any): RafflePrizeComplete[] {
        const totalValue = raffle.price * raffle.total_numbers;
        
        const defaultMainPrize: RafflePrizeComplete = {
            prize: {
                id: 'default-main',
                raffle_id: raffle.id,
                prize_type: 'main',
                title: raffle.title,
                description: raffle.description,
                value: totalValue,
                currency: 'USD',
                quantity: 1,
                image_url: raffle.banner_url,
                is_cash: false,
                is_physical_item: true,
                delivery_method: 'Entrega personal en tu ciudad',
                terms_and_conditions: 'Documentos legales incluidos. Garantía oficial.',
                display_order: 1,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            },
            specifications: [
                {
                    id: 'spec-1',
                    prize_id: 'default-main',
                    specification_name: 'Documentos legales',
                    specification_value: 'Incluidos',
                    display_order: 1,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'spec-2',
                    prize_id: 'default-main',
                    specification_name: 'Garantía oficial',
                    specification_value: 'Incluida',
                    display_order: 2,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'spec-3',
                    prize_id: 'default-main',
                    specification_name: 'Entrega',
                    specification_value: 'En tu ciudad',
                    display_order: 3,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'spec-4',
                    prize_id: 'default-main',
                    specification_name: 'Estado',
                    specification_value: 'Completamente nuevo',
                    display_order: 4,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'spec-5',
                    prize_id: 'default-main',
                    specification_name: 'Costos adicionales',
                    specification_value: 'Ninguno',
                    display_order: 5,
                    created_at: new Date().toISOString()
                },
                {
                    id: 'spec-6',
                    prize_id: 'default-main',
                    specification_name: 'Registro',
                    specification_value: 'Incluido',
                    display_order: 6,
                    created_at: new Date().toISOString()
                }
            ],
            images: raffle.banner_url ? [{
                id: 'img-1',
                prize_id: 'default-main',
                image_url: raffle.banner_url,
                alt_text: raffle.title,
                caption: 'Premio principal',
                display_order: 1,
                is_featured: true,
                created_at: new Date().toISOString()
            }] : []
        };

        return [defaultMainPrize];
    }
}