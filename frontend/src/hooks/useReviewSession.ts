import { useState, useCallback } from 'react';
import { reviewService } from '@/services/review.service';
import type { CardWithProgress, Rating, ReviewSession } from '@/types/review';

interface UseReviewSessionOptions {
  deckId: string;
  token: string;
  newCardsLimit?: number;
}

interface ReviewSessionState {
  dueCards: CardWithProgress[];
  newCards: CardWithProgress[];
  currentIndex: number;
  sessionId: string | null;
  correctCount: number;
  totalReviewed: number;
  isLoading: boolean;
  error: string | null;
}

interface UseReviewSessionReturn extends ReviewSessionState {
  startSession: () => Promise<void>;
  getCurrentCard: () => CardWithProgress | null;
  submitRating: (rating: Rating) => Promise<void>;
  endSession: () => Promise<ReviewSession | null>;
  hasNextCard: () => boolean;
  getProgress: () => { current: number; total: number };
}

export function useReviewSession(options: UseReviewSessionOptions): UseReviewSessionReturn {
  const { deckId, token, newCardsLimit = 20 } = options;

  const [state, setState] = useState<ReviewSessionState>({
    dueCards: [],
    newCards: [],
    currentIndex: 0,
    sessionId: null,
    correctCount: 0,
    totalReviewed: 0,
    isLoading: false,
    error: null,
  });

  /**
   * Start a review session by fetching due/new cards and creating a session on the server
   */
  const startSession = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Fetch due cards and new cards
      const dueCardsResponse = await reviewService.getDueCards(deckId, token, newCardsLimit);

      // Combine due cards and new cards (due cards first, then new cards)
      const allCards = [...dueCardsResponse.dueCards, ...dueCardsResponse.newCards];

      if (allCards.length === 0) {
        setState(prev => ({
          ...prev,
          dueCards: [],
          newCards: [],
          currentIndex: 0,
          sessionId: null,
          correctCount: 0,
          totalReviewed: 0,
          isLoading: false,
        }));
        return;
      }

      // Start a session on the server
      const sessionResponse = await reviewService.startSession(deckId, token);

      setState(prev => ({
        ...prev,
        dueCards: dueCardsResponse.dueCards,
        newCards: dueCardsResponse.newCards,
        currentIndex: 0,
        sessionId: sessionResponse.sessionId,
        correctCount: 0,
        totalReviewed: 0,
        isLoading: false,
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start review session';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('Failed to start session:', err);
    }
  }, [deckId, token, newCardsLimit]);

  /**
   * Get the current card being reviewed
   */
  const getCurrentCard = useCallback((): CardWithProgress | null => {
    const allCards = [...state.dueCards, ...state.newCards];
    if (state.currentIndex >= allCards.length) {
      return null;
    }
    return allCards[state.currentIndex] || null;
  }, [state.dueCards, state.newCards, state.currentIndex]);

  /**
   * Submit a rating for the current card and move to the next
   */
  const submitRating = useCallback(async (rating: Rating) => {
    const currentCard = getCurrentCard();
    if (!currentCard) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Submit the review to the API
      await reviewService.submitReview(
        currentCard.id,
        {
          rating,
          sessionId: state.sessionId || undefined,
        },
        token
      );

      // Determine if the answer was "correct" (Good or Easy)
      const isCorrect = rating === 'good' || rating === 'easy';

      // Update state
      setState(prev => {
        const newCorrectCount = isCorrect ? prev.correctCount + 1 : prev.correctCount;
        const newTotalReviewed = prev.totalReviewed + 1;
        const allCards = [...prev.dueCards, ...prev.newCards];
        const hasNext = prev.currentIndex + 1 < allCards.length;

        return {
          ...prev,
          currentIndex: hasNext ? prev.currentIndex + 1 : prev.currentIndex,
          correctCount: newCorrectCount,
          totalReviewed: newTotalReviewed,
          isLoading: false,
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      console.error('Failed to submit rating:', err);
      throw err;
    }
  }, [getCurrentCard, state.sessionId, token]);

  /**
   * End the review session on the server and return session stats
   */
  const endSession = useCallback(async (): Promise<ReviewSession | null> => {
    if (!state.sessionId) {
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await reviewService.endSession(state.sessionId!, {
        totalCards: state.totalReviewed,
        correctCount: state.correctCount,
      }, token);

      setState(prev => ({
        ...prev,
        isLoading: false,
      }));

      return response.session;
    } catch (err) {
      console.error('Failed to end session:', err);
      setState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, [state.sessionId, state.totalReviewed, state.correctCount, token]);

  /**
   * Check if there are more cards to review
   */
  const hasNextCard = useCallback((): boolean => {
    const allCards = [...state.dueCards, ...state.newCards];
    return state.currentIndex < allCards.length - 1;
  }, [state.dueCards, state.newCards, state.currentIndex]);

  /**
   * Get current progress (1-indexed for display)
   */
  const getProgress = useCallback((): { current: number; total: number } => {
    const allCards = [...state.dueCards, ...state.newCards];
    return {
      current: state.currentIndex + 1,
      total: allCards.length,
    };
  }, [state.dueCards, state.newCards, state.currentIndex]);

  return {
    ...state,
    startSession,
    getCurrentCard,
    submitRating,
    endSession,
    hasNextCard,
    getProgress,
  };
}