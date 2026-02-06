import React from 'react';

interface TokenExpiredModalProps {
    tokenExpired: boolean;
    isLoading: boolean;
    onRenewToken: () => void;
    onGoHome: () => void;
}

export const TokenExpiredModal: React.FC<TokenExpiredModalProps> = ({
    tokenExpired,
    isLoading,
    onRenewToken,
    onGoHome
}) => {
    if (!tokenExpired) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
                <div className="text-center">
                    <div className="text-red-600 text-6xl mb-4">⏰</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Sesión Expirada
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Tu sesión de compra ha expirado por seguridad.
                        Puedes renovar tu sesión o volver a empezar.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={onRenewToken}
                            disabled={isLoading}
                            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition disabled:bg-gray-400"
                        >
                            {isLoading ? 'Renovando...' : 'Renovar Sesión'}
                        </button>
                        <button
                            onClick={onGoHome}
                            className="w-full bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 transition"
                        >
                            Volver al Inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};