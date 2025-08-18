import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
  Easing,
} from 'react-native';
import { initPianoAudio } from '../logic/pianoAudio';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateChordDeck } from '../logic/deckGenerator';
import type { 
  HomeScreenComponent, 
  KeyOption, 
  ChordQuality, 
  ExtensionType,
  ExerciseSettings 
} from '../types';

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
  const [selectedKeys, setSelectedKeys] = useState<string[]>(['C']);
  const [selectedQualities, setSelectedQualities] = useState<ChordQuality[]>(['major', 'minor', 'diminished', 'dominant']);
  const [selectedExtensions, setSelectedExtensions] = useState<ExtensionType[]>(['triads']);
  const [selectedInversions, setSelectedInversions] = useState<string[]>(['root']);
  const [keyTab, setKeyTab] = useState<'major' | 'minor'>('major');
  
  // Expanded sections state for mobile UI
  const [expandedSection, setExpandedSection] = useState<string | null>('keys');
  
  // Animated values for chevron rotation and section heights
  const chevronAnimations = useRef({
    keys: new Animated.Value(1),
    qualities: new Animated.Value(0),
    inversions: new Animated.Value(0),
  }).current;
  
  // Animated values for section heights
  const sectionHeights = useRef({
    keys: new Animated.Value(1),
    qualities: new Animated.Value(0),
    inversions: new Animated.Value(0),
  }).current;

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
    const isExpanding = expandedSection !== section;
    
    // Animation configuration
    const duration = Platform.OS === 'ios' ? 350 : 300;
    const easing = Platform.OS === 'ios' 
      ? Easing.bezier(0.25, 0.1, 0.25, 1) // iOS ease-out curve
      : Easing.out(Easing.ease);
    
    // Animate the chevron and height for the section being toggled
    Animated.parallel([
      Animated.timing(chevronAnimations[section as keyof typeof chevronAnimations], {
        toValue: isExpanding ? 1 : 0,
        duration,
        useNativeDriver: true,
        easing,
      }),
      Animated.timing(sectionHeights[section as keyof typeof sectionHeights], {
        toValue: isExpanding ? 1 : 0,
        duration,
        useNativeDriver: false, // Height animations can't use native driver
        easing,
      }),
    ]).start();
    
    // If expanding a new section, collapse the previous one
    if (expandedSection && expandedSection !== section) {
      Animated.parallel([
        Animated.timing(chevronAnimations[expandedSection as keyof typeof chevronAnimations], {
          toValue: 0,
          duration,
          useNativeDriver: true,
          easing,
        }),
        Animated.timing(sectionHeights[expandedSection as keyof typeof sectionHeights], {
          toValue: 0,
          duration,
          useNativeDriver: false,
          easing,
        }),
      ]).start();
    }
    
    setExpandedSection(isExpanding ? section : null);
  };

  const getSectionSummary = () => {
    // Format keys summary - show actual keys
    const keysDisplay = selectedKeys.length === 0 
      ? 'None selected' 
      : selectedKeys.length <= 4 
        ? selectedKeys.join(', ')
        : `${selectedKeys.slice(0, 3).join(', ')}... (+${selectedKeys.length - 3})`;
    
    // Format qualities summary - use short names and include extensions
    const qualityNames: Record<ChordQuality, string> = {
      'major': 'Maj',
      'minor': 'Min',
      'diminished': 'Dim',
      'dominant': 'Dom7',
    };
    const qualitiesText = selectedQualities.length === 0
      ? 'None'
      : selectedQualities.map(q => qualityNames[q]).join(', ');
    
    const extensionsText = selectedExtensions.length === 0
      ? ''
      : selectedExtensions.length === 2
        ? ' (Triads & 7ths)'
        : selectedExtensions.includes('triads')
          ? ' (Triads)'
          : ' (7ths)';
    
    const qualitiesDisplay = qualitiesText === 'None' 
      ? 'None selected'
      : qualitiesText + extensionsText;
    
    // Format inversions summary - include extension type prefix
    const inversionNames: Record<string, string> = {
      'root': 'Root',
      'first': '1st',
      'second': '2nd',
      'third': '3rd',
    };
    const inversionsText = selectedInversions.length === 0
      ? 'None selected'
      : selectedInversions.map(i => inversionNames[i]).join(', ');
    
    // Add extension context to inversions
    const extensionPrefix = selectedExtensions.length === 2
      ? 'Triads & 7ths: '
      : selectedExtensions.includes('triads')
        ? 'Triads: '
        : selectedExtensions.includes('sevenths')
          ? '7ths: '
          : '';
    
    const inversionsDisplay = selectedInversions.length === 0
      ? 'None selected'
      : extensionPrefix + inversionsText;
    
    return {
      keys: keysDisplay,
      qualities: qualitiesDisplay,
      inversions: inversionsDisplay,
    };
  };

  const summary = getSectionSummary();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Piano Chord Practice</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Keys Section */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('keys')}
          activeOpacity={0.7}>
          <View style={styles.sectionHeaderContent}>
            <Text style={styles.sectionTitle}>Keys</Text>
            <Text style={styles.sectionSummary}>{summary.keys}</Text>
          </View>
          <Animated.Text 
            style={[
              styles.chevron,
              {
                transform: [{
                  rotate: chevronAnimations.keys.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                  })
                }]
              }
            ]}>
            ›
          </Animated.Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            {
              backgroundColor: Platform.OS === 'ios' ? '#1c1c1e' : '#34495e',
              maxHeight: sectionHeights.keys.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 500], // Adjust based on content
              }),
              opacity: sectionHeights.keys,
              overflow: 'hidden',
            }
          ]}>
          {expandedSection === 'keys' && (
            <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 }}>
            {/* Tab selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, keyTab === 'major' && styles.activeTab]}
                onPress={() => setKeyTab('major')}>
                <Text style={[styles.tabText, keyTab === 'major' && styles.activeTabText]}>
                  Major Keys
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, keyTab === 'minor' && styles.activeTab]}
                onPress={() => setKeyTab('minor')}>
                <Text style={[styles.tabText, keyTab === 'minor' && styles.activeTabText]}>
                  Minor Keys
                </Text>
              </TouchableOpacity>
            </View>
            
            {/* Keys grid */}
            <View style={styles.keyGrid}>
              {keyOptions
                .slice(keyTab === 'major' ? 0 : 12, keyTab === 'major' ? 12 : 24)
                .map((key) => {
                  const isSelected = selectedKeys.includes(key.value);
                  return (
                    <TouchableOpacity
                      key={key.value}
                      style={[styles.keyButton, isSelected && styles.selectedKeyButton]}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedKeys(selectedKeys.filter(k => k !== key.value));
                        } else {
                          setSelectedKeys([...selectedKeys, key.value]);
                        }
                      }}>
                      <View style={[styles.keyButtonInner, isSelected && styles.selectedKeyButtonInner]}>
                        <Text style={[styles.keyButtonText, isSelected && styles.selectedKeyButtonText]}>
                          {key.label}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
            </View>
            
            {/* Quick actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => {
                  const allKeysInTab = keyOptions
                    .slice(keyTab === 'major' ? 0 : 12, keyTab === 'major' ? 12 : 24)
                    .map(k => k.value);
                  setSelectedKeys(allKeysInTab);
                }}>
                <Text style={styles.quickActionText}>Select All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickActionButton}
                onPress={() => setSelectedKeys([])}>
                <Text style={styles.quickActionText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            </View>
          )}
        </Animated.View>

        {/* Chord Qualities Section */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('qualities')}
          activeOpacity={0.7}>
          <View style={styles.sectionHeaderContent}>
            <Text style={styles.sectionTitle}>Chord Types</Text>
            <Text style={styles.sectionSummary}>{summary.qualities}</Text>
          </View>
          <Animated.Text 
            style={[
              styles.chevron,
              {
                transform: [{
                  rotate: chevronAnimations.qualities.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                  })
                }]
              }
            ]}>
            ›
          </Animated.Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            {
              backgroundColor: Platform.OS === 'ios' ? '#1c1c1e' : '#34495e',
              maxHeight: sectionHeights.qualities.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 600], // Adjust based on content
              }),
              opacity: sectionHeights.qualities,
              overflow: 'hidden',
            }
          ]}>
          {expandedSection === 'qualities' && (
            <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 }}>
            {/* Chord Extensions - moved here from inversions */}
            <View style={styles.extensionSection}>
              <Text style={styles.extensionTitle}>Chord Extensions</Text>
              <View style={styles.extensionButtons}>
                <TouchableOpacity
                  style={[
                    styles.extensionButton,
                    selectedExtensions.includes('triads') && styles.selectedExtensionButton
                  ]}
                  onPress={() => {
                    if (selectedExtensions.includes('triads')) {
                      setSelectedExtensions(selectedExtensions.filter(e => e !== 'triads'));
                    } else {
                      setSelectedExtensions([...selectedExtensions, 'triads']);
                    }
                  }}>
                  <Text style={[
                    styles.extensionButtonText,
                    selectedExtensions.includes('triads') && styles.selectedExtensionButtonText
                  ]}>
                    Triads (3 notes)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.extensionButton,
                    selectedExtensions.includes('sevenths') && styles.selectedExtensionButton
                  ]}
                  onPress={() => {
                    if (selectedExtensions.includes('sevenths')) {
                      setSelectedExtensions(selectedExtensions.filter(e => e !== 'sevenths'));
                      // Remove 3rd inversion if deselecting 7ths
                      setSelectedInversions(selectedInversions.filter(i => i !== 'third'));
                    } else {
                      setSelectedExtensions([...selectedExtensions, 'sevenths']);
                    }
                  }}>
                  <Text style={[
                    styles.extensionButtonText,
                    selectedExtensions.includes('sevenths') && styles.selectedExtensionButtonText
                  ]}>
                    7ths (4 notes)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Chord Qualities */}
            <Text style={styles.extensionTitle}>Chord Qualities</Text>
            {(() => {
              const qualityOptions = [
                { label: 'Major', value: 'major' as ChordQuality },
                { label: 'Minor', value: 'minor' as ChordQuality },
                { label: 'Diminished', value: 'diminished' as ChordQuality },
                { label: 'Dominant 7th', value: 'dominant' as ChordQuality },
              ];
              
              return qualityOptions.map((quality, index) => {
                const isSelected = selectedQualities.includes(quality.value);
                const isLast = index === qualityOptions.length - 1;
                return (
                  <View key={quality.value} style={[styles.toggleRow, isLast && styles.lastToggleRow]}>
                    <Text style={styles.toggleLabel}>{quality.label}</Text>
                    <Switch
                      value={isSelected}
                      onValueChange={() => {
                        if (isSelected) {
                          setSelectedQualities(selectedQualities.filter(q => q !== quality.value));
                        } else {
                          setSelectedQualities([...selectedQualities, quality.value]);
                        }
                      }}
                      trackColor={{ false: '#3e3e3e', true: '#34c759' }}
                      thumbColor={Platform.OS === 'ios' ? '#ffffff' : isSelected ? '#ffffff' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                    />
                  </View>
                );
              });
            })()}
            </View>
          )}
        </Animated.View>

        {/* Inversions Section */}
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => toggleSection('inversions')}
          activeOpacity={0.7}>
          <View style={styles.sectionHeaderContent}>
            <Text style={styles.sectionTitle}>Inversions</Text>
            <Text style={styles.sectionSummary}>{summary.inversions}</Text>
          </View>
          <Animated.Text 
            style={[
              styles.chevron,
              {
                transform: [{
                  rotate: chevronAnimations.inversions.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '90deg'],
                  })
                }]
              }
            ]}>
            ›
          </Animated.Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            {
              backgroundColor: Platform.OS === 'ios' ? '#1c1c1e' : '#34495e',
              maxHeight: sectionHeights.inversions.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 400], // Adjust based on content
              }),
              opacity: sectionHeights.inversions,
              overflow: 'hidden',
            }
          ]}>
          {expandedSection === 'inversions' && (
            <View style={{ paddingHorizontal: 20, paddingTop: 15, paddingBottom: 20 }}>
            {/* Only show inversions - extensions have been moved to Chord Types */}
            {(() => {
              const inversionOptions = [
                { label: 'Root Position', value: 'root' },
                { label: '1st Inversion', value: 'first' },
                { label: '2nd Inversion', value: 'second' },
                ...(selectedExtensions.includes('sevenths') ? [{ label: '3rd Inversion (7ths only)', value: 'third' }] : []),
              ];
              
              return inversionOptions.map((inversion, index) => {
                const isSelected = selectedInversions.includes(inversion.value);
                const isLast = index === inversionOptions.length - 1;
                return (
                  <View key={inversion.value} style={[styles.toggleRow, isLast && styles.lastToggleRow]}>
                    <Text style={styles.toggleLabel}>{inversion.label}</Text>
                    <Switch
                      value={isSelected}
                      onValueChange={() => {
                        if (isSelected) {
                          setSelectedInversions(selectedInversions.filter(i => i !== inversion.value));
                        } else {
                          setSelectedInversions([...selectedInversions, inversion.value]);
                        }
                      }}
                      trackColor={{ false: '#3e3e3e', true: '#34c759' }}
                      thumbColor={Platform.OS === 'ios' ? '#ffffff' : isSelected ? '#ffffff' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                    />
                  </View>
                );
              });
            })()}
            
            {!selectedExtensions.includes('sevenths') && selectedInversions.includes('third') && (
              <Text style={styles.warningText}>
                Note: 3rd inversion requires 7th chords. Please enable 7ths in Chord Types.
              </Text>
            )}
            </View>
          )}
        </Animated.View>
        
        {/* Add padding at bottom to ensure content isn't hidden behind button */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={styles.bottomContainer}>
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
    paddingTop: 20,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#1c1c1e' : '#34495e',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 1,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  sectionSummary: {
    fontSize: 14,
    color: '#95a5a6',
  },
  chevron: {
    fontSize: 28,
    color: Platform.OS === 'ios' ? '#8e8e93' : '#95a5a6',
    marginLeft: 10,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(118, 118, 128, 0.12)' : '#2c3e50',
    borderRadius: Platform.OS === 'ios' ? 9 : 8,
    padding: Platform.OS === 'ios' ? 2 : 4,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Platform.OS === 'ios' ? '#ffffff' : '#3498db',
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 3 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
    elevation: Platform.OS === 'ios' ? 2 : undefined,
  },
  tabText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: Platform.OS === 'ios' ? '#000000' : 'white',
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  keyButton: {
    width: '25%',
    aspectRatio: 1.5,
    padding: 5,
  },
  keyButtonInner: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedKeyButtonInner: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  keyButtonText: {
    color: '#95a5a6',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedKeyButton: {
    // Style is handled by inner view
  },
  selectedKeyButtonText: {
    color: 'white',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    gap: 15,
  },
  quickActionButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2c3e50',
  },
  quickActionText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.1)' : '#2c3e50',
  },
  lastToggleRow: {
    borderBottomWidth: 0,
  },
  toggleLabel: {
    fontSize: 16,
    color: 'white',
  },
  extensionSection: {
    marginBottom: 15,
  },
  extensionTitle: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 10,
  },
  extensionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  extensionButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedExtensionButton: {
    backgroundColor: '#3498db',
  },
  extensionButtonText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedExtensionButtonText: {
    color: 'white',
  },
  warningText: {
    color: '#e74c3c',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
    paddingHorizontal: 10,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(0, 0, 0, 0.95)' : '#2c3e50',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
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
});

export default HomeScreen;