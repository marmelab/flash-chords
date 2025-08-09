import { chords } from '../data/chords';
import { diatonicChords } from '../data/diatonicChords';

/**
 * Determine the quality of a chord from its name
 * @param {string} chordName - The chord name (e.g., "C", "Dm", "G7", "Cmaj7")
 * @returns {string} The chord quality: 'major', 'minor', 'diminished', or 'dominant'
 */
const getChordQuality = (chordName) => {
  // Diminished chords (including half-diminished)
  if (chordName.includes('dim') || chordName.includes('m7b5')) {
    return 'diminished';
  }
  
  // Dominant 7th chords (has '7' but not 'maj7' or 'm7')
  if (chordName.match(/^[A-G]#?\d*7$/) || chordName.match(/^[A-G]#?7$/)) {
    return 'dominant';
  }
  
  // Minor chords (has 'm' but not diminished)
  if (chordName.includes('m')) {
    return 'minor';
  }
  
  // Major chords (including maj7)
  return 'major';
};

/**
 * Check if a chord is a triad or seventh chord
 * @param {string} chordName - The chord name
 * @returns {string} 'triad' or 'seventh'
 */
const getChordExtension = (chordName) => {
  // If it contains '7', it's a seventh chord
  if (chordName.includes('7')) {
    return 'seventh';
  }
  return 'triad';
};

/**
 * Generates a deck of chord-inversion pairs based on user settings
 * @param {Object} settings - User settings for the exercise
 * @param {Array} settings.selectedKeys - Array of selected keys
 * @param {Array} settings.selectedQualities - Array of chord qualities to include
 * @param {Array} settings.selectedExtensions - Array of extensions ('triads', 'sevenths')
 * @param {Object} settings.inversions - Which inversions to include
 * @returns {Array} Array of chord-inversion objects for the exercise
 */
export const generateChordDeck = (settings) => {
  const { 
    selectedKeys = ['C'],
    selectedQualities = ['major', 'minor', 'diminished'],
    selectedExtensions = ['triads'],
    inversions = { root: true, first: false, second: false }
  } = settings;
  
  // Collect all diatonic chord names from selected keys
  const diatonicChordNames = new Set();
  
  selectedKeys.forEach(key => {
    // Key is already in the format we need (e.g., 'C' for major, 'Cm' for minor)
    const keyChordSet = diatonicChords[key];
    
    if (keyChordSet) {
      // Add triads
      if (selectedExtensions.includes('triads') && keyChordSet.triads) {
        keyChordSet.triads.forEach(name => diatonicChordNames.add(name));
      }
      
      // Add sevenths
      if (selectedExtensions.includes('sevenths') && keyChordSet.sevenths) {
        keyChordSet.sevenths.forEach(name => diatonicChordNames.add(name));
      }
    }
  });
  
  // Filter chords based on:
  // 1. Being in the diatonic set
  // 2. Matching selected qualities
  // 3. Matching selected extensions
  let filteredChords = chords.filter(chord => {
    // Must be in diatonic set
    if (!diatonicChordNames.has(chord.name)) {
      return false;
    }
    
    // Check quality
    const quality = getChordQuality(chord.name);
    if (!selectedQualities.includes(quality)) {
      return false;
    }
    
    // Check extension
    const extension = getChordExtension(chord.name);
    const extensionType = extension === 'triad' ? 'triads' : 'sevenths';
    if (!selectedExtensions.includes(extensionType)) {
      return false;
    }
    
    return true;
  });
  
  // If no chords match criteria, return empty array
  if (filteredChords.length === 0) {
    return [];
  }
  
  // Create all possible chord-inversion combinations
  const allCombinations = [];
  
  filteredChords.forEach(chord => {
    // Add root position if selected and available
    if (inversions.root && chord.notes.root) {
      allCombinations.push({
        chord: chord,
        inversion: 'root',
        name: chord.name,
        notes: chord.notes.root
      });
    }
    
    // Add first inversion if selected and available
    if (inversions.first && chord.notes.first) {
      allCombinations.push({
        chord: chord,
        inversion: 'first',
        name: chord.name,
        notes: chord.notes.first
      });
    }
    
    // Add second inversion if selected and available
    if (inversions.second && chord.notes.second) {
      allCombinations.push({
        chord: chord,
        inversion: 'second',
        name: chord.name,
        notes: chord.notes.second
      });
    }
    
    // Add third inversion for 7th chords if second is selected and available
    // (treating "second" toggle as "2nd and higher" for 7th chords)
    if (inversions.second && chord.notes.third) {
      allCombinations.push({
        chord: chord,
        inversion: 'third',
        name: chord.name,
        notes: chord.notes.third
      });
    }
  });
  
  // Shuffle the combinations
  const shuffled = [...allCombinations];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Return all shuffled combinations
  return shuffled;
};

/**
 * Selects a random chord from the deck
 * @param {Array} deck - The chord deck for the current exercise
 * @returns {Object} A random chord-inversion pair from the deck
 */
export const selectRandomFromDeck = (deck) => {
  if (!deck || deck.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * deck.length);
  return deck[randomIndex];
};