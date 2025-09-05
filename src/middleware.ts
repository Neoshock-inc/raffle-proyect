import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
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
  const globalPaths = ["/checkout", "/login", "/signup"];
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

  // Detectar subdominio (ej: luxury-dreams.127.0.0.1.nip.io o luxury-dreams.myfortunacloud.com)
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
