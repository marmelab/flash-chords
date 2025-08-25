/**
 * Utility functions for chord manipulation and comparison
 */

/**
 * Extract chord type for comparison (ignoring inversions)
 * Normalizes chord names to a standard format for reliable comparison
 * 
 * @param chordName - The chord name to normalize (e.g., "C Major", "Am7", "G Dominant 7")
 * @returns The normalized chord type (e.g., "C", "Am7", "G7")
 */
export const extractChordType = (chordName: string): string => {
  let normalized = chordName.trim();
  
  // Remove any inversion indicators
  normalized = normalized.replace(/\s*\(.*?\)\s*/g, '');
  normalized = normalized.replace(/\s+inversion\s*/i, '');
  normalized = normalized.replace(/\s+position\s*/i, '');
  
  // Normalize chord type variations
  normalized = normalized.replace(/\s+Major\s+7/i, 'maj7');
  normalized = normalized.replace(/\s+Major/i, '');
  normalized = normalized.replace(/\s+major/i, '');
  normalized = normalized.replace(/\s+Minor\s+7/i, 'm7');
  normalized = normalized.replace(/\s+minor\s+7/i, 'm7');
  normalized = normalized.replace(/\s+Minor/i, 'm');
  normalized = normalized.replace(/\s+minor/i, 'm');
  normalized = normalized.replace(/\s+Dominant\s+7/i, '7');
  normalized = normalized.replace(/\s+dominant\s+7/i, '7');
  normalized = normalized.replace(/\s+Diminished\s+7/i, 'dim7');
  normalized = normalized.replace(/\s+diminished\s+7/i, 'dim7');
  normalized = normalized.replace(/\s+Diminished/i, 'dim');
  normalized = normalized.replace(/\s+diminished/i, 'dim');
  normalized = normalized.replace(/\s+Augmented/i, 'aug');
  normalized = normalized.replace(/\s+augmented/i, 'aug');
  normalized = normalized.replace(/Maj7/i, 'maj7');
  normalized = normalized.replace(/maj$/i, '');
  
  // Remove any remaining whitespace
  normalized = normalized.replace(/\s+/g, '');
  
  return normalized;
};