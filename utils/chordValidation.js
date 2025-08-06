/**
 * Removes octave numbers from a note string
 * @param {string} note - Note string like "C4" or "D#5"
 * @returns {string} Note without octave like "C" or "D#"
 */
export const removeOctave = (note) => note.replace(/[0-9]/g, '');

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

  // Get selected notes and expected notes without octaves
  const selectedNotesWithoutOctave = selectedNotes.map(removeOctave);
  const expectedNotesWithoutOctave = expectedNotes.map(removeOctave);

  // Check if the selected notes contain all the correct notes (ignoring octave)
  const hasAllNotes = expectedNotesWithoutOctave.every(expectedNote => 
    selectedNotesWithoutOctave.includes(expectedNote)
  );

  // Check if there are no extra notes
  const noExtraNotes = selectedNotesWithoutOctave.every(selectedNote => 
    expectedNotesWithoutOctave.includes(selectedNote)
  );

  return hasAllNotes && noExtraNotes;
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
  
  if (isSelected && isInChordPattern) {
    return 'correct';  // Selected and it's a correct note (any octave)
  } else if (isSelected && !isInChordPattern) {
    return 'wrong';  // Selected but not part of the chord
  } else if (!isCorrect && isExactNote && !isSelected) {
    return 'expected';  // Only show expected notes when the answer is wrong
  }
  return 'normal';
};