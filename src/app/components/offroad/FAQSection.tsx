// src/components/offroad/FAQSection.tsx
'use client';

import { TenantConfig } from '@/app/types/template';
import React, { useState } from 'react';

interface FAQSectionProps {
  tenantConfig: TenantConfig;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category?: string;
}

export function FAQSection({ tenantConfig }: FAQSectionProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      id: 1,
      question: "¿Cómo funciona el sorteo?",
      answer: "Compras tus números, el día del sorteo transmitimos en vivo por Instagram y Facebook. Utilizamos un sistema de balotas numeradas completamente transparente con supervisión notarial.",
      category: "sorteo"
    },
    {
      id: 2,
      question: "¿Qué pasa si no se venden todos los números?",
      answer: "El sorteo se realiza garantizado sin importar cuántos números se vendan. Si no se venden todos los números, igual realizamos el sorteo con los números vendidos.",
      category: "sorteo"
    },
    {
      id: 3,
      question: "¿Cómo recibo mi premio?",
      answer: "Te contactamos inmediatamente después del sorteo por teléfono y redes sociales. Los premios se entregan personalmente con todos los documentos legales correspondientes.",
      category: "premio"
    },
    {
      id: 4,
      question: "¿Los sorteos están supervisados?",
      answer: "Sí, todos nuestros sorteos están supervisados por un notario público y transmitidos en vivo para garantizar total transparencia y legalidad.",
      category: "transparencia"
    },
    {
      id: 5,
      question: "¿Puedo comprar desde cualquier ciudad?",
      answer: "Por supuesto. Aceptamos participantes de todo Ecuador. Los premios se entregan en la ciudad del ganador sin costo adicional.",
      category: "participacion"
    },
    {
      id: 6,
      question: "¿Qué métodos de pago aceptan?",
      answer: "Aceptamos transferencias bancarias, depósitos, pagos con tarjeta de crédito/débito y otros métodos seguros. Todos los pagos están protegidos.",
      category: "pago"
    },
    {
      id: 7,
      question: "¿Puedo comprar números específicos?",
      answer: "Los números se asignan automáticamente para garantizar equidad. No es posible elegir números específicos, esto asegura que todos tengan las mismas oportunidades.",
      category: "participacion"
    },
    {
      id: 8,
      question: "¿Hay límite de números por persona?",
      answer: "No hay límite mínimo, pero puede haber un límite máximo dependiendo del sorteo para dar oportunidad a más participantes.",
      category: "participacion"
    },
    {
      id: 9,
      question: "¿Cómo sé que mi compra fue exitosa?",
      answer: "Recibes inmediatamente un comprobante por email y WhatsApp con tus números asignados y el código de tu participación.",
      category: "compra"
    },
    {
      id: 10,
      question: "¿Qué pasa si hay problemas técnicos?",
      answer: "En caso de problemas técnicos durante el sorteo, este se reprograma y se notifica a todos los participantes. Tu participación sigue siendo válida.",
      category: "sorteo"
    }
  ];

  const toggleFaq = (faqId: number) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <section className="py-6 px-4 bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl sm:text-6xl font-black text-center text-white mb-8">
          ❓ PREGUNTAS FRECUENTES
        </h2>
        
        <p className="text-xl text-gray-300 text-center mb-16">
          Resolvemos todas tus dudas sobre el sorteo
        </p>
        
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div 
              key={faq.id} 
              className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all duration-300 hover:border-yellow-400"
            >
              <button
                className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-700 transition-colors"
                onClick={() => toggleFaq(faq.id)}
              >
                <h3 className="text-white font-bold text-lg pr-4">
                  {faq.question}
                </h3>
                <span className="text-yellow-400 text-3xl font-bold flex-shrink-0">
                  {expandedFaq === faq.id ? '−' : '+'}
                </span>
              </button>
              
              {expandedFaq === faq.id && (
                <div className="p-6 pt-0 border-t border-gray-700">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contacto para más preguntas */}
        <div className="mt-16 text-center">
          <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
            <h3 className="text-2xl font-black text-white mb-4">
              ¿Tienes más preguntas?
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              Estamos aquí para ayudarte. Contáctanos directamente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-green-500 hover:bg-green-400 text-white font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center">
                <span className="mr-2">💬</span>
                WhatsApp
              </button>
              <button className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center">
                <span className="mr-2">📘</span>
                Facebook
              </button>
              <button className="bg-purple-500 hover:bg-purple-400 text-white font-bold px-6 py-3 rounded-full transition-colors flex items-center justify-center">
                <span className="mr-2">📸</span>
                Instagram
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}