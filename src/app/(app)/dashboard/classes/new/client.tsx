'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { addClasses } from '../actions';
import { MobileSelect } from '@/components/mobile-select';
import { ArrowLeft, Plus, X } from 'lucide-react';
import Link from 'next/link';

export function AddClassClient({ classes, subjects, terms }: { classes: { id: string, name: string }[], subjects: { id: string, name: string }[], terms: { id: string, name: string }[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  
  // Assignments
  const [assignments, setAssignments] = useState<{classLevelId: string, subjectIds: string[], termId: string, weekNumber: number}[]>([]);
  
  // Current Selectors
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  type ActionState = { error?: string | null; success: boolean; };
  const initialState: ActionState = { success: false, error: null };
  const [state, formAction, isPending] = useActionState(addClasses, initialState);

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard');
      router.refresh();
    }
  }, [state.success, router]);

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
    <form ref={formRef} action={formAction} className="space-y-6 pb-20 sm:pb-0">
      {state.error && (
        <div className="p-4 bg-red-50 text-red-700 rounded text-sm font-medium border border-red-200">
          {state.error}
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <Link href="/dashboard" className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold tracking-tight mb-2">Add New Class</h2>
        <p className="text-sm text-muted-foreground">Select the class and subjects you want to add to your schedule.</p>
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

      <input type="hidden" name="assignments" value={JSON.stringify(flattenedAssignments)} />

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
          ) : 'Save New Classes'}
        </button>
      </div>
    </form>
  );
}
