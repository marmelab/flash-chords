import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenOrientation from "expo-screen-orientation";
import PianoKey from "./PianoKey";
import ChordControls from "./ChordControls";
import { notes, getInversionName } from "../data/chords";
import { ContinuousAudioRecognition } from '../logic/continuousAudioRecognition';
import {
  initPianoAudio,
  playPianoNote,
  playChord,
  cleanupPianoAudio,
} from "../logic/pianoAudio";
import { checkAnswer, getKeyStyleForNote } from "../logic/practiceLogic";
import {
  initializeFlashcardDeck,
  selectNextCard,
  updateCardProbability,
  getDeckStats,
  findCardIndex,
  type FlashcardDeck,
  type DeckStats,
} from "../logic/flashcardLogic";
import type { PracticeScreenNavigationProp, PracticeScreenRouteProp } from '../navigation/types';
import type {
  Chord,
  InversionType,
  Note,
  KeyStyle,
} from "../types";

// Helper functions for orientation control
const lockToLandscape = (): void => {
  if (Platform.OS === "web") return;

  // Use promise-based approach instead of async/await
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
    .then(() => {
      console.log("Locked to landscape");
    })
    .catch((error) => {
      console.log("Could not lock orientation:", error);
    });
};

const unlockOrientation = async (): Promise<void> => {
  if (Platform.OS === "web") return;

  try {
    // Set to portrait first
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    console.log("Reset to portrait");
  } catch (error) {
    console.log("Could not reset orientation:", error);
  }
};

