export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Good morning! 👋</h1>
        <p className="text-muted-foreground mt-1">{today}</p>
      </div>

      {/* Today's lessons - empty state */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Lessons</h2>
        <div className="rounded-2xl border border-dashed border-border p-12 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="font-semibold text-lg mb-2">No lessons scheduled for today</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Upload your lesson notes or create a lesson manually to get started.
            LessonPal will help you track your teaching progress across all your classes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/lessons/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity shadow-sm"
            >
              📤 Upload Lesson Notes
            </a>
            <a
              href="/onboarding"
              className="inline-flex items-center gap-2 border border-border px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
            >
              ⚙️ Complete Setup
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
