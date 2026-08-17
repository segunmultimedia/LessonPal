'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { completeOnboarding } from './actions';
import { MobileSelect } from '@/components/mobile-select';
import { BookOpen, Upload, ArrowLeft, Plus, X } from 'lucide-react';

export function OnboardingClient({ classes, subjects, terms }: { classes: { id: string, name: string }[], subjects: { id: string, name: string }[], terms: { id: string, name: string }[] }) {
  const router = useRouter();
  const { update } = useSession();
  
  // Step Management
  // 1: How to teach?
  // 2: Use Curriculum (Add Classes)
  // 3: Upload Lesson Notes (Coming Soon)
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Assignments (Step 2)
  const [assignments, setAssignments] = useState<{classLevelId: string, subjectIds: string[], termId: string, weekNumber: number}[]>([]);
  
  // Current Selectors
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  type ActionState = { error?: string | null; success: boolean; };
  const initialState: ActionState = { success: false, error: null };
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState);

  useEffect(() => {
    if (state.success) {
      // Force NextAuth session refresh so middleware sees the new token
      update({ onboardingCompleted: true }).then(() => {
        router.push('/dashboard');
        router.refresh();
      });
    }
  }, [state.success, router, update]);

  const addClass = () => {
    if (selectedClass && selectedSubjects.length > 0 && selectedTerm && selectedWeek) {
      setAssignments([...assignments, { 
        classLevelId: selectedClass, 
        subjectIds: selectedSubjects, 
        termId: selectedTerm, 
        weekNumber: selectedWeek 
      }]);
      // Reset for next class
      setSelectedClass('');
      setSelectedSubjects([]);
      // Keep term and week as they might be the same
    }
  };

  const removeAssignment = (index: number) => {
    setAssignments(assignments.filter((_, i) => i !== index));
  };

  // Flatten assignments for the backend
  const flattenedAssignments = assignments.flatMap(a => 
    a.subjectIds.map(sId => ({
      classLevelId: a.classLevelId,
      subjectId: sId,
      termId: a.termId,
      weekNumber: a.weekNumber
    }))
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-4 bg-red-50 text-red-700 rounded text-sm font-medium border border-red-200">
          {state.error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-2">How would you like to teach?</h1>
            <p className="text-muted-foreground text-sm">Choose how you want to manage your lessons on LessonPal.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full text-left bg-white dark:bg-gray-900 border border-border/50 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 p-6 rounded-xl shadow-sm transition-all flex items-start gap-4"
            >
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Use Curriculum</h3>
                <p className="text-sm text-muted-foreground">Teach using lessons already available in LessonPal.</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full text-left bg-white dark:bg-gray-900 border border-border/50 hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 p-6 rounded-xl shadow-sm transition-all flex items-start gap-4"
            >
              <div className="bg-purple-100 dark:bg-purple-900/40 p-3 rounded-lg text-purple-600 dark:text-purple-400 shrink-0">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Upload Lesson Notes</h3>
                <p className="text-sm text-muted-foreground">Upload or take a photo of your own lesson notes.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 pb-20 sm:pb-0">
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </button>

          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight mb-2">Set up your classes</h2>
            <p className="text-sm text-muted-foreground">Select the classes and subjects you currently teach.</p>
          </div>

          <div className="bg-gray-50/50 dark:bg-gray-900/50 border border-border/50 p-4 rounded-xl space-y-4">
            <MobileSelect 
              label="Class"
              placeholder="Select Class"
              options={classes.map(c => ({ id: c.id, label: c.name }))}
              value={selectedClass}
              onChange={setSelectedClass}
            />
            
            <MobileSelect 
              label="Subjects"
              placeholder="Select Subjects"
              options={subjects.map(s => ({ id: s.id, label: s.name }))}
              value={selectedSubjects}
              onChange={setSelectedSubjects}
              multiple={true}
              disabled={!selectedClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <MobileSelect 
                label="Term"
                placeholder="Select Term"
                options={terms.map(t => ({ id: t.id, label: t.name }))}
                value={selectedTerm}
                onChange={setSelectedTerm}
              />
              
              <MobileSelect 
                label="Week"
                placeholder="Select Week"
                options={Array.from({length: 15}, (_, i) => ({ id: String(i + 1), label: `Week ${i + 1}` }))}
                value={String(selectedWeek)}
                onChange={(val) => setSelectedWeek(Number(val))}
              />
            </div>

            <button 
              type="button" 
              onClick={addClass} 
              disabled={!selectedClass || selectedSubjects.length === 0 || !selectedTerm || !selectedWeek} 
              className="w-full bg-gray-900 dark:bg-gray-700 text-white font-medium px-6 py-3.5 rounded disabled:opacity-50 hover:bg-gray-800 transition-colors flex items-center justify-center mt-4"
            >
              <Plus className="w-5 h-5 mr-1" /> Add Class
            </button>
          </div>

          {assignments.length > 0 && (
            <div className="space-y-3 mt-8">
              <h3 className="font-semibold text-lg">Added Classes</h3>
              {assignments.map((a, idx) => {
                const cName = classes.find(c => c.id === a.classLevelId)?.name;
                const sNames = a.subjectIds.map(sId => subjects.find(s => s.id === sId)?.name).filter(Boolean).join(' • ');
                const tName = terms.find(t => t.id === a.termId)?.name;
                
                return (
                  <div key={idx} className="bg-white dark:bg-gray-900 border border-border/50 p-4 rounded-xl shadow-sm flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base mb-1">{cName}</h4>
                      <p className="text-sm font-medium mb-1">{sNames}</p>
                      <p className="text-xs text-muted-foreground">{tName} • Week {a.weekNumber}</p>
                    </div>
                    <button type="button" onClick={() => removeAssignment(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors -mr-2 -mt-2">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pass the flattened assignments to the server action */}
          <input type="hidden" name="assignments" value={JSON.stringify(flattenedAssignments)} />

          {/* Fixed bottom action for mobile */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-gray-950/95 border-t border-border backdrop-blur-sm sm:static sm:bg-transparent sm:border-t-0 sm:p-0 z-40 pb-[env(safe-area-inset-bottom)]">
            <button 
              type="submit" 
              disabled={isPending || assignments.length === 0} 
              className="w-full bg-blue-600 text-white px-8 py-3.5 rounded font-medium hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving...
                </>
              ) : 'Continue to Dashboard'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 text-center py-8">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Coming Soon</h2>
          <p className="text-muted-foreground mb-8">
            The intelligent lesson notes upload feature is currently under development. Please use the Curriculum option for now.
          </p>
          <button 
            type="button" 
            onClick={() => setStep(1)} 
            className="border px-8 py-3 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Go Back
          </button>
        </div>
      )}
    </form>
  );
}
