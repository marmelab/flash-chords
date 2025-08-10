import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import HomeScreen from './ui/HomeScreen';
import PianoKeyboard from './ui/PianoKeyboard';
import SummaryScreen from './ui/SummaryScreen';
import { generateChordDeck } from './logic/deckGenerator';
import type { DeckStats } from './logic/flashcardLogic';
import type { 
  ScreenType, 
  ExerciseSettings, 
  ChordDeckItem 
} from './types';

export default function App(): React.ReactElement {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [exerciseSettings, setExerciseSettings] = useState<ExerciseSettings | null>(null);
  const [chordDeck, setChordDeck] = useState<ChordDeckItem[] | null>(null);
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);

  const handleStartExercise = (settings: ExerciseSettings): void => {
    // Generate the chord deck based on settings
    const deck = generateChordDeck(settings);
    
    setExerciseSettings(settings);
    setChordDeck(deck);
    setCurrentScreen('practice');
  };

  const handleGoBack = (): void => {
    setCurrentScreen('home');
    setExerciseSettings(null);
    setChordDeck(null);
    setDeckStats(null);
  };

  const handleExerciseComplete = (stats: DeckStats): void => {
    setDeckStats(stats);
    setCurrentScreen('summary');
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentScreen === 'home' && (
        <HomeScreen onStartExercise={handleStartExercise} />
      )}
      {currentScreen === 'practice' && (
        <PianoKeyboard 
          settings={exerciseSettings!} 
          chordDeck={chordDeck!}
          onGoBack={handleGoBack}
          onExerciseComplete={handleExerciseComplete}
        />
      )}
      {currentScreen === 'summary' && (
        <SummaryScreen 
          deckStats={deckStats!}
          onGoHome={handleGoBack}
        />
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
});