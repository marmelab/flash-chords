import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import HomeScreen from './ui/HomeScreen';
import PianoKeyboard from './ui/PianoKeyboard';
import { generateChordDeck } from './logic/deckGenerator';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [exerciseSettings, setExerciseSettings] = useState(null);
  const [chordDeck, setChordDeck] = useState(null);

  const handleStartExercise = (settings) => {
    // Generate the chord deck based on settings
    const deck = generateChordDeck(settings);
    
    setExerciseSettings(settings);
    setChordDeck(deck);
    setCurrentScreen('practice');
  };

  const handleGoBack = () => {
    setCurrentScreen('home');
    setExerciseSettings(null);
    setChordDeck(null);
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'home' ? (
        <HomeScreen onStartExercise={handleStartExercise} />
      ) : (
        <PianoKeyboard 
          settings={exerciseSettings} 
          chordDeck={chordDeck}
          onGoBack={handleGoBack} 
        />
      )}
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
});
