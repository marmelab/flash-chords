/**
 * Diatonic chords for each major and minor key
 * Each key contains the 7 chords built on each scale degree
 */

export const diatonicChords = {
  // Major keys
  'C': {
    triads: ['C', 'Dm', 'Em', 'F', 'G', 'Am', 'Bdim'],
    sevenths: ['Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7', 'Am7', 'Bm7b5']
  },
  'G': {
    triads: ['G', 'Am', 'Bm', 'C', 'D', 'Em', 'F#dim'],
    sevenths: ['Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7', 'Em7', 'F#m7b5']
  },
  'D': {
    triads: ['D', 'Em', 'F#m', 'G', 'A', 'Bm', 'C#dim'],
    sevenths: ['Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7', 'Bm7', 'C#m7b5']
  },
  'A': {
    triads: ['A', 'Bm', 'C#m', 'D', 'E', 'F#m', 'G#dim'],
    sevenths: ['Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7', 'F#m7', 'G#m7b5']
  },
  'E': {
    triads: ['E', 'F#m', 'G#m', 'A', 'B', 'C#m', 'D#dim'],
    sevenths: ['Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7', 'C#m7', 'D#m7b5']
  },
  'B': {
    triads: ['B', 'C#m', 'D#m', 'E', 'F#', 'G#m', 'A#dim'],
    sevenths: ['Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7', 'G#m7', 'A#m7b5']
  },
  'F#': {
    triads: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'E#dim'],
    sevenths: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'E#m7b5']
  },
  'C#': {
    triads: ['C#', 'D#m', 'E#m', 'F#', 'G#', 'A#m', 'B#dim'],
    sevenths: ['C#maj7', 'D#m7', 'E#m7', 'F#maj7', 'G#7', 'A#m7', 'B#m7b5']
  },
  'F': {
    triads: ['F', 'Gm', 'Am', 'A#', 'C', 'Dm', 'Edim'],
    sevenths: ['Fmaj7', 'Gm7', 'Am7', 'A#maj7', 'C7', 'Dm7', 'Em7b5']
  },
  'A#': {  // Bb
    triads: ['A#', 'Cm', 'Dm', 'D#', 'F', 'Gm', 'Adim'],
    sevenths: ['A#maj7', 'Cm7', 'Dm7', 'D#maj7', 'F7', 'Gm7', 'Am7b5']
  },
  'D#': {  // Eb
    triads: ['D#', 'Fm', 'Gm', 'G#', 'A#', 'Cm', 'Ddim'],
    sevenths: ['D#maj7', 'Fm7', 'Gm7', 'G#maj7', 'A#7', 'Cm7', 'Dm7b5']
  },
  'G#': {  // Ab
    triads: ['G#', 'A#m', 'Cm', 'C#', 'D#', 'Fm', 'Gdim'],
    sevenths: ['G#maj7', 'A#m7', 'Cm7', 'C#maj7', 'D#7', 'Fm7', 'Gm7b5']
  },
  // Add flat key aliases for user convenience
  'Db': {
    triads: ['C#', 'D#m', 'Fm', 'F#', 'G#', 'A#m', 'Cdim'],
    sevenths: ['C#maj7', 'D#m7', 'Fm7', 'F#maj7', 'G#7', 'A#m7', 'Cm7b5']
  },
  'Gb': {
    triads: ['F#', 'G#m', 'A#m', 'B', 'C#', 'D#m', 'Fdim'],
    sevenths: ['F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7', 'D#m7', 'Fm7b5']
  },
  'Bb': {
    triads: ['A#', 'Cm', 'Dm', 'D#', 'F', 'Gm', 'Adim'],
    sevenths: ['A#maj7', 'Cm7', 'Dm7', 'D#maj7', 'F7', 'Gm7', 'Am7b5']
  },
  'Eb': {
    triads: ['D#', 'Fm', 'Gm', 'G#', 'A#', 'Cm', 'Ddim'],
    sevenths: ['D#maj7', 'Fm7', 'Gm7', 'G#maj7', 'A#7', 'Cm7', 'Dm7b5']
  },
  'Ab': {
    triads: ['G#', 'A#m', 'Cm', 'C#', 'D#', 'Fm', 'Gdim'],
    sevenths: ['G#maj7', 'A#m7', 'Cm7', 'C#maj7', 'D#7', 'Fm7', 'Gm7b5']
  },
  
  // Natural minor keys (using relative major's key signature)
  'Am': {  // Relative to C major
    triads: ['Am', 'Bdim', 'C', 'Dm', 'Em', 'F', 'G'],
    sevenths: ['Am7', 'Bm7b5', 'Cmaj7', 'Dm7', 'Em7', 'Fmaj7', 'G7']
  },
  'Em': {  // Relative to G major
    triads: ['Em', 'F#dim', 'G', 'Am', 'Bm', 'C', 'D'],
    sevenths: ['Em7', 'F#m7b5', 'Gmaj7', 'Am7', 'Bm7', 'Cmaj7', 'D7']
  },
  'Bm': {  // Relative to D major
    triads: ['Bm', 'C#dim', 'D', 'Em', 'F#m', 'G', 'A'],
    sevenths: ['Bm7', 'C#m7b5', 'Dmaj7', 'Em7', 'F#m7', 'Gmaj7', 'A7']
  },
  'F#m': {  // Relative to A major
    triads: ['F#m', 'G#dim', 'A', 'Bm', 'C#m', 'D', 'E'],
    sevenths: ['F#m7', 'G#m7b5', 'Amaj7', 'Bm7', 'C#m7', 'Dmaj7', 'E7']
  },
  'C#m': {  // Relative to E major
    triads: ['C#m', 'D#dim', 'E', 'F#m', 'G#m', 'A', 'B'],
    sevenths: ['C#m7', 'D#m7b5', 'Emaj7', 'F#m7', 'G#m7', 'Amaj7', 'B7']
  },
  'G#m': {  // Relative to B major
    triads: ['G#m', 'A#dim', 'B', 'C#m', 'D#m', 'E', 'F#'],
    sevenths: ['G#m7', 'A#m7b5', 'Bmaj7', 'C#m7', 'D#m7', 'Emaj7', 'F#7']
  },
  'D#m': {  // Relative to F# major
    triads: ['D#m', 'E#dim', 'F#', 'G#m', 'A#m', 'B', 'C#'],
    sevenths: ['D#m7', 'E#m7b5', 'F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7']
  },
  'A#m': {  // Relative to C# major
    triads: ['A#m', 'B#dim', 'C#', 'D#m', 'E#m', 'F#', 'G#'],
    sevenths: ['A#m7', 'B#m7b5', 'C#maj7', 'D#m7', 'E#m7', 'F#maj7', 'G#7']
  },
  'Dm': {  // Relative to F major
    triads: ['Dm', 'Edim', 'F', 'Gm', 'Am', 'A#', 'C'],
    sevenths: ['Dm7', 'Em7b5', 'Fmaj7', 'Gm7', 'Am7', 'A#maj7', 'C7']
  },
  'Gm': {  // Relative to Bb major
    triads: ['Gm', 'Adim', 'A#', 'Cm', 'Dm', 'D#', 'F'],
    sevenths: ['Gm7', 'Am7b5', 'A#maj7', 'Cm7', 'Dm7', 'D#maj7', 'F7']
  },
  'Cm': {  // Relative to Eb major
    triads: ['Cm', 'Ddim', 'D#', 'Fm', 'Gm', 'G#', 'A#'],
    sevenths: ['Cm7', 'Dm7b5', 'D#maj7', 'Fm7', 'Gm7', 'G#maj7', 'A#7']
  },
  'Fm': {  // Relative to Ab major
    triads: ['Fm', 'Gdim', 'G#', 'A#m', 'Cm', 'C#', 'D#'],
    sevenths: ['Fm7', 'Gm7b5', 'G#maj7', 'A#m7', 'Cm7', 'C#maj7', 'D#7']
  },
  // Missing minor key aliases that map to existing enharmonics
  'Ebm': {  // Same as D#m
    triads: ['D#m', 'E#dim', 'F#', 'G#m', 'A#m', 'B', 'C#'],
    sevenths: ['D#m7', 'E#m7b5', 'F#maj7', 'G#m7', 'A#m7', 'Bmaj7', 'C#7']
  },
  'Bbm': {  // Same as A#m
    triads: ['A#m', 'B#dim', 'C#', 'D#m', 'E#m', 'F#', 'G#'],
    sevenths: ['A#m7', 'B#m7b5', 'C#maj7', 'D#m7', 'E#m7', 'F#maj7', 'G#7']
  },
  
  // "All keys" option
  'all': {
    triads: null,  // Will include all chords
    sevenths: null  // Will include all 7th chords
  }
};

export const keyOptions = [
  { label: 'C', value: 'C' },
  { label: 'C#/Db', value: 'C#' },
  { label: 'D', value: 'D' },
  { label: 'D#/Eb', value: 'D#' },
  { label: 'E', value: 'E' },
  { label: 'F', value: 'F' },
  { label: 'F#/Gb', value: 'F#' },
  { label: 'G', value: 'G' },
  { label: 'G#/Ab', value: 'G#' },
  { label: 'A', value: 'A' },
  { label: 'A#/Bb', value: 'A#' },
  { label: 'B', value: 'B' },
];