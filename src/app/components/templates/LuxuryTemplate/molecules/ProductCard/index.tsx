// components/templates/LuxuryTemplate/molecules/ProductCard/index.tsx
import { LuxuryButton } from '../../atoms/Button';
import { LuxuryProgressBar } from '../../atoms/ProgressBar';
import { Crown, ArrowRight } from 'lucide-react';

interface LuxuryProductCardProps {
    product: {
        id: string; // ID de la rifa
        name: string; // title de la rifa
        image: string; // banner_url de la rifa
        originalPrice: number; // Valor total del premio (price * total_numbers)
        ticketPrice: number; // price de la rifa
        totalTickets: number; // total_numbers de la rifa
        soldTickets: number; // Entradas vendidas
        endDate: string; // draw_date de la rifa
        featured?: boolean; // Si está destacada
        category: string; // Categoría de la rifa
    };
    onParticipate?: (raffleId: string) => void;
}

export const LuxuryProductCard: React.FC<LuxuryProductCardProps> = ({
    product,
    onParticipate
}) => {
    const remainingTickets = product.totalTickets - product.soldTickets;
    const progressPercentage = (product.soldTickets / product.totalTickets) * 100;

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'electronics': return '📱';
            case 'automotive': return '🚗';
            case 'luxury': return '💎';
            case 'home': return '🏠';
            case 'raffle': return '🎯';
            default: return '✨';
        }
    };

    return (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-500 border-2 border-amber-200/50 hover:border-amber-300 relative group">
            {product.featured && (
                <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-white text-center py-3 font-bold text-sm tracking-wide">
                    ✨ RIFA DESTACADA ✨
                </div>
            )}

            <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                {getCategoryIcon(product.category)} GRAN RIFA
            </div>

            <div className="relative overflow-hidden">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                        // Fallback image si la imagen no carga
                        (e.target as HTMLImageElement).src = '/default-raffle-image.jpg';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-sm text-amber-300 px-4 py-2 rounded-full text-lg font-bold border border-amber-400/50">
                    Premio: ${product.originalPrice.toLocaleString()}
                </div>
            </div>

            <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{product.name}</h3>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-amber-700 uppercase tracking-wide">Progreso de Venta</span>
                        <span className="text-sm font-bold text-gray-900 bg-amber-100 px-3 py-1 rounded-full">
                            {product.soldTickets}/{product.totalTickets}
                        </span>
                    </div>
                    <LuxuryProgressBar current={product.soldTickets} total={product.totalTickets} />
                    <p className="text-xs text-amber-700 mt-2 font-medium">
                        Solo quedan {remainingTickets} números disponibles
                    </p>
                </div>

                <div className="flex items-center justify-between mb-6 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-2xl border border-amber-200">
                    <div>
                        <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
                            ${product.ticketPrice}
                        </p>
                        <p className="text-sm text-amber-700 font-medium">por número de la suerte</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-amber-700 font-medium">Gran Sorteo</p>
                        <p className="text-lg font-bold text-gray-900">
                            {new Date(product.endDate).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                <LuxuryButton
                    variant="primary"
                    size="lg"
                    icon={<Crown className="w-6 h-6" />}
                    onClick={() => onParticipate?.(product.id)}
                >
                    Participar en Esta Rifa
                    <ArrowRight className="w-5 h-5" />
                </LuxuryButton>
            </div>
        </div>
    );
};