import { generateChordDeck, selectRandomFromDeck } from '../deckGenerator';
import type { ExerciseSettings, ChordDeckItem } from '../../types';

describe('deckGenerator', () => {
  describe('generateChordDeck', () => {
    it('should generate a deck with only C major chords when C key is selected', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'minor', 'diminished', 'dominant'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // C major scale triads: C, Dm, Em, F, G, Am, Bdim
      const expectedChords = ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'];
      const deckChordNames = deck.map(item => item.name);
      
      expect(deck.length).toBeGreaterThan(0);
      deckChordNames.forEach(name => {
        expect(expectedChords).toContain(name);
      });
    });

    it('should filter by chord quality', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'], // Only major chords
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Only major chords from C major scale: C, F, G
      const expectedChords = ['C', 'F', 'G'];
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deckChordNames.sort()).toEqual(expectedChords.sort());
    });

    it('should include seventh chords when sevenths extension is selected', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'dominant'], // Include dominant to get G7
        selectedExtensions: ['sevenths'], // Only 7th chords
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Should include Cmaj7, Fmaj7, G7
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deck.length).toBeGreaterThan(0);
      deckChordNames.forEach(name => {
        expect(name).toContain('7');
      });
    });

    it('should include multiple inversions when selected', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: true, second: true }
      };

      const deck = generateChordDeck(settings);
      
      // Should have root, first, and second inversions for each chord
      const cChords = deck.filter(item => item.name === 'C');
      const inversions = cChords.map(item => item.inversion);
      
      expect(inversions).toContain('root');
      expect(inversions).toContain('first');
      expect(inversions).toContain('second');
    });

    it('should handle multiple keys', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C', 'G'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Should include major chords from both C and G scales
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deckChordNames).toContain('C'); // In both
      expect(deckChordNames).toContain('F'); // In C
      expect(deckChordNames).toContain('D'); // In G
      expect(deckChordNames).toContain('G'); // In both
    });

    it('should handle flat keys correctly', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['Bb'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Major chords from Bb major scale: Bb, Eb, F
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deckChordNames).toContain('Bb');
      expect(deckChordNames).toContain('Eb');
      expect(deckChordNames).toContain('F');
    });

    it('should handle minor keys', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['Am'],
        selectedQualities: ['minor'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Minor chords from A minor scale: Dm, Em, Am
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deckChordNames).toContain('Dm');
      expect(deckChordNames).toContain('Em');
      expect(deckChordNames).toContain('Am');
    });

    it('should include dominant chords when selected', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['dominant'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Dominant 7th from C major scale: G7
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deckChordNames).toEqual(['G7']);
    });

    it('should include diminished chords when selected', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['diminished'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      // Diminished chord from C major scale: Bdim
      const deckChordNames = [...new Set(deck.map(item => item.name))];
      
      expect(deckChordNames).toEqual(['Bdim']);
    });

    it('should return empty array when no chords match criteria', () => {
      const settings: ExerciseSettings = {
        selectedKeys: [],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };

      const deck = generateChordDeck(settings);
      
      expect(deck).toEqual([]);
    });

    it('should shuffle the deck', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'minor'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: true, second: true }
      };

      const deck1 = generateChordDeck(settings);
      const deck2 = generateChordDeck(settings);
      
      // With enough items, shuffled decks should be different
      // (there's a tiny chance they could be the same, but very unlikely)
      expect(deck1.length).toBeGreaterThan(10);
      expect(deck1.length).toEqual(deck2.length);
      
      // Check that not all items are in the same position
      let differentPositions = 0;
      for (let i = 0; i < deck1.length; i++) {
        if (deck1[i].name !== deck2[i].name || deck1[i].inversion !== deck2[i].inversion) {
          differentPositions++;
        }
      }
      expect(differentPositions).toBeGreaterThan(0);
    });

    it('should include third inversion for seventh chords when second is selected', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'dominant'],
        selectedExtensions: ['sevenths'],
        inversions: { root: false, first: false, second: true } // second = true means "2nd and higher"
      };

      const deck = generateChordDeck(settings);
      
      // Should include third inversion for 7th chords
      expect(deck.length).toBeGreaterThan(0);
      
      const inversions = deck.map(item => item.inversion);
      expect(inversions).toContain('second');
      expect(inversions).toContain('third');
    });
  });

  describe('selectRandomFromDeck', () => {
    it('should return null for empty deck', () => {
      const result = selectRandomFromDeck([]);
      expect(result).toBeNull();
    });

    it('should return null for null deck', () => {
      const result = selectRandomFromDeck(null as any);
      expect(result).toBeNull();
    });

    it('should return an item from the deck', () => {
      const mockDeck: ChordDeckItem[] = [
        {
          chord: { name: 'C', notes: { root: ['C4', 'E4', 'G4'] } },
          inversion: 'root',
          name: 'C',
          notes: ['C4', 'E4', 'G4']
        }
      ];

      const result = selectRandomFromDeck(mockDeck);
      expect(result).toEqual(mockDeck[0]);
    });

    it('should return different items on multiple calls (statistically)', () => {
      const mockDeck: ChordDeckItem[] = [
        {
          chord: { name: 'C', notes: { root: ['C4', 'E4', 'G4'] } },
          inversion: 'root',
          name: 'C',
          notes: ['C4', 'E4', 'G4']
        },
        {
          chord: { name: 'Dm', notes: { root: ['D4', 'F4', 'A4'] } },
          inversion: 'root',
          name: 'Dm',
          notes: ['D4', 'F4', 'A4']
        },
        {
          chord: { name: 'Em', notes: { root: ['E4', 'G4', 'B4'] } },
          inversion: 'root',
          name: 'Em',
          notes: ['E4', 'G4', 'B4']
        }
      ];

      const results = new Set<string>();
      for (let i = 0; i < 20; i++) {
        const result = selectRandomFromDeck(mockDeck);
        if (result) {
          results.add(result.name);
        }
      }

      // Should have selected multiple different chords
      expect(results.size).toBeGreaterThan(1);
    });
  });
});