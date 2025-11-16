export type PlanMarketing = {
  id: string
  code: string
  name: string
  price: string
  period: string
  originalPrice: string | null
  description: string
  features: Record<string, boolean>
  tenantCount: string
  color: 'gray' | 'blue' | 'purple'
  icon_name: string
  popular: boolean
  cta_text: string
  highlight: string | null
}

export type Testimonial = {
  name: string
  role: string
  image: string
  content: string
  rating: number
  company: string
  results: string
  verified: boolean
}

export type ComparisonData = {
  before: { title: string; items: Array<{ icon: any; text: string; color: string }> }
  after: { title: string; items: Array<{ icon: any; text: string; color: string }> }
}

export type FeaturedRaffleCard = {
  id: string
  name: string
  image: string
  ticketsSold: number
  totalTickets: number
  price: number
  status: string
  participants: number
  category: string
  badge: string
}
