// src/components/ClientWrapper.tsx - Para componentes que necesitan hidratación
'use client';

import React from 'react';
import { DefaultTemplateProps, LuxuryTemplateProps } from '../types/template-props';

interface ClientWrapperProps {
  template: 'default' | 'luxury';
  props: DefaultTemplateProps | LuxuryTemplateProps;
}

// Este componente puede ser útil para casos donde necesitas hidratación específica
export const ClientWrapper: React.FC<ClientWrapperProps> = ({ 
  template, 
  props 
}) => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Dynamic import based on template type
  const TemplateComponent = template === 'luxury' 
    ? require('@/components/templates/LuxuryTemplate').LuxuryTemplate
    : require('@/components/templates/DefaultTemplate').DefaultTemplate;

  return <TemplateComponent {...props} />;
};