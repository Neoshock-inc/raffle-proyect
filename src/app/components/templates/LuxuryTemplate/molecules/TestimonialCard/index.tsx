// components/templates/LuxuryTemplate/molecules/TestimonialCard/index.tsx
import { Crown } from 'lucide-react';
import { LuxuryAvatar } from '../../atoms/Avatar';
import { LuxuryStar } from '../../atoms/Star';

interface LuxuryTestimonialCardProps {
    testimonial: {
        id: number;
        name: string;
        location: string;
        product: string;
        comment: string;
        rating: number;
        avatar: string;
        prize_value: number;
    };
}

export const LuxuryTestimonialCard: React.FC<LuxuryTestimonialCardProps> = ({ testimonial }) => {
    return (
        <div className="bg-gradient-to-br from-white to-amber-50 rounded-3xl p-8 shadow-2xl border border-amber-200/50 transform hover:scale-105 transition-all duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
            <div className="relative z-10">
                <div className="flex items-start space-x-6 mb-4">
                    <LuxuryAvatar
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        size="md"
                        showCrown={true}
                    />
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-bold text-xl text-gray-900">{testimonial.name}</h4>
                            <span className="text-amber-600 font-medium">• {testimonial.location}</span>
                        </div>

                        <div className="flex items-center mb-4">
                            {[...Array(5)].map((_, i) => (
                                <LuxuryStar
                                    key={i}
                                    filled={i < testimonial.rating}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <blockquote className="text-gray-700 mb-4 italic text-lg leading-relaxed">
                    "{testimonial.comment}"
                </blockquote>

                <div className="bg-gradient-to-r from-amber-100 to-yellow-100 p-4 rounded-2xl border border-amber-200">
                    <p className="font-bold text-amber-800">🏆 Premio Ganado: {testimonial.product}</p>
                    <p className="text-amber-700 font-medium">Valor: ${testimonial.prize_value.toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};