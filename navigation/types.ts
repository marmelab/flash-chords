import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import type { ExerciseSettings, ChordDeckItem } from '../types';
import type { DeckStats } from '../logic/flashcardLogic';

export type RootStackParamList = {
  Home: undefined;
  Practice: {
    settings: ExerciseSettings;
    chordDeck: ChordDeckItem[];
  };
  Summary: {
    deckStats: DeckStats;
  };
};

export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type PracticeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Practice'>;
export type SummaryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Summary'>;

export type PracticeScreenRouteProp = RouteProp<RootStackParamList, 'Practice'>;
export type SummaryScreenRouteProp = RouteProp<RootStackParamList, 'Summary'>;