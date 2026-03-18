export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface CardProgress {
  id: string;
  cardId: string;
  userId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastReviewDate: string;
  lapses: number;
}

export interface CardWithProgress {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  deckId: string;
  progress?: CardProgress;
}

export interface DueCardsResponse {
  dueCards: CardWithProgress[];
  newCards: CardWithProgress[];
  totalDue: number;
  totalNew: number;
}

export interface SubmitReviewRequest {
  rating: Rating;
  sessionId?: string;
}

export interface SubmitReviewResponse {
  progress: CardProgress;
  nextReviewDate: string;
}

export interface ReviewSession {
  id: string;
  userId: string;
  deckId: string;
  startedAt: string;
  endedAt?: string;
  totalCards: number;
  correctCount: number;
}

export interface StartSessionResponse {
  sessionId: string;
}

export interface EndSessionRequest {
  totalCards: number;
  correctCount: number;
}

export interface EndSessionResponse {
  session: ReviewSession;
}

export interface DeckStats {
  totalCards: number;
  learnedCards: number;
  newCards: number;
  averageEaseFactor: number;
  dueToday: number;
  dueThisWeek: number;
}