// api/_shared/responses.ts
// Helpers estandarizados para respuestas de API
import { NextResponse } from 'next/server'

export function apiSuccess<T extends Record<string, any>>(data: T, status = 200) {
    return NextResponse.json(data, { status })
}

export function apiError(message: string, status = 500, extra?: Record<string, any>) {
    return NextResponse.json({ error: message, ...extra }, { status })
}
