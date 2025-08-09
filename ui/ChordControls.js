import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const ChordControls = ({ showResult, isCorrect, onSubmit, onNewChord }) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity 
        style={styles.submitButton} 
        onPress={onSubmit}
        disabled={showResult}
      >
        <Text style={[styles.submitButtonText, showResult && styles.disabledText]}>
          Submit
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
  disabledText: {
    opacity: 0.5,
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