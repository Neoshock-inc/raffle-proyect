// components/EventFinalizedSection.tsx
'use client';

interface EventFinalizedSectionProps {
  reason: 'manual' | 'sold_out'; // Razón por la que finalizó
  soldTickets: number;
  totalNumbers: number;
}

export function EventFinalizedSection({ reason, soldTickets, totalNumbers }: EventFinalizedSectionProps) {
  return (
    <section className="w-full max-w-4xl mx-auto p-6 mb-8">
      <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-8 shadow-lg">
        {/* Icono de finalizado */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-red-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
        </div>

        {/* Título principal */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-red-700 mb-4">
          ¡Evento Finalizado!
        </h2>

        {/* Mensaje según la razón */}
        <div className="text-center mb-6">
          {reason === 'sold_out' ? (
            <div>
              <p className="text-lg text-gray-700 mb-2">
                🎉 <strong>¡Todos los boletos han sido vendidos!</strong>
              </p>
              <p className="text-gray-600">
                Gracias a todos los participantes. El sorteo se realizará pronto.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-lg text-gray-700 mb-2">
                📢 <strong>El evento ha sido finalizado manualmente</strong>
              </p>
              <p className="text-gray-600">
                Ya no se pueden adquirir más boletos. ¡Gracias por participar!
              </p>
            </div>
          )}
        </div>

        {/* Estadísticas finales */}
        <div className="bg-white rounded-lg p-4 mb-6 shadow-inner">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
            Estadísticas Finales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-blue-600">{soldTickets.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Boletos Vendidos</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-green-600">{totalNumbers.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Total Boletos</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-2xl font-bold text-purple-600">
                {totalNumbers > 0 ? Math.round((soldTickets / totalNumbers) * 100) : 0}%
              </p>
              <p className="text-sm text-gray-600">Completado</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              const element = document.querySelector('[data-search-section]');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Ver Mis Boletos
          </button>
          
          <a
            href="https://wa.me/1234567890?text=Hola,%20tengo%20una%20consulta%20sobre%20el%20sorteo%20finalizado"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md text-center"
          >
            Contactar Soporte
          </a>
        </div>

        {/* Mensaje adicional */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            <strong>📧 Importante:</strong> Se notificará por email a todos los participantes 
            cuando se realice el sorteo y se anuncien los ganadores.
          </p>
        </div>
      </div>
    </section>
  );
}