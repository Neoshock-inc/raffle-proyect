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
  Loader2
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

    // Suscribirse a actualizaciones en tiempo real
    const unsubscribe = MetricsService.subscribeToMetricsUpdates((updatedMetrics) => {
      setMetrics(prev => ({ ...prev, ...updatedMetrics }));
    });

    // Cleanup subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Rotar testimonios automáticamente
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const plans = [
    {
      id: "basic",
      name: "Básico",
      price: "$199",
      description: "Plan básico con funcionalidades esenciales",
      features: {
        "Rifas ilimitadas": true,
        "Dominio personalizado": false,
        "Reportes avanzados": false,
        "API acceso": false,
        "Soporte prioritario": false,
        "Branding personalizado": false,
      },
      tenantCount: "45 tenants",
      color: "gray",
      icon: Activity,
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      price: "$1000",
      description: "Plan profesional para pequeñas empresas",
      features: {
        "Rifas ilimitadas": true,
        "Dominio personalizado": true,
        "Reportes avanzados": true,
        "API acceso": false,
        "Soporte prioritario": false,
        "Branding personalizado": false,
      },
      tenantCount: "78 tenants",
      color: "blue",
      icon: Zap,
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$1299",
      description: "Plan empresarial con todas las funcionalidades",
      features: {
        "Rifas ilimitadas": true,
        "Dominio personalizado": true,
        "Reportes avanzados": true,
        "API acceso": true,
        "Soporte prioritario": true,
        "Branding personalizado": true,
      },
      tenantCount: "22 tenants",
      color: "purple",
      icon: Crown,
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "María González",
      role: "Fundadora de Rifas Doradas",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      content: "My Fortuna Cloud transformó completamente nuestro negocio. Hemos aumentado nuestras ventas un 300% en solo 6 meses.",
      rating: 5,
      company: "Rifas Doradas"
    },
    {
      name: "Carlos Mendoza",
      role: "Director de Marketing",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      content: "La plataforma es increíblemente fácil de usar y nuestros clientes aman la experiencia. Los reportes son muy detallados.",
      rating: 5,
      company: "Sorteos Premium"
    },
    {
      name: "Ana Rodríguez",
      role: "CEO de Fortuna Express",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      content: "El soporte es excepcional y las funcionalidades nos permiten gestionar cientos de rifas simultáneamente sin problemas.",
      rating: 5,
      company: "Fortuna Express"
    }
  ];

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando métricas en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <nav className="relative z-10 container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">My Fortuna Cloud</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-white/90 hover:text-white transition-colors">Características</a>
              <a href="#pricing" className="text-white/90 hover:text-white transition-colors">Precios</a>
              <a href="#testimonials" className="text-white/90 hover:text-white transition-colors">Testimonios</a>
              <button className="bg-white text-purple-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Comenzar Ahora
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 container mx-auto px-6 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8">
              <Sparkles className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-white text-sm font-medium">Plataforma líder en gestión de rifas</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              La <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">revolución</span> de las rifas digitales
            </h1>

            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Gestiona rifas profesionales, aumenta tus ventas y construye una comunidad leal con la plataforma más avanzada del mercado.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-300 flex items-center shadow-2xl">
                Comenzar Gratis
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 flex items-center">
                <Play className="mr-2 w-5 h-5" />
                Ver Demo
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{metrics.activeRaffles}</div>
                <div className="text-white/70 text-sm">Rifas Activas</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{formatCurrency(metrics.monthlyRevenue)}</div>
                <div className="text-white/70 text-sm">Ingresos Mensuales</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{metrics.totalParticipants.toLocaleString()}</div>
                <div className="text-white/70 text-sm">Participantes</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="text-3xl font-bold text-white mb-2">{metrics.successRate.toFixed(1)}%</div>
                <div className="text-white/70 text-sm">Tasa de Éxito</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Active Raffles Section */}
      <section className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Rifas <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Activas</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Descubre las rifas más populares que están generando ingresos en tiempo real
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {metrics.topRaffles.slice(0, 6).map((raffle) => (
              <div key={raffle.id} className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="h-48 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
                  {raffle.bannerUrl ? (
                    <img
                      src={raffle.bannerUrl}
                      alt={raffle.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Trophy className="w-16 h-16 text-white/70" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-sm font-medium">{raffle.progress}%</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{raffle.title}</h3>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-white/70">
                      <Users className="w-4 h-4 mr-1" />
                      <span className="text-sm">{raffle.participants} participantes</span>
                    </div>
                    <div className="text-yellow-400 font-bold">
                      {formatCurrency(raffle.totalPrice)}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/70 text-sm">Progreso</span>
                      <span className="text-white/70 text-sm">{raffle.soldNumbers}/{raffle.totalNumbers}</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${raffle.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {raffle.endDate && (
                    <div className="flex items-center text-white/70 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Sorteo: {formatDate(raffle.endDate)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              ¿Por qué elegir <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">My Fortuna Cloud</span>?
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Características avanzadas que transformarán tu negocio de rifas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Análisis en Tiempo Real</h3>
              <p className="text-white/80 leading-relaxed">
                Monitorea tus ventas, participantes y métricas clave con dashboards interactivos que se actualizan en tiempo real.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Pagos Seguros</h3>
              <p className="text-white/80 leading-relaxed">
                Integración completa con pasarelas de pago confiables. Todos los pagos están protegidos y encriptados.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Multi-Tenant</h3>
              <p className="text-white/80 leading-relaxed">
                Gestiona múltiples organizaciones desde una sola plataforma con dominios personalizados y branding único.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Diseño Personalizable</h3>
              <p className="text-white/80 leading-relaxed">
                Temas profesionales, carruseles de imágenes y opciones de personalización completa para tu marca.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Gestión de Participantes</h3>
              <p className="text-white/80 leading-relaxed">
                Sistema completo de gestión de usuarios, referidos y programas de lealtad para maximizar engagement.
              </p>
            </div>

            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Automatización Completa</h3>
              <p className="text-white/80 leading-relaxed">
                Sorteos automáticos, notificaciones por email y gestión de premios sin intervención manual.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Planes que se adaptan a tu <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">negocio</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Desde emprendedores hasta grandes empresas. Precios únicos, sin mensualidades.
            </p>
            <div className="inline-flex bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-1">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full font-medium">
                Pago Único - Sin Suscripciones
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => {
              const IconComponent = plan.icon;
              return (
                <div key={plan.id} className={`relative group ${plan.popular ? 'scale-105 z-10' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-bold">
                      Más Popular
                    </div>
                  )}

                  <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 h-full hover:bg-white/15 transition-all duration-300 ${plan.popular ? 'border-yellow-400/50 shadow-2xl shadow-yellow-400/20' : ''}`}>
                    <div className="text-center mb-8">
                      <div className={`w-16 h-16 bg-gradient-to-r ${plan.color === 'purple' ? 'from-purple-400 to-purple-600' :
                          plan.color === 'blue' ? 'from-blue-400 to-blue-600' :
                            'from-gray-400 to-gray-600'
                        } rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                      <div className="text-white/70 text-sm mb-2">Pago único</div>
                      <div className="text-yellow-400 text-sm font-medium">{plan.tenantCount} activos</div>
                    </div>

                    <div className="space-y-4 mb-8">
                      {Object.entries(plan.features).map(([feature, included]) => (
                        <div key={feature} className="flex items-center">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 ${included ? 'bg-green-500' : 'bg-white/20'
                            }`}>
                            {included ? (
                              <Check className="w-3 h-3 text-white" />
                            ) : (
                              <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                            )}
                          </div>
                          <span className={`${included ? 'text-white' : 'text-white/50'}`}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${plan.popular
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-lg'
                        : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                      }`}>
                      Comenzar Ahora
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/80 text-lg">
              ¿Necesitas algo personalizado? <span className="text-yellow-400 font-semibold cursor-pointer hover:underline">Contáctanos</span>
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Lo que dicen nuestros <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">clientes</span>
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Historias reales de éxito de empresarios que transformaron sus negocios
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 md:p-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>

                <blockquote className="text-2xl md:text-3xl text-white font-medium mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>

                <div className="flex items-center justify-center">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">{testimonials[currentTestimonial].name}</div>
                    <div className="text-white/70">{testimonials[currentTestimonial].role}</div>
                    <div className="text-yellow-400 text-sm">{testimonials[currentTestimonial].company}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                      ? 'bg-yellow-400 w-8'
                      : 'bg-white/30 hover:bg-white/50'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400 to-orange-500">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para revolucionar tu negocio?
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto">
            Únete a {metrics.totalTenants}+ empresarios que ya están generando ingresos extraordinarios con My Fortuna Cloud
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="group bg-white text-orange-500 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center shadow-2xl">
              Comenzar Gratis Ahora
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="group bg-white/20 backdrop-blur-sm border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/30 transition-all duration-300 flex items-center">
              Hablar con Ventas
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>

          <div className="mt-12 text-white/90">
            <p className="text-sm">✨ Sin comisiones ocultas • ✨ Soporte 24/7 • ✨ Garantía de satisfacción</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/20 backdrop-blur-sm py-12">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">My Fortuna Cloud</span>
            </div>

            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              La plataforma más avanzada para gestionar rifas digitales. Construye tu imperio de la fortuna con tecnología de vanguardia.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
              <div>
                <h4 className="text-white font-semibold mb-4">Producto</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Soporte</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Empresa</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Carreras</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-white/70 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Privacidad</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Términos</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-white/70 text-sm">
                © 2025 My Fortuna Cloud. Todos los derechos reservados.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <div className="text-white/70 text-sm">
                  Datos actualizados en tiempo real • {new Date().toLocaleTimeString('es-ES')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MyFortunaLanding;