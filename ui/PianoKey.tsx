import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
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
  const [isPressed, setIsPressed] = React.useState(false);
  
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
        // Add pressed state for black keys
        if (!isWhite && isPressed) {
          colorStyle = styles.pressedBlackKey;
        }
        break;
    }
    
    return [baseStyle, positionStyle, colorStyle];
  };
  
  return (
    <TouchableOpacity
      style={getKeyStyles()}
      onPressIn={() => {
        if (!isWhite) setIsPressed(true);
        if (!disabled) onPress(note, frequency);
      }}
      onPressOut={() => !isWhite && setIsPressed(false)}
      activeOpacity={isWhite ? 0.8 : 1.0}
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
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#555',
    borderBottomWidth: 4,
    borderBottomColor: '#333',
    borderRightWidth: 2,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    borderRadius: 0,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  selectedWhiteKey: {
    backgroundColor: '#5DADE2',
    borderBottomWidth: 2,
  },
  correctWhiteKey: {
    backgroundColor: '#58D68D',
    borderBottomWidth: 2,
  },
  expectedWhiteKey: {
    backgroundColor: '#ABEBC6',
    borderBottomWidth: 2,
  },
  wrongWhiteKey: {
    backgroundColor: '#EC7063',
    borderBottomWidth: 2,
  },
  blackKey: {
    position: 'absolute',
    width: 30,
    height: 120,
    backgroundColor: '#1A1A1A',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 10,
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 8,
    borderRadius: 0,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    borderBottomWidth: 4,
    borderColor: '#0A0A0A',
  },
  selectedBlackKey: {
    backgroundColor: '#2E86C1',
    borderBottomWidth: 0,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  correctBlackKey: {
    backgroundColor: '#28B463',
    borderBottomWidth: 0,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  expectedBlackKey: {
    backgroundColor: '#52b788',
    borderBottomWidth: 0,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  wrongBlackKey: {
    backgroundColor: '#CB4335',
    borderBottomWidth: 0,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  pressedBlackKey: {
    backgroundColor: '#2D2D2D',
    borderBottomWidth: 0,
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.3,
  },
  whiteKeyText: {
    color: '#333',
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.7,
  },
  blackKeyText: {
    color: '#DDD',
    fontSize: 9,
    fontWeight: '600',
    opacity: 0.8,
  },
});

export default PianoKey;