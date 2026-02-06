import './css/Header.css';

// 📁 components/Header.tsx (Actualizado)
export function Header() {
  return (
    <header className="w-full bg-sky-600 overflow-hidden">
      <div className="relative w-full h-15">
        <div className="absolute whitespace-nowrap animate-marquee text-white font-bold text-sm flex items-center gap-6 h-full">
          {Array(2).fill(0).map((_, i) => (
            <span key={i} className="flex items-center gap-2">
              My Fortuna Cloud - Payment Gateway 💳
              My Fortuna Cloud - Payment Gateway 💳
              My Fortuna Cloud - Payment Gateway 💳
            </span>
          ))}
        </div>
      </div>
    </header>
  )
}

