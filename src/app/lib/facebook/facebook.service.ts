import crypto from 'crypto';
import { TenantService } from '@/app/services/tenantService';

function sha256(value?: string | null) {
    if (!value) return undefined;
    return crypto.createHash('sha256').update(String(value)).digest('hex');
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

            console.log('📌 Enviando evento a Facebook CAPI...', invoice);

            // === NOMBRE CORREGIDO ===
            const fullName = invoice.full_name || "";
            const nameParts = fullName.trim().split(" ");

            const firstName = nameParts[0] || "";
            const lastName  = nameParts.slice(1).join(" ") || "";

            // === USER DATA ===
            const userData: Record<string, any> = {
                em: sha256(invoice.email),
                ph: sha256(invoice.phone),
                fn: sha256(firstName),
                ln: sha256(lastName),
                ct: sha256(invoice.city),
                st: sha256(invoice.province),
                country: sha256(invoice.country)
            };

            // Quitar undefined (Facebook no acepta)
            Object.keys(userData).forEach((k) => {
                if (!userData[k]) delete userData[k];
            });

            // === CARGAR VALOR DE COMPRA CORRECTAMENTE ===
            const amount = Number(invoice.total_price || invoice.amount || 0);

            const payload = {
                data: [
                    {
                        event_name: "Purchase",
                        event_time: Math.floor(Date.now() / 1000),
                        action_source: "website",
                        event_source_url: `http://pixel-play.127.0.0.1.nip.io:3000/success`,
                        user_data: userData,
                        custom_data: {
                            value: amount,
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