// src/app/api/resend/route.ts - VERSIÓN MULTI-TENANT
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import type { Invoice } from '@/types/invoices';
import {
    getEmailConfigForTenant,
    getTenantInfo,
    resolveBranding,
    emailHeader,
    emailFooter,
    TenantInfo,
    TenantEmailConfig
} from '@/lib/email/tenantEmail';

export async function POST(req: NextRequest) {
  let rawBody: any;
  try {
    rawBody = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }

  const invoice: Invoice = rawBody.record;
  console.log('Invoice data:', invoice);

  if (invoice.status !== 'completed') {
    return NextResponse.json(
      { message: 'Factura no enviada (estado no completado)' },
      { status: 200 }
    );
  }

  if (!invoice.tenant_id) {
    console.error('Invoice sin tenant_id:', invoice.id);
    return NextResponse.json(
      { message: 'Invoice sin tenant_id asociado' },
      { status: 400 }
    );
  }

  try {
    const emailConfig = await getEmailConfigForTenant(invoice.tenant_id);

    if (!emailConfig) {
      console.error('No email config found for tenant:', invoice.tenant_id);
      return NextResponse.json(
        { message: 'No se encontró configuración de email para este tenant' },
        { status: 404 }
      );
    }

    if (!emailConfig.api_key || !emailConfig.api_key.startsWith('re_')) {
      console.error('Invalid Resend API key for tenant:', invoice.tenant_id);
      return NextResponse.json(
        { message: 'Configuración de email inválida' },
        { status: 400 }
      );
    }

    const tenantInfo = await getTenantInfo(invoice.tenant_id);
    const resend = new Resend(emailConfig.api_key);

    const { error } = await resend.emails.send({
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: invoice.email,
      subject: `Factura emitida - Orden #${invoice.order_number}`,
      html: generateInvoiceHtml(invoice, tenantInfo, emailConfig),
    });

    if (error) {
      console.error('Resend error for tenant', invoice.tenant_id, ':', error);
      return NextResponse.json({
        message: 'Error al enviar correo',
        tenant_id: invoice.tenant_id,
        error: error
      }, { status: 500 });
    }

    console.log('Email sent successfully for tenant:', invoice.tenant_id);
    return NextResponse.json({
      message: 'Correo enviado con éxito',
      tenant_id: invoice.tenant_id
    }, { status: 200 });

  } catch (err) {
    console.error('Error inesperado para tenant', invoice.tenant_id, ':', err);
    return NextResponse.json({
      message: 'Error interno del servidor',
      tenant_id: invoice.tenant_id
    }, { status: 500 });
  }
}

function generateInvoiceHtml(
  invoice: Invoice,
  tenantInfo: TenantInfo | null,
  emailConfig: TenantEmailConfig | null
): string {
  const barcodeUrl = `https://bwipjs-api.metafloor.com/?bcid=code128&text=${encodeURIComponent(
    invoice.order_number
  )}&scale=2&includetext`;

  const { companyName, logoUrl, primaryColor, tenantDomain, fromEmail } =
    resolveBranding(tenantInfo, emailConfig);

  return `
    <div style="font-family: sans-serif; color: #333; max-width: 700px; margin: auto; border: 1px solid #eee; padding: 0; width: 100%;">
      ${emailHeader(logoUrl, companyName, primaryColor)}

      <!-- Body -->
      <div style="padding: 20px;">
        <table width="100%" style="margin-bottom: 20px;">
          <tr>
            <td style="text-align: left;">
              <h2 style="margin: 0; color: ${primaryColor}; font-size: 24px;">Factura emitida</h2>
            </td>
            <td style="text-align: right;">
              <img src="${barcodeUrl}" alt="Código de barras" style="max-width: 120px; height: auto;" />
            </td>
          </tr>
        </table>

        <p>Hola <strong>${invoice.full_name}</strong>,</p>
        <p>Tu factura con número de orden
          <strong style="color: ${primaryColor};">${invoice.order_number}</strong> ha sido generada.
        </p>

        <table width="100%" style="margin-top: 30px; font-size: 14px;">
          <tr>
            <td style="width: 65%; vertical-align: top;">
              <table width="100%">
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Concepto:</strong></td>
                  <td style="padding: 8px 0;"> Compra total de ${invoice.amount} Números para ${companyName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; width: 40%;"><strong>Total:</strong></td>
                  <td style="padding: 8px 0;">${invoice.total_price.toFixed(2)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Método de pago:</strong></td>
                  <td style="padding: 8px 0;">${invoice.payment_method}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0;"><strong>Fecha:</strong></td>
                  <td style="padding: 8px 0;">${new Date(invoice.created_at).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; vertical-align: top;"><strong>Dirección:</strong></td>
                  <td style="padding: 8px 0;">${invoice.address}, ${invoice.city}, ${invoice.province}, ${invoice.country}</td>
                </tr>
              </table>
            </td>
            <td style="width: 35%;"></td>
          </tr>
        </table>

        <p style="margin-top: 30px;">Gracias por tu compra en ${companyName}.</p>

        <div style="margin-top: 30px; text-align: center;">
          <a href="${tenantDomain}/success?participantId=${invoice.participant_id}&email=${encodeURIComponent(invoice.email)}&amount=${invoice.amount}"
             style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Ver mis números
          </a>
        </div>
      </div>

      ${emailFooter(companyName, primaryColor, fromEmail)}
    </div>
  `;
}

