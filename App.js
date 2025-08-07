import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import HomeScreen from './components/HomeScreen';
import PianoKeyboard from './components/PianoKeyboard';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [exerciseSettings, setExerciseSettings] = useState(null);

  const handleStartExercise = (settings) => {
    setExerciseSettings(settings);
    setCurrentScreen('practice');
  };

  const handleGoBack = () => {
    setCurrentScreen('home');
    setExerciseSettings(null);
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'home' ? (
        <HomeScreen onStartExercise={handleStartExercise} />
      ) : (
        <PianoKeyboard settings={exerciseSettings} onGoBack={handleGoBack} />
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
