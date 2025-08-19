import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { ChordDetector } from '../logic/chordRecognition/ChordDetector';
import { AudioProcessor, FFT } from '../logic/chordRecognition/AudioProcessor';

const ChordRecognitionScreen: React.FC = () => {
  const navigation = useNavigation();
  const [isRecording, setIsRecording] = useState(false);
  const [detectedChord, setDetectedChord] = useState<string>('No chord detected');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [chordHistory, setChordHistory] = useState<string[]>([]);
  const [confidence, setConfidence] = useState<number>(0);
  const [chordDetector] = useState(() => new ChordDetector());
  const [audioProcessor] = useState(() => new AudioProcessor(44100, 4096));
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<{
    chromagram: number[];
    topCandidates: { chord: string; score: number; confidence: number }[];
    expectedChord: string;
    actualChord: string;
    processedChromagram: number[];
  } | null>(null);
  const [debugTrace, setDebugTrace] = useState<string>('');

  useEffect(() => {
    // Request audio permissions on mount
    requestAudioPermissions();
    
    return () => {
      // Cleanup recording if active
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  const requestAudioPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Audio recording permission is required');
      }
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
    }
  };

  const startRecording = async () => {
    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      // Create and start recording with proper configuration
      const recordingOptions = {
        isMeteringEnabled: false, // We'll process the final audio instead
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      
      // Get the recording URI and process it
      const uri = recording.getURI();
      if (uri) {
        await processRecordedAudio(uri);
      }
      
      setRecording(null);
      setIsRecording(false);
      setIsProcessing(false);
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setIsProcessing(false);
    }
  };

  const processRecordedAudio = async (uri: string) => {
    try {
      // For web platform, we can use Web Audio API
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        // Fetch the audio file
        const response = await fetch(uri);
        const arrayBuffer = await response.arrayBuffer();
        
        // Create audio context
        const audioContext = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 });
        
        // Decode audio data
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Get audio data from first channel
        const audioData = audioBuffer.getChannelData(0);
        
        // Step 1: Downsample audio by 4x (as in EversongApp)
        console.log(`Original audio: ${audioData.length} samples at ${audioBuffer.sampleRate}Hz`);
        const downsampled = audioProcessor.downsampleBy4(audioData);
        const downsampledRate = audioBuffer.sampleRate / 4;
        console.log(`Downsampled: ${downsampled.length} samples at ${downsampledRate}Hz`);
        
        // Step 2: Process with circular buffer and overlap
        const chunkSize = 2048; // After downsampling (equivalent to 8192 original)
        const hopSize = chunkSize / 4; // 75% overlap
        const chromagrams: number[][] = [];
        
        // Find the loudest part of the signal for analysis
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
        
        // Process chunks around the loudest part with overlap
        const numChunks = 5; // Process 5 overlapping chunks
        for (let n = 0; n < numChunks; n++) {
          const i = bestChunkIndex - (2 * hopSize) + (n * hopSize);
          if (i < 0 || i > downsampled.length - chunkSize) continue;
          
          // Get chunk
          const chunk = downsampled.slice(i, i + chunkSize);
          
          // Apply window function (Hamming)
          const windowed = new Float32Array(chunkSize);
          for (let j = 0; j < chunkSize; j++) {
            const window = 0.54 - 0.46 * Math.cos((2 * Math.PI * j) / (chunkSize - 1));
            windowed[j] = chunk[j] * window;
          }
          
          // Perform FFT
          const magnitudeSpectrum = computeFFTMagnitude(windowed, downsampledRate);
          
          // Step 3: Apply band-pass filter (55-4000 Hz)
          const filtered = audioProcessor.applyBandPassFilter(magnitudeSpectrum, downsampledRate, 55, 4000);
          
          // Create chromagram from filtered spectrum
          // Detect if this is high-frequency content based on spectral energy distribution
          const highFreqEnergy = filtered.slice(Math.floor(filtered.length * 0.6)).reduce((sum, val) => sum + val, 0);
          const totalEnergy = filtered.reduce((sum, val) => sum + val, 0);
          const isHighFrequency = totalEnergy > 0 && (highFreqEnergy / totalEnergy) > 0.3;
          
          const chromagram = chordDetector.createChromagram(Array.from(filtered), downsampledRate, isHighFrequency);
          chromagrams.push(chromagram);
          
          // Log first chromagram for debugging
          if (chromagrams.length === 1) {
            console.log('First chromagram (after optimizations):', chromagram.map((v, i) => 
              `${['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'][i]}:${v.toFixed(3)}`
            ).join(', '));
          }
        }
        
        // Average all chromagrams
        const avgChromagram = new Array(12).fill(0);
        chromagrams.forEach(chroma => {
          chroma.forEach((val, idx) => {
            avgChromagram[idx] += val;
          });
        });
        avgChromagram.forEach((val, idx) => {
          avgChromagram[idx] /= chromagrams.length;
        });
        
        // Detect chord
        performChordDetection(avgChromagram);
        
        audioContext.close();
      } else {
        // For native platforms, we need a different approach
        // For now, show a message that real-time detection needs web platform
        Alert.alert('Platform Limitation', 'Real audio analysis currently works best on web platform. Native support coming soon.');
        
        // Fallback to basic detection
        const chromagram = new Array(12).fill(0.05);
        performChordDetection(chromagram);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      Alert.alert('Processing Error', 'Failed to process the recorded audio: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // Helper function to compute FFT magnitude using optimized FFT
  const computeFFTMagnitude = (audioData: Float32Array, sampleRate: number): Float32Array => {
    const N = audioData.length;
    
    // Use the optimized FFT class (Cooley-Tukey algorithm)
    const fft = new FFT(N);
    const real = new Float32Array(audioData);
    const imag = new Float32Array(N).fill(0);
    
    // Perform forward FFT
    fft.forward(real, imag);
    
    // Calculate magnitude spectrum
    const magnitude = new Float32Array(N / 2);
    for (let i = 0; i < N / 2; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    
    return magnitude;
  };
  
  // Helper function to perform chord detection and update UI
  const performChordDetection = (chromagram: number[]) => {
    // Clear the buffer before detection
    chordDetector.clearBuffer();
    
    // Get detailed detection results
    const detectionResult = chordDetector.detectChordWithDetails(chromagram);
    
    if (detectionResult.result) {
      const { result, debug } = detectionResult;
      
      setDetectedChord(result.fullName);
      setConfidence(result.confidence);
      
      // Update debug info (no expected chord since it's real detection)
      const debugData = {
        chromagram: debug.originalChromagram,
        processedChromagram: debug.processedChromagram,
        topCandidates: debug.topCandidates,
        expectedChord: 'Unknown (Real Audio)',
        actualChord: result.fullName,
      };
      setDebugInfo(debugData);
      
      // Create copyable debug trace
      const trace = `=== CHORD DETECTION DEBUG TRACE ===
Expected: Unknown (Real Audio)
Detected: ${result.fullName}

Top 5 Candidates:
${debug.topCandidates.map((c, i) => `  ${i+1}. ${c.chord.padEnd(8)} | Score: ${c.score.toFixed(4)} | Conf: ${(c.confidence * 100).toFixed(0)}%`).join('\n')}

Original Chromagram:
${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note, i) => 
  `  ${note.padEnd(3)}: ${debug.originalChromagram[i].toFixed(4)} ${'█'.repeat(Math.round(debug.originalChromagram[i] * 20))}`
).join('\n')}

Processed Chromagram (after 5th reduction):
${['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note, i) => 
  `  ${note.padEnd(3)}: ${debug.processedChromagram[i].toFixed(4)} ${'█'.repeat(Math.round(debug.processedChromagram[i] * 20))}`
).join('\n')}
===================================`;
      
      setDebugTrace(trace);
      
      // Add to history
      setChordHistory(prev => {
        const newHistory = [result.fullName, ...prev].slice(0, 5);
        return newHistory;
      });
      
      console.log(`Detected: ${result.fullName} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
    }
  };

  const clearHistory = () => {
    setChordHistory([]);
    setDetectedChord('No chord detected');
    setConfidence(0);
    setDebugInfo(null);
    setDebugTrace('');
  };
  
  const copyDebugTrace = () => {
    if (debugTrace) {
      // For React Native, we'd typically use Clipboard API
      // For web, we can use navigator.clipboard
      if (Platform.OS === 'web' && typeof window !== 'undefined' && (window as any).navigator?.clipboard) {
        (window as any).navigator.clipboard.writeText(debugTrace);
        Alert.alert('Copied', 'Debug trace copied to clipboard');
      } else {
        // Fallback for React Native
        Alert.alert('Debug Trace', debugTrace);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Chord Recognition Test</Text>
      </View>

      <View style={styles.mainContent}>
        {/* Left side - Detection and Controls */}
        <View style={styles.leftPanel}>
          <View style={styles.detectionCard}>
            <Text style={styles.detectedLabel}>Detected</Text>
            <Text style={styles.detectedChord}>{detectedChord}</Text>
            {confidence > 0 && (
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceBarSmall}>
                  <View 
                    style={[
                      styles.confidenceFillSmall,
                      { 
                        width: `${confidence * 100}%`,
                        backgroundColor: confidence > 0.8 ? '#27ae60' : confidence > 0.6 ? '#f39c12' : '#e74c3c'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.confidenceTextSmall}>{(confidence * 100).toFixed(0)}%</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={[styles.recordButton, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
          >
            <Text style={styles.recordButtonText}>
              {isProcessing ? '⏳ Processing' : isRecording ? '⏹ Stop' : '🎤 Record'}
            </Text>
          </TouchableOpacity>

          {debugInfo && (
            <View style={styles.comparisonCard}>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Expected:</Text>
                <Text style={[styles.comparisonValue, styles.expectedChord]}>{debugInfo.expectedChord}</Text>
              </View>
              <View style={styles.comparisonRow}>
                <Text style={styles.comparisonLabel}>Detected:</Text>
                <Text style={[styles.comparisonValue, 
                  debugInfo.actualChord.toLowerCase() === debugInfo.expectedChord.toLowerCase() 
                    ? styles.correctChord 
                    : styles.incorrectChord
                ]}>
                  {debugInfo.actualChord}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.historyCard}>
            <Text style={styles.historyTitleSmall}>History</Text>
            {chordHistory.slice(0, 3).map((chord, index) => (
              <Text key={index} style={styles.historyItemSmall}>{chord}</Text>
            ))}
            {chordHistory.length === 0 && (
              <Text style={styles.historyItemSmall}>-</Text>
            )}
          </View>
        </View>

        {/* Right side - Debug Information */}
        {debugInfo && (
          <View style={styles.rightPanel}>
            <View style={styles.candidatesCard}>
              <Text style={styles.sectionTitle}>Top Candidates</Text>
              {debugInfo.topCandidates.slice(0, 3).map((candidate, index) => (
                <View key={index} style={styles.candidateRowCompact}>
                  <Text style={styles.candidateRankCompact}>#{index + 1}</Text>
                  <Text style={styles.candidateChordCompact}>{candidate.chord}</Text>
                  <Text style={styles.candidateScoreCompact}>{candidate.score.toFixed(3)}</Text>
                  <Text style={styles.candidateConfidenceCompact}>{(candidate.confidence * 100).toFixed(0)}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.chromagramCard}>
              <Text style={styles.sectionTitle}>Chromagram</Text>
              <View style={styles.chromagramGrid}>
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note, index) => (
                  <View key={index} style={styles.chromagramItem}>
                    <Text style={styles.chromagramNoteCompact}>{note}</Text>
                    <View style={styles.barCompact}>
                      <View 
                        style={[
                          styles.barFillCompact,
                          { 
                            height: `${Math.min(100, debugInfo.chromagram[index] * 300)}%`,
                            backgroundColor: '#3498db'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.chromagramValueCompact}>{(debugInfo.chromagram[index] * 100).toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.chromagramCard}>
              <Text style={styles.sectionTitle}>After Fifth Reduction</Text>
              <View style={styles.chromagramGrid}>
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((note, index) => (
                  <View key={index} style={styles.chromagramItem}>
                    <Text style={styles.chromagramNoteCompact}>{note}</Text>
                    <View style={styles.barCompact}>
                      <View 
                        style={[
                          styles.barFillCompact,
                          { 
                            height: `${Math.min(100, debugInfo.processedChromagram[index] * 300)}%`,
                            backgroundColor: '#e74c3c'
                          }
                        ]} 
                      />
                    </View>
                    <Text style={styles.chromagramValueCompact}>{(debugInfo.processedChromagram[index] * 100).toFixed(0)}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.debugTraceCard}>
              <View style={styles.debugTraceHeader}>
                <Text style={styles.sectionTitle}>Debug Trace</Text>
                <TouchableOpacity onPress={copyDebugTrace} style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.debugTraceScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.debugTraceText}>{debugTrace}</Text>
              </ScrollView>
            </View>
          </View>
        )}

        {!debugInfo && (
          <View style={styles.rightPanel}>
            <View style={styles.placeholderCard}>
              <Text style={styles.placeholderText}>
                Press Record to start testing chord detection.
                Debug information will appear here.
              </Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 32,
    fontWeight: '300',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  leftPanel: {
    width: '35%',
    paddingRight: 5,
  },
  rightPanel: {
    flex: 1,
    paddingLeft: 5,
  },
  detectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  detectedLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 5,
  },
  detectedChord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  confidenceBarSmall: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  confidenceFillSmall: {
    height: '100%',
    borderRadius: 3,
  },
  confidenceTextSmall: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    width: 35,
  },
  recordButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.15)',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#3498db',
    marginBottom: 10,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderColor: '#e74c3c',
  },
  recordButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  comparisonCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  comparisonLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    width: 60,
  },
  comparisonValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
  },
  historyTitleSmall: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 5,
  },
  historyItemSmall: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 2,
  },
  candidatesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  candidateRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
  },
  candidateRankCompact: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    width: 20,
  },
  candidateChordCompact: {
    fontSize: 11,
    color: 'white',
    flex: 1,
    fontWeight: '500',
  },
  candidateScoreCompact: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.5)',
    marginRight: 8,
  },
  candidateConfidenceCompact: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    width: 35,
    textAlign: 'right',
  },
  chromagramCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  chromagramGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chromagramItem: {
    alignItems: 'center',
    flex: 1,
  },
  chromagramNoteCompact: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 3,
  },
  barCompact: {
    width: 20,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    justifyContent: 'flex-end',
    marginBottom: 3,
  },
  barFillCompact: {
    width: '100%',
    borderRadius: 2,
  },
  chromagramValueCompact: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  placeholderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 20,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
    lineHeight: 20,
  },
  expectedChord: {
    color: '#3498db',
  },
  correctChord: {
    color: '#27ae60',
  },
  incorrectChord: {
    color: '#e74c3c',
  },
  debugTraceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 10,
    flex: 1,
    minHeight: 120,
  },
  debugTraceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  copyButton: {
    backgroundColor: 'rgba(52, 152, 219, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  copyButtonText: {
    fontSize: 11,
    color: '#3498db',
    fontWeight: '600',
  },
  debugTraceScroll: {
    flex: 1,
    maxHeight: 100,
  },
  debugTraceText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 12,
  },
});

export default ChordRecognitionScreen;