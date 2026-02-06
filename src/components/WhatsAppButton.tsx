// components/WhatsAppButton.tsx
import Image from 'next/image';
import { TenantConfig } from '@/types/template';

interface WhatsAppButtonProps {
    tenantConfig: TenantConfig;
    className?: string;
}

export function WhatsAppButton({ tenantConfig, className = "" }: WhatsAppButtonProps) {
    // Si no hay WhatsApp configurado, no mostrar el botón
    if (!tenantConfig.social_media.whatsapp) {
        return null;
    }

    return (
        <a
            href={tenantConfig.social_media.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className={`fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-110 z-99 ${className}`}
            aria-label={`Contactar por WhatsApp - ${tenantConfig.company_name}`}
        >
            <Image
                src="/images/whasapp.png"
                alt="WhatsApp"
                width={30}
                height={30}
                className="w-7 h-7"
                onError={(e) => {
                    // Fallback si la imagen no carga
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty('display', 'block');
                }}
            />
            {/* Fallback emoji si la imagen no carga */}
            <span className="text-2xl hidden">💬</span>
        </a>
    );
}