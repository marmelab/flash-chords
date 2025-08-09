const { generateChordDeck } = require('./utils/deckGenerator');

// Test 1: Filter by C key, triads only
console.log('\n=== Test 1: C Major key, triads only ===');
const cMajorDeck = generateChordDeck({
  inversions: { root: true, first: true, second: true },
  chordCount: 20,
  selectedKey: 'C',
  seventhsOnly: false
});
const cMajorChords = [...new Set(cMajorDeck.map(item => item.name))].sort();
console.log('Chords in C Major deck:', cMajorChords);
console.log('Expected: C, Dm, Em, F, G, Am, Bdim');

// Test 2: Filter by C key, 7th chords only
console.log('\n=== Test 2: C Major key, 7th chords only ===');
const cMajor7thDeck = generateChordDeck({
  inversions: { root: true, first: true, second: true },
  chordCount: 20,
  selectedKey: 'C',
  seventhsOnly: true
});
const cMajor7thChords = [...new Set(cMajor7thDeck.map(item => item.name))].sort();
console.log('7th chords in C Major deck:', cMajor7thChords);
console.log('Expected: Cmaj7, Dm7, Em7, Fmaj7, G7, Am7, Bdim7');

// Test 3: All keys, 7th chords only
console.log('\n=== Test 3: All keys, 7th chords only ===');
const all7thDeck = generateChordDeck({
  inversions: { root: true, first: true, second: true },
  chordCount: 30,
  selectedKey: 'all',
  seventhsOnly: true
});
const all7thChords = [...new Set(all7thDeck.map(item => item.name))].sort();
console.log('Sample 7th chords (first 10):', all7thChords.slice(0, 10));
console.log('Total unique 7th chords:', all7thChords.length);
console.log('All contain "7"?', all7thChords.every(name => name.includes('7')));

// Test 4: G Major key, triads
console.log('\n=== Test 4: G Major key, triads only ===');
const gMajorDeck = generateChordDeck({
  inversions: { root: true, first: true, second: true },
  chordCount: 20,
  selectedKey: 'G',
  seventhsOnly: false
});
const gMajorChords = [...new Set(gMajorDeck.map(item => item.name))].sort();
console.log('Chords in G Major deck:', gMajorChords);
console.log('Expected: G, Am, Bm, C, D, Em, F#dim');