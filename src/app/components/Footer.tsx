// components/Footer.tsx
export function Footer() {
    return (
        <footer className="w-full bg-[#800000] py-4 text-center text-white">
            <p className="text-sm">© 2023 GPC. Todos los derechos reservados.</p>
            <p className="text-sm">
                <a href="/privacy-policy" className="underline hover:text-gray-200">
                    Política de Privacidad
                </a>
                {' '}|{' '}
                <a href="/terms-and-conditions" className="underline hover:text-gray-200">
                    Términos y Condiciones
                </a>
            </p>
        </footer>
    );
}