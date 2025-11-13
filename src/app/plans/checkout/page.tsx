'use client'
import { Suspense } from 'react'
import CheckoutForm from '@/app/components/plans-checkout/CheckoutForm'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando checkout...</div>}>
      <CheckoutForm />
    </Suspense>
  )
}