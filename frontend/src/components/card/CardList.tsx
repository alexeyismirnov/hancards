import { Card as CardType } from '@/services/card.service';
import { CardItem } from './CardItem';
import { CreditCard } from 'lucide-react';

interface CardListProps {
  cards: CardType[];
  onEdit: (card: CardType) => void;
  onDelete: (card: CardType) => void;
  onCardClick?: (card: CardType) => void;
}

export function CardList({ cards, onEdit, onDelete, onCardClick }: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No cards yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Start building your deck by adding your first flashcard. Click the "Add Card" button to begin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onCardClick}
        />
      ))}
    </div>
  );
}
