import { Card } from '@/services/card.service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

interface CardItemProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDelete: (card: Card) => void;
  onClick?: (card: Card) => void;
}

export function CardItem({ card, onEdit, onDelete, onClick }: CardItemProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-all hover-lift cursor-pointer"
      onClick={() => onClick?.(card)}
    >
      <div className="flex items-center gap-6 flex-1 min-w-0">
        {/* Character with calligraphic font */}
        <div className="flex-shrink-0 w-16 text-center">
          <span className="text-3xl font-character text-primary">{card.character}</span>
        </div>

        {/* Pinyin and Meaning */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground italic mb-1">{card.pinyin}</p>
          <p className="text-sm truncate">{card.meaning}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 ml-4" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(card)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(card)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
