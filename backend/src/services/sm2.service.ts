/**
 * SM-2 Spaced Repetition Algorithm Service
 * 
 * Implementation of the SuperMemo 2 (SM-2) algorithm for scheduling
 * flashcard reviews based on user performance ratings.
 */

export type Rating = 'again' | 'hard' | 'good' | 'easy';

export interface CardProgressData {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate: Date;
  lapses: number;
}

export interface SM2Result {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewDate: Date;
  lapses: number;
}

const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate the next review date and SM-2 parameters based on the user's rating.
 * 
 * @param rating - The user's rating ('again', 'hard', 'good', 'easy')
 * @param currentProgress - Optional existing CardProgressData (null for new cards)
 * @returns SM2Result with calculated values
 */
export function calculateNextReview(
  rating: Rating,
  currentProgress: CardProgressData | null
): SM2Result {
  // For new cards, use default values
  let easeFactor: number;
  let interval: number;
  let repetitions: number;
  let lapses: number;

  if (currentProgress === null) {
    easeFactor = 2.5;
    interval = 0;
    repetitions = 0;
    lapses = 0;
  } else {
    easeFactor = currentProgress.easeFactor;
    interval = currentProgress.interval;
    repetitions = currentProgress.repetitions;
    lapses = currentProgress.lapses;
  }

  const isNewCard = currentProgress === null;

  switch (rating) {
    case 'again':
      // Card forgotten - start over
      // Special handling for first review: interval = 1 day
      interval = 1;
      repetitions = 0;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      lapses += 1;
      break;

    case 'hard':
      // Difficult recall - slight increase
      if (isNewCard) {
        // Special handling for first review: interval = 1 day
        interval = 1;
      } else {
        interval = Math.max(1, Math.round(interval * 1.2));
      }
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      repetitions += 1;
      break;

    case 'good':
      // Successful recall - standard interval increase
      if (isNewCard) {
        // Special handling for first review: interval = easeFactor (2.5 days, rounded to 3)
        interval = Math.round(easeFactor);
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetitions += 1;
      // easeFactor unchanged
      break;

    case 'easy':
      // Perfect recall - boost interval
      if (isNewCard) {
        // Special handling for first review: interval = 4 days
        interval = 4;
      } else {
        interval = Math.round(interval * easeFactor * 1.3);
      }
      easeFactor = easeFactor + 0.15;
      repetitions += 1;
      break;
  }

  const now = new Date();
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewDate: now,
    lapses,
  };
}

/**
 * Returns default progress for new cards.
 * 
 * @returns CardProgressData with default values for a new card
 */
export function getInitialProgress(): CardProgressData {
  const now = new Date();
  return {
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReviewDate: now,
    lastReviewDate: now,
    lapses: 0,
  };
}

/**
 * Checks if a card is due for review.
 * A card is due if its nextReviewDate is less than or equal to the current date.
 * 
 * @param progress - The card's progress data
 * @returns true if the card is due for review
 */
export function isCardDue(progress: CardProgressData): boolean {
  const now = new Date();
  return progress.nextReviewDate <= now;
}

/**
 * Calculates the number of days since the last review.
 * 
 * @param progress - The card's progress data
 * @returns Number of days since last review (0 if reviewed today)
 */
export function getDaysSinceLastReview(progress: CardProgressData): number {
  const now = new Date();
  const diffTime = now.getTime() - progress.lastReviewDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}