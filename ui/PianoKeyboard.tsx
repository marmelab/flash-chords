import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import PianoKey from "./PianoKey";
import ChordControls from "./ChordControls";
import { notes, getInversionName } from "../data/chords";
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
import type {
  PianoKeyboardComponent,
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

const unlockOrientation = (): void => {
  if (Platform.OS === "web") return;

  // First set to portrait, then unlock to allow both orientations
  ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
    .then(() => {
      // After setting to portrait, unlock to allow rotation
      return ScreenOrientation.unlockAsync();
    })
    .then(() => {
      console.log("Reset to portrait and unlocked");
    })
    .catch((error) => {
      console.log("Could not reset orientation:", error);
    });
};

const PianoKeyboard: PianoKeyboardComponent = ({
  chordDeck,
  onGoBack,
  onExerciseComplete,
}) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [currentChord, setCurrentChord] = useState<Chord | null>(null);
  const [currentInversion, setCurrentInversion] =
    useState<InversionType>("root");
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showKeyNames, setShowKeyNames] = useState<boolean>(false);
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeck | null>(
    null
  );
  const [deckStats, setDeckStats] = useState<DeckStats | null>(null);
  const [screenDimensions, setScreenDimensions] = useState(() =>
    Dimensions.get("window")
  );

  // Initialize audio system if not already done
  useEffect(() => {
    initPianoAudio();
  }, []);

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
    }
  };

  const handleKeyPress = (note: string, frequency: number): void => {
    if (showResult) return;

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
        onExerciseComplete(newStats);
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
  const keyboardWidth = Math.min(screenWidth - horizontalMargin, 900); // Max 900px
  const whiteKeyWidth = keyboardWidth / 14; // 14 white keys total
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          unlockOrientation();
          onGoBack();
        }}
      >
        <Text style={styles.backButtonText}>‹</Text>
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
        <View
          style={[
            styles.progressContainer,
            {
              width: keyboardWidth,
            },
          ]}
        >
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

      <View
        style={[
          styles.keyboard,
          {
            width: keyboardWidth,
          },
        ]}
      >
        {renderKeys()}
      </View>

      <ChordControls
        showResult={showResult}
        isCorrect={isCorrect}
        onSubmit={handleCheckAnswer}
        onNewChord={() => handleGenerateNewChord(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#2c3e50",
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 20,
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
  soundToggle: {
    position: "absolute",
    top: 10,
    right: 20,
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
    right: 80,
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
  chordCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginBottom: 10,
    marginTop: 20, // Reduced to move everything up
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    minHeight: 50, // Prevent layout shift
    alignItems: "center",
    justifyContent: "center",
  },
  correctCard: {
    backgroundColor: "rgba(39, 174, 96, 0.2)",
    borderColor: "#27ae60",
  },
  incorrectCard: {
    backgroundColor: "rgba(231, 76, 60, 0.2)",
    borderColor: "#e74c3c",
  },
  chordText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  keyboard: {
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
