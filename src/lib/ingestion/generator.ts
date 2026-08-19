import { SequencedSession, TeachingSupport, ParsedIndicator } from './types';

export class TeachingSupportGenerator {
  
  static generate(sessions: SequencedSession[], indicators: ParsedIndicator[], durationMinutes: number): TeachingSupport[] {
    const indicatorMap = new Map<string, ParsedIndicator>();
    for (const ind of indicators) {
      indicatorMap.set(ind.code, ind);
    }

    return sessions.map(session => {
      const ind = indicatorMap.get(session.indicatorCode);
      if (!ind) {
        throw new Error(`Indicator not found for code: ${session.indicatorCode}`);
      }

      // In a real AI-driven engine, this is where we'd call the LLM to generate the lesson plan.
      // For this generic architecture, we generate structured placeholders based on the indicator.
      const prefix = session.isRecurring ? "(Continuation) " : "";
      
      return {
        indicatorCode: session.indicatorCode,
        term: session.term,
        week: session.week,
        lessonNumber: session.lessonNumber,
        sequenceStatus: session.sequenceStatus || 'LESSONPAL_GENERATED_SEQUENCE',
        topic: `${prefix}${ind.description.substring(0, 50)}...`,
        learningObjective: `By the end of the lesson, pupils will be able to ${ind.description.toLowerCase()}`,
        whatToTeach: `Key concepts for ${ind.code}:\\n${ind.exemplars}`,
        howToTeach: `Step-by-step guide to teach ${ind.code}...`,
        activities: `Classroom activities for ${ind.code}...`,
        resources: `Standard teaching resources`,
        durationMinutes,
        exercises: [
          {
            title: `Exercise 1: ${ind.code}`,
            sortOrder: 1,
            questions: [
              { question: `Question 1 for ${ind.code}`, answer: `Answer 1`, sortOrder: 1 },
              { question: `Question 2 for ${ind.code}`, answer: `Answer 2`, sortOrder: 2 }
            ]
          }
        ]
      };
    });
  }
}
