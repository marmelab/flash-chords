import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { Audio } from 'expo-av';

const PianoKeyboard = () => {
  const [sounds, setSounds] = useState({});

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
  }, []);

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

  const playNote = (frequency) => {
    playTone(frequency);
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

  const renderKeys = () => {
    const keys = [];
    let whiteKeyIndex = 0;
    
    notes.forEach((note, index) => {
      if (note.type === 'white') {
        keys.push(
          <TouchableOpacity
            key={note.note}
            style={[styles.whiteKey, { left: whiteKeyIndex * whiteKeyWidth }]}
            onPress={() => playNote(note.freq)}
            activeOpacity={0.8}
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
        keys.push(
          <TouchableOpacity
            key={note.note}
            style={[styles.blackKey, { left: position }]}
            onPress={() => playNote(note.freq)}
            activeOpacity={0.8}
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
      <View style={styles.keyboard}>
        {renderKeys()}
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
});

export default PianoKeyboard;