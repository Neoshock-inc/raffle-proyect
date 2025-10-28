'use client';
import React, { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Users,
  Zap,
  Crown,
  Activity,
  Star,
  Check,
  ArrowRight,
  DollarSign,
  Calendar,
  Target,
  Sparkles,
  Play,
  ChevronRight,
  Award,
  BarChart3,
  Shield,
  Globe,
  Loader2,
  Clock,
  Flame,
  Heart,
  Gift,
  Rocket,
  TrendingDown,
  Lock,
  CheckCircle2,
  AlertCircle,
  X,
  Menu
} from 'lucide-react';
import { MetricsService, DashboardMetrics, ActiveRaffle } from './services/metricsService';

const MyFortunaLanding = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeRaffles: 0,
    monthlyRevenue: 0,
    totalParticipants: 0,
    successRate: 0,
    totalTenants: 0,
    topRaffles: []
  });
  const [loading, setLoading] = useState(true);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Cargar métricas al montar el componente
  useEffect(() => {
    const loadMetrics = async () => {
      try {
        setLoading(true);
        const data = await MetricsService.getDashboardMetrics();
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    const unsubscribe = MetricsService.subscribeToMetricsUpdates((updatedMetrics) => {
      setMetrics(prev => ({ ...prev, ...updatedMetrics }));
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Rotar testimonios automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Rifas destacadas - Agregando las dos nuevas
  const featuredRaffles = [
    {
      id: "proyecto-colorado",
      name: "Proyecto Colorado",
      prize: "Casa de $250,000 + $50,000 en efectivo",
      image: "https://www.proyectocolorado.com/_next/image?url=%2Fimages%2F1.png&w=1200&q=75",
      ticketsSold: 100000,
      totalTickets: 100000,
      price: 1.5,
      endDate: "2025-12-15",
      status: "finalizing",
      participants: 3842,
      daysLeft: 47,
      category: "Vehículos y Más",
      badge: "Finalizando"
    },
    {
      id: "gana-con-trix",
      name: "Gana con el Trix",
      prize: "Gana combos eletrodomésticos + $1,000 en efectivo",
      image: "https://ganaconeltrix.com/wp-content/uploads/2025/09/IMG_1739.webp",
      ticketsSold: 10000,
      totalTickets: 10000,
      price: 2,
      endDate: "2025-11-20",
      status: "new",
      participants: 1520,
      daysLeft: 23,
      category: "Electrodomésticos",
      badge: "Finalizando"
    },
    ...metrics.topRaffles.slice(0, 2).map(raffle => ({
      id: raffle.id,
      name: raffle.title,
      image: raffle.bannerUrl,
      ticketsSold: Math.floor(raffle.soldNumbers * 20),
      totalTickets: raffle.totalNumbers,
      price: Number(raffle.totalPrice),
      status: "active",
      participants: Math.floor(raffle.participants * 0.6),
      category: "Premium",
      badge: "✨ Popular"
    }))
  ];

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "$99",
      period: "/mes",
      originalPrice: null,
      description: "Perfecto para empezar tu negocio de rifas",
      features: {
        "Hasta 10,000 boletos": true,
        "Rifas ilimitadas": true,
        "Dashboard básico": true,
        "Soporte por email": true,
        "Dominio personalizado": false,
        "Sistema de ganadores": false,
        "Sistema de referidos": false,
        "Números bendecidos": false,
        "Landing customizable": false,
        "Soporte prioritario": false,
      },
      tenantCount: "142 usuarios activos",
      color: "gray",
      icon: Activity,
      popular: false,
      cta: "Comenzar Gratis",
      highlight: null
    },
    {
      id: "medium",
      name: "Profesional",
      price: "$500",
      period: "pago único",
      originalPrice: "$899",
      description: "Para negocios serios que buscan automatización",
      features: {
        "Hasta 10,000 boletos": true,
        "Rifas ilimitadas": true,
        "Dashboard avanzado": true,
        "Soporte prioritario": true,
        "Dominio personalizado": false,
        "Sistema de ganadores": true,
        "Sistema de referidos": true,
        "Números bendecidos": true,
        "Landing customizable": false,
        "API acceso": true,
      },
      tenantCount: "89 usuarios activos",
      color: "blue",
      icon: Zap,
      popular: true,
      cta: "Comprar Ahora",
      highlight: "Más popular"
    },
    {
      id: "enterprise",
      name: "Full Elite",
      price: "$1,000",
      period: "pago único",
      originalPrice: "$1,899",
      description: "Todo incluido para empresas de alto volumen",
      features: {
        "Boletos ilimitados": true,
        "Rifas ilimitadas": true,
        "Dashboard completo": true,
        "Soporte VIP 24/7": true,
        "Dominio personalizado": true,
        "Sistema de ganadores": true,
        "Sistema de referidos": true,
        "Números bendecidos": true,
        "Landing customizable": true,
        "API acceso completo": true,
        "Branding personalizado": true,
        "Integración WhatsApp": true,
      },
      tenantCount: "34 usuarios elite",
      color: "purple",
      icon: Crown,
      popular: false,
      cta: "Activar Full Elite",
      highlight: "Mejor valor"
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Fundadora",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "En 6 meses pasé de vender 50 boletos a más de 5,000 mensuales. My Fortuna Cloud no solo es una plataforma, es el socio que necesitaba para escalar mi negocio.",
      rating: 5,
      company: "Rifas Doradas",
      results: "+300% ventas",
      verified: true
    },
    {
      name: "Carlos Mendoza",
      role: "Emprendedor",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "Recuperé mi inversión en menos de 2 semanas. El sistema de referidos me genera ingresos pasivos que jamás imaginé. Esto es un game changer total.",
      rating: 5,
      company: "Sorteos Premium",
      results: "$8,400 primer mes",
      verified: true
    },
    {
      name: "Ana Rodríguez",
      role: "CEO",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "Gestiono 15 rifas simultáneas sin problemas. El sistema automatizado de ganadores me ahorra 20 horas semanales. Nunca volveré a trabajar con hojas de Excel.",
      rating: 5,
      company: "Fortuna Express",
      results: "20 hrs/sem ahorradas",
      verified: true
    },
    {
      name: "Roberto Salazar",
      role: "Empresario Digital",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      content: "La landing personalizable me permitió crear mi propia marca. Mis clientes piensan que tengo un equipo de desarrollo detrás. Profesionalismo al 100%.",
      rating: 5,
      company: "Mega Sorteos",
      results: "Marca profesional",
      verified: true
    }
  ];

  const comparisonData = {
    before: {
      title: "Antes de My Fortuna Cloud",
      items: [
        { icon: TrendingDown, text: "Vendes 50-100 boletos al mes", color: "text-red-400" },
        { icon: Clock, text: "Pierdes 15+ horas en gestión manual", color: "text-red-400" },
        { icon: AlertCircle, text: "Errores constantes en sorteos", color: "text-red-400" },
        { icon: DollarSign, text: "Sin sistema de referidos = $0 extra", color: "text-red-400" },
        { icon: X, text: "Landing genérica que no convierte", color: "text-red-400" }
      ]
    },
    after: {
      title: "Después de My Fortuna Cloud",
      items: [
        { icon: TrendingUp, text: "Escalas a 1,000+ boletos mensuales", color: "text-green-400" },
        { icon: Zap, text: "Automatización total = más tiempo libre", color: "text-green-400" },
        { icon: CheckCircle2, text: "Selección de ganadores 100% transparente", color: "text-green-400" },
        { icon: Gift, text: "Ingresos pasivos con comisiones", color: "text-green-400" },
        { icon: Rocket, text: "Landing profesional que genera confianza", color: "text-green-400" }
      ]
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateProgress = (sold: number, total: number) => {
    return Math.min((sold / total) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-6" />
          <p className="text-white text-xl font-semibold">Cargando la plataforma más avanzada...</p>
          <p className="text-white/70 text-sm mt-2">Preparando métricas en tiempo real</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header Mejorado */}
      <header className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>

        {/* Floating Banner */}
        <div className="relative z-20 bg-gradient-to-r from-yellow-400 to-orange-500 py-2">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm md:text-base font-semibold text-white flex items-center justify-center gap-2">
              <Flame className="w-4 h-4 animate-pulse" />
              <span>🎉 Oferta de Lanzamiento: Ahorra hasta 47% en plan Full Elite • Solo quedan 12 cupos</span>
              <Flame className="w-4 h-4 animate-pulse" />
            </p>
          </div>
        </div>

        <nav className="relative z-10 container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white block">My Fortuna Cloud</span>
                <span className="text-xs text-yellow-400 font-medium">Trusted by 265+ businesses</span>
              </div>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Características</a>
              <a href="#raffles" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Rifas Activas</a>
              <a href="#pricing" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Precios</a>
              <a href="#testimonials" className="text-white/90 hover:text-yellow-400 transition-colors font-medium">Testimonios</a>
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Comenzar Ahora
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-6 pb-6 space-y-4 border-t border-white/10 pt-6">
              <a href="#features" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Características</a>
              <a href="#raffles" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Rifas Activas</a>
              <a href="#pricing" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Precios</a>
              <a href="#testimonials" className="block text-white/90 hover:text-yellow-400 transition-colors font-medium">Testimonios</a>
              <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold">
                Comenzar Ahora
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section - Drásticamente Mejorado */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Trust Badge */}
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
              <Shield className="w-5 h-5 text-green-400 mr-2" />
              <span className="text-white/90 text-sm font-medium">
                Plataforma verificada y segura • +265 empresas activas
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
              Transforma Tu Pasión por las Rifas en un
              <span className="block bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mt-2">
                Imperio de $10,000+ al Mes
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              La única plataforma todo-en-uno que combina <span className="text-yellow-400 font-bold">automatización inteligente</span>,
              sistema de <span className="text-yellow-400 font-bold">referidos rentable</span> y
              <span className="text-yellow-400 font-bold"> landing personalizable</span> para escalar tu negocio sin límites.
            </p>

            {/* Social Proof Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">{formatCurrency(metrics.monthlyRevenue)}</div>
                <div className="text-white/70 text-sm">Ingresos mensuales</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">{metrics.totalParticipants.toLocaleString()}+</div>
                <div className="text-white/70 text-sm">Participantes activos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">{metrics.successRate}%</div>
                <div className="text-white/70 text-sm">Tasa de éxito</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 flex items-center">
                Comenzar Mi Prueba Gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setShowVideoModal(true)}
                className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center"
              >
                <Play className="mr-2 w-5 h-5" />
                Ver Demo (2 min)
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Sin tarjeta de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Configuración en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span>Soporte en español 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rifas Destacadas Section - NUEVA */}
      <section id="raffles" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6">
              <Flame className="w-5 h-5 text-yellow-400 mr-2 animate-pulse" />
              <span className="text-yellow-400 font-semibold">Rifas en Vivo Ahora</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Oportunidades <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Activas</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Únete a miles de participantes que ya están compitiendo por premios increíbles
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredRaffles.map((raffle, index) => {
              const progress = calculateProgress(raffle.ticketsSold, raffle.totalTickets);
              const isAlmostSoldOut = progress > 85;

              return (
                <div
                  key={raffle.id}
                  className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={raffle.image}
                      alt={raffle.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        {raffle.badge}
                      </span>
                    </div>

                    {isAlmostSoldOut && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-red-500/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                          ¡Casi agotado!
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
                        {raffle.category}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-semibold">{raffle.participants}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                      {raffle.name}
                    </h3>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-white/70 mb-2">
                        <span>{raffle.ticketsSold.toLocaleString()} vendidos</span>
                        <span>{raffle.totalTickets.toLocaleString()} total</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-center mt-2">
                        <span className="text-xs font-semibold text-yellow-400">
                          {progress.toFixed(1)}% vendido
                        </span>
                      </div>
                    </div>

                    {/* Price & CTA */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-white">${raffle.price}</div>
                        <div className="text-xs text-white/70">por boleto</div>
                      </div>
                      <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm">
                        Participar
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ver Todas CTA */}
          <div className="text-center mt-12">
            <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 inline-flex items-center gap-2">
              Ver Todas las Rifas Activas
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Antes vs Después Section - NUEVA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              La Transformación es <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Real</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Descubre cómo My Fortuna Cloud revoluciona tu forma de hacer negocios
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Antes */}
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{comparisonData.before.title}</h3>
              </div>

              <div className="space-y-4">
                {comparisonData.before.items.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 ${item.color} flex-shrink-0 mt-1`} />
                      <span className="text-white/80">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Después */}
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 relative overflow-hidden">
              {/* Sparkle effect */}
              <div className="absolute top-4 right-4">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">{comparisonData.after.title}</h3>
              </div>

              <div className="space-y-4">
                {comparisonData.after.items.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <IconComponent className={`w-5 h-5 ${item.color} flex-shrink-0 mt-1`} />
                      <span className="text-white/80 font-medium">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 inline-flex items-center gap-2">
              Quiero Esta Transformación Ahora
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Mejorado */}
      <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Todo lo que Necesitas para <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Dominar el Mercado</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Herramientas profesionales que te dan ventaja competitiva desde el día uno
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Automatización Total",
                description: "Sistema inteligente que gestiona rifas, sorteos y notificaciones 24/7 sin intervención humana.",
                benefit: "Ahorra 20+ horas semanales",
                color: "from-yellow-400 to-orange-500"
              },
              {
                icon: Target,
                title: "Sistema de Ganadores",
                description: "Algoritmo transparente y verificable que selecciona ganadores de forma 100% aleatoria y justa.",
                benefit: "Confianza = más ventas",
                color: "from-blue-400 to-blue-600"
              },
              {
                icon: Users,
                title: "Referidos Rentables",
                description: "Programa de afiliados integrado que convierte a tus clientes en tu fuerza de ventas.",
                benefit: "Ingresos pasivos garantizados",
                color: "from-purple-400 to-purple-600"
              },
              {
                icon: Globe,
                title: "Landing Personalizable",
                description: "Crea tu marca profesional con landing pages customizables sin código. Tu dominio, tu identidad.",
                benefit: "Aumenta conversión 3x",
                color: "from-green-400 to-green-600"
              },
              {
                icon: BarChart3,
                title: "Analytics en Tiempo Real",
                description: "Dashboard completo con métricas de ventas, participación y ROI actualizadas al segundo.",
                benefit: "Decisiones basadas en datos",
                color: "from-pink-400 to-pink-600"
              },
              {
                icon: Shield,
                title: "Seguridad Bancaria",
                description: "Encriptación de nivel militar y cumplimiento PCI DSS. Tus transacciones 100% protegidas.",
                benefit: "Cero fraudes",
                color: "from-red-400 to-red-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/20 transform hover:-translate-y-2"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-white/80 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  {feature.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Mejorado */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6">
              <DollarSign className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold">Planes que se pagan solos</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Elige el Plan que <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Impulsará tu Negocio</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Sin trucos. Sin sorpresas. Solo resultados reales desde el primer día.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const isPopular = plan.popular;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white/10 backdrop-blur-sm border-2 ${isPopular
                    ? 'border-yellow-400 shadow-2xl shadow-yellow-400/30'
                    : 'border-white/20'
                    } rounded-3xl p-8 hover:border-yellow-400/50 transition-all duration-300 ${isPopular ? 'transform scale-105' : 'hover:transform hover:scale-105'
                    }`}
                >
                  {/* Popular Badge */}
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg">
                        {plan.highlight}
                      </div>
                    </div>
                  )}

                  {/* Icon & Title */}
                  <div className="text-center mb-8">
                    <div className={`w-20 h-20 bg-gradient-to-r ${plan.color === 'purple' ? 'from-purple-400 to-purple-600' :
                      plan.color === 'blue' ? 'from-blue-400 to-blue-600' :
                        'from-gray-400 to-gray-600'
                      } rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-3">{plan.name}</h3>

                    <div className="mb-2">
                      {plan.originalPrice && (
                        <div className="text-white/50 text-lg line-through mb-1">
                          {plan.originalPrice}
                        </div>
                      )}
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-bold text-white">{plan.price}</span>
                        <span className="text-white/70 text-lg">{plan.period}</span>
                      </div>
                    </div>

                    {plan.originalPrice && (
                      <div className="text-green-400 font-semibold text-sm mb-3">
                        Ahorras {parseInt(plan.originalPrice.replace('$', '')) - parseInt(plan.price.replace('$', '').replace(',', ''))}$
                      </div>
                    )}

                    <p className="text-white/70 text-sm mb-3">{plan.description}</p>
                    <div className="text-yellow-400 text-sm font-medium">{plan.tenantCount}</div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    {Object.entries(plan.features).map(([feature, included]) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${included ? 'bg-green-500' : 'bg-white/10'
                          }`}>
                          {included ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <X className="w-4 h-4 text-white/40" />
                          )}
                        </div>
                        <span className={`${included ? 'text-white' : 'text-white/50'} text-sm`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${isPopular
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                    : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-yellow-400/50'
                    }`}>
                    {plan.cta}
                  </button>

                  {/* Guarantee */}
                  {plan.id !== 'basic' && (
                    <div className="mt-6 text-center">
                      <div className="inline-flex items-center gap-2 text-green-400 text-xs font-medium">
                        <Shield className="w-4 h-4" />
                        Garantía de devolución 30 días
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Money Back Guarantee */}
          <div className="mt-16 text-center">
            <div className="bg-green-500/10 backdrop-blur-sm border border-green-500/30 rounded-2xl p-8 max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-12 h-12 text-green-400" />
                <h3 className="text-2xl font-bold text-white">Garantía de Satisfacción 100%</h3>
              </div>
              <p className="text-white/80 text-lg leading-relaxed">
                Si en los primeros 30 días no estás completamente satisfecho con My Fortuna Cloud,
                te devolvemos el 100% de tu dinero. Sin preguntas. Sin complicaciones.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-white/80 text-lg">
              ¿Necesitas más de 10,000 boletos? <span className="text-yellow-400 font-semibold cursor-pointer hover:underline">Hablemos de un plan Enterprise</span>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Mejorado */}
      <section id="testimonials" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-full px-6 py-2 mb-6">
              <Heart className="w-5 h-5 text-red-400 mr-2 animate-pulse" />
              <span className="text-yellow-400 font-semibold">Amado por emprendedores como tú</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Historias Reales de <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Éxito</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              No confíes solo en nuestras palabras. Escucha a quienes ya transformaron sus vidas.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="text-center">
                {/* Stars */}
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-7 h-7 text-yellow-400 fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-2xl md:text-3xl text-white font-medium mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                {/* Results Badge */}
                <div className="inline-block bg-gradient-to-r from-green-400/20 to-green-600/20 border border-green-400/30 rounded-full px-6 py-2 mb-8">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-bold text-lg">
                      {testimonials[currentTestimonial].results}
                    </span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center justify-center gap-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-20 h-20 rounded-full border-4 border-yellow-400/30"
                  />
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-white font-bold text-xl">
                        {testimonials[currentTestimonial].name}
                      </div>
                      {testimonials[currentTestimonial].verified && (
                        <span title="Usuario verificado">
                          <CheckCircle2 className="w-5 h-5 text-blue-400" />
                        </span>
                      )}
                    </div>
                    <div className="text-white/70 text-sm">
                      {testimonials[currentTestimonial].role}
                    </div>
                    <div className="text-yellow-400 text-sm font-semibold">
                      {testimonials[currentTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Dots */}
            <div className="flex justify-center mt-8 space-x-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`transition-all duration-300 ${index === currentTestimonial
                    ? 'w-12 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full'
                    : 'w-3 h-3 bg-white/30 rounded-full hover:bg-white/50'
                    }`}
                  aria-label={`Ver testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Trust Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-5xl mx-auto">
            {[
              { number: "4.9/5", label: "Rating promedio" },
              { number: "265+", label: "Clientes activos" },
              { number: "98%", label: "Tasa de retención" },
              { number: "24/7", label: "Soporte disponible" }
            ].map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                  {stat.number}
                </div>
                <div className="text-white/70 text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section - NUEVA */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Preguntas <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Frecuentes</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Todo lo que necesitas saber antes de comenzar
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {[
              {
                q: "¿Cómo funciona el pago único en los planes Profesional y Full Elite?",
                a: "Pagas una sola vez y obtienes acceso de por vida. No hay renovaciones, no hay cargos mensuales. Es tuyo para siempre."
              },
              {
                q: "¿Qué pasa si supero los 10,000 boletos en el plan Básico o Profesional?",
                a: "Puedes hacer upgrade a Full Elite en cualquier momento. El cambio es inmediato y solo pagas la diferencia. O puedes esperar a que tus rifas actuales terminen."
              },
              {
                q: "¿El sistema de referidos genera ingresos reales?",
                a: "Sí. Nuestros clientes generan entre $200 y $2,000 mensuales adicionales solo con el programa de afiliados. Es completamente automático."
              },
              {
                q: "¿Puedo personalizar mi landing si estoy en el plan Básico o Profesional?",
                a: "La personalización completa está disponible solo en Full Elite. Sin embargo, todos los planes incluyen plantillas pre-diseñadas profesionales."
              },
              {
                q: "¿Qué tipo de soporte ofrecen?",
                a: "Básico: Email en 24-48h. Profesional: Chat en 12h. Full Elite: WhatsApp prioritario con respuesta en menos de 2 horas, incluso fines de semana."
              },
              {
                q: "¿Hay garantía de devolución?",
                a: "Sí. Tienes 30 días para probar la plataforma. Si no estás satisfecho, te devolvemos el 100% de tu dinero sin preguntas."
              }
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:border-yellow-400/50 transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-white mb-3 flex items-start gap-3">
                  <span className="text-yellow-400 flex-shrink-0">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-white/80 leading-relaxed pl-8">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/80 text-lg mb-4">
              ¿Tienes más preguntas?
            </p>
            <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold hover:bg-white/20 hover:border-yellow-400/50 transition-all duration-300">
              Hablar con un Experto
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section - Mejorado */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-6 py-2 mb-6">
              <span className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                ¡Última oportunidad para el descuento de lanzamiento!
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Tu Imperio de Rifas Comienza Hoy
            </h2>

            <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed">
              Únete a {metrics.totalTenants}+ emprendedores que están generando {formatCurrency(metrics.monthlyRevenue)}+ mensuales.
              <span className="block mt-2 font-bold">No dejes pasar esta oportunidad.</span>
            </p>

            {/* Urgency Counter */}
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl p-6 max-w-2xl mx-auto mb-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <Clock className="w-8 h-8 text-white animate-pulse" />
                <span className="text-white text-lg font-bold">
                  Oferta especial termina en:
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { value: "02", label: "Días" },
                  { value: "14", label: "Horas" },
                  { value: "37", label: "Min" },
                  { value: "52", label: "Seg" }
                ].map((time, index) => (
                  <div key={index} className="bg-white/10 rounded-xl p-4">
                    <div className="text-4xl font-bold text-white mb-1">{time.value}</div>
                    <div className="text-white/70 text-sm">{time.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
              <button className="group bg-white text-orange-500 px-12 py-6 rounded-xl font-bold text-xl hover:bg-white/90 transition-all duration-300 shadow-2xl hover:shadow-white/50 transform hover:scale-105 flex items-center gap-3">
                <Rocket className="w-6 h-6" />
                Activar Mi Cuenta Ahora
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/95">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Setup en 5 minutos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Sin tarjeta requerida</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span className="font-medium">Garantía 30 días</span>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-10 pt-10 border-t border-white/30">
              <p className="text-white/90 text-sm mb-4">
                ⭐⭐⭐⭐⭐ 4.9/5 basado en 483 reseñas verificadas
              </p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                <img src="https://via.placeholder.com/120x40/ffffff/000000?text=Stripe" alt="Stripe" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
                <img src="https://via.placeholder.com/120x40/ffffff/000000?text=PayPal" alt="PayPal" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
                <img src="https://via.placeholder.com/120x40/ffffff/000000?text=SSL" alt="SSL Secure" className="h-8 opacity-80 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mejorado */}
      <footer className="bg-black/30 backdrop-blur-sm py-16 border-t border-white/10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">My Fortuna Cloud</span>
              </div>

              <p className="text-white/70 mb-6 leading-relaxed">
                La plataforma más avanzada y confiable para gestionar rifas digitales.
                Construye tu imperio con tecnología de vanguardia y soporte excepcional.
              </p>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="font-medium">{metrics.activeRaffles} rifas activas ahora</span>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Producto</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#features" className="hover:text-yellow-400 transition-colors">Características</a></li>
                <li><a href="#pricing" className="hover:text-yellow-400 transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">API</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Integraciones</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Soporte</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Tutoriales</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Status</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-4 text-lg">Empresa</h4>
              <ul className="space-y-3 text-white/70">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Carreras</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Afiliados</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-white/70 text-sm">
              © 2025 My Fortuna Cloud. Todos los derechos reservados.
            </p>

            <div className="flex items-center gap-6">
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Privacidad</a>
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Términos</a>
              <a href="#" className="text-white/70 hover:text-white text-sm transition-colors">Cookies</a>
            </div>

            <div className="flex items-center gap-2 text-white/70 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Datos actualizados • {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Demo de My Fortuna Cloud</h3>
              <button
                onClick={() => setShowVideoModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <Play className="w-20 h-20 text-white/50 mx-auto mb-4" />
                <p className="text-white/70">Video demo aquí</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFortunaLanding;