import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import HomeScreen from './ui/homescreen/HomeScreen';
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
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <View style={styles.container}>
        <StatusBar style="light" />
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
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#000000' : '#2c3e50',
  },
});