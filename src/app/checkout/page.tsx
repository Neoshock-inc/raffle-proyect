'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { CheckoutForm } from '../components/checkout/CheckoutForm';

function CheckoutPageContent() {
    const params = useSearchParams();
    const token = params.get('token');
    const reffer = params.get('ref');

    return <CheckoutForm token={token} reffer={reffer} />;
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div>Cargando checkout...</div>}>
            <CheckoutPageContent />
        </Suspense>
    );
}