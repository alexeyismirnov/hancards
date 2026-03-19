import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { deckService, Deck } from '@/services/deck.service';
import { cardService, Card } from '@/services/card.service';
import { reviewService } from '@/services/review.service';
import { useAuthContext } from '@/contexts/AuthContext';
import { CardList } from '@/components/card/CardList';
import { CreateCardModal } from '@/components/card/CreateCardModal';
import { EditCardModal } from '@/components/card/EditCardModal';
import { DeleteCardDialog } from '@/components/card/DeleteCardDialog';
import { CardPreviewModal } from '@/components/card/CardPreviewModal';
import { DeckStats } from '@/components/deck/DeckStats';
import type { DeckStats as DeckStatsType } from '@/types/review';

export function DeckDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCards, setIsLoadingCards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deckStats, setDeckStats] = useState<DeckStatsType | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeck = useCallback(async () => {
    if (!token || !id) return;

    try {
      setIsLoading(true);
      const response = await deckService.getDeck(id, token);
      setDeck(response.deck);
      setError(null);
    } catch (err) {
      setError('Failed to load deck. Please try again.');
      console.error('Failed to fetch deck:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, id]);

  const fetchCards = useCallback(async () => {
    if (!token || !id) return;

    try {
      setIsLoadingCards(true);
      const response = await cardService.getCards(id, token);
      setCards(response.cards);
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setIsLoadingCards(false);
    }
  }, [token, id]);

  useEffect(() => {
    fetchDeck();
    fetchCards();
  }, [fetchDeck, fetchCards]);

  // Fetch deck stats for review count
  const fetchDeckStats = useCallback(async () => {
    if (!token || !id) return;
    try {
      const stats = await reviewService.getDeckStats(id, token);
      setDeckStats(stats);
    } catch (err) {
      console.error('Failed to fetch deck stats:', err);
    }
  }, [token, id]);

  useEffect(() => {
    fetchDeckStats();
  }, [fetchDeckStats]);

  // Calculate cards available for review (due now + new cards, limited to 20 new cards)
  const NEW_CARDS_LIMIT = 20;
  const reviewableCount = deckStats 
    ? deckStats.dueToday + Math.min(deckStats.newCards, NEW_CARDS_LIMIT) 
    : 0;

  // Create card handler
  const handleCreateCard = async (character: string, pinyin: string, meaning: string) => {
    if (!token || !id) return;
    
    setIsSubmitting(true);
    try {
      const response = await cardService.createCard(id, { character, pinyin, meaning }, token);
      setCards((prev) => [...prev, response.card]);
      // Update deck card count
      setDeck((prev) => prev ? { ...prev, _count: { cards: prev._count.cards + 1 } } : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Edit card handlers
  const handleOpenEditModal = (card: Card) => {
    setSelectedCard(card);
    setIsEditModalOpen(true);
  };

  const handleEditCard = async (cardId: string, character: string, pinyin: string, meaning: string) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      const response = await cardService.updateCard(cardId, { character, pinyin, meaning }, token);
      setCards((prev) =>
        prev.map((c) => (c.id === cardId ? response.card : c))
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete card handlers
  const handleOpenDeleteDialog = (card: Card) => {
    setSelectedCard(card);
    setIsDeleteDialogOpen(true);
  };

  // Preview card handler
  const handleOpenPreviewModal = (card: Card) => {
    setSelectedCard(card);
    setIsPreviewModalOpen(true);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!token) return;
    
    setIsSubmitting(true);
    try {
      await cardService.deleteCard(cardId, token);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      // Update deck card count
      setDeck((prev) => prev ? { ...prev, _count: { cards: Math.max(0, prev._count.cards - 1) } } : null);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (error || !deck) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Decks
          </Button>
          <div className="text-center py-12">
            <p className="text-destructive">{error || 'Deck not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Decks
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            <p className="text-muted-foreground mt-1">
              {cards.length} card{cards.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/decks/${id}/review`)}
              disabled={cards.length === 0}
              className="bg-primary"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Review {reviewableCount > 0 ? `(${reviewableCount})` : ''}
            </Button>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        {/* Deck Statistics */}
        {id && <DeckStats deckId={id} />}

        {/* Card List Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Cards</h2>
          {isLoadingCards ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <CardList
              cards={cards}
              onEdit={handleOpenEditModal}
              onDelete={handleOpenDeleteDialog}
              onCardClick={handleOpenPreviewModal}
            />
          )}
        </div>
      </div>

      {/* Create Card Modal */}
      <CreateCardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateCard}
        isLoading={isSubmitting}
      />

      {/* Edit Card Modal */}
      <EditCardModal
        card={selectedCard}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSubmit={handleEditCard}
        isLoading={isSubmitting}
      />

      {/* Delete Card Dialog */}
      <DeleteCardDialog
        card={selectedCard}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteCard}
        isLoading={isSubmitting}
      />

      {/* Card Preview Modal */}
      <CardPreviewModal
        card={selectedCard}
        open={isPreviewModalOpen}
        onOpenChange={setIsPreviewModalOpen}
      />
    </Layout>
  );
}
