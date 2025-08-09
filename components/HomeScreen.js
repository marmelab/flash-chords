import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  ScrollView,
} from 'react-native';
import { keyOptions } from '../data/diatonicChords';

const HomeScreen = ({ onStartExercise }) => {
  const [includeRoot, setIncludeRoot] = useState(true);
  const [includeFirst, setIncludeFirst] = useState(true);
  const [includeSecond, setIncludeSecond] = useState(true);
  const [selectedKey, setSelectedKey] = useState('all');
  const [chordType, setChordType] = useState('major-triads'); // 'major-triads', 'major-sevenths', 'minor-triads', 'minor-sevenths'

  const handleStart = () => {
    // Validate that at least one inversion is selected
    if (!includeRoot && !includeFirst && !includeSecond) {
      alert('Please select at least one inversion type');
      return;
    }

    const settings = {
      inversions: {
        root: includeRoot,
        first: includeFirst,
        second: includeSecond,
      },
      selectedKey,
      chordType,
    };

    onStartExercise(settings);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Piano Chord Practice</Text>
        <Text style={styles.subtitle}>Configure your exercise</Text>
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Inversions to Include</Text>
          
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Root Position</Text>
            <Switch
              value={includeRoot}
              onValueChange={setIncludeRoot}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={includeRoot ? '#3498db' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>1st Inversion</Text>
            <Switch
              value={includeFirst}
              onValueChange={setIncludeFirst}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={includeFirst ? '#3498db' : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>2nd Inversion</Text>
            <Switch
              value={includeSecond}
              onValueChange={setIncludeSecond}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={includeSecond ? '#3498db' : '#f4f3f4'}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Selection</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.keySelector}>
            {keyOptions.map((key) => (
              <TouchableOpacity
                key={key.value}
                style={[
                  styles.keyButton,
                  selectedKey === key.value && styles.selectedKeyButton,
                ]}
                onPress={() => setSelectedKey(key.value)}
              >
                <Text
                  style={[
                    styles.keyButtonText,
                    selectedKey === key.value && styles.selectedKeyButtonText,
                  ]}
                >
                  {key.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chord Types</Text>
          <View style={styles.chordTypeGrid}>
            <TouchableOpacity
              style={[
                styles.chordTypeButton,
                chordType === 'major-triads' && styles.selectedChordTypeButton,
              ]}
              onPress={() => setChordType('major-triads')}
            >
              <Text
                style={[
                  styles.chordTypeButtonText,
                  chordType === 'major-triads' && styles.selectedChordTypeButtonText,
                ]}
              >
                Major Triads
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chordTypeButton,
                chordType === 'major-sevenths' && styles.selectedChordTypeButton,
              ]}
              onPress={() => setChordType('major-sevenths')}
            >
              <Text
                style={[
                  styles.chordTypeButtonText,
                  chordType === 'major-sevenths' && styles.selectedChordTypeButtonText,
                ]}
              >
                Major 7ths
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chordTypeButton,
                chordType === 'minor-triads' && styles.selectedChordTypeButton,
              ]}
              onPress={() => setChordType('minor-triads')}
            >
              <Text
                style={[
                  styles.chordTypeButtonText,
                  chordType === 'minor-triads' && styles.selectedChordTypeButtonText,
                ]}
              >
                Minor Triads
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chordTypeButton,
                chordType === 'minor-sevenths' && styles.selectedChordTypeButton,
              ]}
              onPress={() => setChordType('minor-sevenths')}
            >
              <Text
                style={[
                  styles.chordTypeButtonText,
                  chordType === 'minor-sevenths' && styles.selectedChordTypeButtonText,
                ]}
              >
                Minor 7ths
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Start Practice</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  scrollContent: {
    padding: 20,
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
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  switchLabel: {
    fontSize: 16,
    color: '#ecf0f1',
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
  keySelector: {
    marginTop: 10,
    marginBottom: 10,
  },
  keyButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedKeyButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  keyButtonText: {
    color: '#ecf0f1',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedKeyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  chordTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chordTypeButton: {
    width: '48%',
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
  },
  selectedChordTypeButton: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  chordTypeButtonText: {
    color: '#ecf0f1',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedChordTypeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default HomeScreen;