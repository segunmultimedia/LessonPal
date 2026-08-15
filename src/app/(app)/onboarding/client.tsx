'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { completeOnboarding } from './actions';

export function OnboardingClient({ curricula, classes, subjects, terms }: { curricula: { id: string, name: string, version: string | null }[], classes: { id: string, name: string }[], subjects: { id: string, name: string }[], terms: { id: string, name: string }[] }) {
  const router = useRouter();
  const { update } = useSession();
  
  // Step Management
  const [step, setStep] = useState(1);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Assignments (Step 1)
  const [curriculumId, setCurriculumId] = useState('');
  const [assignments, setAssignments] = useState<{classLevelId: string, subjectId: string}[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Position (Step 2)
  const [globalTermId, setGlobalTermId] = useState('');
  const [globalWeek, setGlobalWeek] = useState<number>(1);
  // Optional: override positions per assignment. For simplicity in Phase 2 UI, we just apply the global one to all if not overridden.
  // We will build the override UI later, but for now we'll pass the global one.

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

  const addAssignment = () => {
    if (selectedClass && selectedSubject) {
      if (!assignments.some(a => a.classLevelId === selectedClass && a.subjectId === selectedSubject)) {
        setAssignments([...assignments, { classLevelId: selectedClass, subjectId: selectedSubject }]);
      }
      setSelectedSubject('');
    }
  };

  const removeAssignment = (cId: string, sId: string) => {
    setAssignments(assignments.filter(a => !(a.classLevelId === cId && a.subjectId === sId)));
  };

  const handleNextStep = () => {
    if (!curriculumId) {
      alert('Please select a curriculum.');
      return;
    }
    if (assignments.length === 0) {
      alert('Please assign at least one class and subject.');
      return;
    }
    setStep(2);
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      {state.error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200">
          {state.error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <h2 className="text-xl font-semibold border-b pb-2">Step 1: Teaching Assignments</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1.5">Curriculum</label>
            <select 
              name="curriculumId" 
              value={curriculumId}
              onChange={(e) => setCurriculumId(e.target.value)}
              required 
              className="w-full px-3 py-3 rounded border bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              <option value="">Select curriculum...</option>
              {curricula.map((c: { id: string, name: string, version: string | null }) => (
                <option key={c.id} value={c.id}>{c.name} ({c.version})</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border">
            <h3 className="font-medium mb-3 text-sm">Assign Classes & Subjects</h3>
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full sm:flex-1 px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 outline-none">
                <option value="">Select Class...</option>
                {classes.map((c: { id: string, name: string }) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full sm:flex-1 px-3 py-3 border rounded focus:ring-1 focus:ring-blue-500 outline-none">
                <option value="">Select Subject...</option>
                {subjects.map((s: { id: string, name: string }) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <button type="button" onClick={addAssignment} disabled={!selectedClass || !selectedSubject} className="w-full sm:w-auto bg-gray-900 dark:bg-gray-700 text-white px-6 py-3 rounded disabled:opacity-50 hover:bg-gray-800 transition-colors">
                Add
              </button>
            </div>

            {assignments.length > 0 ? (
              <ul className="space-y-2">
                {assignments.map(a => {
                  const cName = classes.find((c: { id: string, name: string }) => c.id === a.classLevelId)?.name;
                  const sName = subjects.find((s: { id: string, name: string }) => s.id === a.subjectId)?.name;
                  return (
                    <li key={`${a.classLevelId}-${a.subjectId}`} className="flex items-center justify-between bg-white dark:bg-gray-900 p-2.5 rounded-lg border shadow-sm">
                      <span className="text-sm font-medium">{cName} — <span className="text-muted-foreground">{sName}</span></span>
                      <button type="button" onClick={() => removeAssignment(a.classLevelId, a.subjectId)} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-4">No subjects assigned yet.</p>
            )}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:justify-end">
            <button 
              type="button" 
              onClick={handleNextStep} 
              className="w-full sm:w-auto bg-blue-600 text-white px-8 py-3 rounded font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          {/* Hidden inputs to carry Step 1 data through the Server Action form submission */}
          <input type="hidden" name="curriculumId" value={curriculumId} />
          
          <h2 className="text-xl font-semibold border-b pb-2">Step 2: Current Teaching Position</h2>
          
          <p className="text-sm text-muted-foreground">
            Where are you currently in the curriculum? We&apos;ll set this as the starting point for your assigned classes.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Term</label>
              <select 
                name="globalTermId" 
                value={globalTermId}
                onChange={(e) => setGlobalTermId(e.target.value)}
                required 
                className="w-full px-3 py-3 border rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="">Select term...</option>
                {terms.map((t: { id: string, name: string }) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1.5">Current Week</label>
              <select 
                name="globalWeek" 
                value={globalWeek}
                onChange={(e) => setGlobalWeek(Number(e.target.value))}
                required 
                className="w-full px-3 py-3 border rounded bg-white dark:bg-gray-800 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                {Array.from({length: 15}, (_, i) => i + 1).map(w => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-xl text-sm">
            You will be able to adjust individual subjects if some classes are ahead or behind.
          </div>

          {/* Pass the fully constructed assignments array with their term/week appended */}
          <input type="hidden" name="assignments" value={JSON.stringify(
            assignments.map(a => ({
              ...a,
              termId: globalTermId,
              weekNumber: globalWeek
            }))
          )} />

          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
            <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto border px-6 py-3 rounded font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              Back
            </button>
            <button type="submit" disabled={isPending || assignments.length === 0 || !globalTermId} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded font-medium hover:opacity-90 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-sm">
              {isPending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Saving Profile...
                </>
              ) : 'Go to Dashboard'}
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