// Helper function to extract chord type from chord name
// Normalizes different naming conventions (e.g., "C Major" vs "C" vs "CMaj")
const extractChordType = (chordName: string): string => {
  if (!chordName) return '';
  
  // Remove any extra whitespace and convert to consistent format
  let normalized = chordName.trim();
  
  // Handle detected chord formats (e.g., "C Major 7" -> "Cmaj7")
  normalized = normalized.replace(/\s+Major\s+7/i, 'maj7');
  normalized = normalized.replace(/\s+Minor\s+7/i, 'm7');
  normalized = normalized.replace(/\s+Major/i, '');
  normalized = normalized.replace(/\s+Minor/i, 'm');
  normalized = normalized.replace(/\s+Diminished/i, 'dim');
  normalized = normalized.replace(/\s+Augmented/i, 'aug');
  normalized = normalized.replace(/\s+/g, ''); // Remove all spaces
  
  // Now normalize case for comparison
  // Keep root uppercase, quality lowercase
  const match = normalized.match(/^([A-G][#b]?)(.*)$/);
  if (!match) return normalized.toLowerCase();
  
  const root = match[1];
  const quality = match[2].toLowerCase();
  
  // Build normalized chord type
  let result = root + quality;
  
  console.log(`Normalized "${chordName}" to "${result}"`);
  return result;
};


const PianoKeyboard: React.FC = () => {
  const navigation = useNavigation<PracticeScreenNavigationProp>();
  const route = useRoute<PracticeScreenRouteProp>();
  const { settings, chordDeck } = route.params;
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [currentInversion, setCurrentInversion] =
    useState<InversionType>("root");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showKeyNames, setShowKeyNames] = useState<boolean>(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeck | null>(
    null
  );
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);
  const [screenDimensions, setScreenDimensions] = useState(() =>
    Dimensions.get("window")
  );
  
  // Audio mode states
  const [audioMode, setAudioMode] = useState<boolean>(false);
  const [continuousRecognition] = useState(() => new ContinuousAudioRecognition());
  const [lastDetectedChord, setLastDetectedChord] = useState<string | null>(null);
  const [waitingForChord, setWaitingForChord] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Initialize audio system and load preferences
  useEffect(() => {
    initPianoAudio();
    
    // Load saved preferences
    const loadPreferences = async () => {
      try {
        const [savedSound, savedShowNames] = await Promise.all([
          AsyncStorage.getItem('soundEnabled'),
          AsyncStorage.getItem('showKeyNames')
        ]);
        
        if (savedSound !== null) {
          setSoundEnabled(savedSound === 'true');
        }
        if (savedShowNames !== null) {
          setShowKeyNames(savedShowNames === 'true');
        }
        setPreferencesLoaded(true);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setPreferencesLoaded(true);
      }
    };
    
    loadPreferences();
  }, []);
  
  // Save sound preference when it changes
  useEffect(() => {
    if (preferencesLoaded) {
      AsyncStorage.setItem('soundEnabled', soundEnabled.toString())
        .catch(error => console.error('Error saving sound preference:', error));
    }
  }, [soundEnabled, preferencesLoaded]);
  
  // Save show key names preference when it changes
  useEffect(() => {
    if (preferencesLoaded) {
      AsyncStorage.setItem('showKeyNames', showKeyNames.toString())
        .catch(error => console.error('Error saving show names preference:', error));
    }
  }, [showKeyNames, preferencesLoaded]);

  useEffect(() => {
    // Lock to landscape when component mounts
    lockToLandscape();

    // Initialize flashcard deck
    const deck = initializeFlashcardDeck(chordDeck);
    setFlashcardDeck(deck);
    setDeckStats(getDeckStats(deck));

    // Update dimensions on orientation change
    const updateDimensions = () => {
      setScreenDimensions(Dimensions.get("window"));
    };

    // Add listener for dimension changes
    const subscription = Dimensions.addEventListener(
      "change",
      updateDimensions
    );

    // Update dimensions after a short delay to ensure orientation has changed
    setTimeout(updateDimensions, 100);

    // Cleanup: unlock orientation and cleanup audio when component unmounts
    return () => {
      unlockOrientation();
      cleanupPianoAudio();
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    if (flashcardDeck && !currentChord) {
      handleGenerateNewChord(false);
    }
  }, [flashcardDeck]);
  
  // Handle audio mode changes
  useEffect(() => {
    if (audioMode) {
      // Start continuous recognition
      setIsListening(true);
      continuousRecognition.start((chord, notes) => {
        console.log('Continuous detection:', chord, notes);
        setLastDetectedChord(chord);
        
        // If we're waiting for a chord and one is detected
        if (waitingForChord && chord && notes.length > 0 && !showResult && currentChord) {
          console.log('=== Audio Detection ===');
          console.log('Expected:', currentChord.name, '-', currentInversion);
          console.log('Detected:', chord);
          
          // Check if the detected chord type matches the expected chord
          // Extract just the chord type without comparing inversions
          const detectedChordType = extractChordType(chord);
          const expectedChordType = extractChordType(currentChord.name);
          
          console.log(`Comparing: "${detectedChordType}" vs "${expectedChordType}"`);
          
          if (detectedChordType === expectedChordType) {
            console.log('✓ Correct chord type detected!');
            
            // In audio mode, we accept any inversion of the correct chord
            // Use the expected notes for visual feedback (show what was expected)
            const expectedNotes = currentChord.notes[currentInversion] || [];
            
            console.log('Setting keys to expected pattern:', expectedNotes);
            setSelectedKeys(new Set(expectedNotes));
            setWaitingForChord(false);
            
            // Check answer after a short delay - force it to be correct
            // since we detected the right chord type (any inversion is OK)
            setTimeout(() => {
              handleCheckAnswer(true); // Pass true to force correct
            }, 500);
          } else {
            console.log(`✗ Wrong chord: detected "${detectedChordType}" but expected "${expectedChordType}"`);
            
            // Show the wrong chord that was played
            setSelectedKeys(new Set(notes));
            setWaitingForChord(false);
            
            // Check the answer to show incorrect feedback
            setTimeout(() => {
              handleCheckAnswer(false); // Pass false for incorrect
            }, 500);
          }
        }
      });
    } else {
      // Stop continuous recognition
      setIsListening(false);
      continuousRecognition.stop();
      setLastDetectedChord(null);
      setWaitingForChord(false);
    }
    
    // Cleanup on unmount
    return () => {
      continuousRecognition.stop();
    };
  }, [audioMode, waitingForChord, showResult]);

  const handleGenerateNewChord = (isSkip: boolean = false): void => {
    if (!flashcardDeck) return;

    // If skipping, increase probability for current card (treat like incorrect)
    if (isSkip && flashcardDeck.currentCard) {
      const cardIndex = findCardIndex(flashcardDeck, flashcardDeck.currentCard);
      const updatedDeck = updateCardProbability(
        flashcardDeck,
        cardIndex,
        false
      );
      setFlashcardDeck(updatedDeck);
      setDeckStats(getDeckStats(updatedDeck));
    }

    const deckToUse =
      isSkip && flashcardDeck.currentCard ? flashcardDeck : flashcardDeck;
    const nextCard = selectNextCard(deckToUse);
    if (nextCard) {
      setCurrentChord(nextCard.chord);
      setCurrentInversion(nextCard.inversion);
      setSelectedKeys(new Set());
      setShowResult(false);
      setIsCorrect(null);

      // Update current card in deck
      setFlashcardDeck({
        ...deckToUse,
        currentCard: nextCard,
      });
      
      // If audio mode is enabled, set waiting for chord
      if (audioMode) {
        setWaitingForChord(true);
      }
    }
  };
  
  const toggleAudioMode = () => {
    const newMode = !audioMode;
    setAudioMode(newMode);
    
    if (newMode && currentChord && !showResult) {
      // Set waiting for chord when enabling audio mode
      setWaitingForChord(true);
    }
  };

  const handleKeyPress = (note: string, frequency: number): void => {
    if (showResult) return;
    if (audioMode) return; // Disable manual key press in audio mode

    if (soundEnabled) {
      playPianoNote(note, frequency);
    }

    const newSelectedKeys = new Set(selectedKeys);
    if (newSelectedKeys.has(note)) {
      newSelectedKeys.delete(note);
    } else {
      newSelectedKeys.add(note);
    }
    setSelectedKeys(newSelectedKeys);
  };

  const handleCheckAnswer = (forceCorrect: boolean = false): void => {
    if (!flashcardDeck || !flashcardDeck.currentCard) return;

    // In audio mode with correct chord detection, we force it to be correct
    // Otherwise, check normally
    const isAnswerCorrect = forceCorrect || checkAnswer(
      selectedKeys,
      currentChord,
      currentInversion
    );

    setIsCorrect(isAnswerCorrect);
    setShowResult(true);

    // Play the correct chord if sound is enabled
    if (soundEnabled && currentChord) {
      const correctNotes = currentChord.notes[currentInversion] || [];
      const chordNotes = correctNotes
        .map((noteName) => {
          const noteData = notes.find((n) => n.note === noteName);
          if (noteData) {
            return { note: noteData.note, frequency: noteData.freq };
          }
          return null;
        })
        .filter((n) => n !== null) as Array<{
        note: string;
        frequency: number;
      }>;

      playChord(chordNotes);
    }

    // Update card probability based on answer
    const cardIndex = findCardIndex(flashcardDeck, flashcardDeck.currentCard);
    const updatedDeck = updateCardProbability(
      flashcardDeck,
      cardIndex,
      isAnswerCorrect
    );
    setFlashcardDeck(updatedDeck);

    // Update deck stats
    const newStats = getDeckStats(updatedDeck);
    setDeckStats(newStats);

    // Check if exercise is complete
    if (newStats.isComplete) {
      setTimeout(() => {
        navigation.navigate('Summary', { deckStats: newStats });
      }, 1500);
    } else {
      // Move to next chord after delay for both correct and incorrect answers
      setTimeout(
        () => {
          handleGenerateNewChord(false);
        },
        isAnswerCorrect ? 1500 : 2500
      ); // Slightly longer delay to hear the chord
    }
  };

  const getKeyStyle = (note: string): KeyStyle => {
    return getKeyStyleForNote(
      note,
      selectedKeys,
      currentChord,
      currentInversion,
      showResult,
      isCorrect
    );
  };

  // Calculate responsive keyboard dimensions using state dimensions
  const screenWidth = screenDimensions.width;
  const screenHeight = screenDimensions.height;

  // Detect iPhone with notch (X and later) - they have specific aspect ratios in landscape
  const isIPhoneWithNotch =
    Platform.OS === "ios" &&
    screenWidth > screenHeight && // Is landscape
    screenWidth / screenHeight > 2.1; // iPhone X+ aspect ratio in landscape

  // Use symmetrical margins to account for notch on either side
  const sideMargin = isIPhoneWithNotch ? 80 : 30;
  const horizontalMargin = sideMargin * 2; // Same margin on both sides
  const safeWidth = Math.min(screenWidth - horizontalMargin, 900); // Max 900px - this is the safe area width
  const whiteKeyWidth = safeWidth / 14; // 14 white keys total
  const blackKeyWidth = whiteKeyWidth * 0.6; // Black keys are 60% of white key width

  const getKeyPosition = (
    note: Note,
    whiteKeyIndex: number
  ): number => {
    if (note.type === "white") {
      return whiteKeyIndex * whiteKeyWidth;
    }

    const blackKeyPositions: Record<string, number> = {
      "C#4": 1,
      "D#4": 2,
      "F#4": 4,
      "G#4": 5,
      "A#4": 6,
      "C#5": 8,
      "D#5": 9,
      "F#5": 11,
      "G#5": 12,
      "A#5": 13,
    };

    const whiteKeyPos = blackKeyPositions[note.note];
    return whiteKeyPos * whiteKeyWidth - blackKeyWidth / 2;
  };

  const renderKeys = (): React.ReactElement[] => {
    const keys: React.ReactElement[] = [];
    let whiteKeyIndex = 0;

    // Render white keys first
    notes.forEach((note) => {
      if (note.type === "white") {
        keys.push(
          <PianoKey
            key={note.note}
            note={note.note}
            frequency={note.freq}
            type={note.type}
            position={getKeyPosition(note, whiteKeyIndex)}
            keyStyle={getKeyStyle(note.note)}
            onPress={handleKeyPress}
            disabled={showResult}
            showNoteName={showKeyNames}
            width={whiteKeyWidth}
            height={200}
          />
        );
        whiteKeyIndex++;
      }
    });

    // Render black keys on top
    notes.forEach((note) => {
      if (note.type === "black") {
        keys.push(
          <PianoKey
            key={note.note}
            note={note.note}
            frequency={note.freq}
            type={note.type}
            position={getKeyPosition(note, 0)}
            keyStyle={getKeyStyle(note.note)}
            onPress={handleKeyPress}
            disabled={showResult}
            showNoteName={showKeyNames}
            width={blackKeyWidth}
            height={200}
          />
        );
      }
    });

    return keys;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.safeContainer, { width: safeWidth }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={async () => {
          // Reset orientation before navigating
          await unlockOrientation();
          // Small delay to ensure orientation change completes
          setTimeout(() => {
            navigation.goBack();
          }, 100);
        }}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.audioModeToggle, audioMode && styles.audioModeActive]}
        onPress={toggleAudioMode}
      >
        <Text style={[styles.audioModeToggleText, audioMode && styles.audioModeActiveText]}>
          🎤
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.soundToggle}
        onPress={() => setSoundEnabled(!soundEnabled)}
      >
        <Text style={styles.soundToggleText}>{soundEnabled ? "🔊" : "🔇"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.keyNamesToggle}
        onPress={() => setShowKeyNames(!showKeyNames)}
      >
        <Text style={styles.keyNamesToggleText}>
          {showKeyNames ? "ABC" : "abc"}
        </Text>
      </TouchableOpacity>

      <View
        style={[
          styles.chordCard,
          showResult && (isCorrect ? styles.correctCard : styles.incorrectCard),
        ]}
      >
        <Text style={styles.chordText}>
          {currentChord?.name}
          {currentInversion !== "root"
            ? ` - ${getInversionName(currentInversion)}`
            : ""}
        </Text>
      </View>

      {deckStats && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${deckStats.completionPercentage}%` },
              ]}
            />
          </View>
        </View>
      )}

        <View style={styles.keyboard}>
        {renderKeys()}
      </View>

        <ChordControls
          showResult={showResult}
          isCorrect={isCorrect}
          onSubmit={handleCheckAnswer}
          onNewChord={() => handleGenerateNewChord(true)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
    justifyContent: "center",
    alignItems: "center",
  },
  safeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 0,
    backgroundColor: "transparent",
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  backButtonText: {
    color: "white",
    fontSize: 40,
    fontWeight: "200",
  },
  audioModeToggle: {
    position: "absolute",
    top: 10,
    right: 120,
    backgroundColor: "transparent",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  soundToggle: {
    position: "absolute",
    top: 10,
    right: 60,
    backgroundColor: "transparent",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  soundToggleText: {
    fontSize: 24,
  },
  keyNamesToggle: {
    position: "absolute",
    top: 10,
    right: 0,
    backgroundColor: "transparent",
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  keyNamesToggleText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
  audioModeActive: {
    backgroundColor: "rgba(231, 76, 60, 0.8)",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#e74c3c",
  },
  audioModeToggleText: {
    fontSize: 24,
  },
  audioModeActiveText: {
    opacity: 1,
  },
  chordCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 30,
    paddingVertical: 16,
    marginBottom: 10,
    marginTop: 20,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  correctCard: {
    backgroundColor: "rgba(39, 174, 96, 0.3)",
  },
  incorrectCard: {
    backgroundColor: "rgba(231, 76, 60, 0.3)",
  },
  chordText: {
    fontSize: 32,
    fontWeight: "400",
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    letterSpacing: 1.5,
  },
  keyboard: {
    width: "100%",
    height: 200,
    position: "relative",
    backgroundColor: "#1a1a1a",
    borderRadius: 8,
    padding: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  progressContainer: {
    width: "100%",
    marginTop: 10,
    marginBottom: 0,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#27ae60",
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    marginLeft: 1,
    marginRight: 1,
  },
});

export default PianoKeyboard;
