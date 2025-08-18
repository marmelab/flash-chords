import { generateChordDeck } from '../logic/deckGenerator';
import type { ExerciseSettings } from '../types';

describe('generateChordDeck', () => {
  describe('chord quality filtering', () => {
    it('should correctly identify major 7th chords', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has Cmaj7 and Fmaj7 as major 7th chords
      expect(chordNames).toContain('Cmaj7');
      expect(chordNames).toContain('Fmaj7');
      expect(deck.length).toBe(2);
    });

    it('should correctly identify minor 7th chords', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['minor'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has Dm7, Em7, Am7 as minor 7th chords
      expect(chordNames).toContain('Dm7');
      expect(chordNames).toContain('Em7');
      expect(chordNames).toContain('Am7');
      expect(deck.length).toBe(3);
    });

    it('should correctly identify dominant 7th chords', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['dominant'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has G7 as dominant 7th chord
      expect(chordNames).toContain('G7');
      expect(deck.length).toBe(1);
    });

    it('should correctly identify diminished chords', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['diminished'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has Bm7b5 as half-diminished 7th chord
      expect(chordNames).toContain('Bm7b5');
      expect(deck.length).toBe(1);
    });

    it('should correctly identify major triads', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has C, F, G as major triads
      expect(chordNames).toContain('C');
      expect(chordNames).toContain('F');
      expect(chordNames).toContain('G');
      expect(deck.length).toBe(3);
    });

    it('should correctly identify minor triads', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['minor'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has Dm, Em, Am as minor triads
      expect(chordNames).toContain('Dm');
      expect(chordNames).toContain('Em');
      expect(chordNames).toContain('Am');
      expect(deck.length).toBe(3);
    });

    it('should correctly identify diminished triads', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['diminished'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // C major key has Bdim as diminished triad
      expect(chordNames).toContain('Bdim');
      expect(deck.length).toBe(1);
    });
  });

  describe('extension filtering', () => {
    it('should filter by triads only', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'minor', 'diminished', 'dominant'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // Should only have triads
      chordNames.forEach(name => {
        expect(name).not.toContain('7');
      });
      
      // C major scale has 7 triads
      expect(deck.length).toBe(7);
    });

    it('should filter by sevenths only', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'minor', 'diminished', 'dominant'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // Should only have seventh chords
      chordNames.forEach(name => {
        expect(name).toContain('7');
      });
      
      // C major scale has 7 seventh chords
      expect(deck.length).toBe(7);
    });

    it('should include both triads and sevenths', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'minor', 'diminished', 'dominant'],
        selectedExtensions: ['triads', 'sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      
      // C major scale has 7 triads + 7 sevenths = 14 total
      expect(deck.length).toBe(14);
    });
  });

  describe('inversions', () => {
    it('should generate all inversions for triads', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: true, second: true }
      };
      
      const deck = generateChordDeck(settings);
      
      // C major key has 3 major triads (C, F, G)
      // Each triad has 3 inversions = 9 total
      expect(deck.length).toBe(9);
      
      // Check that each chord has all inversions
      const cChords = deck.filter(item => item.name === 'C');
      expect(cChords.length).toBe(3);
      expect(cChords.map(c => c.inversion).sort()).toEqual(['first', 'root', 'second']);
    });

    it('should generate all inversions for seventh chords', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'],
        selectedExtensions: ['sevenths'],
        inversions: { root: true, first: true, second: true }
      };
      
      const deck = generateChordDeck(settings);
      
      // C major key has 2 major 7th chords (Cmaj7, Fmaj7)
      // Each 7th chord has 4 inversions (root, first, second, third) = 8 total
      expect(deck.length).toBe(8);
      
      // Check that each chord has all inversions including third
      const cmaj7Chords = deck.filter(item => item.name === 'Cmaj7');
      expect(cmaj7Chords.length).toBe(4);
      expect(cmaj7Chords.map(c => c.inversion).sort()).toEqual(['first', 'root', 'second', 'third']);
    });
  });

  describe('multiple keys', () => {
    it('should combine chords from multiple keys', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C', 'G'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = [...new Set(deck.map(item => item.name))];
      
      // C major has C, F, G
      // G major has G, C, D
      // Combined unique set: C, F, G, D
      expect(chordNames).toContain('C');
      expect(chordNames).toContain('F');
      expect(chordNames).toContain('G');
      expect(chordNames).toContain('D');
    });
  });

  describe('edge cases', () => {
    it('should return empty array when no chords match criteria', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: [], // No qualities selected
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      expect(deck.length).toBe(0);
    });

    it('should handle minor keys correctly', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['Am'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // A minor key has C, F, G as major triads
      expect(chordNames).toContain('C');
      expect(chordNames).toContain('F');
      expect(chordNames).toContain('G');
      expect(deck.length).toBe(3);
    });

    it('should handle enharmonic keys', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['Db'],
        selectedQualities: ['major'],
        selectedExtensions: ['triads'],
        inversions: { root: true, first: false, second: false }
      };
      
      const deck = generateChordDeck(settings);
      const chordNames = deck.map(item => item.name);
      
      // Db major key has Db, Gb, Ab as major triads
      expect(chordNames).toContain('Db');
      expect(chordNames).toContain('Gb');
      expect(chordNames).toContain('Ab');
      expect(deck.length).toBe(3);
    });
  });

  describe('shuffle', () => {
    it('should shuffle the deck', () => {
      const settings: ExerciseSettings = {
        selectedKeys: ['C'],
        selectedQualities: ['major', 'minor', 'diminished', 'dominant'],
        selectedExtensions: ['triads', 'sevenths'],
        inversions: { root: true, first: false, second: false }
      };
      
      // Generate multiple decks and check they're not always in the same order
      const deck1 = generateChordDeck(settings);
      const deck2 = generateChordDeck(settings);
      const deck3 = generateChordDeck(settings);
      
      // Convert to string for comparison
      const deck1String = JSON.stringify(deck1.map(d => d.name));
      const deck2String = JSON.stringify(deck2.map(d => d.name));
      const deck3String = JSON.stringify(deck3.map(d => d.name));
      
      // At least one should be different (statistically very likely)
      const allSame = deck1String === deck2String && deck2String === deck3String;
      expect(allSame).toBe(false);
    });
  });
});