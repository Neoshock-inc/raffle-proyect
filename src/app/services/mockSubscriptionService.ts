'use client'
export type MockCheckoutPayload = {
  planId: string
  type: 'subscription' | 'one_time'
  fullName: string
  email: string
  phone?: string
  country?: string
  city?: string
  company?: string
  referralCode?: string
}

export type MockSession = {
  id: string
  planId: string
  type: 'subscription' | 'one_time'
  status: 'created' | 'completed'
}

export const MockSubscriptionService = {
  createSession: async (payload: MockCheckoutPayload): Promise<MockSession> => {
    await new Promise((r) => setTimeout(r, 500))
    return { id: `sess_${Math.random().toString(36).slice(2)}`, planId: payload.planId, type: payload.type, status: 'created' }
  },
  completeCheckout: async (sessionId: string): Promise<MockSession> => {
    await new Promise((r) => setTimeout(r, 600))
    return { id: sessionId, planId: 'basic', type: 'subscription', status: 'completed' }
  }
}