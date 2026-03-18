import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { deckService, Deck } from '@/services/deck.service';
import { useAuthContext } from '@/contexts/AuthContext';
import { useReviewSession } from '@/hooks/useReviewSession';
import { Flashcard } from '@/components/review/Flashcard';
import { RatingButtons } from '@/components/review/RatingButtons';
import { ReviewProgress } from '@/components/review/ReviewProgress';
import { ReviewComplete } from '@/components/review/ReviewComplete';
import type { Rating } from '@/types/review';

export function ReviewPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { token } = useAuthContext();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [isLoadingDeck, setIsLoadingDeck] = useState(true);
  const [deckError, setDeckError] = useState<string | null>(null);
  
  // Review state
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionStats, setSessionStats] = useState<{
    totalReviewed: number;
    correctCount: number;
  } | null>(null);

  // Use the review session hook
  const {
    startSession,
    getCurrentCard,
    submitRating,
    endSession,
    hasNextCard,
    getProgress,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useReviewSession({
    deckId: deckId || '',
    token: token || '',
    newCardsLimit: 20,
  });

  // Fetch deck info
  const fetchDeck = useCallback(async () => {
    if (!token || !deckId) return;

    try {
      setIsLoadingDeck(true);
      const response = await deckService.getDeck(deckId, token);
      setDeck(response.deck);
      setDeckError(null);
    } catch (err) {
      setDeckError('Failed to load deck. Please try again.');
      console.error('Failed to fetch deck:', err);
    } finally {
      setIsLoadingDeck(false);
    }
  }, [token, deckId]);

  // Start session on mount
  const initializeSession = useCallback(async () => {
    if (!token || !deckId) return;
    await startSession();
  }, [token, deckId, startSession]);

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  useEffect(() => {
    if (token && deckId) {
      initializeSession();
    }
  }, [token, deckId, initializeSession]);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [getProgress().current]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRating = async (rating: Rating) => {
    try {
      await submitRating(rating);
      setIsFlipped(false);

      // Check if session is complete
      if (!hasNextCard()) {
        const session = await endSession();
        if (session) {
          setSessionStats({
            totalReviewed: session.totalCards,
            correctCount: session.correctCount,
          });
        }
        setIsComplete(true);
      }
    } catch (err) {
      console.error('Failed to submit rating:', err);
    }
  };

  const handleExit = async () => {
    if (!isComplete) {
      await endSession();
    }
    navigate(`/decks/${deckId}`);
  };

  const handleReviewAgain = () => {
    setIsComplete(false);
    setSessionStats(null);
    setIsFlipped(false);
    initializeSession();
  };

  // Loading state
  if (isLoadingDeck || isSessionLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  // Error state
  if (deckError || sessionError || !deck) {
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
            <p className="text-destructive">{deckError || sessionError || 'Deck not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Empty state
  const progress = getProgress();
  if (progress.total === 0) {
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
              All cards are up to date! Check back later or add more cards to this deck.
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
            totalCards={sessionStats?.totalReviewed || progress.total}
            correctCount={sessionStats?.correctCount}
            onReviewAgain={handleReviewAgain}
            onExit={handleExit}
          />
        </div>
      </Layout>
    );
  }

  const currentCard = getCurrentCard();

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
            current={progress.current}
            total={progress.total}
          />
        </div>

        {/* Flashcard */}
        <div className="mb-8">
          {currentCard && (
            <Flashcard 
              card={currentCard} 
              isFlipped={isFlipped}
              onFlip={handleFlip}
            />
          )}
        </div>

        {/* Rating Buttons - Show only when flipped */}
        {isFlipped && (
          <div className="mb-8">
            <RatingButtons
              onRate={handleRating}
              disabled={isSessionLoading}
            />
          </div>
        )}

        {/* Flip hint when not flipped */}
        {!isFlipped && (
          <div className="text-center text-muted-foreground">
            <p>Flip the card to see the answer and rate your recall</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
