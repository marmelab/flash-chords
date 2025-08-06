import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChordControls = ({ showResult, isCorrect, onSubmit, onNewChord }) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={[
          styles.submitButton,
          showResult && (isCorrect ? styles.correctButton : styles.incorrectButton)
        ]} 
        onPress={onSubmit}
      >
        <Text style={styles.submitButtonText}>
          {!showResult ? 'Submit' : (isCorrect ? '✓' : '✗')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.newButton} onPress={onNewChord}>
        <Text style={styles.newButtonText}>New Chord</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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

export default ChordControls;