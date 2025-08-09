import { chords } from '../data/chords';
import { diatonicChords } from '../data/diatonicChords';

/**
 * Generates a deck of chord-inversion pairs based on user settings
 * @param {Object} settings - User settings for the exercise
 * @param {Object} settings.inversions - Which inversions to include
 * @param {string} settings.selectedKey - The key to filter chords ('all' or specific key)
 * @param {string} settings.chordType - Type of chords ('major-triads', 'major-sevenths', 'minor-triads', 'minor-sevenths')
 * @returns {Array} Array of chord-inversion objects for the exercise
 */
export const generateChordDeck = (settings) => {
  const { inversions, selectedKey = 'all', chordType = 'major-triads' } = settings;
  
  // Filter chords based on selected key and chord type
  let filteredChords = chords;
  
  // Determine if we're using major or minor key
  const isMinor = chordType.includes('minor');
  const isSevenths = chordType.includes('sevenths');
  
  if (selectedKey !== 'all') {
    // Get the appropriate key name (add 'm' for minor keys)
    const keyName = isMinor ? selectedKey + 'm' : selectedKey;
    const keyChords = diatonicChords[keyName];
    
    if (keyChords) {
      const chordNames = isSevenths ? keyChords.sevenths : keyChords.triads;
      if (chordNames) {
        // Filter to only include chords that match the diatonic chord names
        filteredChords = chords.filter(chord => 
          chordNames.includes(chord.name)
        );
      }
    }
  } else {
    // If all keys, filter by chord type
    if (chordType === 'major-triads') {
      // Include only major, diminished triads (diatonic to major keys)
      filteredChords = chords.filter(chord => 
        !chord.name.includes('7') && 
        (!chord.name.includes('m') || chord.name.includes('dim'))
      );
    } else if (chordType === 'major-sevenths') {
      // Include maj7, dom7, m7, m7b5 (diatonic to major keys)
      filteredChords = chords.filter(chord => 
        chord.name.includes('maj7') || 
        chord.name.includes('m7') || 
        (chord.name.includes('7') && !chord.name.includes('dim7'))
      );
    } else if (chordType === 'minor-triads') {
      // Include minor, major, diminished triads (diatonic to minor keys)
      filteredChords = chords.filter(chord => 
        !chord.name.includes('7')
      );
    } else if (chordType === 'minor-sevenths') {
      // Include all 7th chords (diatonic to minor keys)
      filteredChords = chords.filter(chord => 
        chord.name.includes('7')
      );
    }
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