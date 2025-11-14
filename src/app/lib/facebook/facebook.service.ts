import crypto from 'crypto';
import { TenantService } from '@/app/services/tenantService';

function sha256(value: string) {
    return crypto.createHash('sha256').update(value).digest('hex');
}

export const FacebookService = {
    async sendPurchaseEvent(invoice: any) {
        try {
            const tenantId = invoice.tenant_id;
            if (!tenantId) return;

            const tenant = await TenantService.getTenantFullConfig(tenantId);

            if (!tenant?.tenant?.metadata?.metaPixel?.enabled) {
                console.log('⚠ Pixel deshabilitado para este tenant');
                return;
            }

            const pixelId = tenant.tenant.metadata.metaPixel.id;
            const token = tenant.tenant.metadata.metaPixel.token;

            if (!pixelId || !token) {
                console.log('⚠ Pixel ID o TOKEN no configurado');
                return;
            }

            // Datos del usuario
            const userData = {
                em: sha256(invoice.email),
                ph: sha256(invoice.phone),
                fn: sha256(invoice.fullName.split(' ')[0] || ''),
                ln: sha256(invoice.fullName.split(' ')[1] || ''),
                ct: sha256(invoice.city || ''),
                st: sha256(invoice.province || ''),
                country: sha256(invoice.country || '')
            };

            const payload = {
                data: [
                    {
                        event_name: "Purchase",
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: "website",
                        event_source_url: `http://pixel-play.127.0.0.1.nip.io:3000/success`,
                        user_data: userData,
                        custom_data: {
                            value: invoice.totalPrice,
                            currency: "USD"
                        }
                    }
                ]
            };

            const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`;

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const responseData = await res.json();
            console.log('📤 Respuesta de Facebook CAPI => ', responseData);

        } catch (err) {
            console.error("❌ Error enviando a Facebook CAPI:", err);
        }
    }
};
