import { Audio } from "expo-av";
import { notes } from "../data/chords";

// Cache for loaded sounds to improve performance
const soundCache: Map<string, Audio.Sound> = new Map();
let isInitialized = false;

// Pre-generate all piano notes in background (non-blocking)
const preGenerateAllNotes = (): void => {
  // Add C6 which is not in the imported notes array
  const allNotes = [
    ...notes,
    { note: "C6", freq: 1046.5, type: "white" as const },
  ];

  // Generate notes in background, don't await
  allNotes.forEach(async ({ note, freq }) => {
    if (!soundCache.has(note)) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: `data:audio/wav;base64,${generatePianoTone(freq)}` },
          { shouldPlay: false, volume: 1.0 }
        );
        soundCache.set(note, sound);
      } catch (error) {
        console.log("Error pre-generating note:", note, error);
      }
    }
  });
};

// Check if audio system is initialized
export const isAudioReady = (): boolean => {
  return isInitialized;
};

export const initPianoAudio = async (): Promise<void> => {
  if (isInitialized) return;

  // Don't set audio mode here - let the recording system manage it
  // This prevents conflicts with continuous recording
  try {
    // Only set minimal audio settings that don't interfere with recording
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true, // Always play sounds, even when muted
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
    });
  } catch (error) {
    console.log('Error setting audio mode for piano:', error);
  }

  isInitialized = true;
  
  // Start pre-generating notes in background (non-blocking)
  preGenerateAllNotes();
};

// Enhanced piano synthesis with multiple harmonics and proper ADSR envelope
const generatePianoTone = (frequency: number): string => {
  const sampleRate = 44100;
  const duration = 2.0; // Longer duration for more realistic decay
  const numSamples = Math.floor(sampleRate * duration);

  // ADSR Envelope parameters for piano-like sound
  const attackTime = 0.0001; // Near-instant attack (0.1ms)
  const decayTime = 0.1; // Quick decay
  const sustainLevel = 0.3; // Lower sustain level
  const releaseTime = 1.5; // Long release for piano resonance

  // Harmonic amplitudes for piano-like timbre
  const harmonics = [
    { ratio: 1, amplitude: 1.0 }, // Fundamental
    { ratio: 2, amplitude: 0.5 }, // 2nd harmonic
    { ratio: 3, amplitude: 0.25 }, // 3rd harmonic
    { ratio: 4, amplitude: 0.125 }, // 4th harmonic
    { ratio: 5, amplitude: 0.0625 }, // 5th harmonic
    { ratio: 6, amplitude: 0.03125 }, // 6th harmonic
    { ratio: 7, amplitude: 0.015625 }, // 7th harmonic
    { ratio: 8, amplitude: 0.0078125 }, // 8th harmonic
  ];

  // Add slight inharmonicity for more realistic piano sound
  const inharmonicity = 0.0001;

  // Generate WAV header
  const dataSize = numSamples * 2; // 16-bit samples
  const fileSize = dataSize + 36;

  const header: number[] = [
    // "RIFF"
    0x52,
    0x49,
    0x46,
    0x46,
    // File size - 8
    fileSize & 0xff,
    (fileSize >> 8) & 0xff,
    (fileSize >> 16) & 0xff,
    (fileSize >> 24) & 0xff,
    // "WAVE"
    0x57,
    0x41,
    0x56,
    0x45,
    // "fmt "
    0x66,
    0x6d,
    0x74,
    0x20,
    // Subchunk1Size (16 for PCM)
    0x10,
    0x00,
    0x00,
    0x00,
    // AudioFormat (1 for PCM)
    0x01,
    0x00,
    // NumChannels (1 for mono)
    0x01,
    0x00,
    // SampleRate
    sampleRate & 0xff,
    (sampleRate >> 8) & 0xff,
    (sampleRate >> 16) & 0xff,
    (sampleRate >> 24) & 0xff,
    // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    (sampleRate * 2) & 0xff,
    ((sampleRate * 2) >> 8) & 0xff,
    ((sampleRate * 2) >> 16) & 0xff,
    ((sampleRate * 2) >> 24) & 0xff,
    // BlockAlign (NumChannels * BitsPerSample/8)
    0x02,
    0x00,
    // BitsPerSample
    0x10,
    0x00,
    // "data"
    0x64,
    0x61,
    0x74,
    0x61,
    // Subchunk2Size
    dataSize & 0xff,
    (dataSize >> 8) & 0xff,
    (dataSize >> 16) & 0xff,
    (dataSize >> 24) & 0xff,
  ];

  const samples: number[] = [];
  const attackSamples = Math.floor(attackTime * sampleRate);
  const decaySamples = Math.floor(decayTime * sampleRate);
  const releaseSamples = Math.floor(releaseTime * sampleRate);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let envelope = 0;

    // ADSR Envelope
    if (i < attackSamples) {
      // Attack phase - start at higher value for instant response
      envelope = 0.8 + 0.2 * (i / attackSamples);
    } else if (i < attackSamples + decaySamples) {
      // Decay phase
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1 - (1 - sustainLevel) * decayProgress;
    } else {
      // Sustain and Release phase
      const releaseProgress =
        (i - attackSamples - decaySamples) / releaseSamples;
      envelope = sustainLevel * Math.exp(-releaseProgress * 4);
    }

    // Generate sample with harmonics
    let sample = 0;
    for (const harmonic of harmonics) {
      // Add slight inharmonicity to higher harmonics
      const harmonicFreq =
        frequency *
        harmonic.ratio *
        (1 + inharmonicity * harmonic.ratio * harmonic.ratio);
      sample += Math.sin(2 * Math.PI * harmonicFreq * t) * harmonic.amplitude;
    }

    // Apply envelope and normalize
    sample = sample * envelope * 0.3;

    // Add very subtle noise for realism
    sample += (Math.random() - 0.5) * 0.001 * envelope;

    // Convert to 16-bit signed integer
    const sampleInt = Math.max(
      -32768,
      Math.min(32767, Math.round(sample * 32767))
    );

    // Little-endian format
    samples.push(sampleInt & 0xff);
    samples.push((sampleInt >> 8) & 0xff);
  }

  // Combine header and samples
  const data = header.concat(samples);

  // Convert to base64 more efficiently using array
  const binaryArray = new Array(data.length);
  for (let i = 0; i < data.length; i++) {
    binaryArray[i] = String.fromCharCode(data[i]);
  }
  const binary = binaryArray.join("");

  return btoa(binary);
};

