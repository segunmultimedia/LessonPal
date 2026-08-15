import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm bg-white/80 dark:bg-gray-950/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <span className="font-semibold text-lg tracking-tight">LessonPal</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/signin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded hover:opacity-90 transition-opacity shadow-sm"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Built for the Ghana NaCCA Curriculum
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-[1.1]">
            Know exactly what to teach,{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              every single day
            </span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            LessonPal helps teachers track their teaching progress across multiple classes and subjects.
            Never lose track of where you stopped or what comes next.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="w-full sm:w-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded font-medium hover:opacity-90 transition-opacity shadow-lg shadow-blue-500/25"
            >
              Start using LessonPal
            </Link>
            <Link
              href="/signin"
              className="w-full sm:w-auto text-center border border-border px-8 py-3 rounded font-medium hover:bg-accent transition-colors"
            >
              I already have an account
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '📋',
                title: "Today's Lessons",
                description: 'See exactly what you need to teach today, for every class and subject.',
              },
              {
                icon: '📍',
                title: 'Where You Stopped',
                description: 'Continue from where you stopped. Never lose your teaching progress.',
              },
              {
                icon: '🤖',
                title: 'AI Lesson Analysis',
                description: 'Upload your lesson notes and let AI extract structured teaching data.',
              },
              {
                icon: '📅',
                title: 'Smart Scheduling',
                description: 'Carry forward, reschedule, or merge lessons that were not taught.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-xl bg-white dark:bg-gray-900 border border-border/50 hover:border-blue-200 dark:hover:border-blue-800 transition-colors shadow-sm"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LessonPal. Empowering teachers across Ghana.
          </p>
        </div>
      </footer>
    </div>
  );
}
