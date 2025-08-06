import './css/Header.css';

export function Header() {
  return (
    <header className="w-full bg-foreground overflow-hidden">
      <div className="relative w-full h-15">
        <div className="absolute whitespace-nowrap animate-marquee text-white font-bold text-sm flex items-center gap-6 h-full">
          {Array(2).fill(0).map((_, i) => (
            <span key={i} className="flex items-center gap-2">
              GANA CON EL TRIX 🎉
              GANA CON EL TRIX 🎉
              GANA CON EL TRIX 🎉
              GANA CON EL TRIX 🎉
              GANA CON EL TRIX 🎉
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}

