import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { Audio } from 'expo-av';

const PianoKeyboard = () => {
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [currentChord, setCurrentChord] = useState(null);
  const [currentInversion, setCurrentInversion] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const chords = [
    { 
      name: 'C', 
      notes: {
        root: ['C4', 'E4', 'G4'],
        first: ['E4', 'G4', 'C5'],
        second: ['G4', 'C5', 'E5']
      }
    },
    { 
      name: 'Cm', 
      notes: {
        root: ['C4', 'D#4', 'G4'],
        first: ['D#4', 'G4', 'C5'],
        second: ['G4', 'C5', 'D#5']
      }
    },
    { 
      name: 'C7', 
      notes: {
        root: ['C4', 'E4', 'G4', 'A#4'],
        first: ['E4', 'G4', 'A#4', 'C5'],
        second: ['G4', 'A#4', 'C5', 'E5'],
        third: ['A#4', 'C5', 'E5', 'G5']
      }
    },
    { 
      name: 'Cmaj7', 
      notes: {
        root: ['C4', 'E4', 'G4', 'B4'],
        first: ['E4', 'G4', 'B4', 'C5'],
        second: ['G4', 'B4', 'C5', 'E5'],
        third: ['B4', 'C5', 'E5', 'G5']
      }
    },
    { 
      name: 'Cdim', 
      notes: {
        root: ['C4', 'D#4', 'F#4'],
        first: ['D#4', 'F#4', 'C5'],
        second: ['F#4', 'C5', 'D#5']
      }
    },
  ];

  const notes = [
    { note: 'C4', freq: 261.63, type: 'white' },
    { note: 'C#4', freq: 277.18, type: 'black' },
    { note: 'D4', freq: 293.66, type: 'white' },
    { note: 'D#4', freq: 311.13, type: 'black' },
    { note: 'E4', freq: 329.63, type: 'white' },
    { note: 'F4', freq: 349.23, type: 'white' },
    { note: 'F#4', freq: 369.99, type: 'black' },
    { note: 'G4', freq: 392.00, type: 'white' },
    { note: 'G#4', freq: 415.30, type: 'black' },
    { note: 'A4', freq: 440.00, type: 'white' },
    { note: 'A#4', freq: 466.16, type: 'black' },
    { note: 'B4', freq: 493.88, type: 'white' },
    { note: 'C5', freq: 523.25, type: 'white' },
    { note: 'C#5', freq: 554.37, type: 'black' },
    { note: 'D5', freq: 587.33, type: 'white' },
    { note: 'D#5', freq: 622.25, type: 'black' },
    { note: 'E5', freq: 659.25, type: 'white' },
    { note: 'F5', freq: 698.46, type: 'white' },
    { note: 'F#5', freq: 739.99, type: 'black' },
    { note: 'G5', freq: 783.99, type: 'white' },
    { note: 'G#5', freq: 830.61, type: 'black' },
    { note: 'A5', freq: 880.00, type: 'white' },
    { note: 'A#5', freq: 932.33, type: 'black' },
    { note: 'B5', freq: 987.77, type: 'white' },
  ];

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });
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
  
  const getInversionName = (inversion) => {
    const names = {
      root: 'root position',
      first: '1st inversion',
      second: '2nd inversion',
      third: '3rd inversion'
    };
    return names[inversion] || 'root position';
  };

  const playTone = async (frequency) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${generateTone(frequency)}` },
        { shouldPlay: true }
      );
      
      setTimeout(async () => {
        await sound.unloadAsync();
      }, 500);
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const generateTone = (frequency) => {
    const sampleRate = 44100;
    const duration = 0.3;
    const numSamples = sampleRate * duration;
    const amplitude = 0.3;
    
    const header = [
      0x52, 0x49, 0x46, 0x46,
      0x24, 0x08, 0x00, 0x00,
      0x57, 0x41, 0x56, 0x45,
      0x66, 0x6d, 0x74, 0x20,
      0x10, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00,
      0x44, 0xac, 0x00, 0x00,
      0x88, 0x58, 0x01, 0x00,
      0x02, 0x00, 0x10, 0x00,
      0x64, 0x61, 0x74, 0x61,
      0x00, 0x08, 0x00, 0x00
    ];

    const samples = [];
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const value = Math.sin(2 * Math.PI * frequency * t) * amplitude;
      const envelope = Math.exp(-t * 3);
      const sample = Math.round(value * envelope * 32767);
      samples.push(sample & 0xff);
      samples.push((sample >> 8) & 0xff);
    }

    const data = header.concat(samples);
    let binary = '';
    for (let i = 0; i < data.length; i++) {
      binary += String.fromCharCode(data[i]);
    }
    
    return btoa(binary);
  };

  const handleKeyPress = (note, frequency) => {
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

  const whiteKeyWidth = 50;
  const blackKeyWidth = 30;
  
  const getBlackKeyPosition = (noteIndex) => {
    const whiteKeyPositions = {
      'C#4': 1,   // Between C4 (index 0) and D4 (index 1)
      'D#4': 2,   // Between D4 (index 1) and E4 (index 2)
      'F#4': 4,   // Between F4 (index 3) and G4 (index 4)
      'G#4': 5,   // Between G4 (index 4) and A4 (index 5)
      'A#4': 6,   // Between A4 (index 5) and B4 (index 6)
      'C#5': 8,   // Between C5 (index 7) and D5 (index 8)
      'D#5': 9,   // Between D5 (index 8) and E5 (index 9)
      'F#5': 11,  // Between F5 (index 10) and G5 (index 11)
      'G#5': 12,  // Between G5 (index 11) and A5 (index 12)
      'A#5': 13,  // Between A5 (index 12) and B5 (index 13)
    };
    
    const whiteKeyPos = whiteKeyPositions[noteIndex];
    return (whiteKeyPos * whiteKeyWidth) - (blackKeyWidth / 2);
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

  const renderKeys = () => {
    const keys = [];
    let whiteKeyIndex = 0;
    
    notes.forEach((note, index) => {
      if (note.type === 'white') {
        const keyStyle = getKeyStyle(note.note);
        keys.push(
          <TouchableOpacity
            key={note.note}
            style={[
              styles.whiteKey, 
              { left: whiteKeyIndex * whiteKeyWidth },
              keyStyle === 'selected' && styles.selectedWhiteKey,
              keyStyle === 'correct' && styles.correctWhiteKey,
              keyStyle === 'expected' && styles.expectedWhiteKey,
              keyStyle === 'wrong' && styles.wrongWhiteKey
            ]}
            onPress={() => !showResult && handleKeyPress(note.note, note.freq)}
            activeOpacity={0.8}
            disabled={showResult}
          >
            <Text style={styles.whiteKeyText}>{note.note.replace(/[0-9]/g, '')}</Text>
          </TouchableOpacity>
        );
        whiteKeyIndex++;
      }
    });
    
    notes.forEach((note, index) => {
      if (note.type === 'black') {
        const position = getBlackKeyPosition(note.note);
        const keyStyle = getKeyStyle(note.note);
        keys.push(
          <TouchableOpacity
            key={note.note}
            style={[
              styles.blackKey, 
              { left: position },
              keyStyle === 'selected' && styles.selectedBlackKey,
              keyStyle === 'correct' && styles.correctBlackKey,
              keyStyle === 'expected' && styles.expectedBlackKey,
              keyStyle === 'wrong' && styles.wrongBlackKey
            ]}
            onPress={() => !showResult && handleKeyPress(note.note, note.freq)}
            activeOpacity={0.8}
            disabled={showResult}
          >
            <Text style={styles.blackKeyText}>{note.note.replace(/[0-9]/g, '')}</Text>
          </TouchableOpacity>
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
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[
            styles.submitButton,
            showResult && (isCorrect ? styles.correctButton : styles.incorrectButton)
          ]} 
          onPress={checkAnswer}
        >
          <Text style={styles.submitButtonText}>
            {!showResult ? 'Submit' : (isCorrect ? '✓' : '✗')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.newButton} onPress={generateNewChord}>
          <Text style={styles.newButtonText}>New Chord</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get('window');

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
  whiteKey: {
    position: 'absolute',
    width: 50,
    height: 200,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#333',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
  },
  selectedWhiteKey: {
    backgroundColor: '#3498db',
  },
  correctWhiteKey: {
    backgroundColor: '#27ae60',
  },
  expectedWhiteKey: {
    backgroundColor: '#27ae60',
  },
  wrongWhiteKey: {
    backgroundColor: '#e74c3c',
  },
  blackKey: {
    position: 'absolute',
    width: 30,
    height: 120,
    backgroundColor: 'black',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    zIndex: 1,
  },
  selectedBlackKey: {
    backgroundColor: '#2980b9',
  },
  correctBlackKey: {
    backgroundColor: '#229954',
  },
  expectedBlackKey: {
    backgroundColor: '#229954',
  },
  wrongBlackKey: {
    backgroundColor: '#c0392b',
  },
  whiteKeyText: {
    color: 'black',
    fontSize: 12,
    fontWeight: 'bold',
  },
  blackKeyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    marginTop: 40,
    gap: 20,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  correctButton: {
    backgroundColor: '#27ae60',
  },
  incorrectButton: {
    backgroundColor: '#e74c3c',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  newButton: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  newButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PianoKeyboard;