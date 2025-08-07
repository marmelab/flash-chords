import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import Slider from '@react-native-community/slider';

const HomeScreen = ({ onStartExercise }) => {
  const [includeRoot, setIncludeRoot] = useState(true);
  const [includeFirst, setIncludeFirst] = useState(true);
  const [includeSecond, setIncludeSecond] = useState(true);
  const [chordCount, setChordCount] = useState(10);

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
      chordCount,
    };

    onStartExercise(settings);
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.sectionTitle}>Number of Chords</Text>
          <Text style={styles.sliderValue}>{chordCount}</Text>
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={25}
            step={1}
            value={chordCount}
            onValueChange={setChordCount}
            minimumTrackTintColor="#3498db"
            maximumTrackTintColor="#95a5a6"
            thumbTintColor="#2980b9"
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>5</Text>
            <Text style={styles.sliderLabel}>25</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={handleStart}>
        <Text style={styles.startButtonText}>Start Practice</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    padding: 20,
    justifyContent: 'center',
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
  sliderValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  sliderLabel: {
    color: '#95a5a6',
    fontSize: 14,
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
});

export default HomeScreen;