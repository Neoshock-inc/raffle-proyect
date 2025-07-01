// components/Header.tsx
import Image from 'next/image';

export function Header() {
  return (
    <header className="w-full bg-[#800000] text-center">
      <Image
        src="/images/logo-secondary.png"
        alt="Logo"
        width={1200}
        height={300}
        className="mx-auto mb-2"
      />
    </header>
  );
}