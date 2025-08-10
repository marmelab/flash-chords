import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface ChordControlsProps {
  showResult: boolean;
  isCorrect: boolean | null;
  onSubmit: () => void;
  onNewChord: () => void;
}

const ChordControls: React.FC<ChordControlsProps> = ({ 
  showResult, 
  onSubmit, 
  onNewChord 
}) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={onSubmit}
        disabled={showResult}
      >
        <Text style={[styles.submitButtonText, showResult && styles.disabledText]}>
          ✓ Submit
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.skipButton} onPress={onNewChord}>
        <Text style={styles.skipButtonText}>↻</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 15,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledText: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    width: 60,
    height: 53,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '400',
  },
});

export default ChordControls;