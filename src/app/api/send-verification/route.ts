// src/app/api/send-verification/route.ts - VERSIÓN MULTI-TENANT
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase para consultas directas
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Función para obtener configuración de email por tenant_id
async function getEmailConfigForTenant(tenantId: string) {
  try {
    const { data, error } = await supabase
      .from('email_configs')
      .select('provider, username, password, from_name, host, port')
      .eq('tenant_id', tenantId)
      .eq('provider', 'resend')
      .single();

    if (error) {
      console.log('No email config found for tenant:', tenantId, error);
      return null;
    }

    // Mapear los campos: password = api_key, username = from_email
    return {
      provider: data.provider,
      api_key: data.password,
      from_email: data.username,
      from_name: data.from_name || `Sistema ${tenantId}`,
      host: data.host || 'api.resend.com',
      port: data.port || 443
    };
  } catch (error) {
    console.error('Error getting email config for tenant:', error);
    return null;
  }
}

async function getTenantInfo(tenantId: string) {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select(`
        name,
        slug,
        tenant_config (
          company_name,
          logo_url,
          primary_color
        ),
        tenant_domains (
          domain,
          verified
        )
      `)
      .eq('id', tenantId)
      .single();

    if (error || !data) {
      console.log('No tenant info found:', tenantId, error);
      return null;
    }

    // Normalizar tenant_config
    const config = Array.isArray(data.tenant_config)
      ? data.tenant_config[0]
      : data.tenant_config || {};

    // Buscar dominio verificado
    const verifiedDomain = data.tenant_domains?.find(d => d.verified);
    const primaryDomain = verifiedDomain?.domain || data.tenant_domains?.[0]?.domain;

    return {
      name: data.name,
      slug: data.slug,
      company_name: config.company_name || data.name,
      logo_url: config.logo_url || null,
      primary_color: config.primary_color || '#fa8d3b',
      domain: primaryDomain || null,
    };
  } catch (error) {
    console.error('Error getting tenant info:', error);
    return null;
  }
}

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

  // Validar parámetros requeridos
  if (!referralId || !tenantId || !referralLink || !verifyUrl) {
    return NextResponse.json({
      message: 'Faltan datos requeridos: referralId, tenantId, referralLink, verifyUrl'
    }, { status: 400 });
  }

  try {
    // Obtener información del referido
    const referralInfo = await getReferralInfo(referralId);
    if (!referralInfo) {
      return NextResponse.json({
        message: 'No se encontró información del referido',
        referralId
      }, { status: 404 });
    }

    // Validar que el referido tenga email
    if (!referralInfo.email) {
      return NextResponse.json({
        message: 'El referido no tiene email configurado',
        referralId
      }, { status: 400 });
    }

    // Obtener configuración de email del tenant
    const emailConfig = await getEmailConfigForTenant(tenantId);
    if (!emailConfig) {
      return NextResponse.json({
        message: 'No se encontró configuración de email para este tenant',
        tenantId
      }, { status: 404 });
    }

    // Validar configuración de Resend
    if (!emailConfig.api_key || !emailConfig.api_key.startsWith('re_')) {
      return NextResponse.json({
        message: 'Configuración de email inválida para Resend',
        tenantId
      }, { status: 400 });
    }

    // Obtener información del tenant
    const tenantInfo = await getTenantInfo(tenantId);

    // Crear instancia de Resend con la API key del tenant
    const resend = new Resend(emailConfig.api_key);

    // Enviar email personalizado por tenant
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
  tenantInfo: any = null,
  emailConfig: any = null
): string {
  // Usar información del tenant si está disponible, sino valores por defecto
  const companyName = tenantInfo?.company_name || emailConfig?.from_name || 'Nuestro Sistema';
  const logoUrl = tenantInfo?.logo_url || 'https://wpffdsoqmlfplhlefcwf.supabase.co/storage/v1/object/public/main/main_logo.jpeg';
  const primaryColor = tenantInfo?.primary_color || '#fa8d3b';
  const tenantDomain = tenantInfo?.domain ? `https://${tenantInfo.domain}` : 'https://app.myfortunacloud.com';
  const websiteUrl = tenantInfo?.domain ? `https://${tenantInfo.domain}` : `https://${tenantInfo?.slug || 'app'}.app.myfortunacloud.com`;

  return `
    <div style="font-family: sans-serif; color: #333; max-width: 700px; margin: auto; border: 1px solid #eee;">
      <!-- Header -->
      <div style="background-color: ${primaryColor}; color: white; padding: 20px; text-align: center;">
        <img src="${logoUrl}" alt="${companyName} Logo" style="max-width: 150px;" />
        <h2 style="margin-top: 10px; color: white;">¡Bienvenido a ${companyName}!</h2>
      </div>

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
          <h3 style="margin: 0 0 10px 0; color: #1e40af;">💡 ¿Cómo funciona?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Comparte tu enlace con amigos y familiares</li>
            <li>Cuando alguien haga una compra usando tu enlace, tú ganas comisiones</li>
            <li>Puedes ver tus estadísticas y ganancias en tiempo real</li>
          </ul>
        </div>

        <p>Para finalizar tu registro y activar tu cuenta de referido, por favor verifica tu email haciendo clic en el siguiente botón:</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            ✅ Verificar mi cuenta
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

      <!-- Footer -->
      <div style="background-color: ${primaryColor}; color: white; padding: 15px; text-align: center; font-size: 12px;">
        ${companyName} © ${new Date().getFullYear()}<br/>
        ${emailConfig?.from_email || 'contacto@sistema.com'}
        ${tenantInfo?.domain ? ` | ${tenantInfo.domain}` : ''}
      </div>
    </div>
  `;
}