// ============================================
// 📄 app/lib/facebook.ts
// ============================================
import crypto from 'crypto';
import { TenantService } from '@/services/tenantService';

function sha256(value?: string | null) {
  if (!value) return undefined;
  // Normalizar: lowercase, trim, sin espacios extras
  return crypto.createHash('sha256')
    .update(String(value).toLowerCase().trim())
    .digest('hex');
}

interface FacebookEventData {
  invoice: any;
  eventName: 'OrderCreated' | 'Purchase';
}

export const FacebookService = {
  /**
   * 🆕 Enviar evento OrderCreated cuando se crea la orden
   */
  async sendOrderCreatedEvent(invoice: any) {
    return this.sendEvent({ invoice, eventName: 'OrderCreated' });
  },

  /**
   * ✅ Enviar evento Purchase cuando se completa la compra
   */
  async sendPurchaseEvent(invoice: any) {
    return this.sendEvent({ invoice, eventName: 'Purchase' });
  },

  /**
   * 📤 Método unificado para enviar eventos a Meta CAPI
   */
  async sendEvent({ invoice, eventName }: FacebookEventData) {
    try {
      const tenantId = invoice.tenant_id;
      if (!tenantId) {
        console.log('⚠ No tenant_id en la factura');
        return;
      }

      const tenant = await TenantService.getTenantFullConfig(tenantId);
      if (!tenant?.tenant?.metadata?.metaPixel?.enabled) {
        console.log('⚠ Pixel deshabilitado para tenant:', tenantId);
        return;
      }

      const pixelId = tenant.tenant.metadata.metaPixel.id;
      const token = tenant.tenant.metadata.metaPixel.token;

      if (!pixelId || !token) {
        console.log('⚠ Pixel ID o TOKEN no configurado');
        return;
      }

      console.log(`📌 Enviando ${eventName} a Facebook CAPI...`);

      // ==========================================
      // IDENTIFICADORES ÚNICOS (deben ser iguales en ambos eventos)
      // ==========================================
      const event_id = `order_${invoice.id}`; // ID único de la orden
      const transaction_id = invoice.id || invoice.order_number; // Código interno

      // ==========================================
      // DATOS DEL NAVEGADOR (fbp y fbc)
      // ==========================================
      const fbp = invoice.fbp || invoice.fb_browser_id; // _fbp cookie
      const fbc = invoice.fbc || invoice.fb_click_id;   // _fbc cookie

      if (!fbp) {
        console.warn('⚠️ WARNING: fbp no disponible. Meta no podrá emparejar correctamente.');
      }

      // ==========================================
      // DATOS DEL USUARIO (hasheados con SHA256)
      // ==========================================
      const fullName = invoice.full_name || "";
      const nameParts = fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const userData: Record<string, any> = {
        em: sha256(invoice.email),
        ph: sha256(invoice.phone?.replace(/\D/g, '')), // Solo números
        fn: sha256(firstName),
        ln: sha256(lastName),
        ct: sha256(invoice.city),
        st: sha256(invoice.province),
        country: sha256(invoice.country)
      };

      // Agregar fbp y fbc si existen
      if (fbp) userData.fbp = fbp; // NO hashear
      if (fbc) userData.fbc = fbc; // NO hashear

      // Quitar campos undefined
      Object.keys(userData).forEach((k) => {
        if (userData[k] === undefined) delete userData[k];
      });

      // ==========================================
      // VALOR DE LA COMPRA
      // ==========================================
      const amount = Number(invoice.total_price || invoice.amount || 0);
      const currency = invoice.currency || "USD";

      // ==========================================
      // CONSTRUIR PAYLOAD
      // ==========================================
      const payload = {
        data: [
          {
            event_name: eventName,
            event_time: Math.floor(Date.now() / 1000),
            event_id: event_id,              // ✅ Mismo en ambos eventos
            action_source: "website",
            event_source_url: invoice.event_source_url || invoice.checkout_url || `https://tu-dominio.com`,
            user_data: userData,              // ✅ Mismo en ambos eventos
            custom_data: {
              value: amount,
              currency: currency,
              transaction_id: transaction_id, // ✅ Mismo en ambos eventos
              content_type: "product",
              contents: [
                {
                  id: invoice.product_id || transaction_id,
                  quantity: invoice.quantity || 1
                }
              ]
            }
          }
        ]
      };

      // ==========================================
      // ENVIAR A META CAPI
      // ==========================================
      const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`;
      
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const responseData = await res.json();

      if (res.ok && responseData.events_received) {
        console.log(`✅ ${eventName} enviado exitosamente:`, {
          event_id,
          transaction_id,
          events_received: responseData.events_received,
          fbp: fbp ? '✓' : '✗',
          fbc: fbc ? '✓' : '✗'
        });
      } else {
        console.error(`❌ Error en respuesta de ${eventName}:`, responseData);
      }

      return responseData;
    } catch (err) {
      console.error(`❌ Error enviando ${eventName} a Facebook CAPI:`, err);
      throw err;
    }
  }
};