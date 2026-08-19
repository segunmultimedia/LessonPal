import { ParsedIndicator, SequencedSession, CurriculumSourceInfo } from './types';

class PedagogicalSessionAllocator {
  static calculateSessions(ind: ParsedIndicator, availablePeriods: number): number {
    let score = 1; // Base session
    
    const text = ((ind.description || '') + ' ' + (ind.exemplars || '')).toLowerCase();
    
    // 1. Complexity of skills/actions (Bloom's Taxonomy / Higher order)
    const complexVerbs = ['analyse', 'analyze', 'evaluate', 'create', 'build', 'perform', 'produce', 'investigate', 'solve', 'synthesise', 'design'];
    for (const verb of complexVerbs) {
      if (text.includes(verb)) {
        score += 0.5;
      }
    }

    // 2. Introduction of new concept (often the first indicator in a content standard)
    if (ind.indicatorNum === 1) {
      score += 0.5; // Foundation needs time
    }

    // 3. Practice required (guided or independent)
    if (text.includes('practice') || text.includes('group') || text.includes('independently') || text.includes('pairs')) {
      score += 0.5;
    }

    // 4. Domains (reading, writing, speaking, listening, practical work, etc.)
    const domains = ['read', 'write', 'speak', 'listen', 'practical', 'investigat', 'perform', 'produc'];
    let domainCount = 0;
    for (const d of domains) {
      if (text.includes(d)) domainCount++;
    }
    if (domainCount > 2) {
      score += 0.5; // Multi-domain integration takes more time
    }

    // 5. Number/depth of exemplars (using bullet points or line breaks as a proxy)
    const bulletCount = (ind.exemplars?.match(/[-•*]/g) || []).length;
    if (bulletCount > 5) {
      score += 1.0;
    } else if (bulletCount > 2) {
      score += 0.5;
    }

    // 6. Character length as a supporting signal only
    if (text.length > 800) {
      score += 0.5;
    }
    
    // Map score to session count
    let numSessions = Math.floor(score);
    if (numSessions < 1) numSessions = 1;
    
    // Cap reasonably so we don't blow out the term length, though the outer loop protects against it.
    // E.g. max 4 sessions for a very complex topic
    if (numSessions > 4) numSessions = 4;
    
    return numSessions;
  }
}

export class CurriculumSequencer {
  static distribute(indicators: ParsedIndicator[], info: CurriculumSourceInfo): SequencedSession[] {
    const timeAlloc = info.timeAllocation;

    const terms = timeAlloc?.termsPerYear || 3;
    const sessions: SequencedSession[] = [];
    
    // We will distribute indicators across terms based on count, then allocate sessions.
    const indicatorsPerTerm = Math.ceil(indicators.length / terms);
    let indicatorIdx = 0;

    for (let term = 1; term <= terms; term++) {
      let currentWeek = 1;
      let currentLesson = 1;
      
      const termIndicators = indicators.slice(indicatorIdx, indicatorIdx + indicatorsPerTerm);
      indicatorIdx += termIndicators.length;
      
      // We read available capacity, but do not force-fill it.
      const periodsPerWeek = timeAlloc?.recommendedPeriodsPerWeek || 5;
      const weeksPerTerm = timeAlloc?.weeksPerTerm || 12;
      const totalSessionsAvailable = periodsPerWeek * weeksPerTerm;
      let sessionsGenerated = 0;
      
      // Session allocation is a LessonPal decision, so it's LESSONPAL_GENERATED_SEQUENCE
      const sequenceStatus = 'LESSONPAL_GENERATED_SEQUENCE';
      
      for (let i = 0; i < termIndicators.length; i++) {
        const ind = termIndicators[i];
        
        let numSessions = PedagogicalSessionAllocator.calculateSessions(ind, totalSessionsAvailable);
        
        // Ensure we don't exceed the term's available capacity while guaranteeing at least 1 session
        const remainingCapacity = totalSessionsAvailable - sessionsGenerated;
        
        // If we are running out of capacity but still have indicators left in this term:
        // We must guarantee at least 1 session for every remaining indicator.
        const indicatorsRemaining = termIndicators.length - i;
        if (remainingCapacity <= indicatorsRemaining) {
          numSessions = 1; 
        } else if (numSessions > remainingCapacity - indicatorsRemaining + 1) {
          numSessions = remainingCapacity - indicatorsRemaining + 1;
        }

        for (let s = 0; s < numSessions; s++) {
          if (sessionsGenerated >= totalSessionsAvailable) break; // Hard cap fallback
          
          sessions.push({
            term,
            week: currentWeek,
            lessonNumber: currentLesson,
            indicatorCode: ind.code,
            description: ind.description,
            isRecurring: s > 0,
            sequenceStatus
          });
          
          sessionsGenerated++;
          currentLesson++;
          if (currentLesson > periodsPerWeek) {
            currentLesson = 1;
            currentWeek++;
          }
        }
      }
    }

    return sessions;
  }
}
