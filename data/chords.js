export const chords = [
  { 
    name: 'C', 
    notes: {
      root: ['C4', 'E4', 'G4'],
      first: ['E4', 'G4', 'C5'],
      second: ['G4', 'C5', 'E5']
    }
  },
  { 
    name: 'Cm', 
    notes: {
      root: ['C4', 'D#4', 'G4'],
      first: ['D#4', 'G4', 'C5'],
      second: ['G4', 'C5', 'D#5']
    }
  },
  { 
    name: 'C7', 
    notes: {
      root: ['C4', 'E4', 'G4', 'A#4'],
      first: ['E4', 'G4', 'A#4', 'C5'],
      second: ['G4', 'A#4', 'C5', 'E5'],
      third: ['A#4', 'C5', 'E5', 'G5']
    }
  },
  { 
    name: 'Cmaj7', 
    notes: {
      root: ['C4', 'E4', 'G4', 'B4'],
      first: ['E4', 'G4', 'B4', 'C5'],
      second: ['G4', 'B4', 'C5', 'E5'],
      third: ['B4', 'C5', 'E5', 'G5']
    }
  },
  { 
    name: 'Cdim', 
    notes: {
      root: ['C4', 'D#4', 'F#4'],
      first: ['D#4', 'F#4', 'C5'],
      second: ['F#4', 'C5', 'D#5']
    }
  },
];

export const notes = [
  { note: 'C4', freq: 261.63, type: 'white' },
  { note: 'C#4', freq: 277.18, type: 'black' },
  { note: 'D4', freq: 293.66, type: 'white' },
  { note: 'D#4', freq: 311.13, type: 'black' },
  { note: 'E4', freq: 329.63, type: 'white' },
  { note: 'F4', freq: 349.23, type: 'white' },
  { note: 'F#4', freq: 369.99, type: 'black' },
  { note: 'G4', freq: 392.00, type: 'white' },
  { note: 'G#4', freq: 415.30, type: 'black' },
  { note: 'A4', freq: 440.00, type: 'white' },
  { note: 'A#4', freq: 466.16, type: 'black' },
  { note: 'B4', freq: 493.88, type: 'white' },
  { note: 'C5', freq: 523.25, type: 'white' },
  { note: 'C#5', freq: 554.37, type: 'black' },
  { note: 'D5', freq: 587.33, type: 'white' },
  { note: 'D#5', freq: 622.25, type: 'black' },
  { note: 'E5', freq: 659.25, type: 'white' },
  { note: 'F5', freq: 698.46, type: 'white' },
  { note: 'F#5', freq: 739.99, type: 'black' },
  { note: 'G5', freq: 783.99, type: 'white' },
  { note: 'G#5', freq: 830.61, type: 'black' },
  { note: 'A5', freq: 880.00, type: 'white' },
  { note: 'A#5', freq: 932.33, type: 'black' },
  { note: 'B5', freq: 987.77, type: 'white' },
];

export const getInversionName = (inversion) => {
  const names = {
    root: 'root position',
    first: '1st inversion',
    second: '2nd inversion',
    third: '3rd inversion'
  };
  return names[inversion] || 'root position';
};