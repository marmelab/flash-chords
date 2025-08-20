/**
 * Continuous Audio Recognition for Piano Practice
 * Runs continuously and reports detected chords via callback
 */

import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { ChordDetector } from './chordRecognition/ChordDetector';
import { AudioProcessor } from './chordRecognition/AudioProcessor';
import { AudioFileParser } from './chordRecognition/AudioFileParser';

export type ChordDetectionCallback = (chord: string | null, notes: string[]) => void;

export class ContinuousAudioRecognition {
  private chordDetector: ChordDetector;
  private audioProcessor: AudioProcessor;
  private recording: Audio.Recording | null = null;
  private isRunning = false;
  private callback: ChordDetectionCallback | null = null;
  private recordingCycleTimeout: ReturnType<typeof setTimeout> | null = null;
  
  constructor() {
    this.chordDetector = new ChordDetector();
    this.audioProcessor = new AudioProcessor(44100, 4096);
  }
  
  async start(callback: ChordDetectionCallback): Promise<void> {
    if (this.isRunning) {
      console.log('Already running continuous recognition');
      return;
    }
    
    console.log('Starting continuous audio recognition');
    this.isRunning = true;
    this.callback = callback;
    
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      console.error('Microphone permission denied');
      this.isRunning = false;
      return;
    }
    
    // Configure audio mode BEFORE starting recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    });
    
