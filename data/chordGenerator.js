/**
 * Generates chord notes based on root note and intervals
 */

const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Map of enharmonic equivalents
const enharmonicMap = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#',
  'Cb': 'B',
  'B': 'Cb'
};

/**
 * Get the note that is a certain number of semitones from the root
 */
const getNoteAtInterval = (root, semitones) => {
  let rootNote = root.replace(/[0-9]/g, '');
  const octave = parseInt(root.match(/[0-9]/)?.[0] || '4');
  
  // Convert flat notes to sharp equivalents for calculation
  if (enharmonicMap[rootNote] && rootNote.includes('b')) {
    rootNote = enharmonicMap[rootNote];
  }
  
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
 * Generate minor 7th chord (1-b3-5-b7)
 */
const generateMin7Chord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 10)  // Minor seventh
    ],
    first: [
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 7),  // Perfect fifth
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15)  // Minor third (octave up)
    ],
    third: [
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15), // Minor third (octave up)
      getNoteAtInterval(rootNote, 19)  // Perfect fifth (octave up)
    ]
  };
};

/**
 * Generate diminished 7th chord (1-b3-b5-bb7)
 */
const generateDim7Chord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 9)   // Diminished seventh
    ],
    first: [
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 9),  // Diminished seventh
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 9),  // Diminished seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15)  // Minor third (octave up)
    ],
    third: [
      getNoteAtInterval(rootNote, 9),  // Diminished seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15), // Minor third (octave up)
      getNoteAtInterval(rootNote, 18)  // Diminished fifth (octave up)
    ]
  };
};

/**
 * Generate minor 7 flat 5 (half-diminished) chord (1-b3-b5-b7)
 */
const generateMin7b5Chord = (root) => {
  const rootNote = root + '4';
  return {
    root: [
      rootNote,
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 10)  // Minor seventh
    ],
    first: [
      getNoteAtInterval(rootNote, 3),  // Minor third
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12)  // Root (octave up)
    ],
    second: [
      getNoteAtInterval(rootNote, 6),  // Diminished fifth
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15)  // Minor third (octave up)
    ],
    third: [
      getNoteAtInterval(rootNote, 10), // Minor seventh
      getNoteAtInterval(rootNote, 12), // Root (octave up)
      getNoteAtInterval(rootNote, 15), // Minor third (octave up)
      getNoteAtInterval(rootNote, 18)  // Diminished fifth (octave up)
    ]
  };
};

/**
 * Generate all chord types for all keys
 */
export const generateAllChords = () => {
  const allChords = [];
  
  // Helper function to add chord with enharmonic equivalent
  const addChord = (name, notes) => {
    allChords.push({ name, notes });
    
    // Add enharmonic equivalent if it exists
    const rootNote = name.match(/^[A-G]#?b?/)?.[0];
    if (rootNote && enharmonicMap[rootNote]) {
      const enharmonicName = name.replace(rootNote, enharmonicMap[rootNote]);
      allChords.push({ name: enharmonicName, notes });
    }
  };
  
  // For each of the 12 notes (sharps)
  noteOrder.forEach(root => {
    // Major chord
    addChord(root, generateMajorChord(root));
    
    // Minor chord
    addChord(root + 'm', generateMinorChord(root));
    
    // Dominant 7th
    addChord(root + '7', generateDom7Chord(root));
    
    // Major 7th
    addChord(root + 'maj7', generateMaj7Chord(root));
    
    // Diminished
    addChord(root + 'dim', generateDimChord(root));
    
    // Minor 7th
    addChord(root + 'm7', generateMin7Chord(root));
    
    // Diminished 7th
    addChord(root + 'dim7', generateDim7Chord(root));
    
    // Minor 7 flat 5 (half-diminished)
    addChord(root + 'm7b5', generateMin7b5Chord(root));
  });
  
  // Also add Cb chords (which are B chords)
  const cbNotes = generateMajorChord('B');
  allChords.push({ name: 'Cb', notes: cbNotes });
  allChords.push({ name: 'Cbmaj7', notes: generateMaj7Chord('B') });
  allChords.push({ name: 'Cb7', notes: generateDom7Chord('B') });
  
  return allChords;
};