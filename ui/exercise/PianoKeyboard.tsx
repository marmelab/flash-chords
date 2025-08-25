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
import ProgressBar from "./ProgressBar";
import ChordCard from "./ChordCard";
import { notes } from "../../data/chords";
import type { Chord, InversionType, ChordDeckItem } from "../../types";
import type { Note, KeyStyle } from "../../types";

// Screen orientation helpers
const lockToLandscape = async () => {
  await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
};

const unlockOrientation = async () => {
  await ScreenOrientation.unlockAsync();
};
import {
  initializeFlashcardDeck,
  selectNextCard,
  updateCardProbability,
  getDeckStats,
  findCardIndex,
  type FlashcardDeck,
  type DeckStats,
} from "../../logic/flashcardLogic";
import { checkAnswer, getKeyStyleForNote } from "../../logic/practiceLogic";
import {
  initPianoAudio,
  playPianoNote,
  playChord,
  cleanupPianoAudio,
} from "../../logic/pianoAudio";
import { ContinuousAudioRecognition } from '../../logic/continuousAudioRecognition';
import { extractChordType } from '../../logic/chordUtils';

interface RouteParams {
  chordDeck: ChordDeckItem[];
  settings: {
    inversions: {
      root: boolean;
      first: boolean;
      second: boolean;
    };
    selectedExtensions: string[];
    selectedKeys: string[];
    selectedQualities: string[];
  };
}

