import { ChordDeckItem } from './deckGenerator';

export interface FlashcardItem extends ChordDeckItem {
  probability: number;
  attempts: number;
  correctAttempts: number;
  lastShownIndex?: number; // Track when card was last shown
}

export interface FlashcardDeck {
  cards: FlashcardItem[];
  currentCard: FlashcardItem | null;
  showIndex: number; // Track total cards shown
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
const COOLDOWN_PERIOD = 3; // Minimum cards between repeats
const INCORRECT_PENALTY = 2; // How much to increase probability on failure
const CORRECT_REWARD = 1; // How much to decrease probability on success

export const initializeFlashcardDeck = (deck: ChordDeckItem[]): FlashcardDeck => {
  const cards = deck.map(item => ({
    ...item,
    probability: INITIAL_PROBABILITY,
    attempts: 0,
    correctAttempts: 0,
    lastShownIndex: -999, // Never shown
  }));
  
  return {
    cards,
    currentCard: null,
    showIndex: 0,
  };
};

export const selectNextCard = (deck: FlashcardDeck): FlashcardItem | null => {
  if (deck.cards.length === 0) return null;
  
  // Filter out cards with probability 0 (mastered cards)
  const activeCards = deck.cards.filter(card => card.probability > 0);
  
  if (activeCards.length === 0) return null;
  
  // Dynamically adjust cooldown based on number of active cards
  // If we have fewer active cards, reduce the cooldown period
  const effectiveCooldown = Math.min(COOLDOWN_PERIOD, Math.max(1, activeCards.length - 1));
  
  // Further filter cards in cooldown period (shown too recently)
  const availableCards = activeCards.filter(card => {
    const cardsSinceLastShown = deck.showIndex - (card.lastShownIndex ?? -999);
    return cardsSinceLastShown >= effectiveCooldown;
  });
  
  // If all cards are in cooldown (shouldn't happen with dynamic cooldown), use all active cards
  const cardsToChooseFrom = availableCards.length > 0 ? availableCards : activeCards;
  
  // Calculate total weight
  const totalWeight = cardsToChooseFrom.reduce((sum, card) => sum + card.probability, 0);
  
  // Generate random value
  let random = Math.random() * totalWeight;
  
  // Select card based on weighted probability
  for (const card of cardsToChooseFrom) {
    random -= card.probability;
    if (random <= 0) {
      // Update the card's last shown index
      card.lastShownIndex = deck.showIndex;
      return card;
    }
  }
  
  // Fallback (should never reach here)
  return cardsToChooseFrom[0];
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
    card.probability = Math.max(MIN_PROBABILITY, card.probability - CORRECT_REWARD);
  } else {
    // Increase probability for incorrect answer
    // This resets the "streak" - card needs consecutive correct answers to reach 0
    card.probability = Math.min(MAX_PROBABILITY, card.probability + INCORRECT_PENALTY);
  }
  
  return {
    ...deck,
    cards: updatedCards,
    showIndex: deck.showIndex + 1, // Increment show counter
  };
};

export const getDeckStats = (deck: FlashcardDeck): DeckStats => {
  const totalCards = deck.cards.length;
  const completedCards = deck.cards.filter(
    card => card.probability === 0
  ).length;
  
  // Calculate weighted progress - cards closer to mastery contribute more
  let totalProgress = 0;
  if (totalCards > 0) {
    deck.cards.forEach(card => {
      // Convert probability to progress (0 prob = 100% progress, 3 prob = 0% progress)
      const cardProgress = Math.max(0, (INITIAL_PROBABILITY - card.probability) / INITIAL_PROBABILITY);
      totalProgress += cardProgress;
    });
    totalProgress = Math.round((totalProgress / totalCards) * 100);
  }
  
  const completionPercentage = totalProgress;
  
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