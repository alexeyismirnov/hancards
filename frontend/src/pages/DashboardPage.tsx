import { useState, useEffect, useCallback } from 'react';
import { Plus, Loader2, Layers, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout';
import { DeckList } from '@/components/deck/DeckList';
import { CreateDeckModal } from '@/components/deck/CreateDeckModal';
import { EditDeckModal } from '@/components/deck/EditDeckModal';
import { DeleteDeckDialog } from '@/components/deck/DeleteDeckDialog';
import { deckService, Deck } from '@/services/deck.service';
import { useAuthContext } from '@/contexts/AuthContext';

export function DashboardPage() {
  const { token, user } = useAuthContext();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [deletingDeck, setDeletingDeck] = useState<Deck | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch decks
  const fetchDecks = useCallback(async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const response = await deckService.getDecks(token);
      setDecks(response.decks);
      setError(null);
    } catch (err) {
      setError('Failed to load decks. Please try again.');
      console.error('Failed to fetch decks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  // Create deck
  const handleCreateDeck = async (name: string) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await deckService.createDeck({ name }, token);
      setDecks((prev) => [response.deck, ...prev]);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update deck
  const handleUpdateDeck = async (id: string, name: string) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const response = await deckService.updateDeck(id, { name }, token);
      setDecks((prev) =>
        prev.map((deck) => (deck.id === id ? response.deck : deck))
      );
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete deck
  const handleDeleteDeck = async (id: string) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      await deckService.deleteDeck(id, token);
      setDecks((prev) => prev.filter((deck) => deck.id !== id));
    } catch (err) {
      console.error('Failed to delete deck:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate stats
  const totalCards = decks.reduce((sum, deck) => sum + deck._count.cards, 0);

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">
            {getGreeting()}, {user?.email?.split('@')[0] || 'Learner'}!
          </h2>
          <p className="text-muted-foreground">
            Welcome back to your flashcard collection
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{decks.length}</p>
                <p className="text-xs text-muted-foreground">Total Decks</p>
              </div>
            </div>
          </div>
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCards}</p>
                <p className="text-xs text-muted-foreground">Total Cards</p>
              </div>
            </div>
          </div>
        </div>

        {/* Decks Section Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-semibold">My Decks</h3>
            <p className="text-sm text-muted-foreground">
              Manage your flashcard decks
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Deck
          </Button>
        </div>

        {/* Deck List with Loading/Error States */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              onClick={fetchDecks}
              className="mt-4"
            >
              Try Again
            </Button>
          </div>
        ) : (
          <DeckList
            decks={decks}
            onEdit={(deck) => setEditingDeck(deck)}
            onDelete={(deck) => setDeletingDeck(deck)}
            onCreateDeck={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      {/* Modals */}
      <CreateDeckModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleCreateDeck}
        isLoading={isSubmitting}
      />

      <EditDeckModal
        deck={editingDeck}
        open={!!editingDeck}
        onOpenChange={(open) => !open && setEditingDeck(null)}
        onSubmit={handleUpdateDeck}
        isLoading={isSubmitting}
      />

      <DeleteDeckDialog
        deck={deletingDeck}
        open={!!deletingDeck}
        onOpenChange={(open) => !open && setDeletingDeck(null)}
        onConfirm={handleDeleteDeck}
        isLoading={isSubmitting}
      />
    </Layout>
  );
}
