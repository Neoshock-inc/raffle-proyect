import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // Ignorar _next, favicon, APIs
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/favicon.ico") ||
    url.pathname.startsWith("/api/")
  ) {
    return NextResponse.next();
  }

  // Rutas globales que no queremos reescribir
  const excludedPaths = ["/checkout", "/login", "/signup"];
  if (excludedPaths.some(path => url.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // localhost -> landing
  if (host.startsWith("127.0.0.1") || host.startsWith("localhost")) {
    return NextResponse.next();
  }

  // Detectar subdominio (ej: luxury-dreams.127.0.0.1.nip.io)
  const parts = host.split(".");
  if (parts.length > 3) {
    const subdomain = parts[0];
    if (subdomain && subdomain !== "www") {
      // Solo reescribimos si NO es ruta excluida
      url.pathname = `/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}
