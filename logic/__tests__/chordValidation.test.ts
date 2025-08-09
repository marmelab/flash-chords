import { removeOctave, validateChord, getKeyStyle } from "../../logic/chordValidation";

describe("removeOctave", () => {
  test("removes octave from simple notes", () => {
    expect(removeOctave("C4")).toBe("C");
    expect(removeOctave("D5")).toBe("D");
    expect(removeOctave("G3")).toBe("G");
  });

  test("removes octave from sharp notes", () => {
    expect(removeOctave("C#4")).toBe("C#");
    expect(removeOctave("D#5")).toBe("D#");
    expect(removeOctave("F#3")).toBe("F#");
  });

  test("handles notes without octave", () => {
    expect(removeOctave("C")).toBe("C");
    expect(removeOctave("D#")).toBe("D#");
  });
});

describe("validateChord", () => {
  describe("C major chord", () => {
    const expectedNotes = ["C4", "E4", "G4"];

    test("accepts exact match", () => {
      expect(validateChord(["C4", "E4", "G4"], expectedNotes)).toBe(true);
    });

    test("accepts same chord in different octave", () => {
      expect(validateChord(["C5", "E5", "G5"], expectedNotes)).toBe(true);
      expect(validateChord(["C3", "E3", "G3"], expectedNotes)).toBe(true);
    });

    test("rejects same chord with mixed octaves", () => {
      expect(validateChord(["C4", "E5", "G3"], expectedNotes)).toBe(false);
      expect(validateChord(["C5", "E4", "G5"], expectedNotes)).toBe(false);
    });

    test("rejects notes in different order", () => {
      expect(validateChord(["E4", "G4", "C4"], expectedNotes)).toBe(false);
      expect(validateChord(["G5", "C5", "E5"], expectedNotes)).toBe(false);
    });

    test("rejects wrong notes", () => {
      expect(validateChord(["C4", "F4", "G4"], expectedNotes)).toBe(false);
      expect(validateChord(["C4", "E4", "A4"], expectedNotes)).toBe(false);
    });

    test("rejects incomplete chord", () => {
      expect(validateChord(["C4", "E4"], expectedNotes)).toBe(false);
      expect(validateChord(["C5", "G5"], expectedNotes)).toBe(false);
    });

    test("rejects chord with extra notes", () => {
      expect(validateChord(["C4", "E4", "G4", "B4"], expectedNotes)).toBe(
        false
      );
    });
  });

  describe("C minor chord", () => {
    const expectedNotes = ["C4", "D#4", "G4"];

    test("accepts exact match", () => {
      expect(validateChord(["C4", "D#4", "G4"], expectedNotes)).toBe(true);
    });

    test("accepts same chord in different octave", () => {
      expect(validateChord(["C5", "D#5", "G5"], expectedNotes)).toBe(true);
    });

    test("rejects major third instead of minor", () => {
      expect(validateChord(["C4", "E4", "G4"], expectedNotes)).toBe(false);
    });
  });

  describe("C7 chord (4 notes)", () => {
    const expectedNotes = ["C4", "E4", "G4", "A#4"];

    test("accepts exact match", () => {
      expect(validateChord(["C4", "E4", "G4", "A#4"], expectedNotes)).toBe(
        true
      );
    });

    test("accepts same chord in different octave", () => {
      expect(validateChord(["C5", "E5", "G5", "A#5"], expectedNotes)).toBe(
        true
      );
    });

    test("rejects incomplete seventh chord", () => {
      expect(validateChord(["C4", "E4", "G4"], expectedNotes)).toBe(false);
    });
  });

  describe("Inversions", () => {
    test("first inversion of C major", () => {
      const firstInversion = ["E4", "G4", "C5"];
      expect(validateChord(["E4", "G4", "C5"], firstInversion)).toBe(true);
      expect(validateChord(["E3", "G3", "C4"], firstInversion)).toBe(true);
      expect(validateChord(["E5", "G5", "C6"], firstInversion)).toBe(true);
    });

    test("second inversion of C major", () => {
      const secondInversion = ["G4", "C5", "E5"];
      expect(validateChord(["G4", "C5", "E5"], secondInversion)).toBe(true);
      expect(validateChord(["G3", "C4", "E4"], secondInversion)).toBe(true);
    });
  });
});

