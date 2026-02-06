// src/components/luxury/TestimonialsSection.tsx
'use client';

import { Testimonial, TenantConfig } from '@/types/template';
import React, { useState, useEffect } from 'react';

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
  tenantConfig: TenantConfig;
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ 
  testimonials, 
  tenantConfig 
}) => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonios" className="py-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center mb-12 text-white drop-shadow-lg">
          🏆 NUESTROS GANADORES 🏆
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`p-10 transition-transform duration-700 ease-in-out ${
                  index === currentTestimonial ? 'translate-x-0' : 
                  index < currentTestimonial ? '-translate-x-full' : 'translate-x-full'
                } ${index !== currentTestimonial ? 'absolute inset-0' : ''}`}
              >
                <div className="text-center">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                  />
                  <h3 className="text-3xl font-black text-gray-800 mb-2">{testimonial.name}</h3>
                  <p className="text-red-500 font-bold text-xl mb-2">🏆 {testimonial.product}</p>
                  <p className="text-gray-600 mb-4">📍 {testimonial.location}</p>
                  
                  <div className="flex justify-center mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-2xl">⭐</span>
                    ))}
                  </div>
                  
                  <blockquote className="text-xl text-gray-700 italic max-w-3xl mx-auto leading-relaxed">
                    "{testimonial.comment}"
                  </blockquote>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-4 h-4 rounded-full transition-all ${
                  index === currentTestimonial ? 'bg-white shadow-lg' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
