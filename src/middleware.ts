import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cache simple para evitar consultas repetidas
const domainToTenantCache = new Map<string, { slug: string; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

async function getTenantSlugByDomain(domain: string): Promise<string | null> {
  // Verificar cache
  const cached = domainToTenantCache.get(domain);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.slug;
  }

  try {
    // Llamar al endpoint que ya tienes
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tenant/by-domain?domain=${domain}`);

    if (response.ok) {
      const data = await response.json();
      if (data.slug) {
        // Guardar en cache
        domainToTenantCache.set(domain, {
          slug: data.slug,
          timestamp: Date.now()
        });
        return data.slug;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting tenant by domain:', error);
    return null;
  }
}

function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase();
}


export async function middleware(request: NextRequest) {
  const rawHost = request.headers.get("host") || "";
  const host = normalizeDomain(rawHost);  // 👈 aplicar aquí
  const url = request.nextUrl.clone();

  // Ignorar rutas técnicas
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Rutas globales
  const globalPaths = ["/checkout", "/login", "/signup", "/success", "/cancel", "/transfer-success"];
  if (globalPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Host raíz → landing (local o prod)
  if (
    host.startsWith("127.0.0.1") ||
    host.startsWith("localhost") ||
    host === "app.myfortunacloud.com"
  ) {
    return NextResponse.next();
  }

  // Verificar si es un dominio personalizado (no contiene nuestros dominios base)
  const isCustomDomain = !host.includes('.app.myfortunacloud.com') &&
    !host.includes('.127.0.0.1.nip.io');

  if (isCustomDomain) {
    // Buscar tenant por dominio personalizado
    const tenantSlug = await getTenantSlugByDomain(host);

    if (tenantSlug) {
      url.pathname = `/${tenantSlug}${url.pathname}`;
      return NextResponse.rewrite(url);
    } else {
      // Dominio personalizado no encontrado - podrías mostrar una página de error
      return NextResponse.next(); // O redirigir a error
    }
  }

  // Detectar subdominio (ej: luxury-dreams.127.0.0.1.nip.io o luxury-dreams.app.myfortunacloud.com)
  const parts = host.split(".");
  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== "www") {
      url.pathname = `/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}