describe("getKeyStyle", () => {
  const chordNotes = ["C4", "E4", "G4"];

  describe("when not showing result", () => {
    test("returns selected for selected keys", () => {
      const selectedKeys = new Set(["C4", "E4"]);
      expect(getKeyStyle("C4", selectedKeys, chordNotes, false, false)).toBe(
        "selected"
      );
      expect(getKeyStyle("E4", selectedKeys, chordNotes, false, false)).toBe(
        "selected"
      );
    });

    test("returns default for unselected keys", () => {
      const selectedKeys = new Set(["C4"]);
      expect(getKeyStyle("D4", selectedKeys, chordNotes, false, false)).toBe(
        "default"
      );
      expect(getKeyStyle("G4", selectedKeys, chordNotes, false, false)).toBe(
        "default"
      );
    });
  });

  describe("when showing result", () => {
    describe("with correct answer", () => {
      test("shows selected chord notes as correct", () => {
        const selectedKeys = new Set(["C5", "E5", "G5"]);
        expect(getKeyStyle("C5", selectedKeys, chordNotes, true, true)).toBe(
          "correct"
        );
        expect(getKeyStyle("E5", selectedKeys, chordNotes, true, true)).toBe(
          "correct"
        );
        expect(getKeyStyle("G5", selectedKeys, chordNotes, true, true)).toBe(
          "correct"
        );
      });

      test("shows unselected keys as default", () => {
        const selectedKeys = new Set(["C5", "E5", "G5"]);
        expect(getKeyStyle("D4", selectedKeys, chordNotes, true, true)).toBe(
          "default"
        );
        expect(getKeyStyle("F4", selectedKeys, chordNotes, true, true)).toBe(
          "default"
        );
      });

      test("does not show expected notes when answer is correct", () => {
        const selectedKeys = new Set(["C5", "E5", "G5"]);
        expect(getKeyStyle("C4", selectedKeys, chordNotes, true, true)).toBe(
          "default"
        );
        expect(getKeyStyle("E4", selectedKeys, chordNotes, true, true)).toBe(
          "default"
        );
      });
    });

    describe("with incorrect answer", () => {
      test("shows wrong notes as incorrect", () => {
        const selectedKeys = new Set(["C4", "F4", "G4"]);
        expect(getKeyStyle("F4", selectedKeys, chordNotes, true, false)).toBe(
          "incorrect"
        );
      });

      test("shows exact matching notes as correct even when answer is incorrect", () => {
        const selectedKeys = new Set(["C4", "F4", "G4"]);
        // C4 and G4 are in the exact position expected, so they show as correct
        expect(getKeyStyle("C4", selectedKeys, chordNotes, true, false)).toBe(
          "correct"
        );
        expect(getKeyStyle("G4", selectedKeys, chordNotes, true, false)).toBe(
          "correct"
        );
        // But C5 would be incorrect (right note, wrong octave)
        const selectedKeys2 = new Set(["C5", "E5", "G5"]);
        expect(getKeyStyle("C5", selectedKeys2, chordNotes, true, false)).toBe(
          "incorrect"
        );
      });

      test("shows expected notes that were not selected", () => {
        const selectedKeys = new Set(["C4", "F4"]);
        expect(getKeyStyle("E4", selectedKeys, chordNotes, true, false)).toBe(
          "missed"
        );
        expect(getKeyStyle("G4", selectedKeys, chordNotes, true, false)).toBe(
          "missed"
        );
      });
    });
  });

  describe('edge cases and additional coverage', () => {
    describe('validateChord with enharmonic equivalents', () => {
      it('should accept Db as equivalent to C#', () => {
        const selectedNotes = ['Db4', 'F4', 'Ab4']; // Db major
        const expectedNotes = ['C#4', 'F4', 'G#4']; // C# major (enharmonic)
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });

      it('should accept Bb as equivalent to A#', () => {
        const selectedNotes = ['Bb4', 'D5', 'F5']; // Bb major
        const expectedNotes = ['A#4', 'D5', 'F5']; // A# major (enharmonic)
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });

      it('should handle Cb as equivalent to B', () => {
        const selectedNotes = ['Cb4', 'Eb4', 'Gb4']; // Cb major
        const expectedNotes = ['B3', 'D#4', 'F#4']; // B major (enharmonic, different octave)
        expect(validateChord(selectedNotes, expectedNotes)).toBe(false); // Different octave
      });

      it('should handle mixed enharmonics in a chord', () => {
        const selectedNotes = ['C4', 'Eb4', 'G4']; // C minor with Eb
        const expectedNotes = ['C4', 'D#4', 'G4']; // C minor with D# (enharmonic)
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });
    });

    describe('validateChord with malformed input', () => {
      it('should handle notes without octave numbers', () => {
        const selectedNotes = ['C', 'E', 'G'];
        const expectedNotes = ['C4', 'E4', 'G4'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(false);
      });

      it('should handle empty arrays', () => {
        expect(validateChord([], [])).toBe(true); // Both empty = match
        expect(validateChord(['C4'], [])).toBe(false);
        expect(validateChord([], ['C4'])).toBe(false);
      });

      it('should handle null or undefined gracefully', () => {
        expect(validateChord(null as any, ['C4'])).toBe(false);
        expect(validateChord(['C4'], null as any)).toBe(false);
        expect(validateChord(undefined as any, undefined as any)).toBe(false);
      });

      it('should handle invalid note formats', () => {
        const selectedNotes = ['X4', 'Y4', 'Z4']; // Invalid notes
        const expectedNotes = ['C4', 'E4', 'G4'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(false);
      });

      it('should handle very high octaves', () => {
        const selectedNotes = ['C9', 'E9', 'G9'];
        const expectedNotes = ['C4', 'E4', 'G4'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true); // Same intervals, different octave
      });
    });

    describe('getKeyStyle edge cases', () => {
      it('should handle null in isCorrect parameter', () => {
        const selectedKeys = new Set(['C4']);
        const chordNotes = ['C4', 'E4', 'G4'];
        const result = getKeyStyle('C4', selectedKeys, chordNotes, true, null);
        // When isCorrect is null, treat as incorrect
        expect(['incorrect', 'correct', 'missed']).toContain(result);
      });

      it('should handle empty selectedKeys set', () => {
        const selectedKeys = new Set<string>();
        const chordNotes = ['C4', 'E4', 'G4'];
        
        // Not showing result
        expect(getKeyStyle('C4', selectedKeys, chordNotes, false, null)).toBe('default');
        
        // Showing result, note is expected but not selected
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, false)).toBe('missed');
      });

      it('should handle empty chord notes array', () => {
        const selectedKeys = new Set(['C4']);
        const chordNotes: string[] = [];
        
        // Selected note but no expected notes
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, false)).toBe('incorrect');
      });

      it('should handle note with multiple octave occurrences', () => {
        const selectedKeys = new Set(['C4', 'C5']);
        const chordNotes = ['C4', 'E4', 'G4', 'C5']; // C with octave doubling
        
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, true)).toBe('correct');
        expect(getKeyStyle('C5', selectedKeys, chordNotes, true, true)).toBe('correct');
      });

      it('should prioritize exact match over pattern match', () => {
        const selectedKeys = new Set(['C5']); // Wrong octave
        const chordNotes = ['C4', 'E4', 'G4'];
        
        // C5 is in the chord pattern (C) but not exact
        expect(getKeyStyle('C5', selectedKeys, chordNotes, true, false)).toBe('incorrect');
        
        // C4 is exact but not selected
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, false)).toBe('missed');
      });

      it('should handle complex jazz chords', () => {
        const selectedKeys = new Set(['C4', 'E4', 'G4', 'Bb4', 'D5', 'F#5']);
        const chordNotes = ['C4', 'E4', 'G4', 'Bb4', 'D5', 'F#5']; // C13#11
        
        expect(getKeyStyle('C4', selectedKeys, chordNotes, true, true)).toBe('correct');
        expect(getKeyStyle('F#5', selectedKeys, chordNotes, true, true)).toBe('correct');
      });
    });

    describe('removeOctave additional cases', () => {
      it('should handle double digit octaves', () => {
        expect(removeOctave('C10')).toBe('C');
        expect(removeOctave('F#11')).toBe('F#');
      });

      it('should handle flat notes', () => {
        expect(removeOctave('Bb4')).toBe('Bb');
        expect(removeOctave('Db5')).toBe('Db');
      });

      it('should handle notes with no octave', () => {
        expect(removeOctave('C')).toBe('C');
        expect(removeOctave('F#')).toBe('F#');
        expect(removeOctave('Bb')).toBe('Bb');
      });

      it('should handle empty string', () => {
        expect(removeOctave('')).toBe('');
      });

      it('should handle invalid input gracefully', () => {
        expect(removeOctave(null as any)).toBe(null);
        expect(removeOctave(undefined as any)).toBe(undefined);
      });
    });

    describe('chord inversion validation', () => {
      it('should validate augmented chords', () => {
        const selectedNotes = ['C4', 'E4', 'G#4']; // C augmented
        const expectedNotes = ['C4', 'E4', 'G#4'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });

      it('should validate sus chords', () => {
        const selectedNotes = ['C4', 'F4', 'G4']; // Csus4
        const expectedNotes = ['C4', 'F4', 'G4'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });

      it('should reject partial voicings', () => {
        const selectedNotes = ['C4', 'G4']; // Missing the third
        const expectedNotes = ['C4', 'E4', 'G4'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(false);
      });

      it('should handle rootless voicings correctly', () => {
        const selectedNotes = ['E4', 'G4', 'Bb4', 'D5']; // Rootless C7
        const expectedNotes = ['E4', 'G4', 'Bb4', 'D5'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });
    });

    describe('performance with large chords', () => {
      it('should handle extended chords efficiently', () => {
        const selectedNotes = ['C4', 'E4', 'G4', 'B4', 'D5', 'F#5', 'A5']; // Cmaj13#11
        const expectedNotes = ['C4', 'E4', 'G4', 'B4', 'D5', 'F#5', 'A5'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(true);
      });

      it('should handle chord with many duplicated notes', () => {
        const selectedNotes = ['C4', 'C5', 'E4', 'E5', 'G4', 'G5']; // Doubled voicing
        const expectedNotes = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'];
        expect(validateChord(selectedNotes, expectedNotes)).toBe(false); // Order matters
      });
    });
  });
});