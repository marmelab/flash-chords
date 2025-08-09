import { validateChord, getKeyStyle } from './chordValidation';
import { selectRandomFromDeck } from './deckGenerator';
import { chords } from '../data/chords';

/**
 * Generate a new chord for practice
 * @param {Array} chordDeck - The deck of chords to select from
 * @returns {Object} Object with chord and inversion
 */
export const generateNewChord = (chordDeck) => {
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
  const availableInversions = Object.keys(randomChord.notes);
  const randomInversion = availableInversions[Math.floor(Math.random() * availableInversions.length)];
  
  return {
    chord: randomChord,
    inversion: randomInversion
  };
};

/**
 * Check if the user's answer is correct
 * @param {Set} selectedKeys - Set of selected note names
 * @param {Object} currentChord - The current chord object
 * @param {string} currentInversion - The current inversion
 * @returns {boolean} Whether the answer is correct
 */
export const checkAnswer = (selectedKeys, currentChord, currentInversion) => {
  if (!currentChord || !currentInversion) return false;
  
  const selectedArray = Array.from(selectedKeys);
  const correctArray = [...currentChord.notes[currentInversion]];
  
  return validateChord(selectedArray, correctArray);
};

/**
 * Get the visual style for a piano key based on current state
 * @param {string} note - The note name
 * @param {Set} selectedKeys - Set of selected note names
 * @param {Object} currentChord - The current chord object
 * @param {string} currentInversion - The current inversion
 * @param {boolean} showResult - Whether to show the result
 * @param {boolean} isCorrect - Whether the answer is correct
 * @returns {string} The key style to apply
 */
export const getKeyStyleForNote = (note, selectedKeys, currentChord, currentInversion, showResult, isCorrect) => {
  const expectedNotes = currentChord?.notes[currentInversion] || [];
  return getKeyStyle(note, selectedKeys, expectedNotes, showResult, isCorrect);
};