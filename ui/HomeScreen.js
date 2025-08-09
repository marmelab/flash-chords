import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { keyOptions } from '../data/diatonicChords';

const HomeScreen = ({ onStartExercise }) => {
  const [selectedInversions, setSelectedInversions] = useState(['root']); // Multiple selection, default to root
  const [selectedKeys, setSelectedKeys] = useState(['C']); // Multiple selection, default to C
  const [selectedChordTypes, setSelectedChordTypes] = useState(['major-triads']); // Multiple selection, default to major triads

  const handleStart = () => {
    // Validate that at least one inversion is selected
    if (selectedInversions.length === 0) {
      alert('Please select at least one inversion type');
      return;
    }
    
    // Validate that at least one key is selected
    if (selectedKeys.length === 0) {
      alert('Please select at least one key');
      return;
    }
    
    // Validate that at least one chord type is selected
    if (selectedChordTypes.length === 0) {
      alert('Please select at least one chord type');
      return;
    }

    const settings = {
      inversions: {
        root: selectedInversions.includes('root'),
        first: selectedInversions.includes('first'),
        second: selectedInversions.includes('second'),
      },
      selectedKeys,
      selectedChordTypes,
    };

    onStartExercise(settings);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Piano Chord Practice</Text>
          <Text style={styles.subtitle}>Configure your exercise</Text>
        </View>

      <View style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Keys</Text>
          <View style={styles.keyContainer}>
            {keyOptions.map((key) => {
              const isSelected = selectedKeys.includes(key.value);
              return (
                <TouchableOpacity
                  key={key.value}
                  style={[
                    styles.keyButton,
                    isSelected && styles.selectedKeyButton,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      // Remove key if already selected
                      setSelectedKeys(selectedKeys.filter(k => k !== key.value));
                    } else {
                      // Add key if not selected
                      setSelectedKeys([...selectedKeys, key.value]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.keyButtonText,
                      isSelected && styles.selectedKeyButtonText,
                    ]}
                  >
                    {key.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chord Types</Text>
          <View style={styles.chipContainer}>
            {[
              { label: 'Major Triads', value: 'major-triads' },
              { label: 'Major 7ths', value: 'major-sevenths' },
              { label: 'Minor Triads', value: 'minor-triads' },
              { label: 'Minor 7ths', value: 'minor-sevenths' },
            ].map((chordType) => {
              const isSelected = selectedChordTypes.includes(chordType.value);
              return (
                <TouchableOpacity
                  key={chordType.value}
                  style={[
                    styles.chip,
                    isSelected && styles.selectedChip,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedChordTypes(selectedChordTypes.filter(t => t !== chordType.value));
                    } else {
                      setSelectedChordTypes([...selectedChordTypes, chordType.value]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {chordType.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inversions</Text>
          <View style={styles.chipContainer}>
            {[
              { label: 'Root', value: 'root' },
              { label: '1st', value: 'first' },
              { label: '2nd', value: 'second' },
            ].map((inversion) => {
              const isSelected = selectedInversions.includes(inversion.value);
              return (
                <TouchableOpacity
                  key={inversion.value}
                  style={[
                    styles.chip,
                    isSelected && styles.selectedChip,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedInversions(selectedInversions.filter(i => i !== inversion.value));
                    } else {
                      setSelectedInversions([...selectedInversions, inversion.value]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {inversion.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
          <Text style={styles.startButtonText}>Start Practice</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#ecf0f1',
  },
  settingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 15,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  chip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedChip: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  chipText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedChipText: {
    color: 'white',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  keyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  keyButton: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedKeyButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  keyButtonText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedKeyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default HomeScreen;