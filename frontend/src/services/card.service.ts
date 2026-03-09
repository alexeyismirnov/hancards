import { api } from '@/lib/api';

export interface Card {
  id: string;
  deckId: string;
  character: string;
  pinyin: string;
  meaning: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardsResponse {
  cards: Card[];
}

export interface CardResponse {
  card: Card;
}

export interface CreateCardInput {
  character: string;
  pinyin: string;
  meaning: string;
}

export interface UpdateCardInput {
  character: string;
  pinyin: string;
  meaning: string;
}

export const cardService = {
  /**
   * Get all cards in a deck
   */
  async getCards(deckId: string, token: string): Promise<CardsResponse> {
    return api.get<CardsResponse>(`/api/decks/${deckId}/cards`, token);
  },

  /**
   * Create a new card in a deck
   */
  async createCard(deckId: string, data: CreateCardInput, token: string): Promise<CardResponse> {
    return api.post<CardResponse>(`/api/decks/${deckId}/cards`, data, token);
  },

  /**
   * Update a card
   */
  async updateCard(cardId: string, data: UpdateCardInput, token: string): Promise<CardResponse> {
    return api.put<CardResponse>(`/api/cards/${cardId}`, data, token);
  },

  /**
   * Delete a card
   */
  async deleteCard(cardId: string, token: string): Promise<{ success: boolean }> {
    return api.delete<{ success: boolean }>(`/api/cards/${cardId}`, token);
  },
};
