'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileNav({ navItems }: { navItems: { href: string; label: string; icon: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[4rem] gap-0.5 py-1 rounded transition-colors ${
                isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <span className={`text-xl ${isActive ? 'scale-110 transition-transform' : ''}`}>{item.icon}</span>
              <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
