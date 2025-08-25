import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Chord, InversionType } from '../../types';

interface ChordCardProps {
  chord: Chord | null;
  inversion: InversionType;
  showResult: boolean;
  isCorrect: boolean | null;
  audioMode: boolean;
  waitingForChord: boolean;
  lastDetectedChord: string | null;
}

const ChordCard: React.FC<ChordCardProps> = ({
  chord,
  inversion,
  showResult,
  isCorrect,
  audioMode,
  waitingForChord,
  lastDetectedChord,
}) => {
  const getCardStyle = () => {
    const baseStyle = styles.chordCard;
    if (!showResult) return [baseStyle, styles.defaultCard];
    return [baseStyle, isCorrect ? styles.correctCard : styles.incorrectCard];
  };

  const getChordDisplayText = () => {
    if (!chord) return '';
    const inversionMap: Record<InversionType, string> = {
      root: '',
      first: ' (1st inv)',
      second: ' (2nd inv)',
      third: ' (3rd inv)',
    };
    return `${chord.name}${inversionMap[inversion]}`;
  };

  return (
    <View style={getCardStyle()}>
      <Text style={styles.chordText}>{getChordDisplayText()}</Text>
      {audioMode && waitingForChord && (
        <Text style={styles.detectedChordText}>
          {lastDetectedChord ? `Detected: ${lastDetectedChord}` : 'Listening...'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chordCard: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 2,
    minWidth: 180,
    alignItems: 'center',
  },
  defaultCard: {
    backgroundColor: '#34495e',
    borderColor: '#2c3e50',
  },
  correctCard: {
    backgroundColor: '#27ae60',
    borderColor: '#229954',
  },
  incorrectCard: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  chordText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '300',
  },
  detectedChordText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 5,
  },
});

export default ChordCard;