    // Start the continuous recording cycle
    this.startRecordingCycle();
  }
  
  async stop(): Promise<void> {
    console.log('Stopping continuous audio recognition');
    this.isRunning = false;
    this.callback = null;
    
    // Clear any pending timeout
    if (this.recordingCycleTimeout) {
      clearTimeout(this.recordingCycleTimeout);
      this.recordingCycleTimeout = null;
    }
    
    // Stop current recording if any
    if (this.recording) {
      try {
        const recordingToStop = this.recording;
        this.recording = null; // Clear reference first
        await recordingToStop.stopAndUnloadAsync();
      } catch (error) {
        console.error('Error stopping recording:', error);
        this.recording = null;
      }
    }
    
    // Only reset audio mode when completely stopping continuous recognition
    // Don't reset between recording cycles
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
  }
  
  private async startRecordingCycle(): Promise<void> {
    if (!this.isRunning) return;
    
    // Ensure no recording is in progress
    if (this.recording) {
      console.log('Recording already in progress, skipping cycle');
      return;
    }
    
    try {
      // Always re-ensure audio mode is set for recording before each cycle
      // This is critical for iOS which may reset the mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Small delay to ensure mode is set
      await new Promise<void>(resolve => setTimeout(resolve, 50));
      
      // Recording options - use same format as test screen for consistency
      const recordingOptions: Audio.RecordingOptions = {
        isMeteringEnabled: false,
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.wav',  // Changed to WAV like test screen
          audioQuality: Audio.IOSAudioQuality.MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };
      
      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      this.recording = recording;
      
      // Stop after 3 seconds for better chord detection (matches test screen)
      setTimeout(async () => {
        if (this.isRunning && this.recording === recording) {
          await this.stopAndProcessRecording();
        }
      }, 3000);
      
    } catch (error) {
      console.error('Error in recording cycle:', error);
      // Schedule retry if still running
      if (this.isRunning) {
        this.recordingCycleTimeout = setTimeout(() => {
          this.startRecordingCycle();
        }, 1000);
      }
    }
  }
  
  private async stopAndProcessRecording(): Promise<void> {
    if (!this.recording) {
      console.log('No recording to stop');
      // If still running, start next cycle
      if (this.isRunning) {
        this.scheduleNextCycle();
      }
      return;
    }
    
    try {
      // Stop the recording
      const recordingToProcess = this.recording;
      this.recording = null; // Clear reference immediately
      
      console.log('Stopping recording...');
      await recordingToProcess.stopAndUnloadAsync();
      const uri = recordingToProcess.getURI();
      
      if (uri) {
        console.log('Recording stopped, processing audio from:', uri);
        // Process in background while starting next recording
        this.processAudioInBackground(uri);
      } else {
        console.log('No URI from recording');
      }
      
      // Start next cycle immediately with small gap
      if (this.isRunning) {
        this.scheduleNextCycle();
      }
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      this.recording = null; // Ensure recording is cleared on error
      if (this.isRunning) {
        this.scheduleNextCycle();
      }
    }
  }
  
  private scheduleNextCycle(): void {
    // Small gap between recordings (200ms - enough for iOS, but still responsive)
    this.recordingCycleTimeout = setTimeout(() => {
      this.startRecordingCycle();
    }, 200);
  }
  
  private async processAudioInBackground(uri: string): Promise<void> {
    try {
      let audioData: Float32Array;
      let sampleRate: number;
      
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Web platform
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioData = audioBuffer.getChannelData(0);
        sampleRate = audioBuffer.sampleRate;
        audioContext.close();
      } else {
        // Native platforms
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) return;
        
        const base64Data = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        const parsed = AudioFileParser.parseAudioFile(base64Data);
        audioData = parsed.samples;
        sampleRate = parsed.sampleRate;
      }
      
      // Process and detect chord
      const result = this.processAudioData(audioData, sampleRate);
      
      // Report result via callback
      if (this.callback && result) {
        this.callback(result.chord, result.notes);
      } else if (this.callback) {
        this.callback(null, []);
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      if (this.callback) {
        this.callback(null, []);
      }
    }
  }
  
  private processAudioData(audioData: Float32Array, sampleRate: number): { chord: string; notes: string[] } | null {
    console.log(`Processing audio: ${audioData.length} samples at ${sampleRate}Hz`);
    
    // Check signal strength
    let maxAmplitude = 0;
    let sumAmplitude = 0;
    for (let i = 0; i < audioData.length; i++) {
      const absVal = Math.abs(audioData[i]);
      if (absVal > maxAmplitude) {
        maxAmplitude = absVal;
      }
      sumAmplitude += absVal;
    }
    const avgAmplitude = sumAmplitude / audioData.length;
    
    console.log(`Signal analysis: max=${maxAmplitude.toFixed(4)}, avg=${avgAmplitude.toFixed(6)}`);
    
    // Higher threshold for considering it an actual response
    // User must be actively playing something
    const MIN_AMPLITUDE_FOR_RESPONSE = 0.02; // Require clear signal (2%)
    const MIN_AVG_AMPLITUDE = 0.001; // Require sustained signal (0.1%)
    
    if (maxAmplitude < MIN_AMPLITUDE_FOR_RESPONSE || avgAmplitude < MIN_AVG_AMPLITUDE) {
      console.log('No significant audio input detected - waiting for user to play');
      return null;
    }
    
    console.log('Significant audio detected - processing for chord recognition');
    
    // Amplify if needed
    let processedAudio = audioData;
    if (maxAmplitude < 0.1) {
      const amplificationFactor = 0.3 / maxAmplitude;
      processedAudio = new Float32Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        processedAudio[i] = audioData[i] * amplificationFactor;
      }
    }
    
    // Process audio
    const downsampled = this.audioProcessor.downsampleBy4(processedAudio);
    const downsampledRate = sampleRate / 4;
    
    const chunkSize = 2048;
    const hopSize = chunkSize / 4;
    const chromagrams: number[][] = [];
    
    // Find loudest part
    let maxEnergy = 0;
    let bestChunkIndex = 0;
    
    for (let i = 0; i < downsampled.length - chunkSize; i += hopSize) {
      const chunk = downsampled.slice(i, i + chunkSize);
      const energy = chunk.reduce((sum, val) => sum + val * val, 0);
      if (energy > maxEnergy) {
        maxEnergy = energy;
        bestChunkIndex = i;
      }
    }
    
    // Check if we have enough energy to process
    console.log(`Max energy in audio: ${maxEnergy}`);
    const MIN_ENERGY_FOR_DETECTION = 0.001; // Require significant energy
    if (maxEnergy < MIN_ENERGY_FOR_DETECTION) {
      console.log('Insufficient energy for chord detection - no active playing detected');
      return null;
    }
    
    // Process chunks
    const numChunks = 5;
    let validChunks = 0;
    for (let n = 0; n < numChunks; n++) {
      const i = bestChunkIndex - (2 * hopSize) + (n * hopSize);
      if (i < 0 || i > downsampled.length - chunkSize) continue;
      
      const chunk = downsampled.slice(i, i + chunkSize);
      
      // Check if chunk has signal
      const chunkEnergy = chunk.reduce((sum, val) => sum + val * val, 0);
      if (chunkEnergy < 0.00001) continue;
      
      const windowed = new Float32Array(chunkSize);
      
      for (let j = 0; j < chunkSize; j++) {
        const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * j) / (chunkSize - 1));
        windowed[j] = chunk[j] * window;
      }
      
      // FFT
      const { real, imag } = this.audioProcessor.performFFT(windowed);
      const N = windowed.length;
      const magnitude = new Float32Array(N / 2);
      for (let i = 0; i < N / 2; i++) {
        magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
      }
      
      const filtered = this.audioProcessor.applyBandPassFilter(magnitude, downsampledRate, 55, 4000);
      
      const highFreqEnergy = filtered.slice(Math.floor(filtered.length * 0.6)).reduce((sum, val) => sum + val, 0);
      const totalEnergy = filtered.reduce((sum, val) => sum + val, 0);
      const isHighFrequency = totalEnergy > 0 && (highFreqEnergy / totalEnergy) > 0.3;
      
      const chromagram = this.chordDetector.createChromagram(Array.from(filtered), downsampledRate, isHighFrequency);
      
      // Validate chromagram - check for NaN values
      const hasValidValues = chromagram.some(val => !isNaN(val) && val > 0);
      if (hasValidValues) {
        chromagrams.push(chromagram);
        validChunks++;
      }
    }
    
    if (validChunks === 0) {
      console.log('No valid chromagrams generated');
      return null;
    }
    
    // Average chromagrams
    const avgChromagram = new Array(12).fill(0);
    chromagrams.forEach(chroma => {
      chroma.forEach((val, idx) => {
        if (!isNaN(val)) {
          avgChromagram[idx] += val;
        }
      });
    });
    avgChromagram.forEach((val, idx) => {
      avgChromagram[idx] /= chromagrams.length;
    });
    
    // Validate averaged chromagram
    const hasValidChromagram = avgChromagram.some(val => !isNaN(val) && val > 0);
    if (!hasValidChromagram) {
      console.log('Invalid chromagram after averaging');
      return null;
    }
    
    // Check for noise pattern - if all notes have similar energy, it's likely noise
    const maxChroma = Math.max(...avgChromagram);
    const minChroma = Math.min(...avgChromagram);
    const chromaRange = maxChroma - minChroma;
    const avgChroma = avgChromagram.reduce((sum, val) => sum + val, 0) / 12;
    
    // Calculate standard deviation to detect if values are too uniform (noise)
    const variance = avgChromagram.reduce((sum, val) => sum + Math.pow(val - avgChroma, 2), 0) / 12;
    const stdDev = Math.sqrt(variance);
    
    console.log('Chromagram:', avgChromagram.map((v, i) => 
      `${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][i]}:${v.toFixed(2)}`
    ).join(' '));
    console.log(`Chromagram stats: range=${chromaRange.toFixed(3)}, stdDev=${stdDev.toFixed(3)}, max=${maxChroma.toFixed(3)}`);
    
    // If chromagram is too uniform (low std dev), it's likely noise
    const MIN_STD_DEV = 0.03; // Require some variation in note strengths (lowered)
    const MIN_RANGE = 0.08; // Require difference between strongest and weakest notes (lowered)
    const MIN_MAX_VALUE = 0.1; // Require at least one strong note (lowered)
    
    if (stdDev < MIN_STD_DEV || chromaRange < MIN_RANGE || maxChroma < MIN_MAX_VALUE) {
      console.log('Chromagram appears to be noise (too uniform or weak)');
      return null;
    }
    
    // Check for clear peaks - a real chord should have 3-5 prominent notes
    // Use a lower threshold for detecting "strong" notes
    const threshold = maxChroma * 0.3; // Notes should be at least 30% of the strongest (lowered from 60%)
    const strongNotes = avgChromagram.filter(val => val > threshold).length;
    
    // Also count medium-strength notes for complex chords
    const mediumThreshold = maxChroma * 0.25;
    const mediumNotes = avgChromagram.filter(val => val > mediumThreshold).length;
    
    // Accept if we have 3-5 strong notes OR 3-6 medium notes (for complex chords)
    if ((strongNotes < 3 || strongNotes > 5) && (mediumNotes < 3 || mediumNotes > 6)) {
      console.log(`Invalid chord pattern: ${strongNotes} strong notes, ${mediumNotes} medium notes`);
      return null;
    }
    
    // Detect chord
    this.chordDetector.clearBuffer();
    const detectionResult = this.chordDetector.detectChordWithDetails(avgChromagram);
    
    // Higher confidence threshold to avoid false positives
    const MIN_CONFIDENCE_FOR_DETECTION = 0.45; // 45% confidence minimum
    
    if (detectionResult.result && detectionResult.result.confidence > MIN_CONFIDENCE_FOR_DETECTION) {
      const { result } = detectionResult;
      console.log(`Detected: ${result.fullName} (confidence: ${result.confidence.toFixed(2)})`);
      const detectedNotes = this.mapChordToNotes(result.fullName);
      
      return {
        chord: result.fullName,
        notes: detectedNotes
      };
    }
    
    console.log(`No chord detected or confidence too low (${detectionResult.result?.confidence?.toFixed(2) || 0})`);
    return null;
  }
  
  private mapChordToNotes(detectedChordName: string): string[] {
    const noteMap: { [key: string]: string } = {
      'C': 'C4', 'C#': 'C#4', 'Db': 'C#4',
      'D': 'D4', 'D#': 'D#4', 'Eb': 'D#4',
      'E': 'E4', 'F': 'F4',
      'F#': 'F#4', 'Gb': 'F#4',
      'G': 'G4', 'G#': 'G#4', 'Ab': 'G#4',
      'A': 'A4', 'A#': 'A#4', 'Bb': 'A#4',
      'B': 'B4'
    };
    
    const rootMatch = detectedChordName.match(/^([A-G][#b]?)/);
    if (!rootMatch) return [];
    
    const root = rootMatch[1];
    const rootNote = noteMap[root];
    if (!rootNote) return [];
    
    const getNotePlusSemitones = (baseNote: string, semitones: number): string => {
      const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const match = baseNote.match(/([A-G][#]?)(\d)/);
      if (!match) return '';
      
      const noteName = match[1];
      const octave = parseInt(match[2]);
      
      let noteIndex = noteOrder.indexOf(noteName);
      if (noteIndex === -1) return '';
      
      noteIndex += semitones;
      const newOctave = octave + Math.floor(noteIndex / 12);
      const newNoteIndex = ((noteIndex % 12) + 12) % 12;
      
      return `${noteOrder[newNoteIndex]}${newOctave}`;
    };
    
    const detectedNotes: string[] = [rootNote];
    
    if (detectedChordName.includes('Minor') || detectedChordName.includes('m')) {
      detectedNotes.push(getNotePlusSemitones(rootNote, 3));
      detectedNotes.push(getNotePlusSemitones(rootNote, 7));
    } else if (detectedChordName.includes('Dim')) {
      detectedNotes.push(getNotePlusSemitones(rootNote, 3));
      detectedNotes.push(getNotePlusSemitones(rootNote, 6));
    } else if (detectedChordName.includes('Aug')) {
      detectedNotes.push(getNotePlusSemitones(rootNote, 4));
      detectedNotes.push(getNotePlusSemitones(rootNote, 8));
    } else {
      detectedNotes.push(getNotePlusSemitones(rootNote, 4));
      detectedNotes.push(getNotePlusSemitones(rootNote, 7));
    }
    
    if (detectedChordName.includes('7')) {
      if (detectedChordName.includes('Maj7')) {
        detectedNotes.push(getNotePlusSemitones(rootNote, 11));
      } else {
        detectedNotes.push(getNotePlusSemitones(rootNote, 10));
      }
    }
    
    return detectedNotes.filter(note => note !== '');
  }
  
  isActive(): boolean {
    return this.isRunning;
  }
}