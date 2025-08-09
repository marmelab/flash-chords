import { validateChord, getKeyStyle } from './chordValidation';
import { selectRandomFromDeck } from './deckGenerator';
import { chords } from '../data/chords';
import type { 
  ChordDeckItem, 
  GeneratedChord, 
  Chord, 
  InversionType,
  KeyStyle
} from '../types';

/**
 * Generate a new chord for practice
 */
export const generateNewChord = (chordDeck: ChordDeckItem[]): GeneratedChord | null => {
  // If we have a deck, select from it; otherwise fall back to all chords
  if (chordDeck && chordDeck.length > 0) {
    const selectedChordData = selectRandomFromDeck(chordDeck);
    
    if (selectedChordData) {
      return {
        chord: selectedChordData.chord,
        inversion: selectedChordData.inversion
      };
    }
  }
  
  // Fallback: select from all chords (shouldn't happen with proper deck)
  const randomChord = chords[Math.floor(Math.random() * chords.length)];
  const availableInversions = Object.keys(randomChord.notes) as InversionType[];
  const randomInversion = availableInversions[Math.floor(Math.random() * availableInversions.length)];
  
  return {
    chord: randomChord,
    inversion: randomInversion
  };
};

/**
 * Check if the user's answer is correct
 */
export const checkAnswer = (
  selectedKeys: Set<string>, 
  currentChord: Chord | null, 
  currentInversion: InversionType
): boolean => {
  if (!currentChord || !currentInversion) return false;
  
  const selectedArray = Array.from(selectedKeys);
  const correctArray = [...(currentChord.notes[currentInversion] || [])];
  
  return validateChord(selectedArray, correctArray);
};

/**
 * Get the visual style for a piano key based on current state
 */
export const getKeyStyleForNote = (
  note: string, 
  selectedKeys: Set<string>, 
  currentChord: Chord | null, 
  currentInversion: InversionType, 
  showResult: boolean, 
  isCorrect: boolean | null
): KeyStyle => {
  const expectedNotes = currentChord?.notes[currentInversion] || [];
  return getKeyStyle(note, selectedKeys, expectedNotes, showResult, isCorrect);
};