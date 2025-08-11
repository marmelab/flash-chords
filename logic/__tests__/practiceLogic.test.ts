import { generateNewChord, checkAnswer, getKeyStyleForNote } from '../practiceLogic';
import type { ChordDeckItem, Chord } from '../../types';

// Mock the dependencies
jest.mock('../deckGenerator', () => ({
  selectRandomFromDeck: jest.fn()
}));

jest.mock('../../data/chords', () => ({
  chords: [
    {
      name: 'C',
      notes: {
        root: ['C4', 'E4', 'G4'],
        first: ['E4', 'G4', 'C5'],
        second: ['G4', 'C5', 'E5']
      }
    },
    {
      name: 'Dm',
      notes: {
        root: ['D4', 'F4', 'A4'],
        first: ['F4', 'A4', 'D5'],
        second: ['A4', 'D5', 'F5']
      }
    }
  ]
}));

import { selectRandomFromDeck } from '../deckGenerator';

describe('practiceLogic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateNewChord', () => {
    it('should select from deck when deck is provided', () => {
      const mockDeckItem: ChordDeckItem = {
        chord: {
          name: 'C',
          notes: { root: ['C4', 'E4', 'G4'] }
        },
        inversion: 'root',
        name: 'C',
        notes: ['C4', 'E4', 'G4']
      };

      const mockDeck = [mockDeckItem];
      (selectRandomFromDeck as jest.Mock).mockReturnValue(mockDeckItem);

      const result = generateNewChord(mockDeck);

      expect(selectRandomFromDeck).toHaveBeenCalledWith(mockDeck);
      expect(result).toEqual({
        chord: mockDeckItem.chord,
        inversion: 'root'
      });
    });

    it('should fallback to random selection when deck selection returns null', () => {
      (selectRandomFromDeck as jest.Mock).mockReturnValue(null);

      const result = generateNewChord([{} as any]); // Non-empty deck but selectRandom returns null

      // Should fallback to random selection from chords array
      expect(result).not.toBeNull();
      if (result) {
        expect(result.chord).toBeDefined();
        expect(['root', 'first', 'second', 'third']).toContain(result.inversion);
      }
    });

    it('should fallback to random chord when deck is empty', () => {
      const result = generateNewChord([]);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.chord).toBeDefined();
        expect(['root', 'first', 'second', 'third']).toContain(result.inversion);
      }
    });

    it('should fallback to random chord when deck is null', () => {
      const result = generateNewChord(null as any);

      expect(result).not.toBeNull();
      if (result) {
        expect(result.chord).toBeDefined();
        expect(['root', 'first', 'second', 'third']).toContain(result.inversion);
      }
    });
  });

  describe('checkAnswer', () => {
    const mockChord: Chord = {
      name: 'C',
      notes: {
        root: ['C4', 'E4', 'G4'],
        first: ['E4', 'G4', 'C5']
      }
    };

    it('should return true for correct answer', () => {
      const selectedKeys = new Set(['C4', 'E4', 'G4']);
      const result = checkAnswer(selectedKeys, mockChord, 'root');
      expect(result).toBe(true);
    });

    it('should return true for correct answer in different octave', () => {
      const selectedKeys = new Set(['C5', 'E5', 'G5']);
      const result = checkAnswer(selectedKeys, mockChord, 'root');
      expect(result).toBe(true);
    });

    it('should return false for incorrect answer', () => {
      const selectedKeys = new Set(['C4', 'D4', 'G4']);
      const result = checkAnswer(selectedKeys, mockChord, 'root');
      expect(result).toBe(false);
    });

    it('should return false for wrong inversion', () => {
      const selectedKeys = new Set(['E4', 'G4', 'C5']); // First inversion notes
      const result = checkAnswer(selectedKeys, mockChord, 'root'); // Expecting root position
      expect(result).toBe(false); // Wrong octaves for root position
    });

    it('should return false when chord is null', () => {
      const selectedKeys = new Set(['C4', 'E4', 'G4']);
      const result = checkAnswer(selectedKeys, null, 'root');
      expect(result).toBe(false);
    });

    it('should return false when inversion is null', () => {
      const selectedKeys = new Set(['C4', 'E4', 'G4']);
      const result = checkAnswer(selectedKeys, mockChord, null as any);
      expect(result).toBe(false);
    });

    it('should handle empty selected keys', () => {
      const selectedKeys = new Set<string>();
      const result = checkAnswer(selectedKeys, mockChord, 'root');
      expect(result).toBe(false);
    });

    it('should handle first inversion correctly', () => {
      const selectedKeys = new Set(['E4', 'G4', 'C5']);
      const result = checkAnswer(selectedKeys, mockChord, 'first');
      expect(result).toBe(true);
    });

    it('should handle chord with missing inversion gracefully', () => {
      const chordWithoutSecond: Chord = {
        name: 'C',
        notes: {
          root: ['C4', 'E4', 'G4']
          // No 'second' inversion defined
        }
      };
      const selectedKeys = new Set(['G4', 'C5', 'E5']);
      const result = checkAnswer(selectedKeys, chordWithoutSecond, 'second');
      expect(result).toBe(false);
    });
  });

  describe('getKeyStyleForNote', () => {
    const mockChord: Chord = {
      name: 'C',
      notes: {
        root: ['C4', 'E4', 'G4']
      }
    };

    it('should delegate to getKeyStyle with correct parameters', () => {
      const selectedKeys = new Set(['C4']);
      const note = 'C4';
      
      const result = getKeyStyleForNote(
        note,
        selectedKeys,
        mockChord,
        'root',
        false,
        null
      );

      // Should return a key style
      expect(typeof result).toBe('string');
    });

    it('should handle null chord gracefully', () => {
      const selectedKeys = new Set(['C4']);
      const note = 'C4';
      
      const result = getKeyStyleForNote(
        note,
        selectedKeys,
        null,
        'root',
        false,
        null
      );

      // Should still return a style even with null chord
      expect(typeof result).toBe('string');
    });

    it('should pass empty array when chord or inversion is missing', () => {
      const selectedKeys = new Set(['C4']);
      const note = 'C4';
      
      // With null chord
      const result1 = getKeyStyleForNote(
        note,
        selectedKeys,
        null,
        'root',
        false,
        null
      );
      expect(result1).toBe('selected'); // Should show selected state

      // With missing inversion
      const chordNoRoot: Chord = {
        name: 'C',
        notes: {} // No inversions defined
      };
      const result2 = getKeyStyleForNote(
        note,
        selectedKeys,
        chordNoRoot,
        'root',
        false,
        null
      );
      expect(result2).toBe('selected'); // Should show selected state
    });

    it('should show correct style when showing results', () => {
      const selectedKeys = new Set(['C4', 'E4', 'G4']);
      
      // Test correct answer styling
      const correctResult = getKeyStyleForNote(
        'C4',
        selectedKeys,
        mockChord,
        'root',
        true, // showResult
        true  // isCorrect
      );
      expect(correctResult).toBe('correct');

      // Test incorrect answer styling
      const selectedWrong = new Set(['C4', 'D4', 'F4']);
      const incorrectResult = getKeyStyleForNote(
        'D4',
        selectedWrong,
        mockChord,
        'root',
        true,  // showResult
        false  // isCorrect
      );
      expect(incorrectResult).toBe('incorrect');
    });

    it('should show expected notes when answer is wrong', () => {
      const selectedKeys = new Set(['D4']); // Wrong note
      
      const result = getKeyStyleForNote(
        'C4', // This is an expected note
        selectedKeys,
        mockChord,
        'root',
        true,  // showResult
        false  // isCorrect
      );
      
      expect(result).toBe('missed'); // Should show as missed/expected
    });
  });
});