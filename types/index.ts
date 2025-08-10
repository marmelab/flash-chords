// Core types for the flash cards piano chord practice app

// Note and Musical Types
export type NoteType = 'white' | 'black';

export interface Note {
  note: string;
  freq: number;
  type: NoteType;
}

// Chord and Inversion Types
export type InversionType = 'root' | 'first' | 'second' | 'third';
export type ChordQuality = 'major' | 'minor' | 'diminished' | 'dominant';
export type ExtensionType = 'triads' | 'sevenths';

export interface ChordInversions {
  root?: string[];
  first?: string[];
  second?: string[];
  third?: string[];
}

export interface Chord {
  name: string;
  notes: ChordInversions;
}

export interface ChordDeckItem {
  chord: Chord;
  inversion: InversionType;
  name: string;
  notes: string[];
}

// Key and Scale Types
export interface KeyOption {
  value: string;
  label: string;
}

export interface DiatonicChordSet {
  triads: string[];
  sevenths: string[];
}

export type DiatonicChords = Record<string, DiatonicChordSet>;

// Settings and Configuration Types
export interface InversionSettings {
  root: boolean;
  first: boolean;
  second: boolean;
}

export interface ExerciseSettings {
  selectedKeys: string[];
  selectedQualities: ChordQuality[];
  selectedExtensions: ExtensionType[];
  inversions: InversionSettings;
}

// Piano Key and UI Types
export type KeyStyle = 
  | 'default' 
  | 'selected' 
  | 'correct' 
  | 'incorrect' 
  | 'missed' 
  | 'extra';

export interface PianoKeyProps {
  note: string;
  frequency: number;
  type: NoteType;
  position: number;
  keyStyle: string;
  onPress: (note: string, frequency: number) => void;
  disabled: boolean;
  showNoteName?: boolean;
}

// Component Props Types
export interface HomeScreenProps {
  onStartExercise: (settings: ExerciseSettings) => void;
}

export interface ChordControlsProps {
  showResult: boolean;
  isCorrect: boolean | null;
  onSubmit: () => void;
  onNewChord: () => void;
}

export interface PianoKeyboardProps {
  settings: ExerciseSettings;
  chordDeck: ChordDeckItem[];
  onGoBack: () => void;
  onExerciseComplete: (stats: any) => void;
}

// Practice Logic Types
export interface ChordPracticeState {
  selectedKeys: Set<string>;
  currentChord: Chord | null;
  currentInversion: InversionType;
  showResult: boolean;
  isCorrect: boolean | null;
  soundEnabled: boolean;
}

export interface GeneratedChord {
  chord: Chord;
  inversion: InversionType;
}

// Audio Types
export interface AudioContextState {
  context: any; // Will be AudioContext in browser
  gainNode: any; // Will be GainNode in browser
  isInitialized: boolean;
}

// Screen Types
export type ScreenType = 'home' | 'practice' | 'summary';

// Validation Types
export interface ValidationResult {
  isCorrect: boolean;
  missingNotes: string[];
  extraNotes: string[];
}

// Enharmonic and Note Utility Types
export type EnharmonicMap = Record<string, string>;

export interface NoteInterval {
  note: string;
  semitones: number;
}

// App State Type
export interface AppState {
  currentScreen: ScreenType;
  exerciseSettings: ExerciseSettings | null;
  chordDeck: ChordDeckItem[] | null;
}

// Function Types
export type ChordGenerator = (root: string) => ChordInversions;
export type NoteValidator = (selectedNotes: string[], correctNotes: string[]) => boolean;
export type KeyStyleCalculator = (
  note: string,
  selectedKeys: Set<string>,
  expectedNotes: string[],
  showResult: boolean,
  isCorrect: boolean | null
) => KeyStyle;

// React Component Types (extending React.FC for better type checking)
export type HomeScreenComponent = React.FC<HomeScreenProps>;
export type PianoKeyboardComponent = React.FC<PianoKeyboardProps>;
export type PianoKeyComponent = React.FC<PianoKeyProps>;
export type ChordControlsComponent = React.FC<ChordControlsProps>;