const PianoKeyboard: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as RouteParams;
  const chordDeck = params?.chordDeck || [];

  // State
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [currentInversion, setCurrentInversion] = useState<InversionType>("root");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showKeyNames, setShowKeyNames] = useState<boolean>(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState<boolean>(false);
  const [screenDimensions, setScreenDimensions] = useState(Dimensions.get("window"));
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeck | null>(null);
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);
  
  // Audio mode state
  const [audioMode, setAudioMode] = useState<boolean>(false);
  const [waitingForChord, setWaitingForChord] = useState<boolean>(false);
  const [lastDetectedChord, setLastDetectedChord] = useState<string | null>(null);

  const continuousRecognition = new ContinuousAudioRecognition();

  // ==================== HELPER FUNCTIONS ====================

  // Handle correct audio chord detection
  const handleCorrectAudioDetection = () => {
    // Show expected notes on keyboard
    const expectedNotes = currentChord!.notes[currentInversion] || [];
    setSelectedKeys(new Set(expectedNotes));
    setWaitingForChord(false);
    
    // Mark as correct and update deck after delay
    setTimeout(() => {
      setIsCorrect(true);
      setShowResult(true);
      
      if (flashcardDeck && flashcardDeck.currentCard) {
        const cardIndex = findCardIndex(flashcardDeck, flashcardDeck.currentCard);
        const updatedDeck = updateCardProbability(flashcardDeck, cardIndex, true);
        setFlashcardDeck(updatedDeck);
        setDeckStats(getDeckStats(updatedDeck));
        
        // Auto-advance to next chord
        setTimeout(() => {
          handleGenerateNewChord(false);
        }, 1500);
      }
    }, 500);
  };

  // Handle incorrect audio chord detection
  const handleIncorrectAudioDetection = (detectedNotes: string[]) => {
    // Show what was actually played
    setSelectedKeys(new Set(detectedNotes));
    setWaitingForChord(false);
    
    // Mark as incorrect and update deck after delay
    setTimeout(() => {
      setIsCorrect(false);
      setShowResult(true);
      
      if (flashcardDeck && flashcardDeck.currentCard) {
        const cardIndex = findCardIndex(flashcardDeck, flashcardDeck.currentCard);
        const updatedDeck = updateCardProbability(flashcardDeck, cardIndex, false);
        setFlashcardDeck(updatedDeck);
        setDeckStats(getDeckStats(updatedDeck));
      }
    }, 500);
  };

  // Process detected chord from audio recognition
  const processAudioDetection = (detectedChord: string | null, detectedNotes: string[]) => {
    setLastDetectedChord(detectedChord);
    
    // Skip if not ready to process
    if (!waitingForChord || !detectedChord || detectedNotes.length === 0 || showResult || !currentChord) {
      return;
    }
    
    // Compare chord types (ignoring inversions)
    const detectedChordType = extractChordType(detectedChord);
    const expectedChordType = extractChordType(currentChord.name);
    
    if (detectedChordType === expectedChordType) {
      handleCorrectAudioDetection();
    } else {
      handleIncorrectAudioDetection(detectedNotes);
    }
  };

  // ==================== INITIALIZATION ====================
  // Initialize audio and load user preferences on mount
  useEffect(() => {
    initPianoAudio();
    
    const loadPreferences = async () => {
      try {
        const [savedSound, savedShowNames, savedAudioMode] = await Promise.all([
          AsyncStorage.getItem('soundEnabled'),
          AsyncStorage.getItem('showKeyNames'),
          AsyncStorage.getItem('audioModeEnabled')
        ]);
        
        if (savedSound !== null) setSoundEnabled(savedSound === 'true');
        if (savedShowNames !== null) setShowKeyNames(savedShowNames === 'true');
        if (savedAudioMode !== null) setAudioMode(savedAudioMode === 'true');
        setPreferencesLoaded(true);
      } catch (error) {
        console.error('Error loading preferences:', error);
        setPreferencesLoaded(true);
      }
    };
    
    loadPreferences();
  }, []);

  // Lock orientation and initialize deck on mount
  useEffect(() => {
    lockToLandscape();

    // Initialize flashcard deck
    if (!chordDeck || chordDeck.length === 0) {
      return;
    }
    
    const deck = initializeFlashcardDeck(chordDeck);
    
    if (!deck) {
      return;
    }
    
    setFlashcardDeck(deck);
    setDeckStats(getDeckStats(deck));

    // Handle dimension changes
    const updateDimensions = () => setScreenDimensions(Dimensions.get("window"));
    const subscription = Dimensions.addEventListener("change", updateDimensions);
    setTimeout(updateDimensions, 100); // Ensure orientation has changed

    // Cleanup
    return () => {
      unlockOrientation();
      cleanupPianoAudio();
      subscription?.remove();
    };
  }, [chordDeck]); // Add chordDeck as dependency

  // ==================== PREFERENCES ====================
  // Save sound preference when it changes
  useEffect(() => {
    if (preferencesLoaded) {
      AsyncStorage.setItem('soundEnabled', soundEnabled.toString())
        .catch(error => console.error('Error saving sound preference:', error));
    }
  }, [soundEnabled, preferencesLoaded]);
  
  // Save key names preference when it changes
  useEffect(() => {
    if (preferencesLoaded) {
      AsyncStorage.setItem('showKeyNames', showKeyNames.toString())
        .catch(error => console.error('Error saving show names preference:', error));
    }
  }, [showKeyNames, preferencesLoaded]);

  // Save audio mode preference when it changes
  useEffect(() => {
    if (preferencesLoaded) {
      AsyncStorage.setItem('audioModeEnabled', audioMode.toString())
        .catch(error => console.error('Error saving audio mode preference:', error));
    }
  }, [audioMode, preferencesLoaded]);

  // ==================== GAME LOGIC ====================
  // Generate first chord when deck is ready
  useEffect(() => {
    if (flashcardDeck && !currentChord) {
      // Generate the first chord inline to avoid closure issues
      const nextCard = selectNextCard(flashcardDeck);
      if (nextCard) {
        setCurrentChord(nextCard.chord);
        setCurrentInversion(nextCard.inversion);
        setSelectedKeys(new Set());
        setShowResult(false);
        setIsCorrect(null);
        
        // Update current card in deck
        setFlashcardDeck({
          ...flashcardDeck,
          currentCard: nextCard,
        });
        
        // If audio mode is enabled, set waiting for chord
        if (audioMode) {
          setWaitingForChord(true);
        }
      }
    }
  }, [flashcardDeck]);

  // ==================== AUDIO RECOGNITION ====================
  // Handle audio mode recognition
  useEffect(() => {
    if (!audioMode) {
      // Stop recognition when audio mode is disabled
      continuousRecognition.stop();
      setLastDetectedChord(null);
      setWaitingForChord(false);
      return;
    }

    // Start continuous recognition
    continuousRecognition.start(processAudioDetection);
    
    // Cleanup on unmount
    return () => {
      continuousRecognition.stop();
    };
  }, [audioMode, waitingForChord, showResult, currentChord, currentInversion, flashcardDeck]);

  // ==================== EVENT HANDLERS ====================
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

  const handleCheckAnswer = (): void => {
    if (!flashcardDeck || !flashcardDeck.currentCard) return;

    const isAnswerCorrect = checkAnswer(
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
          const noteData = notes.find((n: Note) => n.note === noteName);
          if (noteData) {
            return { note: noteData.note, frequency: noteData.freq };
          }
          return null;
        })
        .filter((n): n is { note: string; frequency: number } => n !== null) as Array<{
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
        (navigation as any).navigate('Summary', { deckStats: newStats });
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

  // ==================== RENDERING ====================
  const { width: screenWidth, height: screenHeight } = screenDimensions;
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
    notes.forEach((note: Note) => {
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
            disabled={showResult || audioMode}
            showNoteName={showKeyNames}
            width={whiteKeyWidth}
            height={190}
          />
        );
        whiteKeyIndex++;
      }
    });

    // Render black keys on top
    notes.forEach((note: Note) => {
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
            disabled={showResult || audioMode}
            showNoteName={showKeyNames}
            width={blackKeyWidth}
            height={190}
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
            await unlockOrientation();
            (navigation as any).goBack();
          }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.audioModeToggle,
            audioMode && styles.audioModeActive
          ]}
          onPress={toggleAudioMode}
        >
          <Text style={[
            styles.audioModeText,
            audioMode && styles.audioModeActiveText
          ]}>
            🎤
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.soundToggle}
          onPress={() => setSoundEnabled(!soundEnabled)}
        >
          <Text style={styles.soundToggleText}>
            {soundEnabled ? "🔊" : "🔇"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.keyNamesToggle}
          onPress={() => setShowKeyNames(!showKeyNames)}
        >
          <Text style={[
            styles.keyNamesToggleText,
            { opacity: showKeyNames ? 1 : 0.5 }
          ]}>
            {showKeyNames ? "ABC" : "abc"}
          </Text>
        </TouchableOpacity>

        <View style={styles.topSection}>
          <ChordCard
            chord={currentChord}
            inversion={currentInversion}
            showResult={showResult}
            isCorrect={isCorrect}
            audioMode={audioMode}
            waitingForChord={waitingForChord}
            lastDetectedChord={lastDetectedChord}
          />
        </View>

        <View style={styles.mainContent}>
          {deckStats && (
            <View style={styles.progressContainer}>
              <ProgressBar
                current={deckStats.completionPercentage}
                total={100}
              />
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
  topSection: {
    position: "absolute",
    top: 10,
    alignItems: "center",
    width: "100%",
  },
  mainContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 60, // Add space for the ChordCard at the top
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
    fontSize: 28,
    fontWeight: "600",
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
    backgroundColor: "rgba(231, 76, 60, 0.2)",
    borderRadius: 25,
  },
  audioModeText: {
    fontSize: 24,
  },
  audioModeActiveText: {
    color: "#e74c3c",
  },
});

export default PianoKeyboard;