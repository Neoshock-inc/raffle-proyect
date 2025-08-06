// components/WhatsAppButton.tsx
import Image from 'next/image';

export function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/593983313707"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition"
        >
            <Image
                src="/images/whasapp.png"
                alt="WhatsApp"
                width={30}
                height={30}
                className="w-7 h-7"
            />
        </a>
    );
}