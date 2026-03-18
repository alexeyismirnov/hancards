import { api } from '@/lib/api';
import type {
  DueCardsResponse,
  SubmitReviewRequest,
  SubmitReviewResponse,
  StartSessionResponse,
  EndSessionRequest,
  EndSessionResponse,
  DeckStats,
} from '@/types/review';

export const reviewService = {
  /**
   * Get due cards and new cards for review
   * GET /api/decks/:deckId/review/due?newCardsLimit=20
   */
  async getDueCards(
    deckId: string,
    token: string,
    newCardsLimit: number = 20
  ): Promise<DueCardsResponse> {
    return api.get<DueCardsResponse>(
      `/api/decks/${deckId}/review/due?newCardsLimit=${newCardsLimit}`,
      token
    );
  },

  /**
   * Submit a card rating
   * POST /api/cards/:cardId/review
   */
  async submitReview(
    cardId: string,
    data: SubmitReviewRequest,
    token: string
  ): Promise<SubmitReviewResponse> {
    return api.post<SubmitReviewResponse>(`/api/cards/${cardId}/review`, data, token);
  },

  /**
   * Start a review session
   * POST /api/decks/:deckId/review/session/start
   */
  async startSession(deckId: string, token: string): Promise<StartSessionResponse> {
    return api.post<StartSessionResponse>(
      `/api/decks/${deckId}/review/session/start`,
      {},
      token
    );
  },

  /**
   * End a review session
   * POST /api/review/session/:sessionId/end
   */
  async endSession(
    sessionId: string,
    data: EndSessionRequest,
    token: string
  ): Promise<EndSessionResponse> {
    return api.post<EndSessionResponse>(
      `/api/review/session/${sessionId}/end`,
      data,
      token
    );
  },

  /**
   * Get deck statistics
   * GET /api/decks/:deckId/stats
   */
  async getDeckStats(deckId: string, token: string): Promise<DeckStats> {
    return api.get<DeckStats>(`/api/decks/${deckId}/stats`, token);
  },
};