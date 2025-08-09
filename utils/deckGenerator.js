import { chords } from '../data/chords';
import { diatonicChords } from '../data/diatonicChords';

/**
 * Generates a deck of chord-inversion pairs based on user settings
 * @param {Object} settings - User settings for the exercise
 * @param {Object} settings.inversions - Which inversions to include
 * @param {Array} settings.selectedKeys - Array of selected keys
 * @param {Array} settings.selectedChordTypes - Array of chord types ('major-triads', 'major-sevenths', 'minor-triads', 'minor-sevenths')
 * @returns {Array} Array of chord-inversion objects for the exercise
 */
export const generateChordDeck = (settings) => {
  const { inversions, selectedKeys = ['C'], selectedChordTypes = ['major-triads'] } = settings;
  
  // Collect all chord names from selected keys and chord types
  const allChordNames = new Set();
  
  selectedChordTypes.forEach(chordType => {
    // Determine if we're using major or minor key
    const isMinor = chordType.includes('minor');
    const isSevenths = chordType.includes('sevenths');
    
    selectedKeys.forEach(key => {
      // Get the appropriate key name (add 'm' for minor keys)
      const keyName = isMinor ? key + 'm' : key;
      const keyChords = diatonicChords[keyName];
      
      if (keyChords) {
        const chordNames = isSevenths ? keyChords.sevenths : keyChords.triads;
        if (chordNames) {
          chordNames.forEach(name => allChordNames.add(name));
        }
      }
    });
  });
  
  // Filter chords based on collected chord names
  let filteredChords = chords.filter(chord => 
    allChordNames.has(chord.name)
  );
  
  // If no keys selected or no chords found, return empty array
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
  
  // Return all shuffled combinations (no limit)
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