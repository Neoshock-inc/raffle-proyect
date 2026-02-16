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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function getAmbassadorInfo(ambassadorId: string) {
  try {
    const { data, error } = await supabase
      .from('ambassadors')
      .select('name, ambassador_code, email')
      .eq('id', ambassadorId)
      .single();

    if (error || !data) {
      console.log('No ambassador info found:', ambassadorId, error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error getting ambassador info:', error);
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

  const { ambassadorId, tenantId, ambassadorLink, verifyUrl } = body;

  if (!ambassadorId || !tenantId || !ambassadorLink || !verifyUrl) {
    return NextResponse.json({
      message: 'Faltan datos requeridos: ambassadorId, tenantId, ambassadorLink, verifyUrl'
    }, { status: 400 });
  }

  try {
    const ambassadorInfo = await getAmbassadorInfo(ambassadorId);
    if (!ambassadorInfo) {
      return NextResponse.json({
        message: 'No se encontró información del embajador',
        ambassadorId
      }, { status: 404 });
    }

    if (!ambassadorInfo.email) {
      return NextResponse.json({
        message: 'El embajador no tiene email configurado',
        ambassadorId
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
      to: ambassadorInfo.email,
      subject: `¡Bienvenido como Embajador a ${tenantInfo?.company_name || 'nuestro sistema'}!`,
      html: generateAmbassadorEmailHtml(ambassadorInfo, ambassadorLink, verifyUrl, tenantInfo, emailConfig),
    });

    if (error) {
      console.error('Resend error for tenant', tenantId, ':', error);
      return NextResponse.json({
        message: 'Error al enviar correo de verificación',
        tenantId,
        ambassadorId,
        error: error
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Correo de verificación enviado con éxito',
      tenantId,
      ambassadorId,
      sentTo: ambassadorInfo.email
    }, { status: 200 });

  } catch (err) {
    console.error('Error inesperado:', err);
    return NextResponse.json({
      message: 'Error interno del servidor',
      tenantId,
      ambassadorId,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateAmbassadorEmailHtml(
  ambassadorInfo: any,
  ambassadorLink: string,
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
      ${emailHeader(logoUrl, companyName, primaryColor, `¡Bienvenido Embajador a ${companyName}!`)}

      <div style="padding: 20px;">
        <p>Hola <strong>${ambassadorInfo.name}</strong>,</p>

        <p>Has sido seleccionado como <strong style="color: ${primaryColor};">Embajador</strong> de ${companyName}. Este es un rol especial que te permite gestionar tu propio equipo de referidos y ganar comisiones en cascada.</p>

        <p>Tu código de embajador: <strong style="color: ${primaryColor}; font-size: 18px;">${ambassadorInfo.ambassador_code}</strong></p>

        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border-left: 4px solid ${primaryColor};">
          <strong style="font-size: 16px; word-break: break-all;">${ambassadorLink}</strong>
        </div>

        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">Beneficios de Embajador</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Crea y gestiona tu propio equipo de referidos</li>
            <li>Gana comisiones personales por las ventas de tu equipo</li>
            <li>Recibe comisiones en cascada por toda tu red</li>
            <li>Accede a un dashboard exclusivo con estadísticas en tiempo real</li>
          </ul>
        </div>

        <p>Para activar tu cuenta de embajador, verifica tu email haciendo clic en el siguiente botón:</p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${verifyUrl}" style="display: inline-block; background-color: ${primaryColor}; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
            Activar mi cuenta de Embajador
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
