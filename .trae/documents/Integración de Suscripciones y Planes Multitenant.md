## Alcance
- Separar `MyFortunaLanding` en componentes, hooks, utils y data, siguiendo las convenciones existentes de `src/app/components`, `src/app/hooks`, `src/app/services` y `src/app/utils`.
- Mantener funcionalidades actuales: métricas en tiempo real, carrusel de testimonios, secciones visuales y CTA.
- No tocar servicios existentes (reusar `MetricsService`).

## Estado Actual
- Entrada: `src/app/content.tsx` con componente único `MyFortunaLanding` (línea clave `src/app/content.tsx:38`).
- Lógica mezclada: carga/suscripción de métricas (líneas 52–75), carrusel de testimonios (77–83), utilidades (`formatCurrency`, `formatDate`, `calculateProgress`) y datos estáticos (`plans`, `testimonials`, `comparisonData`).

## Estructura Propuesta
- `src/app/components/landing/Header.tsx`
- `src/app/components/landing/HeroSection.tsx`
- `src/app/components/landing/RafflesSection.tsx`
- `src/app/components/landing/BeforeAfterSection.tsx`
- `src/app/components/landing/FeaturesSection.tsx`
- `src/app/components/landing/Pricing/PlansSection.tsx`
- `src/app/components/landing/TestimonialsSection.tsx`
- `src/app/components/landing/FAQSection.tsx`
- `src/app/components/landing/FinalCTASection.tsx`
- `src/app/components/landing/Footer.tsx`
- `src/app/components/landing/VideoModal.tsx`
- `src/app/components/landing/Pricing/PlanCard.tsx`

- `src/app/hooks/landing/useLandingMetrics.ts` (fetch + subscribe)
- `src/app/hooks/landing/useTestimonialsCarousel.ts` (rotación y dots)
- `src/app/hooks/landing/useMobileMenu.ts` (toggle en header)
- `src/app/hooks/landing/useFeaturedRaffles.ts` (derivar `featuredRaffles` desde métricas)

- `src/app/utils/landing/format.ts` (`formatCurrency`, `formatDate`)
- `src/app/utils/landing/progress.ts` (`calculateProgress`)

- `src/app/components/landing/data/plans.ts` (copiar `plans` marketing)
- `src/app/components/landing/data/testimonials.ts`
- `src/app/components/landing/data/comparisonData.ts`

## Contratos de Props
- `Header`: `{ onPrimaryCtaClick: () => void }` y manejo de menú móvil interno.
- `HeroSection`: `{ metrics: DashboardMetrics, onStartFreeTrial: () => void, onOpenDemo: () => void }`.
- `RafflesSection`: `{ featuredRaffles: Array<{ id; name; image; ticketsSold; totalTickets; price; participants; category; badge; }> }`.
- `FeaturesSection`: sin props (contenido estático actual).
- `PlansSection`: `{ plans: PlanMarketing[], onSelectPlan: (planId: string) => void }`.
- `PlanCard`: `{ plan: PlanMarketing, onSelect: (id: string) => void }`.
- `TestimonialsSection`: `{ testimonials: Testimonial[], currentIndex: number, onSelectIndex: (i: number) => void }`.
- `FAQSection`: datos estáticos.
- `FinalCTASection`: `{ metrics: DashboardMetrics, onActivate: () => void }`.
- `Footer`: `{ activeRaffles: number }`.
- `VideoModal`: `{ open: boolean, onClose: () => void }`.

## Hooks Detalle
- `useLandingMetrics`
  - Estado inicial: `{ activeRaffles, monthlyRevenue, totalParticipants, successRate, totalTenants, topRaffles }`.
  - `load()` + `subscribe()` usando `MetricsService.getDashboardMetrics()` y `MetricsService.subscribeToMetricsUpdates()`.
- `useTestimonialsCarousel`
  - `currentIndex`, `setIndex`, `startAutoRotate(intervalMs=6000)`, `stop()`.
- `useFeaturedRaffles`
  - Combina dos rifas estáticas + `metrics.topRaffles.slice(0,2)` con mapping actual.
- `useMobileMenu`
  - `open`, `toggle()`.

## Utils y Data
- Extraer `formatCurrency`, `formatDate`, `calculateProgress` a utils.
- Extraer `plans`, `testimonials`, `comparisonData` a archivos de data.
- Tipar `PlanMarketing` y `Testimonial` en `src/app/types/landing.ts`.

## Componente Contenedor
- `src/app/content.tsx` queda como orquestador:
  - Importa hooks (`useLandingMetrics`, `useTestimonialsCarousel`, `useFeaturedRaffles`).
  - Pasa props a secciones.
  - Gestiona `showVideoModal` y callbacks de CTA.

## Convenciones a Seguir
- Componentes interactivos con `'use client'` en cada archivo que lo requiera.
- Imports con alias `@/app/...`.
- Tipos en `src/app/types` (público) evitando mezclar con `(auth)`.
- Evitar barrels; imports directos.

## Plan de Refactor Incremental
1. Extraer utils y data (sin cambiar UI).
2. Crear hooks y reemplazar lógica en `content.tsx`.
3. Migrar secciones una por una empezando por `Header` y `HeroSection`, luego `Pricing`, `Raffles`, `Features`, `Testimonials`, `FAQ`, `FinalCTA`, `Footer`, `VideoModal`.
4. Revisar estilos y que la UI y métricas se mantengan idénticas.

## Verificación
- Cargar la página y validar render equivalente.
- Confirmar suscripción a métricas funciona (loader → datos, actualizaciones en tiempo real).
- Navegación y CTAs responden correctamente.

## Siguientes Pasos (post-refactor)
- Integrar el nuevo flujo de checkout de planes conectando los CTAs a `/checkout`.
- Añadir seguridad de sesión en el inicio de checkout.