// Endpoint GET para testing
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant_id');
  const testEmail = searchParams.get('email') || 'test@example.com';

  if (!tenantId) {
    return NextResponse.json({
      message: 'Se requiere tenant_id como parámetro de query'
    }, { status: 400 });
  }

  try {
    const emailConfig = await getEmailConfigForTenant(tenantId);
    const tenantInfo = await getTenantInfo(tenantId);

    console.log(tenantInfo);

    if (!emailConfig) {
      return NextResponse.json({
        message: 'No se encontró configuración de email para este tenant',
        tenant_id: tenantId,
        tenant_info: tenantInfo
      }, { status: 404 });
    }

    const resend = new Resend(emailConfig.api_key);

    const { error } = await resend.emails.send({
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: testEmail,
      subject: 'Test de configuración multi-tenant',
      html: `
        <h1>Test Exitoso</h1>
        <p>Este correo de prueba se envió correctamente usando la configuración del tenant: <strong>${tenantId}</strong></p>
        <ul>
          <li><strong>From:</strong> ${emailConfig.from_name} &lt;${emailConfig.from_email}&gt;</li>
          <li><strong>API Key:</strong> ${emailConfig.api_key.substring(0, 10)}...</li>
          <li><strong>Provider:</strong> ${emailConfig.provider}</li>
        </ul>
        ${tenantInfo ? `
          <h2>Información del Tenant</h2>
          <ul>
            <li><strong>Empresa:</strong> ${tenantInfo.company_name}</li>
            <li><strong>Dominio:</strong> ${tenantInfo.domain || 'No configurado'}</li>
            <li><strong>Color:</strong> ${tenantInfo.primary_color}</li>
          </ul>
        ` : ''}
      `,
    });

    if (error) {
      console.error('Test email error:', error);
      return NextResponse.json({
        message: 'Error al enviar correo de prueba',
        tenant_id: tenantId,
        tenant_info: tenantInfo,
        email_config: {
          from_name: emailConfig.from_name,
          from_email: emailConfig.from_email,
          api_key_prefix: emailConfig.api_key.substring(0, 10) + '...'
        },
        error: error
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Correo de prueba enviado con éxito',
      tenant_id: tenantId,
      tenant_info: tenantInfo ? {
        name: tenantInfo.name,
        company_name: tenantInfo.company_name,
        domain: tenantInfo.domain,
        primary_color: tenantInfo.primary_color,
        logo_url: tenantInfo.logo_url
      } : null,
      email_config: {
        from_name: emailConfig.from_name,
        from_email: emailConfig.from_email,
        provider: emailConfig.provider,
        api_key_prefix: emailConfig.api_key.substring(0, 10) + '...'
      },
      test_details: {
        email_sent_to: testEmail,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (err) {
    console.error('Error en test:', err);
    return NextResponse.json({
      message: 'Error interno del servidor en test',
      tenant_id: tenantId,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
