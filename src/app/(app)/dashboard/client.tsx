'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export type DashboardSubject = {
  id: string;
  subjectName: string;
  termName: string;
  weekNumber: number | null;
};

export type DashboardClass = {
  classLevelId: string;
  className: string;
  termName: string;
  weekNumber: number | null;
  subjects: DashboardSubject[];
};

interface DashboardTabsProps {
  classes: DashboardClass[];
}

export function DashboardTabs({ classes }: DashboardTabsProps) {
  const [activeClassId, setActiveClassId] = useState<string | null>(classes.length > 0 ? classes[0].classLevelId : null);

  if (classes.length === 0) {
    return (
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
          <h2 className="text-lg font-semibold">Your Classes</h2>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/classes/manage" className="text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border px-3 py-1.5 rounded transition">
              Manage Classes
            </Link>
            <Link href="/dashboard/classes/new" className="bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 transition shadow-sm">
              <Plus className="w-4 h-4" /> Add New Class
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="font-semibold text-lg mb-2">No classes assigned yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Please complete your setup to tell us what classes and subjects you teach.
          </p>
          <Link href="/dashboard/classes/new" className="inline-flex bg-gray-900 dark:bg-gray-700 text-white font-medium px-6 py-3 rounded hover:bg-gray-800 transition-colors">
            Add Your First Class
          </Link>
        </div>
      </section>
    );
  }

  const activeClass = classes.find(c => c.classLevelId === activeClassId) || classes[0];

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">My Classes</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 overflow-x-auto pb-2 -mb-2 sm:pb-0 sm:mb-0 hide-scrollbar">
            <div className="flex items-center gap-2 min-w-max">
              {classes.map((c) => {
                const isActive = c.classLevelId === activeClassId;
                return (
                  <button
                    key={c.classLevelId}
                    onClick={() => setActiveClassId(c.classLevelId)}
                    className={`px-4 py-2 rounded font-medium text-sm transition-colors whitespace-nowrap
                      ${isActive 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50' 
                        : 'bg-white dark:bg-gray-900 border border-border/50 text-muted-foreground hover:text-foreground hover:border-border'
                      }
                    `}
                  >
                    {c.className}
                  </button>
                );
              })}
              
              <Link href="/dashboard/classes/new" className="px-3 py-2 rounded text-sm font-medium text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-blue-300 dark:hover:border-blue-700 flex items-center gap-1.5 transition-colors whitespace-nowrap bg-gray-50/50 dark:bg-gray-900/20">
                <Plus className="w-4 h-4" /> Add Class
              </Link>
            </div>
          </div>
          
          <div className="shrink-0 flex items-center">
            <Link href="/dashboard/classes/manage" className="text-sm font-medium text-muted-foreground hover:text-foreground border border-transparent hover:border-border px-3 py-1.5 rounded transition whitespace-nowrap">
              Manage Classes
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-gray-50/50 dark:bg-gray-900/20 border border-border/50 rounded-2xl p-6 sm:p-8 animate-in fade-in duration-300">
        <div className="mb-8">
          <h3 className="text-2xl font-bold tracking-tight text-foreground mb-1">{activeClass.className}</h3>
          <p className="text-muted-foreground font-medium">
            {activeClass.termName} • Week {activeClass.weekNumber}
          </p>
        </div>

        <div className="mb-4">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Subjects</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeClass.subjects.map((subject) => (
            <div key={subject.id} className="bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm flex flex-col h-full hover:border-blue-500/50 transition-colors">
              <div className="mb-4">
                <h3 className="text-lg font-bold tracking-tight text-foreground">{subject.subjectName}</h3>
                {/* Optional: Show individual subject term/week if it differs, but keep it clean for now */}
              </div>
              
              <div className="mt-auto">
                <button disabled className="w-full bg-gray-900/50 dark:bg-gray-100/50 text-white dark:text-gray-900 font-medium py-3 rounded opacity-70 cursor-not-allowed flex items-center justify-center gap-2 transition-opacity">
                  Start Teaching
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
