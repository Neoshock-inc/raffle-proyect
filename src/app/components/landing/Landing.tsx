'use client'
import { Loader2 } from 'lucide-react'
import Header from '@/app/components/landing/Header'
import HeroSection from '@/app/components/landing/HeroSection'
import RafflesSection from '@/app/components/landing/RafflesSection'
import BeforeAfterSection from '@/app/components/landing/BeforeAfterSection'
import FeaturesSection from '@/app/components/landing/FeaturesSection'
import PlansSection from '@/app/components/landing/Pricing/PlansSection'
import TestimonialsSection from '@/app/components/landing/TestimonialsSection'
import FAQSection from '@/app/components/landing/FAQSection'
import FinalCTASection from '@/app/components/landing/FinalCTASection'
import Footer from '@/app/components/landing/Footer'
import VideoModal from '@/app/components/landing/VideoModal'
import { useLandingMetrics } from '@/app/hooks/landing/useLandingMetrics'
import { useTestimonialsCarousel } from '@/app/hooks/landing/useTestimonialsCarousel'
import { useFeaturedRaffles } from '@/app/hooks/landing/useFeaturedRaffles'
import { testimonials } from '@/app/components/landing/data/testimonials'
import { useRouter } from 'next/navigation'

const Landing = () => {
  const { metrics, loading } = useLandingMetrics()
  const { current, setCurrent } = useTestimonialsCarousel(testimonials.length)
  const featuredRaffles = useFeaturedRaffles(metrics)
  const router = useRouter()
  const onPrimaryCta = () => { router.push('/plans/checkout') }
  const onStartFreeTrial = () => { router.push('/plans/checkout?plan=basic') }
  const [showVideoModal, setShowVideoModal] = useState(false)
  const onOpenDemo = () => setShowVideoModal(true)
  const onSelectPlan = (id: string) => { router.push(`/plans/checkout?plan=${id}`) }
  const onActivate = () => { router.push('/plans/checkout') }
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-6" />
          <p className="text-white text-xl font-semibold">Cargando la plataforma más avanzada...</p>
          <p className="text-white/70 text-sm mt-2">Preparando métricas en tiempo real</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header onPrimaryCtaClick={onPrimaryCta} />
      <HeroSection metrics={metrics} onStartFreeTrial={onStartFreeTrial} onOpenDemo={onOpenDemo} />
      <RafflesSection featuredRaffles={featuredRaffles} />
      <BeforeAfterSection />
      <FeaturesSection />
      <PlansSection onSelectPlan={onSelectPlan} />
      <TestimonialsSection currentIndex={current} onSelectIndex={setCurrent} />
      <FAQSection />
      <FinalCTASection metrics={metrics} onActivate={onActivate} />
      <Footer activeRaffles={metrics.activeRaffles} />
      <VideoModal open={showVideoModal} onClose={() => setShowVideoModal(false)} />
    </div>
  )
}

import { useState } from 'react'
export default Landing
