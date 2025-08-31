// src/app/[tenant]/error.tsx - Error page específico para tenant
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Tenant page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-rose-100">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-6xl mb-4">😞</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-8">
          Ocurrió un error inesperado. Nuestro equipo ha sido notificado.
        </p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
