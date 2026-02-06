// src/app/api/send-verification/route.ts - VERSIÓN MULTI-TENANT
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import {
    getEmailConfigForTenant,
    getTenantInfo,
    resolveBranding,
    emailHeader,
    emailFooter,
    TenantInfo,
    TenantEmailConfig
} from '@/lib/email/tenantEmail';

// Cliente Supabase para consultas específicas de referidos
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getReferralInfo(referralId: string) {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('name, referral_code, email')
      .eq('id', referralId)
      .single();

    if (error || !data) {
      console.log('No referral info found:', referralId, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting referral info:', error);
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ message: 'Cuerpo JSON inválido' }, { status: 400 });
  }

  const { referralId, tenantId, referralLink, verifyUrl } = body;

  if (!referralId || !tenantId || !referralLink || !verifyUrl) {
    return NextResponse.json({
      message: 'Faltan datos requeridos: referralId, tenantId, referralLink, verifyUrl'
    }, { status: 400 });
  }

  try {
    const referralInfo = await getReferralInfo(referralId);
    if (!referralInfo) {
      return NextResponse.json({
        message: 'No se encontró información del referido',
        referralId
      }, { status: 404 });
    }

    if (!referralInfo.email) {
      return NextResponse.json({
        message: 'El referido no tiene email configurado',
        referralId
      }, { status: 400 });
    }

    const emailConfig = await getEmailConfigForTenant(tenantId);
    if (!emailConfig) {
      return NextResponse.json({
        message: 'No se encontró configuración de email para este tenant',
        tenantId
      }, { status: 404 });
    }

    if (!emailConfig.api_key || !emailConfig.api_key.startsWith('re_')) {
      return NextResponse.json({
        message: 'Configuración de email inválida para Resend',
        tenantId
      }, { status: 400 });
    }

    const tenantInfo = await getTenantInfo(tenantId);
    const resend = new Resend(emailConfig.api_key);

    const { error } = await resend.emails.send({
      from: `${emailConfig.from_name} <${emailConfig.from_email}>`,
      to: referralInfo.email,
      subject: `¡Bienvenido a ${tenantInfo?.company_name || 'nuestro sistema'}! Verifica tu cuenta`,
      html: generateVerificationEmailHtml(referralInfo, referralLink, verifyUrl, tenantInfo, emailConfig),
    });

    if (error) {
      console.error('Resend error for tenant', tenantId, ':', error);
      return NextResponse.json({
        message: 'Error al enviar correo de verificación',
        tenantId,
        referralId,
        error: error
      }, { status: 500 });
    }

    console.log('Verification email sent successfully for tenant:', tenantId, 'referral:', referralId);
    return NextResponse.json({
      message: 'Correo de verificación enviado con éxito',
      tenantId,
      referralId,
      sentTo: referralInfo.email
    }, { status: 200 });

  } catch (err) {
    console.error('Error inesperado:', err);
    return NextResponse.json({
      message: 'Error interno del servidor',
      tenantId,
      referralId,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateVerificationEmailHtml(
  referralInfo: any,
  referralLink: string,
  verifyUrl: string,
  tenantInfo: TenantInfo | null,
  emailConfig: TenantEmailConfig | null
): string {
  const { companyName, logoUrl, primaryColor, fromEmail } =
    resolveBranding(tenantInfo, emailConfig);
  const websiteUrl = tenantInfo?.domain
    ? `https://${tenantInfo.domain}`
    : `https://${tenantInfo?.slug || 'app'}.app.myfortunacloud.com`;

  return `
    <div style="font-family: sans-serif; color: #333; max-width: 700px; margin: auto; border: 1px solid #eee;">
      ${emailHeader(logoUrl, companyName, primaryColor, `¡Bienvenido a ${companyName}!`)}

      <!-- Body -->
      <div style="padding: 20px;">
        <p>Hola <strong>${referralInfo.name}</strong>,</p>

        <p>Gracias por unirte a nuestra comunidad de ${companyName}. Estamos muy felices de que formes parte de este proyecto.</p>

        <p>Tu código de referido <strong style="color: ${primaryColor};">${referralInfo.referral_code}</strong> ha sido creado exitosamente.</p>

        <p>A continuación te compartimos tu enlace de referido personalizado para que puedas invitar a tus amigos y ganar beneficios:</p>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid ${primaryColor};">
          <strong style="font-size: 16px; word-break: break-all;">${referralLink}</strong>
        </div>

        <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">¿Cómo funciona?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Comparte tu enlace con amigos y familiares</li>
            <li>Cuando alguien haga una compra usando tu enlace, tú ganas comisiones</li>
            <li>Puedes ver tus estadísticas y ganancias en tiempo real</li>
          </ul>
        </div>

        <p>Para finalizar tu registro y activar tu cuenta de referido, por favor verifica tu email haciendo clic en el siguiente botón:</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Verificar mi cuenta
          </a>
        </div>

        <p style="margin-top: 40px; font-size: 14px; color: #555;">
          Si no fuiste tú quien solicitó esta cuenta, puedes ignorar este correo.
        </p>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">

        <div style="text-align: center;">
          <p style="font-size: 14px; color: #666;">
            ¿Tienes preguntas? Visita nuestro sitio web:
            <a href="${websiteUrl}" style="color: ${primaryColor};">${websiteUrl}</a>
          </p>
        </div>
      </div>

      ${emailFooter(companyName, primaryColor, fromEmail, tenantInfo?.domain)}
    </div>
  `;
}
