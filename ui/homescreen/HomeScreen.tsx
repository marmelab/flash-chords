import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { initPianoAudio } from '../../logic/pianoAudio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateChordDeck } from '../../logic/deckGenerator';
import { CollapsibleSection } from './CollapsibleSection';
import { KeysSection, getKeysSummary } from './KeysSection';
import { ChordTypesSection, getChordTypesSummary } from './ChordTypesSection';
import { InversionsSection, getInversionsSummary } from './InversionsSection';
import type { 
  HomeScreenComponent, 
  KeyOption, 
  ChordQuality, 
  ExtensionType,
  ExerciseSettings 
} from '../../types';

// Generate all 24 key options (12 major + 12 minor)
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

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const HomeScreen: HomeScreenComponent = ({ onStartExercise }) => {
  const insets = useSafeAreaInsets();
  // Use fallback values if insets aren't ready yet
  const topInset = insets.top || (Platform.OS === 'ios' ? 44 : 0);
  const bottomInset = insets.bottom || (Platform.OS === 'ios' ? 34 : 0);
  
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['C']);
  const [selectedQualities, setSelectedQualities] = useState<ChordQuality[]>(['major', 'minor', 'diminished', 'dominant']);
  const [selectedExtensions, setSelectedExtensions] = useState<ExtensionType[]>(['triads']);
  const [selectedInversions, setSelectedInversions] = useState<string[]>(['root']);
  const [keyTab, setKeyTab] = useState<'major' | 'minor'>('major');
  
  // Expanded sections state for mobile UI
  const [expandedSection, setExpandedSection] = useState<string | null>('keys');

  // Track if we're still loading initial settings
  const isInitialLoad = useRef(true);

  // Auto-save settings whenever they change
  const saveSettings = async () => {
    const settingsToSave = {
      selectedKeys,
      selectedQualities: selectedQualities as string[],
      selectedExtensions: selectedExtensions as string[],
      selectedInversions,
    };
    
    try {
      await AsyncStorage.setItem(
        'exercise_settings',
        JSON.stringify(settingsToSave)
      );
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  // Auto-save when settings change
  useEffect(() => {
    // Skip saving on initial load
    if (!isInitialLoad.current) {
      saveSettings();
    }
  }, [selectedKeys, selectedQualities, selectedExtensions, selectedInversions]);

  // Pre-initialize piano audio and load saved settings
  useEffect(() => {
    initPianoAudio();
    
    // Load saved exercise settings
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem('exercise_settings');
        if (stored) {
          const savedSettings = JSON.parse(stored);
          
          // Load keys
          if (savedSettings.selectedKeys && savedSettings.selectedKeys.length > 0) {
            setSelectedKeys(savedSettings.selectedKeys);
          }
          
          // Load qualities
          if (savedSettings.selectedQualities && savedSettings.selectedQualities.length > 0) {
            setSelectedQualities(savedSettings.selectedQualities as ChordQuality[]);
          }
          
          // Load extensions (new format)
          if (savedSettings.selectedExtensions) {
            setSelectedExtensions(savedSettings.selectedExtensions as ExtensionType[]);
          } else if (savedSettings.selectedInversions) {
            // Fallback for old format
            const hasTriads = savedSettings.selectedInversions.some((inv: string) => 
              ['root', 'first', 'second'].includes(inv.replace('-7th', ''))
            );
            const hasSevenths = savedSettings.selectedInversions.some((inv: string) => 
              inv.includes('-7th')
            );
            const extensions: ExtensionType[] = [];
            if (hasTriads) extensions.push('triads');
            if (hasSevenths) extensions.push('sevenths');
            setSelectedExtensions(extensions.length > 0 ? extensions : ['triads']);
          }
          
          // Load inversions
          if (savedSettings.selectedInversions) {
            if (Array.isArray(savedSettings.selectedInversions)) {
              // Handle both new format (plain inversions) and old format (with -7th suffix)
              const inversions = savedSettings.selectedInversions
                .map((inv: string) => inv.replace('-7th', ''))
                .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
              setSelectedInversions(inversions.length > 0 ? inversions : ['root']);
            }
          }
          
          // Set key tab based on first selected key
          if (savedSettings.selectedKeys && savedSettings.selectedKeys.length > 0) {
            const firstKey = savedSettings.selectedKeys[0];
            setKeyTab(firstKey.includes('m') ? 'minor' : 'major');
          }
        }
        // Mark initial load as complete after loading settings
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 100);
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Mark initial load as complete even on error
        setTimeout(() => {
          isInitialLoad.current = false;
        }, 100);
      }
    };
    
    loadSettings();
  }, []);

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
    
    // Settings are already auto-saved on change, no need to save here
    onStartExercise(settings);
  };

  // Calculate the number of cards in the deck based on current settings
  const deckSize = useMemo(() => {
    // Build settings object matching the format expected by generateChordDeck
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
    
    // Generate the deck and return its size
    const deck = generateChordDeck(settings);
    return deck.length;
  }, [selectedKeys, selectedQualities, selectedExtensions, selectedInversions]);

  const toggleSection = (section: string) => {
    // Toggle: if clicking the same section, close it; otherwise open the new section
    setExpandedSection(expandedSection === section ? null : section);
  };


  return (
    <View style={[styles.container, { paddingTop: topInset }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Piano Chord Practice</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Keys Section */}
        <CollapsibleSection
          title="Keys"
          summary={getKeysSummary(selectedKeys)}
          isExpanded={expandedSection === 'keys'}
          onToggle={() => toggleSection('keys')}>
          <KeysSection
            keyTab={keyTab}
            setKeyTab={setKeyTab}
            selectedKeys={selectedKeys}
            setSelectedKeys={setSelectedKeys}
            keyOptions={keyOptions}
          />
        </CollapsibleSection>

        {/* Chord Types Section */}
        <CollapsibleSection
          title="Chord Types"
          summary={getChordTypesSummary(selectedQualities, selectedExtensions)}
          isExpanded={expandedSection === 'qualities'}
          onToggle={() => toggleSection('qualities')}>
          <ChordTypesSection
            selectedQualities={selectedQualities}
            setSelectedQualities={setSelectedQualities}
            selectedExtensions={selectedExtensions}
            setSelectedExtensions={setSelectedExtensions}
            setSelectedInversions={setSelectedInversions}
            selectedInversions={selectedInversions}
          />
        </CollapsibleSection>

        {/* Inversions Section */}
        <CollapsibleSection
          title="Inversions"
          summary={getInversionsSummary(selectedInversions, selectedExtensions)}
          isExpanded={expandedSection === 'inversions'}
          onToggle={() => toggleSection('inversions')}>
          <InversionsSection
            selectedInversions={selectedInversions}
            setSelectedInversions={setSelectedInversions}
            selectedExtensions={selectedExtensions}
          />
        </CollapsibleSection>
        
        {/* Add padding at bottom to ensure content isn't hidden behind button */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={[styles.bottomContainer, { paddingBottom: bottomInset + 20 }]}>
        <View style={styles.deckInfo}>
          <Text style={styles.deckInfoText}>
            {deckSize} {deckSize === 1 ? 'card' : 'cards'} in deck
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.startButton} 
          onPress={handleStart}
          activeOpacity={0.8}>
          <Text style={styles.startButtonText}>Start Practice</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Platform.OS === 'ios' ? '#000000' : '#2c3e50',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: Platform.OS === 'ios' ? '#000000' : '#2c3e50',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.95)' : '#2c3e50',
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  deckInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  deckInfoText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: Platform.OS === 'ios' ? '#34c759' : '#27ae60',
    paddingVertical: 16,
    borderRadius: Platform.OS === 'ios' ? 14 : 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default HomeScreen;