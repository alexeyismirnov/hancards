import { api } from '@/lib/api';

export interface Deck {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    cards: number;
  };
}

export interface DecksResponse {
  decks: Deck[];
}

export interface DeckResponse {
  deck: Deck;
}

export interface CreateDeckInput {
  name: string;
}

export interface UpdateDeckInput {
  name: string;
}

export const deckService = {
  /**
   * Get all decks for the authenticated user
   */
  async getDecks(token: string): Promise<DecksResponse> {
    return api.get<DecksResponse>('/api/decks', token);
  },

  /**
   * Get a single deck by ID
   */
  async getDeck(id: string, token: string): Promise<DeckResponse> {
    return api.get<DeckResponse>(`/api/decks/${id}`, token);
  },

  /**
   * Create a new deck
   */
  async createDeck(data: CreateDeckInput, token: string): Promise<DeckResponse> {
    return api.post<DeckResponse>('/api/decks', data, token);
  },

  /**
   * Update (rename) a deck
   */
  async updateDeck(id: string, data: UpdateDeckInput, token: string): Promise<DeckResponse> {
    return api.put<DeckResponse>(`/api/decks/${id}`, data, token);
  },

  /**
   * Delete a deck
   */
  async deleteDeck(id: string, token: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/api/decks/${id}`, token);
  },
};
