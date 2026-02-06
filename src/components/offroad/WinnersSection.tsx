// src/components/offroad/WinnersSection.tsx
'use client';

import { TenantConfig } from '@/types/template';
import React from 'react';

interface WinnersSectionProps {
    tenantConfig: TenantConfig;
}

interface Winner {
    id: number;
    name: string;
    city: string;
    prize: string;
    date: string;
    image: string;
    value: number;
}

export function WinnersSection({ tenantConfig }: WinnersSectionProps) {
    // Datos de ganadores anteriores - podrían venir de la base de datos en el futuro
    const previousWinners: Winner[] = [
        {
            id: 1,
            name: "Luis Rodríguez",
            city: "Ambato",
            prize: "Chevrolet D-Max 2023",
            date: "15 Julio 2024",
            image: "🚛",
            value: 45000
        },
        {
            id: 2,
            name: "Patricia Vega",
            city: "Riobamba",
            prize: "Nissan Frontier 2023",
            date: "22 Mayo 2024",
            image: "🚙",
            value: 42000
        },
        {
            id: 3,
            name: "Diego Morales",
            city: "Loja",
            prize: "Ford Ranger 2023",
            date: "8 Marzo 2024",
            image: "🛻",
            value: 48000
        },
        {
            id: 4,
            name: "Carmen Ruiz",
            city: "Machala",
            prize: "Toyota Hilux 2023",
            date: "12 Enero 2024",
            image: "🚐",
            value: 50000
        },
        {
            id: 5,
            name: "Fernando Castro",
            city: "Esmeraldas",
            prize: "Mitsubishi L200 2023",
            date: "28 Noviembre 2023",
            image: "🚚",
            value: 40000
        },
        {
            id: 6,
            name: "Rocío Mendoza",
            city: "Ibarra",
            prize: "Isuzu D-Max 2023",
            date: "15 Septiembre 2023",
            image: "🚛",
            value: 43000
        }
    ];

    const totalValueDelivered = previousWinners.reduce((sum, winner) => sum + winner.value, 0);

    return (
        <section className="py-20 px-4 bg-black">
            <div className="max-w-6xl mx-auto text-center">
                <h2 className="text-4xl sm:text-6xl font-black text-white mb-8">
                    🏆 GANADORES ANTERIORES
                </h2>

                <p className="text-2xl text-gray-300 mb-4">
                    Más de <span className="text-yellow-400 font-black">${totalValueDelivered.toLocaleString()}</span> en premios entregados
                </p>

                <p className="text-lg text-gray-400 mb-16">
                    Estos son algunos de nuestros ganadores verificados
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {previousWinners.map((winner) => (
                        <div
                            key={winner.id}
                            className="bg-gray-800 p-8 rounded-xl border border-gray-700 hover:border-green-400 transition-all duration-300 hover:scale-105"
                        >
                            <div className="text-6xl mb-4">{winner.image}</div>
                            <h4 className="text-white font-black text-2xl mb-2">{winner.name}</h4>
                            <p className="text-gray-400 mb-2 flex items-center justify-center">
                                <span className="mr-2">📍</span>
                                {winner.city}
                            </p>
                            <p className="text-yellow-400 font-bold text-lg mb-2">{winner.prize}</p>
                            <p className="text-green-400 font-bold text-xl mb-2">
                                ${winner.value.toLocaleString()}
                            </p>
                            <p className="text-gray-500 text-sm">
                                <span className="mr-2">📅</span>
                                {winner.date}
                            </p>

                            {/* Badge de verificado */}
                            <div className="mt-4 inline-flex items-center bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                <span className="mr-1">✅</span>
                                Verificado
                            </div>
                        </div>
                    ))}
                </div>

                {/* Estadísticas adicionales */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="text-4xl font-black text-yellow-400 mb-2">
                            {previousWinners.length}+
                        </div>
                        <div className="text-gray-300">Ganadores Felices</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="text-4xl font-black text-green-400 mb-2">
                            ${Math.round(totalValueDelivered / 1000)}K+
                        </div>
                        <div className="text-gray-300">En Premios Entregados</div>
                    </div>
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                        <div className="text-4xl font-black text-blue-400 mb-2">
                            100%
                        </div>
                        <div className="text-gray-300">Premios Entregados</div>
                    </div>
                </div>

                {/* Llamada a la acción */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-xl border border-gray-600">
                    <h3 className="text-3xl font-black text-white mb-4">
                        <span className="text-yellow-400">Tu podrías ser el próximo</span> 🎯
                    </h3>
                    <p className="text-gray-300 text-lg mb-6">
                        Únete a nuestra lista de ganadores verificados. Todos los sorteos son supervisados por notario público.
                    </p>
                    <button
                        onClick={() => {
                            const packagesSection = document.getElementById('packages-section');
                            packagesSection?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl px-12 py-4 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        ¡QUIERO PARTICIPAR!
                    </button>
                </div>

                {/* Nota de transparencia */}
                <div className="mt-8 text-center">
                    <p className="text-gray-500 text-sm">
                        📋 Todos los ganadores son verificados y contactados públicamente •
                        🔴 Sorteos transmitidos en vivo •
                        👨‍⚖️ Supervisión notarial
                    </p>
                </div>
            </div>
        </section>
    );
}