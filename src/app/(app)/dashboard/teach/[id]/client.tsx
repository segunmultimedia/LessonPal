'use client';

import { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Eye, EyeOff, Loader2 } from 'lucide-react';
import { markLessonCompleteAction } from './actions';
import { useRouter } from 'next/navigation';

type Question = {
  id: string;
  question: string;
  answer: string;
};

type Exercise = {
  id: string;
  title: string;
  questions: Question[];
};

export function TeachClient({ 
  scheduledLessonId, 
  teacherClassSubjectId,
  exercises 
}: { 
  scheduledLessonId: string;
  teacherClassSubjectId: string;
  exercises: Exercise[];
}) {
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  const toggleAnswers = (exerciseId: string) => {
    setShowAnswers(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const handleMarkComplete = async () => {
    if (!confirm('Are you sure you want to mark this lesson as complete?')) {
      return;
    }
    
    setIsCompleting(true);
    try {
      await markLessonCompleteAction(scheduledLessonId, teacherClassSubjectId);
      // The action will handle redirecting, but just in case:
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
      setIsCompleting(false);
      alert('Failed to mark lesson complete.');
    }
  };

  return (
    <div className="mt-8 space-y-6">
      {exercises.length > 0 && (
        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4">Exercises</h2>
          <div className="space-y-4">
            {exercises.map((exercise) => {
              const showing = showAnswers[exercise.id] || false;
              
              return (
                <div key={exercise.id} className="bg-white dark:bg-gray-900 border rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg">{exercise.title}</h3>
                      <button 
                        onClick={() => toggleAnswers(exercise.id)}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                      >
                        {showing ? (
                          <><EyeOff className="w-4 h-4" /> Hide Answers</>
                        ) : (
                          <><Eye className="w-4 h-4" /> View Answers</>
                        )}
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {exercise.questions.map((q, idx) => (
                        <div key={q.id} className="pt-2">
                          <p className="font-medium text-foreground mb-1">
                            <span className="text-muted-foreground mr-1.5">{idx + 1}.</span>
                            {q.question}
                          </p>
                          {showing && (
                            <div className="mt-2 ml-5 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-lg text-gray-700 dark:text-gray-300 text-sm">
                              <span className="font-semibold text-gray-500 dark:text-gray-400 mr-2">Answer:</span>
                              {q.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="pt-8 border-t border-border mt-8">
        <button
          onClick={handleMarkComplete}
          disabled={isCompleting}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3.5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mx-auto"
        >
          {isCompleting ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Saving Progress...</>
          ) : (
            <><CheckCircle2 className="w-5 h-5" /> Mark Complete</>
          )}
        </button>
      </div>
    </div>
  );
}
