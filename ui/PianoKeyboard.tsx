import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import PianoKey from './PianoKey';
import ChordControls from './ChordControls';
import { notes, getInversionName } from '../data/chords';
import { initAudio, playTone } from '../logic/audio';
import { generateNewChord, checkAnswer, getKeyStyleForNote } from '../logic/practiceLogic';
import type { 
  PianoKeyboardComponent, 
  Chord, 
  InversionType, 
  Note, 
  KeyStyle 
} from '../types';

// Helper functions for orientation control
const lockToLandscape = (): void => {
  if (Platform.OS === 'web') return;
  
  // Use promise-based approach instead of async/await
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    .then(() => {
      console.log('Locked to landscape');
    })
    .catch((error) => {
      console.log('Could not lock orientation:', error);
    });
};

const unlockOrientation = (): void => {
  if (Platform.OS === 'web') return;
  
  // First set to portrait, then unlock to allow both orientations
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    .then(() => {
      // After setting to portrait, unlock to allow rotation
      return ScreenOrientation.unlockAsync();
    })
    .then(() => {
      console.log('Reset to portrait and unlocked');
    })
    .catch((error) => {
      console.log('Could not reset orientation:', error);
    });
};

const PianoKeyboard: PianoKeyboardComponent = ({ settings, chordDeck, onGoBack }) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [currentInversion, setCurrentInversion] = useState<InversionType>('root');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Lock to landscape when component mounts
    lockToLandscape();
    
    initAudio();
    handleGenerateNewChord();
    
    // Cleanup: unlock orientation when component unmounts
    return () => {
      unlockOrientation();
    };
  }, []);

  const handleGenerateNewChord = (): void => {
    const result = generateNewChord(chordDeck);
    if (result) {
      const { chord, inversion } = result;
      setCurrentChord(chord);
      setCurrentInversion(inversion);
      setSelectedKeys(new Set());
      setShowResult(false);
      setIsCorrect(null);
    }
  };

  const handleKeyPress = (note: string, frequency: number): void => {
    if (showResult) return;
    
    if (soundEnabled) {
      playTone(frequency);
    }
    
    const newSelectedKeys = new Set(selectedKeys);
    if (newSelectedKeys.has(note)) {
      newSelectedKeys.delete(note);
    } else {
      newSelectedKeys.add(note);
    }
    setSelectedKeys(newSelectedKeys);
  };

  const handleCheckAnswer = (): void => {
    const isAnswerCorrect = checkAnswer(selectedKeys, currentChord, currentInversion);
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setTimeout(() => {
        handleGenerateNewChord();
      }, 1500);
    }
  };

  const getKeyStyle = (note: string): KeyStyle => {
    return getKeyStyleForNote(
      note,
      selectedKeys,
      currentChord,
      currentInversion,
      showResult,
      isCorrect
    );
  };

  const getKeyPosition = (note: Note, index: number, whiteKeyIndex: number): number => {
    const whiteKeyWidth = 50;
    const blackKeyWidth = 30;
    
    if (note.type === 'white') {
      return whiteKeyIndex * whiteKeyWidth;
    }
    
    const blackKeyPositions: Record<string, number> = {
      'C#4': 1, 'D#4': 2, 'F#4': 4, 'G#4': 5, 'A#4': 6,
      'C#5': 8, 'D#5': 9, 'F#5': 11, 'G#5': 12, 'A#5': 13,
    };
    
    const whiteKeyPos = blackKeyPositions[note.note];
    return (whiteKeyPos * whiteKeyWidth) - (blackKeyWidth / 2);
  };

  const renderKeys = (): React.ReactElement[] => {
    const keys: React.ReactElement[] = [];
    let whiteKeyIndex = 0;
    
    // Render white keys first
    notes.forEach((note) => {
      if (note.type === 'white') {
        keys.push(
          <PianoKey
            key={note.note}
            note={note.note}
            frequency={note.freq}
            type={note.type}
            position={getKeyPosition(note, 0, whiteKeyIndex)}
            keyStyle={getKeyStyle(note.note)}
            onPress={handleKeyPress}
            disabled={showResult}
          />
        );
        whiteKeyIndex++;
      }
    });
    
    // Render black keys on top
    notes.forEach((note) => {
      if (note.type === 'black') {
        keys.push(
          <PianoKey
            key={note.note}
            note={note.note}
            frequency={note.freq}
            type={note.type}
            position={getKeyPosition(note, 0, 0)}
            keyStyle={getKeyStyle(note.note)}
            onPress={handleKeyPress}
            disabled={showResult}
          />
        );
      }
    });
    
    return keys;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          unlockOrientation();
          onGoBack();
        }}
      >
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.soundToggle}
        onPress={() => setSoundEnabled(!soundEnabled)}
      >
        <Text style={styles.soundToggleText}>
          {soundEnabled ? '🔊' : '🔇'}
        </Text>
      </TouchableOpacity>
      
      <View style={[
        styles.chordCard,
        showResult && (isCorrect ? styles.correctCard : styles.incorrectCard)
      ]}>
        <View style={styles.chordCardContent}>
          <View style={styles.iconSpace}>
            {showResult && (
              <Text style={styles.feedbackIcon}>
                {isCorrect ? '✓' : '✗'}
              </Text>
            )}
          </View>
          <Text style={styles.chordText}>
            {currentChord?.name} - {getInversionName(currentInversion)}
          </Text>
          <View style={styles.iconSpace} />
        </View>
      </View>
      
      <View style={styles.keyboard}>
        {renderKeys()}
      </View>
      
      <ChordControls
        showResult={showResult}
        isCorrect={isCorrect}
        onSubmit={handleCheckAnswer}
        onNewChord={handleGenerateNewChord}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  soundToggle: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  soundToggleText: {
    fontSize: 24,
  },
  chordCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 50, // Prevent layout shift
  },
  correctCard: {
    backgroundColor: 'rgba(39, 174, 96, 0.2)',
    borderColor: '#27ae60',
  },
  incorrectCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)',
    borderColor: '#e74c3c',
  },
  chordCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconSpace: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chordText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flexShrink: 1,
  },
  feedbackIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  keyboard: {
    height: 200,
    width: 700,
    position: 'relative',
  },
});

export default PianoKeyboard;