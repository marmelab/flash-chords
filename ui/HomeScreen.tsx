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
import type { 
  HomeScreenComponent, 
  KeyOption, 
  ChordQuality, 
  ExtensionType,
  ExerciseSettings 
} from '../types';

// Generate all 24 key options (12 major + 12 minor)
// Using the most common enharmonic spellings
const keyOptions: KeyOption[] = [
  // Major keys
  { value: 'C', label: 'C' },
  { value: 'Db', label: 'Db' },
  { value: 'D', label: 'D' },
  { value: 'Eb', label: 'Eb' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'F#', label: 'F#' },
  { value: 'G', label: 'G' },
  { value: 'Ab', label: 'Ab' },
  { value: 'A', label: 'A' },
  { value: 'Bb', label: 'Bb' },
  { value: 'B', label: 'B' },
  // Minor keys
  { value: 'Cm', label: 'Cm' },
  { value: 'C#m', label: 'C#m' },
  { value: 'Dm', label: 'Dm' },
  { value: 'Ebm', label: 'Ebm' },
  { value: 'Em', label: 'Em' },
  { value: 'Fm', label: 'Fm' },
  { value: 'F#m', label: 'F#m' },
  { value: 'Gm', label: 'Gm' },
  { value: 'G#m', label: 'G#m' },
  { value: 'Am', label: 'Am' },
  { value: 'Bbm', label: 'Bbm' },
  { value: 'Bm', label: 'Bm' },
];

const HomeScreen: HomeScreenComponent = ({ onStartExercise }) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['C']); // Multiple selection, default to C major
  const [selectedQualities, setSelectedQualities] = useState<ChordQuality[]>(['major', 'minor', 'diminished', 'dominant']); // Chord qualities
  const [selectedExtensions, setSelectedExtensions] = useState<ExtensionType[]>(['triads']); // triads or sevenths
  const [selectedInversions, setSelectedInversions] = useState<string[]>(['root']); // Multiple selection, default to root

  const handleStart = (): void => {
    // Validate selections
    if (selectedKeys.length === 0) {
      alert('Please select at least one key');
      return;
    }
    if (selectedQualities.length === 0) {
      alert('Please select at least one chord quality');
      return;
    }
    if (selectedExtensions.length === 0) {
      alert('Please select triads or 7ths');
      return;
    }
    if (selectedInversions.length === 0) {
      alert('Please select at least one inversion');
      return;
    }

    const settings: ExerciseSettings = {
      selectedKeys,
      selectedQualities,
      selectedExtensions,
      inversions: {
        root: selectedInversions.includes('root'),
        first: selectedInversions.includes('first'),
        second: selectedInversions.includes('second'),
      },
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
            {keyOptions.slice(0, 12).map((key) => {
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
          <View style={styles.keyContainer}>
            {keyOptions.slice(12).map((key) => {
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
          <Text style={styles.sectionTitle}>Chord Qualities</Text>
          <View style={styles.chipContainer}>
            {[
              { label: 'Major', value: 'major' as ChordQuality },
              { label: 'Minor', value: 'minor' as ChordQuality },
              { label: 'Diminished', value: 'diminished' as ChordQuality },
              { label: 'Dominant', value: 'dominant' as ChordQuality },
            ].map((quality) => {
              const isSelected = selectedQualities.includes(quality.value);
              return (
                <TouchableOpacity
                  key={quality.value}
                  style={[
                    styles.chip,
                    isSelected && styles.selectedChip,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedQualities(selectedQualities.filter(q => q !== quality.value));
                    } else {
                      setSelectedQualities([...selectedQualities, quality.value]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {quality.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extensions</Text>
          <View style={styles.chipContainer}>
            {[
              { label: 'Triads', value: 'triads' as ExtensionType },
              { label: '7ths', value: 'sevenths' as ExtensionType },
            ].map((extension) => {
              const isSelected = selectedExtensions.includes(extension.value);
              return (
                <TouchableOpacity
                  key={extension.value}
                  style={[
                    styles.chip,
                    isSelected && styles.selectedChip,
                  ]}
                  onPress={() => {
                    if (isSelected) {
                      setSelectedExtensions(selectedExtensions.filter(e => e !== extension.value));
                    } else {
                      setSelectedExtensions([...selectedExtensions, extension.value]);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected && styles.selectedChipText,
                    ]}
                  >
                    {extension.label}
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