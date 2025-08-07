import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PianoKey from './PianoKey';
import ChordControls from './ChordControls';
import { chords, notes, getInversionName } from '../data/chords';
import { initAudio, playTone } from '../utils/audio';
import { validateChord, getKeyStyle as getKeyStyleUtil } from '../utils/chordValidation';
import { selectRandomFromDeck } from '../utils/deckGenerator';

const PianoKeyboard = ({ settings, chordDeck, onGoBack }) => {
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [currentChord, setCurrentChord] = useState(null);
  const [currentInversion, setCurrentInversion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    initAudio();
    generateNewChord();
  }, []);

  const generateNewChord = () => {
    // If we have a deck, select from it; otherwise fall back to all chords
    if (chordDeck && chordDeck.length > 0) {
      const selectedChordData = selectRandomFromDeck(chordDeck);
      
      if (selectedChordData) {
        setCurrentChord(selectedChordData.chord);
        setCurrentInversion(selectedChordData.inversion);
        setSelectedKeys(new Set());
        setShowResult(false);
        setIsCorrect(null);
        return;
      }
    }
    
    // Fallback: select from all chords (shouldn't happen with proper deck)
    const randomChord = chords[Math.floor(Math.random() * chords.length)];
    const availableInversions = Object.keys(randomChord.notes);
    const randomInversion = availableInversions[Math.floor(Math.random() * availableInversions.length)];
    
    setCurrentChord(randomChord);
    setCurrentInversion(randomInversion);
    setSelectedKeys(new Set());
    setShowResult(false);
    setIsCorrect(null);
  };

  const handleKeyPress = (note, frequency) => {
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

  const checkAnswer = () => {
    if (!currentChord || !currentInversion) return;
    
    const selectedArray = Array.from(selectedKeys);
    const correctArray = [...currentChord.notes[currentInversion]];
    
    const isAnswerCorrect = validateChord(selectedArray, correctArray);
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setTimeout(() => {
        generateNewChord();
      }, 1500);
    }
  };

  const getKeyStyle = (note) => {
    return getKeyStyleUtil(
      note,
      selectedKeys,
      currentChord?.notes[currentInversion] || [],
      showResult,
      isCorrect
    );
  };

  const getKeyPosition = (note, index, whiteKeyIndex) => {
    const whiteKeyWidth = 50;
    const blackKeyWidth = 30;
    
    if (note.type === 'white') {
      return whiteKeyIndex * whiteKeyWidth;
    }
    
    const blackKeyPositions = {
      'C#4': 1, 'D#4': 2, 'F#4': 4, 'G#4': 5, 'A#4': 6,
      'C#5': 8, 'D#5': 9, 'F#5': 11, 'G#5': 12, 'A#5': 13,
    };
    
    const whiteKeyPos = blackKeyPositions[note.note];
    return (whiteKeyPos * whiteKeyWidth) - (blackKeyWidth / 2);
  };

  const renderKeys = () => {
    const keys = [];
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
        onPress={onGoBack}
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
      
      <View style={styles.header}>
        <Text style={styles.chordName}>{currentChord?.name}</Text>
        <Text style={styles.inversionText}>{getInversionName(currentInversion)}</Text>
      </View>
      
      <View style={styles.keyboard}>
        {renderKeys()}
      </View>
      
      <ChordControls
        showResult={showResult}
        isCorrect={isCorrect}
        onSubmit={checkAnswer}
        onNewChord={generateNewChord}
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
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  chordName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  inversionText: {
    fontSize: 20,
    color: '#ecf0f1',
    fontStyle: 'italic',
  },
  keyboard: {
    height: 200,
    width: 700,
    position: 'relative',
  },
});

export default PianoKeyboard;