import { Plus } from 'lucide-react';
import { Deck } from '@/services/deck.service';
import { DeckCard } from './DeckCard';
import { Button } from '@/components/ui/button';

interface DeckListProps {
  decks: Deck[];
  onEdit: (deck: Deck) => void;
  onDelete: (deck: Deck) => void;
  onCreateDeck?: () => void;
}

export function DeckList({ decks, onEdit, onDelete, onCreateDeck }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <Plus className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium">No decks yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Create your first deck to start learning Chinese characters
        </p>
        {onCreateDeck && (
          <Button onClick={onCreateDeck}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Deck
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