export const playPianoNote = async (
  note: string,
  frequency: number
): Promise<void> => {
  try {
    // Check if we have a cached sound for this note
    let sound = soundCache.get(note);

    if (!sound) {
      // Generate and cache the sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,${generatePianoTone(frequency)}` },
        { shouldPlay: false, volume: 1.0, isLooping: false }
      );
      sound = newSound;

      // Set audio mode for low latency
      await sound.setStatusAsync({
        androidImplementation: "MediaPlayer",
        progressUpdateIntervalMillis: 100,
      });

      // Cache it for reuse (limit cache size)
      if (soundCache.size > 30) {
        // Remove oldest entries if cache is too large
        const firstKey = soundCache.keys().next().value;
        if (firstKey !== undefined) {
          const firstSound = soundCache.get(firstKey);
          if (firstSound) {
            await firstSound.unloadAsync();
          }
          soundCache.delete(firstKey);
        }
      }
      soundCache.set(note, sound);
    }

    // Reset and play without checking status for better performance
    try {
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch (error) {
      // If error, try stop then play
      await sound.stopAsync();
      await sound.setPositionAsync(0);
      await sound.playAsync();
    }
  } catch (error) {
    console.error("Error playing piano note:", error);
  }
};

// Play a chord (multiple notes simultaneously)
export const playChord = async (
  notes: Array<{ note: string; frequency: number }>
): Promise<void> => {
  try {
    // Play all notes of the chord simultaneously
    const playPromises = notes.map(({ note, frequency }) =>
      playPianoNote(note, frequency)
    );

    await Promise.all(playPromises);
  } catch (error) {
    console.error("Error playing chord:", error);
  }
};

// Cleanup function to unload all cached sounds
export const cleanupPianoAudio = async (): Promise<void> => {
  for (const [_, sound] of soundCache) {
    try {
      await sound.unloadAsync();
    } catch (error) {
      console.error("Error unloading sound:", error);
    }
  }
  soundCache.clear();
};