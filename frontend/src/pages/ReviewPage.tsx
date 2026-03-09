import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { deckService, Deck } from '@/services/deck.service';
import { cardService, Card } from '@/services/card.service';
import { useAuthContext } from '@/contexts/AuthContext';
import { Flashcard } from '@/components/review/Flashcard';
import { ReviewControls } from '@/components/review/ReviewControls';
import { ReviewProgress } from '@/components/review/ReviewProgress';
import { ReviewComplete } from '@/components/review/ReviewComplete';

export function ReviewPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const fetchDeckAndCards = useCallback(async () => {
    if (!token || !deckId) return;

    try {
      setIsLoading(true);
      const [deckResponse, cardsResponse] = await Promise.all([
        deckService.getDeck(deckId, token),
        cardService.getCards(deckId, token),
      ]);
      setDeck(deckResponse.deck);
      setCards(cardsResponse.cards);
      setError(null);
    } catch (err) {
      setError('Failed to load review session. Please try again.');
      console.error('Failed to fetch deck and cards:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token, deckId]);

  useEffect(() => {
    fetchDeckAndCards();
  }, [fetchDeckAndCards]);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleExit = () => {
    navigate(`/decks/${deckId}`);
  };

  const handleReviewAgain = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !deck) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/decks/${deckId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deck
          </Button>
          <div className="text-center py-12">
            <p className="text-destructive">{error || 'Deck not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty state
  if (cards.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(`/decks/${deckId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deck
          </Button>
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No cards to review</h2>
            <p className="text-muted-foreground mb-6">
              Add some cards to this deck first.
            </p>
            <Button onClick={() => navigate(`/decks/${deckId}`)}>
              Back to Deck
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Session complete
  if (isComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <ReviewComplete
            totalCards={cards.length}
            onReviewAgain={handleReviewAgain}
            onExit={handleExit}
          />
        </div>
      </Layout>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleExit}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deck
          </Button>
          <h1 className="text-2xl font-bold">{deck.name}</h1>
        </div>

        {/* Progress */}
        <div className="max-w-md mx-auto mb-8">
          <ReviewProgress
            current={currentIndex + 1}
            total={cards.length}
          />
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          <Flashcard 
            card={currentCard} 
            isFlipped={isFlipped}
            onFlip={handleFlip}
          />
        </div>

        {/* Controls */}
        <ReviewControls
          currentIndex={currentIndex}
          totalCards={cards.length}
          isFlipped={isFlipped}
          onFlip={handleFlip}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onExit={handleExit}
        />
      </div>
    </Layout>
  );
}
