// components/templates/LuxuryTemplate/organisms/TestimonialsSection/index.tsx
import { Trophy, CheckCircle, Shield } from 'lucide-react';
import { LuxuryTestimonialCard } from '../../molecules/TestimonialCard';

interface LuxuryTestimonialsSectionProps {
  testimonials: any[];
}

export const LuxuryTestimonialsSection: React.FC<LuxuryTestimonialsSectionProps> = ({ 
  testimonials 
}) => {
  return (
    <section id="testimonios" className="py-24 px-6 bg-gradient-to-br from-white to-amber-50/30">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-6">
            🏆 Historias de Éxito
          </span>
          <h3 className="text-5xl font-bold text-gray-900 mb-6">Sueños de Lujo Cumplidos</h3>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestros ganadores comparten sus experiencias con productos auténticos de las mejores marcas
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {testimonials.map((testimonial) => (
            <LuxuryTestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl p-10 max-w-4xl mx-auto border border-amber-200/50 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <Trophy className="w-12 h-12 text-amber-600 mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">€15M+</div>
                <div className="text-amber-700 font-semibold">en premios entregados</div>
              </div>
              <div className="flex flex-col items-center">
                <CheckCircle className="w-12 h-12 text-green-600 mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">100%</div>
                <div className="text-amber-700 font-semibold">productos auténticos</div>
              </div>
              <div className="flex flex-col items-center">
                <Shield className="w-12 h-12 text-blue-600 mb-4" />
                <div className="text-3xl font-bold text-gray-900 mb-2">5,247</div>
                <div className="text-amber-700 font-semibold">ganadores felices</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};