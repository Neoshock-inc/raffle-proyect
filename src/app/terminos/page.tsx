'use client'

import { Header } from '@/components/Header'

export default function TerminosPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Términos y Condiciones</h1>
            <p className="text-sm text-gray-500 mb-6">Última actualización: Noviembre 2025</p>

            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Aceptación</h2>
                <p>Al utilizar esta plataforma, aceptas estos términos y condiciones. Si no estás de acuerdo, no debes usar el servicio.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Uso de la plataforma</h2>
                <p>El uso debe cumplir con las leyes aplicables. No se permite contenido fraudulento, engañoso, ilícito o que infrinja derechos de terceros.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Pagos y suscripciones</h2>
                <p>Los planes y pagos se procesan a través de proveedores autorizados. Las renovaciones, cargos y cancelaciones se rigen por la política del plan seleccionado.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Privacidad</h2>
                <p>La información personal se trata conforme a nuestras prácticas de privacidad. Al usar el servicio, consientes el procesamiento de datos necesario para operar la plataforma.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Limitación de responsabilidad</h2>
                <p>La plataforma se ofrece "tal cual". No garantizamos disponibilidad continua ni ausencia de errores. Nuestra responsabilidad se limita en la medida permitida por la ley.</p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Contacto</h2>
                <p>Para consultas sobre estos términos, contáctanos mediante los canales de soporte indicados en la plataforma.</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}