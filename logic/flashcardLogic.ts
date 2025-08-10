import { ChordDeckItem } from './deckGenerator';

export interface FlashcardItem extends ChordDeckItem {
  probability: number;
  attempts: number;
  correctAttempts: number;
}

export interface FlashcardDeck {
  cards: FlashcardItem[];
  currentCard: FlashcardItem | null;
}

export interface DeckStats {
  totalCards: number;
  completedCards: number;
  completionPercentage: number;
  isComplete: boolean;
  cardsByDifficulty: FlashcardItem[];
}

const INITIAL_PROBABILITY = 3;
const MIN_PROBABILITY = 0;  // 0 means card is removed from rotation
const MAX_PROBABILITY = 10;

export const initializeFlashcardDeck = (deck: ChordDeckItem[]): FlashcardDeck => {
  const cards = deck.map(item => ({
    ...item,
    probability: INITIAL_PROBABILITY,
    attempts: 0,
    correctAttempts: 0,
  }));
  
  return {
    cards,
    currentCard: null,
  };
};

export const selectNextCard = (deck: FlashcardDeck): FlashcardItem | null => {
  if (deck.cards.length === 0) return null;
  
  // Filter out cards with probability 0 (mastered cards)
  const activeCards = deck.cards.filter(card => card.probability > 0);
  
  if (activeCards.length === 0) return null;
  
  // Calculate total weight
  const totalWeight = activeCards.reduce((sum, card) => sum + card.probability, 0);
  
  // Generate random value
  let random = Math.random() * totalWeight;
  
  // Select card based on weighted probability
  for (const card of activeCards) {
    random -= card.probability;
    if (random <= 0) {
      return card;
    }
  }
  
  // Fallback (should never reach here)
  return activeCards[0];
};

export const updateCardProbability = (
  deck: FlashcardDeck,
  cardIndex: number,
  isCorrect: boolean
): FlashcardDeck => {
  const updatedCards = [...deck.cards];
  const card = updatedCards[cardIndex];
  
  if (!card) return deck;
  
  // Update attempts
  card.attempts++;
  if (isCorrect) {
    card.correctAttempts++;
    // Decrease probability for correct answer (down to 0)
    card.probability = Math.max(MIN_PROBABILITY, card.probability - 1);
  } else {
    // Increase probability for incorrect answer
    // This resets the "streak" - card needs consecutive correct answers to reach 0
    card.probability = Math.min(MAX_PROBABILITY, card.probability + 2);
  }
  
  return {
    ...deck,
    cards: updatedCards,
  };
};

export const getDeckStats = (deck: FlashcardDeck): DeckStats => {
  const totalCards = deck.cards.length;
  const completedCards = deck.cards.filter(
    card => card.probability === 0
  ).length;
  
  const completionPercentage = totalCards > 0 
    ? Math.round((completedCards / totalCards) * 100)
    : 0;
  
  const isComplete = completedCards === totalCards && totalCards > 0;
  
  // Sort cards by number of attempts (descending)
  const cardsByDifficulty = [...deck.cards].sort((a, b) => b.attempts - a.attempts);
  
  return {
    totalCards,
    completedCards,
    completionPercentage,
    isComplete,
    cardsByDifficulty,
  };
};

export const findCardIndex = (deck: FlashcardDeck, card: FlashcardItem): number => {
  return deck.cards.findIndex(
    c => c.name === card.name && c.inversion === card.inversion
  );
};