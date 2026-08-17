import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default function ManageClassesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-border/50 shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Manage Classes</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          The ability to edit and remove existing classes is coming soon. For now, you can add new classes to your schedule.
        </p>
        <Link 
          href="/dashboard/classes/new" 
          className="inline-flex bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700 transition"
        >
          Add New Class
        </Link>
      </div>
    </div>
  );
}
