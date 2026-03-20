import Link from "next/link";

export function Header() {
  return (
    <header className="fixed top-0 left-0 md:left-20 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 z-30 px-4 md:px-8 flex items-center justify-between transition-all duration-300">
      <Link href="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          Decision
        </h1>
        <div className="text-sm text-gray-400 font-medium hidden sm:block">
          Make better decisions today.
        </div>
      </Link>
    </header>
  );
}
