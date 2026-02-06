// api/_shared/withErrorHandler.ts
// Wrapper try-catch centralizado para API routes
import { NextRequest, NextResponse } from 'next/server'

type RouteHandler = (req: NextRequest) => Promise<NextResponse>

export function withErrorHandler(handler: RouteHandler, label?: string): RouteHandler {
    return async (req: NextRequest) => {
        try {
            return await handler(req)
        } catch (error) {
            console.error(`Error in ${label || 'API route'}:`, error)
            return NextResponse.json(
                { error: 'Error interno del servidor' },
                { status: 500 }
            )
        }
    }
}
