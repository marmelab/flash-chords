/**
 * Generates chord notes based on root note and intervals
 */

const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Get the note that is a certain number of semitones from the root
 */
const getNoteAtInterval = (root, semitones) => {
  const rootNote = root.replace(/[0-9]/g, '');
  const octave = parseInt(root.match(/[0-9]/)?.[0] || '4');
  
  const rootIndex = noteOrder.indexOf(rootNote);
  if (rootIndex === -1) return null;
  
  let newIndex = rootIndex + semitones;
  let newOctave = octave;
  
  while (newIndex >= 12) {
    newIndex -= 12;
    newOctave++;
  }
  
  while (newIndex < 0) {
    newIndex += 12;
    newOctave--;
  }
  
  return noteOrder[newIndex] + newOctave;
};

/**
 * Generate major chord (1-3-5)
 */
const generateMajorChord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 4),  // Major third
      getNoteAtInterval(rootNote, 7)   // Perfect fifth
    ],
    first: [
      getNoteAtInterval(rootNote, 4),  // Major third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 16)  // Major third (octave up)
    ]
  };
};

/**
 * Generate minor chord (1-b3-5)
 */
const generateMinorChord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 7)   // Perfect fifth
    ],
    first: [
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15)  // Minor third (octave up)
    ]
  };
};

/**
 * Generate dominant 7th chord (1-3-5-b7)
 */
const generateDom7Chord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 4),  // Major third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 10)  // Minor seventh
    ],
    first: [
      getNoteAtInterval(rootNote, 4),  // Major third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 16)  // Major third (octave up)
    ],
    third: [
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 16), // Major third (octave up)
      getNoteAtInterval(rootNote, 19)  // Perfect fifth (octave up)
    ]
  };
};

/**
 * Generate major 7th chord (1-3-5-7)
 */
const generateMaj7Chord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 4),  // Major third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 11)  // Major seventh
    ],
    first: [
      getNoteAtInterval(rootNote, 4),  // Major third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 11), // Major seventh
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 11), // Major seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 16)  // Major third (octave up)
    ],
    third: [
      getNoteAtInterval(rootNote, 11), // Major seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 16), // Major third (octave up)
      getNoteAtInterval(rootNote, 19)  // Perfect fifth (octave up)
    ]
  };
};

/**
 * Generate diminished chord (1-b3-b5)
 */
const generateDimChord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 6)   // Diminished fifth
    ],
    first: [
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15)  // Minor third (octave up)
    ]
  };
};

/**
 * Generate all chord types for all keys
 */
export const generateAllChords = () => {
  const allChords = [];
  
  // For each of the 12 notes
  noteOrder.forEach(root => {
    // Major chord
    allChords.push({
      name: root,
      notes: generateMajorChord(root)
    });
    
    // Minor chord
    allChords.push({
      name: root + 'm',
      notes: generateMinorChord(root)
    });
    
    // Dominant 7th
    allChords.push({
      name: root + '7',
      notes: generateDom7Chord(root)
    });
    
    // Major 7th
    allChords.push({
      name: root + 'maj7',
      notes: generateMaj7Chord(root)
    });
    
    // Diminished
    allChords.push({
      name: root + 'dim',
      notes: generateDimChord(root)
    });
  });
  
  return allChords;
};