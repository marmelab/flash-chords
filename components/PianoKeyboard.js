import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PianoKey from './PianoKey';
import ChordControls from './ChordControls';
import { chords, notes, getInversionName } from '../data/chords';
import { initAudio, playTone } from '../utils/audio';

const PianoKeyboard = () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [currentChord, setCurrentChord] = useState(null);
  const [currentInversion, setCurrentInversion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    initAudio();
    generateNewChord();
  }, []);

  const generateNewChord = () => {
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
    
    playTone(frequency);
    
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
    
    const selectedArray = Array.from(selectedKeys).sort();
    const correctArray = [...currentChord.notes[currentInversion]].sort();
    
    const isAnswerCorrect = 
      selectedArray.length === correctArray.length &&
      selectedArray.every((note, index) => note === correctArray[index]);
    
    setIsCorrect(isAnswerCorrect);
    setShowResult(true);
    
    if (isAnswerCorrect) {
      setTimeout(() => {
        generateNewChord();
      }, 1500);
    }
  };

  const getKeyStyle = (note) => {
    if (!showResult) {
      return selectedKeys.has(note) ? 'selected' : 'normal';
    }
    
    const isInChord = currentChord.notes[currentInversion].includes(note);
    const isSelected = selectedKeys.has(note);
    
    if (isInChord && isSelected) {
      return 'correct';
    } else if (isInChord && !isSelected) {
      return 'expected';
    } else if (!isInChord && isSelected) {
      return 'wrong';
    }
    return 'normal';
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