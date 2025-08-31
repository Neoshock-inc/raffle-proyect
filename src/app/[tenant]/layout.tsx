// src/app/[tenant]/layout.tsx - Versión más simple usando solo CSS
import { ReactNode } from 'react';
import { TenantService } from '../services/tenantService';

interface TenantLayoutProps {
  children: ReactNode;
  params: { tenant: string };
}

export default async function TenantLayout({ 
  children, 
  params 
}: TenantLayoutProps) {
  const { tenant: tenantSlug } = params;
  
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