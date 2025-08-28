// components/templates/LuxuryTemplate/organisms/ProductsSection/index.tsx
import { LuxuryProductCard } from '../../molecules/ProductCard';

interface LuxuryProductsSectionProps {
  products: Array<{
    id: string;
    name: string;
    image: string;
    originalPrice: number;
    ticketPrice: number;
    totalTickets: number;
    soldTickets: number;
    endDate: string;
    featured?: boolean;
    category: string;
  }>;
}

export const LuxuryProductsSection: React.FC<LuxuryProductsSectionProps> = ({ 
  products 
}) => {
  return (
    <section id="rifas" className="py-24 px-6 bg-gradient-to-br from-white to-amber-50/50">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
            🎯 Rifas Disponibles
          </span>
          <h3 className="text-5xl font-bold text-gray-900 mb-6">Grandes Premios Te Esperan</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Participa en nuestras rifas exclusivas y gana increíbles premios con total transparencia
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {products.map((product) => (
            <LuxuryProductCard 
              key={product.id} 
              product={product}
              onParticipate={(raffleId) => {
                // TODO: Lógica para participar en la rifa
                console.log('Participar en rifa:', raffleId);
                // Scroll a la sección de ofertas o abrir modal
                document.getElementById('ofertas')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};