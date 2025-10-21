// 📁 app/payphone-success/page.tsx
import { Suspense } from 'react';
import PayPhoneSuccessClient from './client';

// Componente de loading
function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando...</p>
            </div>
        </div>
    );
}

export default function PayPhoneSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PayPhoneSuccessClient />
        </Suspense>
    );
}