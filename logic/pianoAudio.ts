import { Audio } from "expo-av";

// Cache for loaded sounds to improve performance
const soundCache: Map<string, Audio.Sound> = new Map();
let isInitialized = false;

export const initPianoAudio = async (): Promise<void> => {
  if (isInitialized) return;
  
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    staysActiveInBackground: false,
    interruptionModeIOS: 1, // Do not mix with other apps
    interruptionModeAndroid: 1,
  });
  
  isInitialized = true;
};

// Enhanced piano synthesis with multiple harmonics and proper ADSR envelope
const generatePianoTone = (frequency: number): string => {
  const sampleRate = 44100;
  const duration = 2.0; // Longer duration for more realistic decay
  const numSamples = Math.floor(sampleRate * duration);
  
  // ADSR Envelope parameters for piano-like sound
  const attackTime = 0.0001; // Near-instant attack (0.1ms)
  const decayTime = 0.1;     // Quick decay
  const sustainLevel = 0.3;   // Lower sustain level
  const releaseTime = 1.5;    // Long release for piano resonance
  
  // Harmonic amplitudes for piano-like timbre
  const harmonics = [
    { ratio: 1, amplitude: 1.0 },    // Fundamental
    { ratio: 2, amplitude: 0.5 },    // 2nd harmonic
    { ratio: 3, amplitude: 0.25 },   // 3rd harmonic
    { ratio: 4, amplitude: 0.125 },  // 4th harmonic
    { ratio: 5, amplitude: 0.0625 }, // 5th harmonic
    { ratio: 6, amplitude: 0.03125 },// 6th harmonic
    { ratio: 7, amplitude: 0.015625 },// 7th harmonic
    { ratio: 8, amplitude: 0.0078125 },// 8th harmonic
  ];
  
  // Add slight inharmonicity for more realistic piano sound
  const inharmonicity = 0.0001;
  
  // Generate WAV header
  const dataSize = numSamples * 2; // 16-bit samples
  const fileSize = dataSize + 36;
  
  const header: number[] = [
    // "RIFF"
    0x52, 0x49, 0x46, 0x46,
    // File size - 8
    fileSize & 0xff, (fileSize >> 8) & 0xff, (fileSize >> 16) & 0xff, (fileSize >> 24) & 0xff,
    // "WAVE"
    0x57, 0x41, 0x56, 0x45,
    // "fmt "
    0x66, 0x6d, 0x74, 0x20,
    // Subchunk1Size (16 for PCM)
    0x10, 0x00, 0x00, 0x00,
    // AudioFormat (1 for PCM)
    0x01, 0x00,
    // NumChannels (1 for mono)
    0x01, 0x00,
    // SampleRate
    sampleRate & 0xff, (sampleRate >> 8) & 0xff, (sampleRate >> 16) & 0xff, (sampleRate >> 24) & 0xff,
    // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    (sampleRate * 2) & 0xff, ((sampleRate * 2) >> 8) & 0xff, ((sampleRate * 2) >> 16) & 0xff, ((sampleRate * 2) >> 24) & 0xff,
    // BlockAlign (NumChannels * BitsPerSample/8)
    0x02, 0x00,
    // BitsPerSample
    0x10, 0x00,
    // "data"
    0x64, 0x61, 0x74, 0x61,
    // Subchunk2Size
    dataSize & 0xff, (dataSize >> 8) & 0xff, (dataSize >> 16) & 0xff, (dataSize >> 24) & 0xff,
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
      envelope = 0.8 + (0.2 * (i / attackSamples));
    } else if (i < attackSamples + decaySamples) {
      // Decay phase
      const decayProgress = (i - attackSamples) / decaySamples;
      envelope = 1 - (1 - sustainLevel) * decayProgress;
    } else {
      // Sustain and Release phase
      const releaseProgress = (i - attackSamples - decaySamples) / releaseSamples;
      envelope = sustainLevel * Math.exp(-releaseProgress * 4);
    }
    
    // Generate sample with harmonics
    let sample = 0;
    for (const harmonic of harmonics) {
      // Add slight inharmonicity to higher harmonics
      const harmonicFreq = frequency * harmonic.ratio * (1 + inharmonicity * harmonic.ratio * harmonic.ratio);
      sample += Math.sin(2 * Math.PI * harmonicFreq * t) * harmonic.amplitude;
    }
    
    // Apply envelope and normalize
    sample = sample * envelope * 0.3;
    
    // Add very subtle noise for realism
    sample += (Math.random() - 0.5) * 0.001 * envelope;
    
    // Convert to 16-bit signed integer
    const sampleInt = Math.max(-32768, Math.min(32767, Math.round(sample * 32767)));
    
    // Little-endian format
    samples.push(sampleInt & 0xff);
    samples.push((sampleInt >> 8) & 0xff);
  }
  
  // Combine header and samples
  const data = header.concat(samples);
  
  // Convert to base64
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  
  return btoa(binary);
};

export const playPianoNote = async (note: string, frequency: number): Promise<void> => {
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
        androidImplementation: 'MediaPlayer',
        progressUpdateIntervalMillis: 100,
      });
      
      // Cache it for reuse (limit cache size)
      if (soundCache.size > 30) {
        // Remove oldest entries if cache is too large
        const firstKey = soundCache.keys().next().value;
        const firstSound = soundCache.get(firstKey);
        if (firstSound) {
          await firstSound.unloadAsync();
        }
        soundCache.delete(firstKey);
      }
      soundCache.set(note, sound);
    }
    
    // Stop and reset if already playing - do this quickly
    const status = await sound.getStatusAsync();
    if (status.isLoaded && status.isPlaying) {
      await sound.stopAsync();
    }
    if (status.isLoaded) {
      await sound.setPositionAsync(0);
    }
    
    // Play the sound immediately
    await sound.playAsync();
    
  } catch (error) {
    console.error("Error playing piano note:", error);
    // Fallback to simple tone if enhanced version fails
    playSimpleTone(frequency);
  }
};

// Fallback simple tone generator
const playSimpleTone = async (frequency: number): Promise<void> => {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${generateSimpleTone(frequency)}` },
      { shouldPlay: true }
    );
    
    setTimeout(async () => {
      await sound.unloadAsync();
    }, 500);
  } catch (error) {
    console.error("Error playing simple tone:", error);
  }
};

// Simple tone generator as fallback
const generateSimpleTone = (frequency: number): string => {
  const sampleRate = 44100;
  const duration = 0.3;
  const numSamples = sampleRate * duration;
  const amplitude = 0.3;

  const header: number[] = [
    0x52, 0x49, 0x46, 0x46, 0x24, 0x08, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
    0x66, 0x6d, 0x74, 0x20, 0x10, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
    0x44, 0xac, 0x00, 0x00, 0x88, 0x58, 0x01, 0x00, 0x02, 0x00, 0x10, 0x00,
    0x64, 0x61, 0x74, 0x61, 0x00, 0x08, 0x00, 0x00,
  ];

  const samples: number[] = [];
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const value = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    const envelope = Math.exp(-t * 3);
    const sample = Math.round(value * envelope * 32767);
    samples.push(sample & 0xff);
    samples.push((sample >> 8) & 0xff);
  }

  const data = header.concat(samples);
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }

  return btoa(binary);
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