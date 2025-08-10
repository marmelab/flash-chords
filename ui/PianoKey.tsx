import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import type { PianoKeyComponent, KeyStyle, NoteType } from '../types';

interface PianoKeyProps {
  note: string;
  frequency: number;
  type: NoteType;
  position: number;
  keyStyle?: KeyStyle;
  onPress: (note: string, frequency: number) => void;
  disabled?: boolean;
  showNoteName?: boolean;
}

const PianoKey: PianoKeyComponent = ({ 
  note, 
  frequency, 
  type, 
  position, 
  keyStyle = 'default', 
  onPress, 
  disabled = false,
  showNoteName = false 
}) => {
  const isWhite = type === 'white';
  
  const getKeyStyles = () => {
    const baseStyle = isWhite ? styles.whiteKey : styles.blackKey;
    const positionStyle = { left: position };
    
    let colorStyle = {};
    switch(keyStyle) {
      case 'selected':
        colorStyle = isWhite ? styles.selectedWhiteKey : styles.selectedBlackKey;
        break;
      case 'correct':
        colorStyle = isWhite ? styles.correctWhiteKey : styles.correctBlackKey;
        break;
      case 'missed':
        colorStyle = isWhite ? styles.expectedWhiteKey : styles.expectedBlackKey;
        break;
      case 'incorrect':
        colorStyle = isWhite ? styles.wrongWhiteKey : styles.wrongBlackKey;
        break;
      case 'extra':
        colorStyle = isWhite ? styles.wrongWhiteKey : styles.wrongBlackKey;
        break;
      case 'default':
      default:
        // No additional color style
        break;
    }
    
    return [baseStyle, positionStyle, colorStyle];
  };
  
  return (
    <TouchableOpacity
      style={getKeyStyles()}
      onPress={() => onPress(note, frequency)}
      activeOpacity={0.8}
      disabled={disabled}
    >
      {showNoteName && (
        <Text style={isWhite ? styles.whiteKeyText : styles.blackKeyText}>
          {note.replace(/[0-9]/g, '')}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: '#95d5b2',  // Lighter green for expected keys
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
    backgroundColor: '#52b788',  // Lighter green for expected black keys
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
});

export default PianoKey;