// components/Header.tsx
import Image from 'next/image';

export function Header() {
  return (
    <header className="w-full bg-foreground text-center">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-white">Gana con el TRIX</h1>
      </div>
    </header>
  );
}