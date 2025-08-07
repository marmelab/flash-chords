import { chords } from '../data/chords';

/**
 * Generates a deck of chord-inversion pairs based on user settings
 * @param {Object} settings - User settings for the exercise
 * @param {Object} settings.inversions - Which inversions to include
 * @param {number} settings.chordCount - Number of chord variations to include
 * @returns {Array} Array of chord-inversion objects for the exercise
 */
export const generateChordDeck = (settings) => {
  const { inversions, chordCount } = settings;
  
  // Create all possible chord-inversion combinations
  const allCombinations = [];
  
  chords.forEach(chord => {
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
  
  // Take only the requested number of chords
  const deckSize = Math.min(chordCount, shuffled.length);
  const deck = shuffled.slice(0, deckSize);
  
  return deck;
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