/**
 * Chord validation and visual style logic
 */

import type { KeyStyle, NoteValidator, KeyStyleCalculator } from '../types';

interface ParsedNote {
  note: string;
  octave: number;
}

/**
 * Removes octave numbers from a note string
 */
export const removeOctave = (note: string): string => {
  if (!note || typeof note !== 'string') {
    return note as any;
  }
  return note.replace(/[0-9]/g, '');
};

/**
 * Parses a note string into note name and octave
 */
const parseNote = (noteStr: string): ParsedNote | null => {
  const match = noteStr.match(/([A-G][#b]?)(\d)/);
  if (!match) return null;
  return { note: match[1], octave: parseInt(match[2]) };
};



/**
 * Validates if the selected notes match the expected chord
 * Accepts the chord in any octave but maintains the same inversion
 */
export const validateChord: NoteValidator = (selectedNotes: string[], expectedNotes: string[]): boolean => {
  // Handle null/undefined input
  if (!selectedNotes || !expectedNotes) {
    return false;
  }
  
  // Check if same number of notes
  if (selectedNotes.length !== expectedNotes.length) {
    return false;
  }

  // Parse the notes to get their components
  const selectedParsed = selectedNotes.map(parseNote).filter((n): n is ParsedNote => n !== null);
  const expectedParsed = expectedNotes.map(parseNote).filter((n): n is ParsedNote => n !== null);

  if (selectedParsed.length !== expectedParsed.length) {
    return false;
  }

  // Helper function to check if two notes are enharmonically equivalent
  const areNotesEquivalent = (note1: string, note2: string): boolean => {
    if (note1 === note2) return true;
    
    const enharmonics: Record<string, string> = {
      'C#': 'Db', 'Db': 'C#',
      'D#': 'Eb', 'Eb': 'D#',
      'F#': 'Gb', 'Gb': 'F#',
      'G#': 'Ab', 'Ab': 'G#',
      'A#': 'Bb', 'Bb': 'A#',
      'B': 'Cb', 'Cb': 'B'
    };
    
    return enharmonics[note1] === note2;
  };
  
  // Check if notes match in the same order (ignoring octave, considering enharmonics)
  const notesMatchInOrder = selectedParsed.every((selected, index) => 
    areNotesEquivalent(selected.note, expectedParsed[index].note)
  );

  if (!notesMatchInOrder) {
    return false;
  }

  // Check that all notes are transposed by the same amount
  // (all in the same octave relative to the original)
  const octaveDifferences = selectedParsed.map((selected, index) => 
    selected.octave - expectedParsed[index].octave
  );

  // All octave differences should be the same
  const allSameOctaveShift = octaveDifferences.every(diff => 
    diff === octaveDifferences[0]
  );

  return notesMatchInOrder && allSameOctaveShift;
};

/**
 * Determines the visual style for a piano key based on the current state
 */
export const getKeyStyle: KeyStyleCalculator = (
  note: string, 
  selectedKeys: Set<string>, 
  chordNotes: string[], 
  showResult: boolean, 
  isCorrect: boolean | null
): KeyStyle => {
  if (!showResult) {
    return selectedKeys.has(note) ? 'selected' : 'default';
  }

  const noteWithoutOctave = removeOctave(note);
  
  // Check if this note (without octave) is part of the chord
  const isInChordPattern = chordNotes.some(
    chordNote => removeOctave(chordNote) === noteWithoutOctave
  );
  
  // Check if this exact note is in the original chord definition
  const isExactNote = chordNotes.includes(note);
  
  const isSelected = selectedKeys.has(note);
  
  // If the answer is correct overall
  if (isCorrect) {
    if (isSelected && isInChordPattern) {
      return 'correct';  // Selected and it's a correct note
    }
    return 'default';
  }
  
  // If the answer is incorrect
  if (isSelected && isExactNote) {
    // This exact note is both selected AND in the expected chord position
    return 'correct';  // Show as correct since it's in the right place
  } else if (isSelected && isInChordPattern) {
    // The note is part of the chord but not in the right position/octave
    return 'incorrect';  
  } else if (isSelected && !isInChordPattern) {
    return 'incorrect';  // Selected but not part of the chord at all
  } else if (isExactNote && !isSelected) {
    return 'missed';  // Show expected notes when the answer is wrong
  }
  
  return 'default';
};