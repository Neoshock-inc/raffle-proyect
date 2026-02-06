import React from 'react';

export const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
        <span>Procesando...</span>
    </div>
);