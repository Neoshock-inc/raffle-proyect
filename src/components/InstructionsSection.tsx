// components/InstructionsSection.tsx
interface InstructionsSectionProps {
    onVideoClick: () => void;
}

export function InstructionsSection({ onVideoClick }: InstructionsSectionProps) {
    return (
        <section className="w-full mb-8 text-gray-800 mt-3">
            <h3 className="text-xl font-semibold mb-2 text-center">¿Cómo puedo hacer para participar?</h3>
            <p className="mb-2">Es muy sencillo, te lo explico en estos cuatro pasos ⤵️</p>
            <ol className="list-decimal list-inside space-y-2 pl-4 text-xs marker:font-bold">
                <li>
                    Selecciona el paquete de números que desees, es súper fácil. Recuerda que mientras más números tengas,
                    más oportunidades tendrás de ganar.
                </li>
                <li>
                    Serás redirigido a una página donde seleccionas tu forma de pago y llenarás tus datos.
                </li>
                <li>
                    Una vez realizado el pago, automáticamente y de manera aleatoria se asignarán tus números, los mismos que serán enviados
                    al correo electrónico registrado con la compra (revisa también tu bandeja de correo no deseado o spam).
                </li>
                <li>
                    Podrás revisarlos también en la parte de abajo en el apartado <strong>«Consulta tus números»</strong>.
                </li>
            </ol>
            <div className="mt-6 flex justify-center">
                <button
                    className="bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
                    onClick={onVideoClick}
                >
                    🎥 Ver video tutorial
                </button>
            </div>
        </section>
    );
}
