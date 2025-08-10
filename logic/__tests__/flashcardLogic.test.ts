import {
  initializeFlashcardDeck,
  selectNextCard,
  updateCardProbability,
  getDeckStats,
  findCardIndex,
  type FlashcardDeck,
} from '../flashcardLogic';
import { ChordDeckItem } from '../deckGenerator';

describe('flashcardLogic', () => {
  const mockDeckItems: ChordDeckItem[] = [
    {
      chord: { name: 'C', notes: { root: ['C4', 'E4', 'G4'] } },
      inversion: 'root',
      name: 'C',
      notes: ['C4', 'E4', 'G4'],
    },
    {
      chord: { name: 'F', notes: { root: ['F4', 'A4', 'C5'] } },
      inversion: 'root',
      name: 'F',
      notes: ['F4', 'A4', 'C5'],
    },
  ];

  describe('initializeFlashcardDeck', () => {
    it('should initialize deck with default probability', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      
      expect(deck.cards).toHaveLength(2);
      expect(deck.currentCard).toBeNull();
      
      deck.cards.forEach(card => {
        expect(card.probability).toBe(3);
        expect(card.attempts).toBe(0);
        expect(card.correctAttempts).toBe(0);
      });
    });
    
    it('should preserve original chord data', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      
      expect(deck.cards[0].name).toBe('C');
      expect(deck.cards[1].name).toBe('F');
    });
    
    it('should handle empty deck', () => {
      const deck = initializeFlashcardDeck([]);
      
      expect(deck.cards).toHaveLength(0);
      expect(deck.currentCard).toBeNull();
    });
  });

  describe('selectNextCard', () => {
    it('should select a card from the deck', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      const card = selectNextCard(deck);
      
      expect(card).toBeDefined();
      expect(['C', 'F']).toContain(card?.name);
    });
    
    it('should return null for empty deck', () => {
      const deck: FlashcardDeck = { cards: [], currentCard: null };
      const card = selectNextCard(deck);
      
      expect(card).toBeNull();
    });
    
    it('should favor cards with higher probability', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 1;
      deck.cards[1].probability = 9;
      
      const selections = { C: 0, F: 0 };
      for (let i = 0; i < 100; i++) {
        const card = selectNextCard(deck);
        if (card?.name === 'C') selections.C++;
        if (card?.name === 'F') selections.F++;
      }
      
      // F should be selected significantly more often
      expect(selections.F).toBeGreaterThan(selections.C * 2);
    });
    
    it('should not select cards with probability 0', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 0;
      deck.cards[1].probability = 1;
      
      for (let i = 0; i < 20; i++) {
        const card = selectNextCard(deck);
        expect(card?.name).toBe('F');
      }
    });
    
    it('should return null when all cards have probability 0', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 0;
      deck.cards[1].probability = 0;
      
      const card = selectNextCard(deck);
      expect(card).toBeNull();
    });
  });

  describe('updateCardProbability', () => {
    it('should decrease probability for correct answer', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      const updatedDeck = updateCardProbability(deck, 0, true);
      
      expect(updatedDeck.cards[0].probability).toBe(2);
      expect(updatedDeck.cards[0].attempts).toBe(1);
      expect(updatedDeck.cards[0].correctAttempts).toBe(1);
    });
    
    it('should set probability to 0 after 3 consecutive correct answers', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      
      // First correct answer: 3 -> 2
      let updatedDeck = updateCardProbability(deck, 0, true);
      expect(updatedDeck.cards[0].probability).toBe(2);
      
      // Second correct answer: 2 -> 1
      updatedDeck = updateCardProbability(updatedDeck, 0, true);
      expect(updatedDeck.cards[0].probability).toBe(1);
      
      // Third correct answer: 1 -> 0
      updatedDeck = updateCardProbability(updatedDeck, 0, true);
      expect(updatedDeck.cards[0].probability).toBe(0);
      expect(updatedDeck.cards[0].correctAttempts).toBe(3);
    });
    
    it('should reset streak on incorrect answer', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      
      // Two correct answers: 3 -> 2 -> 1
      let updatedDeck = updateCardProbability(deck, 0, true);
      updatedDeck = updateCardProbability(updatedDeck, 0, true);
      expect(updatedDeck.cards[0].probability).toBe(1);
      
      // Incorrect answer: 1 -> 3 (increases by 2)
      updatedDeck = updateCardProbability(updatedDeck, 0, false);
      expect(updatedDeck.cards[0].probability).toBe(3);
      
      // Now needs 3 more consecutive correct to reach 0 again
      updatedDeck = updateCardProbability(updatedDeck, 0, true);
      expect(updatedDeck.cards[0].probability).toBe(2);
    });
    
    it('should increase probability for incorrect answer', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      const updatedDeck = updateCardProbability(deck, 0, false);
      
      expect(updatedDeck.cards[0].probability).toBe(5);
      expect(updatedDeck.cards[0].attempts).toBe(1);
      expect(updatedDeck.cards[0].correctAttempts).toBe(0);
    });
    
    it('should bring mastered card back into rotation on incorrect answer', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 0;
      deck.cards[0].correctAttempts = 3;
      
      const updatedDeck = updateCardProbability(deck, 0, false);
      
      // Card comes back with probability 2 (0 + 2)
      expect(updatedDeck.cards[0].probability).toBe(2);
      expect(updatedDeck.cards[0].attempts).toBe(1);
    });
    
    it('should decrease to 0 from probability 1', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 1;
      
      const updatedDeck = updateCardProbability(deck, 0, true);
      expect(updatedDeck.cards[0].probability).toBe(0);
      expect(updatedDeck.cards[0].correctAttempts).toBe(1);
    });
    
    it('should not increase above maximum probability', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 10;
      
      const updatedDeck = updateCardProbability(deck, 0, false);
      expect(updatedDeck.cards[0].probability).toBe(10);
    });
    
    it('should handle invalid index', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      const updatedDeck = updateCardProbability(deck, 99, true);
      
      expect(updatedDeck).toEqual(deck);
    });
  });

  describe('getDeckStats', () => {
    it('should calculate completion percentage', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 0; // Completed
      deck.cards[1].probability = 2; // Not completed
      
      const stats = getDeckStats(deck);
      
      expect(stats.totalCards).toBe(2);
      expect(stats.completedCards).toBe(1);
      expect(stats.completionPercentage).toBe(50);
      expect(stats.isComplete).toBe(false);
    });
    
    it('should detect when deck is complete', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].probability = 0;
      deck.cards[1].probability = 0;
      
      const stats = getDeckStats(deck);
      
      expect(stats.completedCards).toBe(2);
      expect(stats.completionPercentage).toBe(100);
      expect(stats.isComplete).toBe(true);
    });
    
    it('should sort cards by difficulty', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      deck.cards[0].attempts = 5;
      deck.cards[1].attempts = 10;
      
      const stats = getDeckStats(deck);
      
      expect(stats.cardsByDifficulty[0].attempts).toBe(10);
      expect(stats.cardsByDifficulty[1].attempts).toBe(5);
    });
    
    it('should handle empty deck', () => {
      const deck: FlashcardDeck = { cards: [], currentCard: null };
      const stats = getDeckStats(deck);
      
      expect(stats.totalCards).toBe(0);
      expect(stats.completedCards).toBe(0);
      expect(stats.completionPercentage).toBe(0);
      expect(stats.isComplete).toBe(false);
    });
  });

  describe('findCardIndex', () => {
    it('should find card by name and inversion', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      const index = findCardIndex(deck, deck.cards[0]);
      
      expect(index).toBe(0);
    });
    
    it('should return -1 for non-existent card', () => {
      const deck = initializeFlashcardDeck(mockDeckItems);
      const nonExistentCard = {
        ...deck.cards[0],
        name: 'NonExistent',
      };
      
      const index = findCardIndex(deck, nonExistentCard);
      expect(index).toBe(-1);
    });
    
    it('should distinguish between inversions', () => {
      const deckItems: ChordDeckItem[] = [
        {
          chord: { name: 'C', notes: { root: ['C4', 'E4', 'G4'] } },
          inversion: 'root',
          name: 'C',
          notes: ['C4', 'E4', 'G4'],
        },
        {
          chord: { name: 'C', notes: { first: ['E4', 'G4', 'C5'] } },
          inversion: 'first',
          name: 'C',
          notes: ['E4', 'G4', 'C5'],
        },
      ];
      
      const deck = initializeFlashcardDeck(deckItems);
      const firstInversionCard = deck.cards[1];
      
      const index = findCardIndex(deck, firstInversionCard);
      expect(index).toBe(1);
    });
  });
});