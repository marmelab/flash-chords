import { removeOctave, validateChord, getKeyStyle } from '../chordValidation';

describe('removeOctave', () => {
  test('removes octave from simple notes', () => {
    expect(removeOctave('C4')).toBe('C');
    expect(removeOctave('D5')).toBe('D');
    expect(removeOctave('G3')).toBe('G');
  });

  test('removes octave from sharp notes', () => {
    expect(removeOctave('C#4')).toBe('C#');
    expect(removeOctave('D#5')).toBe('D#');
    expect(removeOctave('F#3')).toBe('F#');
  });

  test('handles notes without octave', () => {
    expect(removeOctave('C')).toBe('C');
    expect(removeOctave('D#')).toBe('D#');
  });
});

describe('validateChord', () => {
  describe('C major chord', () => {
    const expectedNotes = ['C4', 'E4', 'G4'];

    test('accepts exact match', () => {
      expect(validateChord(['C4', 'E4', 'G4'], expectedNotes)).toBe(true);
    });

    test('accepts same chord in different octave', () => {
      expect(validateChord(['C5', 'E5', 'G5'], expectedNotes)).toBe(true);
      expect(validateChord(['C3', 'E3', 'G3'], expectedNotes)).toBe(true);
    });

    test('accepts same chord with mixed octaves', () => {
      expect(validateChord(['C4', 'E5', 'G3'], expectedNotes)).toBe(true);
      expect(validateChord(['C5', 'E4', 'G5'], expectedNotes)).toBe(true);
    });

    test('accepts notes in different order', () => {
      expect(validateChord(['E4', 'G4', 'C4'], expectedNotes)).toBe(true);
      expect(validateChord(['G5', 'C5', 'E5'], expectedNotes)).toBe(true);
    });

    test('rejects wrong notes', () => {
      expect(validateChord(['C4', 'F4', 'G4'], expectedNotes)).toBe(false);
      expect(validateChord(['C4', 'E4', 'A4'], expectedNotes)).toBe(false);
    });

    test('rejects incomplete chord', () => {
      expect(validateChord(['C4', 'E4'], expectedNotes)).toBe(false);
      expect(validateChord(['C5', 'G5'], expectedNotes)).toBe(false);
    });

    test('rejects chord with extra notes', () => {
      expect(validateChord(['C4', 'E4', 'G4', 'B4'], expectedNotes)).toBe(false);
    });
  });

  describe('C minor chord', () => {
    const expectedNotes = ['C4', 'D#4', 'G4'];

    test('accepts exact match', () => {
      expect(validateChord(['C4', 'D#4', 'G4'], expectedNotes)).toBe(true);
    });

    test('accepts same chord in different octave', () => {
      expect(validateChord(['C5', 'D#5', 'G5'], expectedNotes)).toBe(true);
    });

    test('rejects major third instead of minor', () => {
      expect(validateChord(['C4', 'E4', 'G4'], expectedNotes)).toBe(false);
    });
  });

  describe('C7 chord (4 notes)', () => {
    const expectedNotes = ['C4', 'E4', 'G4', 'A#4'];

    test('accepts exact match', () => {
      expect(validateChord(['C4', 'E4', 'G4', 'A#4'], expectedNotes)).toBe(true);
    });

    test('accepts same chord in different octave', () => {
      expect(validateChord(['C5', 'E5', 'G5', 'A#5'], expectedNotes)).toBe(true);
    });

    test('rejects incomplete seventh chord', () => {
      expect(validateChord(['C4', 'E4', 'G4'], expectedNotes)).toBe(false);
    });
  });

  describe('Inversions', () => {
    test('first inversion of C major', () => {
      const firstInversion = ['E4', 'G4', 'C5'];
      expect(validateChord(['E4', 'G4', 'C5'], firstInversion)).toBe(true);
      expect(validateChord(['E3', 'G3', 'C4'], firstInversion)).toBe(true);
      expect(validateChord(['E5', 'G5', 'C6'], firstInversion)).toBe(true);
    });

    test('second inversion of C major', () => {
      const secondInversion = ['G4', 'C5', 'E5'];
      expect(validateChord(['G4', 'C5', 'E5'], secondInversion)).toBe(true);
      expect(validateChord(['G3', 'C4', 'E4'], secondInversion)).toBe(true);
    });
  });
});

describe('getKeyStyle', () => {
  const chordNotes = ['C4', 'E4', 'G4'];

  describe('when not showing result', () => {
    test('returns selected for selected keys', () => {
      const selectedKeys = new Set(['C4', 'E4']);
      expect(getKeyStyle('C4', selectedKeys, chordNotes, false, false)).toBe('selected');
      expect(getKeyStyle('E4', selectedKeys, chordNotes, false, false)).toBe('selected');
    });

    test('returns normal for unselected keys', () => {
      const selectedKeys = new Set(['C4']);
      expect(getKeyStyle('D4', selectedKeys, chordNotes, false, false)).toBe('normal');
      expect(getKeyStyle('G4', selectedKeys, chordNotes, false, false)).toBe('normal');
    });
  });

  describe('when showing result', () => {
    describe('with correct answer', () => {
      test('shows selected chord notes as correct', () => {
        const selectedKeys = new Set(['C5', 'E5', 'G5']);
        expect(getKeyStyle('C5', selectedKeys, chordNotes, true, true)).toBe('correct');
        expect(getKeyStyle('E5', selectedKeys, chordNotes, true, true)).toBe('correct');
        expect(getKeyStyle('G5', selectedKeys, chordNotes, true, true)).toBe('correct');
      });

      test('shows unselected keys as normal', () => {
        const selectedKeys = new Set(['C5', 'E5', 'G5']);
        expect(getKeyStyle('D4', selectedKeys, chordNotes, true, true)).toBe('normal');
        expect(getKeyStyle('F4', selectedKeys, chordNotes, true, true)).toBe('normal');
      });

      test('does not show expected notes when answer is correct', () => {
        const selectedKeys = new Set(['C5', 'E5', 'G5']);
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, true)).toBe('normal');
        expect(getKeyStyle('E4', selectedKeys, chordNotes, true, true)).toBe('normal');
      });
    });

    describe('with incorrect answer', () => {
      test('shows wrong notes as wrong', () => {
        const selectedKeys = new Set(['C4', 'F4', 'G4']);
        expect(getKeyStyle('F4', selectedKeys, chordNotes, true, false)).toBe('wrong');
      });

      test('shows correct selected notes as correct', () => {
        const selectedKeys = new Set(['C4', 'F4', 'G4']);
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, false)).toBe('correct');
        expect(getKeyStyle('G4', selectedKeys, chordNotes, true, false)).toBe('correct');
      });

      test('shows expected notes that were not selected', () => {
        const selectedKeys = new Set(['C4', 'F4']);
        expect(getKeyStyle('E4', selectedKeys, chordNotes, true, false)).toBe('expected');
        expect(getKeyStyle('G4', selectedKeys, chordNotes, true, false)).toBe('expected');
      });
    });
  });
});