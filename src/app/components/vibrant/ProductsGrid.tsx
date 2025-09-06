// src/components/luxury/ProductsGrid.tsx
'use client';

import { Product, TenantConfig } from '@/app/types/template';
import React from 'react';

interface ProductsGridProps {
  products: Product[];
  tenantConfig: TenantConfig;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({ 
  products, 
  tenantConfig 
}) => {
  return (
    <section id="rifas" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-5xl font-black text-center mb-4 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          🎁 RIFAS ACTIVAS 🎁
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">¡Elige tu premio favorito y participa ya!</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-lg border-2 border-gray-100 p-6 hover:shadow-2xl transition-all duration-300 group hover:transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {product.category}
                </span>
                <div className="text-3xl">🎁</div>
              </div>

              <h3 className="text-2xl font-black text-gray-800 mb-3 group-hover:text-red-500 transition-colors">
                {product.name}
              </h3>
              <p className="text-3xl font-black text-green-600 mb-4">
                ${product.ticketPrice}/número
              </p>

              <div className="mb-6">
                {/* <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Vendidos: {product.soldTickets}</span>
                  <span>Total: {product.totalTickets}</span>
                </div> */}
                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-1000 relative"
                    style={{ width: `${product.progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                  </div>
                </div>
                <p className="text-right text-sm font-bold text-green-600 mt-1">
                  {product.progress.toFixed(1)}% completado
                </p>
              </div>

              <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold py-4 rounded-2xl hover:from-red-400 hover:to-pink-400 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
                ¡Comprar Números! 🎯
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
