import Link from 'next/link';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📋' },
  { href: '/lessons/upload', label: 'Upload Notes', icon: '📤' },
  { href: '/carry-overs', label: 'Carry-Overs', icon: '🔄' },
  { href: '/history', label: 'History', icon: '📜' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
];

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/signin');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top navigation bar */}
      <header className="border-b border-border/40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">LP</span>
              </div>
              <span className="font-semibold text-sm tracking-tight hidden sm:block">LessonPal</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {session.user?.name?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
        {children}
      </main>
    </div>
  );
}
