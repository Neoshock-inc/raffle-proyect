// src/app/api/stripe/checkout/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { subscriptionService } from '@/app/services/subscriptionService'
import { CreateCheckoutRequest, PlanCode } from '@/app/types/subscription'
import { z } from 'zod'

/**
 * Validation schema for checkout request
 */
const checkoutSchema = z.object({
  planCode: z.enum(['basic', 'professional', 'enterprise']),
  customer: z.object({
    name: z.string().min(1, 'Nombre requerido'),
    lastName: z.string().min(1, 'Apellido requerido'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(1, 'Teléfono requerido'),
    address: z.object({
      line1: z.string().min(1, 'Dirección requerida'),
      city: z.string().min(1, 'Ciudad requerida'),
      state: z.string().min(1, 'Estado requerido'),
      country: z.string().min(1, 'País requerido'),
    }),
  }),
  tenant: z.object({
    name: z.string().min(1, 'Nombre de empresa requerido'),
    slug: z.string()
      .min(1, 'Slug requerido')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug inválido (solo minúsculas, números y guiones)'),
    domain: z.string().optional(),
    description: z.string().optional(),
  }),
})

/**
 * POST /api/stripe/checkout
 * Create a Stripe checkout session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Request body:', body)
    // Validate request
    const validationResult = checkoutSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Datos inválidos', 
          details: validationResult.error.flatten() 
        },
        { status: 400 }
      )
    }
    
    const data = validationResult.data as CreateCheckoutRequest
    
    // Check for domain requirement
    if (data.planCode !== 'basic' && !data.tenant.domain) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El dominio es requerido para este plan' 
        },
        { status: 400 }
      )
    }
    
    // Create checkout session
    const session = await subscriptionService.createCheckoutSession(data)
    
    return NextResponse.json({
      success: true,
      data: session,
    })
    
  } catch (error) {
    console.error('Checkout error:', error)
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('slug')) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 409 } // Conflict
        )
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear sesión de pago' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/stripe/checkout
 * Get available plans
 */
export async function GET() {
  try {
    const plans = await subscriptionService.getPlans()
    
    return NextResponse.json({
      success: true,
      data: plans,
    })
    
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener planes' },
      { status: 500 }
    )
  }
}