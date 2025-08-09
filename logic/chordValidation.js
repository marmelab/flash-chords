/**
 * Removes octave numbers from a note string
 * @param {string} note - Note string like "C4" or "D#5"
 * @returns {string} Note without octave like "C" or "D#"
 */
export const removeOctave = (note) => note.replace(/[0-9]/g, '');

/**
 * Parses a note string into note name and octave
 * @param {string} noteStr - Note string like "C4" or "D#5"
 * @returns {{note: string, octave: number}} Parsed note object
 */
const parseNote = (noteStr) => {
  const match = noteStr.match(/([A-G]#?)(\d)/);
  if (!match) return null;
  return { note: match[1], octave: parseInt(match[2]) };
};

/**
 * Gets the chromatic position of a note (C=0, C#=1, D=2, etc.)
 * @param {string} note - Note name without octave
 * @returns {number} Chromatic position 0-11
 */
const getNotePosition = (note) => {
  const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return noteOrder.indexOf(note);
};

/**
 * Sorts notes by absolute pitch (considering octave and note position)
 * @param {string[]} notes - Array of note strings
 * @returns {object[]} Sorted array of parsed note objects
 */
const sortByPitch = (notes) => {
  return notes
    .map(parseNote)
    .filter(n => n !== null)
    .sort((a, b) => {
      const aPitch = a.octave * 12 + getNotePosition(a.note);
      const bPitch = b.octave * 12 + getNotePosition(b.note);
      return aPitch - bPitch;
    });
};

/**
 * Validates if the selected notes match the expected chord
 * Accepts the chord in any octave but maintains the same inversion
 * 
 * @param {string[]} selectedNotes - Array of selected notes (e.g., ["C5", "E5", "G5"])
 * @param {string[]} expectedNotes - Array of expected notes (e.g., ["C4", "E4", "G4"])
 * @returns {boolean} True if the chord is correct
 */
export const validateChord = (selectedNotes, expectedNotes) => {
  // Check if same number of notes
  if (selectedNotes.length !== expectedNotes.length) {
    return false;
  }

  // Parse the notes to get their components
  const selectedParsed = selectedNotes.map(parseNote).filter(n => n !== null);
  const expectedParsed = expectedNotes.map(parseNote).filter(n => n !== null);

  if (selectedParsed.length !== expectedParsed.length) {
    return false;
  }

  // Check if notes match in the same order (ignoring octave)
  const notesMatchInOrder = selectedParsed.every((selected, index) => 
    selected.note === expectedParsed[index].note
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
 * 
 * @param {string} note - The note to check (e.g., "C4")
 * @param {Set} selectedKeys - Set of selected note strings
 * @param {string[]} chordNotes - Array of notes in the current chord
 * @param {boolean} showResult - Whether to show the result
 * @param {boolean} isCorrect - Whether the answer is correct
 * @returns {string} Style name: 'normal', 'selected', 'correct', 'wrong', or 'expected'
 */
export const getKeyStyle = (note, selectedKeys, chordNotes, showResult, isCorrect) => {
  if (!showResult) {
    return selectedKeys.has(note) ? 'selected' : 'normal';
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
    return 'normal';
  }
  
  // If the answer is incorrect
  if (isSelected && isExactNote) {
    // This exact note is both selected AND in the expected chord position
    return 'correct';  // Show as correct since it's in the right place
  } else if (isSelected && isInChordPattern) {
    // The note is part of the chord but not in the right position/octave
    return 'wrong';  
  } else if (isSelected && !isInChordPattern) {
    return 'wrong';  // Selected but not part of the chord at all
  } else if (isExactNote && !isSelected) {
    return 'expected';  // Show expected notes when the answer is wrong
  }
  
  return 'normal';
};