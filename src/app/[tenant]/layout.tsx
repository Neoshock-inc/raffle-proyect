// src/app/[tenant]/layout.tsx - Fixed for Next.js 15
import { ReactNode } from 'react';
import { TenantService } from '../services/tenantService';

interface TenantLayoutProps {
  children: ReactNode;
  params: Promise<{ tenant: string }>; // Changed to Promise
}

export default async function TenantLayout({ 
  children, 
  params 
}: TenantLayoutProps) {
  // Await the params Promise
  const { tenant: tenantSlug } = await params;
  
  const tenant = await TenantService.getTenantBySlug(tenantSlug);
  
  if (!tenant) {
    return children;
  }

  return (
    <div 
      className={`tenant-${tenant.slug}`} 
      data-tenant-layout={tenant.layout}
    >
      {children}
    </div>
  );
}