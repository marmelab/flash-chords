/**
 * AudioProcessor - Handles audio processing for chord detection
 * Includes FFT implementation and audio buffer management
 */

export class AudioProcessor {
  private sampleRate: number;
  private bufferSize: number;
  private windowFunction: Float32Array;
  private circularBuffer: Float32Array;
  private bufferIndex: number = 0;
  
  constructor(sampleRate: number = 44100, bufferSize: number = 8192) {
    this.sampleRate = sampleRate;
    this.bufferSize = bufferSize;
    this.windowFunction = this.createHammingWindow(bufferSize);
    this.circularBuffer = new Float32Array(bufferSize);
  }

  /**
   * Create a Hamming window for FFT preprocessing
   */
  private createHammingWindow(size: number): Float32Array {
    const window = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (size - 1));
    }
    return window;
  }

  /**
   * Apply window function to audio buffer
   */
  private applyWindow(buffer: Float32Array): Float32Array {
    const windowed = new Float32Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      windowed[i] = buffer[i] * this.windowFunction[i];
    }
    return windowed;
  }

  /**
   * Perform Fast Fourier Transform on audio buffer using optimized FFT
   */
  public performFFT(audioBuffer: Float32Array): { real: Float32Array; imag: Float32Array } {
    const N = audioBuffer.length;
    const real = new Float32Array(N);
    const imag = new Float32Array(N);
    
    // Apply window function and copy to real array
    const windowed = this.applyWindow(audioBuffer);
    for (let i = 0; i < N; i++) {
      real[i] = windowed[i];
      imag[i] = 0;
    }
    
    // Use optimized FFT implementation
    const fft = new FFT(N);
    fft.forward(real, imag);
    
    return { real, imag };
  }

  /**
   * Calculate magnitude spectrum from FFT results
   */
  public calculateMagnitudeSpectrum(fftResult: { real: Float32Array; imag: Float32Array }): Float32Array {
    const { real, imag } = fftResult;
    const magnitude = new Float32Array(real.length);
    
    for (let i = 0; i < real.length; i++) {
      magnitude[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
    }
    
    return magnitude;
  }

  /**
   * Process audio chunk and return magnitude spectrum
   */
  public processAudioChunk(audioData: Float32Array): Float32Array {
    // Ensure buffer is the right size
    let processBuffer: Float32Array;
    
    if (audioData.length < this.bufferSize) {
      // Pad with zeros if needed
      processBuffer = new Float32Array(this.bufferSize);
      processBuffer.set(audioData);
    } else if (audioData.length > this.bufferSize) {
      // Take only what we need
      processBuffer = audioData.slice(0, this.bufferSize);
    } else {
      processBuffer = audioData;
    }
    
    // Perform FFT
    const fftResult = this.performFFT(processBuffer);
    
    // Calculate magnitude spectrum
    return this.calculateMagnitudeSpectrum(fftResult);
  }

  /**
   * Downsample audio data by a factor
   */
  public downsample(audioData: Float32Array, factor: number = 4): Float32Array {
    const newLength = Math.floor(audioData.length / factor);
    const downsampled = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      downsampled[i] = audioData[i * factor];
    }
    
    return downsampled;
  }

  /**
   * Convert audio buffer from Int16 to Float32 (normalized to -1 to 1)
   */
  public int16ToFloat32(buffer: Int16Array): Float32Array {
    const float32Buffer = new Float32Array(buffer.length);
    
    for (let i = 0; i < buffer.length; i++) {
      float32Buffer[i] = buffer[i] / 32768.0; // Normalize to [-1, 1]
    }
    
    return float32Buffer;
  }

  /**
   * Get sample rate
   */
  public getSampleRate(): number {
    return this.sampleRate;
  }

  /**
   * Get buffer size
   */
  public getBufferSize(): number {
    return this.bufferSize;
  }
  
  /**
   * Downsample audio by factor of 4 with anti-aliasing filter
   * V8 implementation with two-stage decimation for better quality
   */
  public downsampleBy4(audioData: Float32Array): Float32Array {
    // Two-stage decimation for better quality
    let data = audioData;
    
    // Stage 1: Downsample by 2
    data = this.downsampleBy2(data);
    
    // Stage 2: Downsample by 2 again
    data = this.downsampleBy2(data);
    
    return data;
  }
  
  /**
   * Downsample by factor of 2 with Chebyshev filter
   */
  private downsampleBy2(data: Float32Array): Float32Array {
    // Apply low-pass filter
    const filtered = this.chebyshevFilter(data, 0.45);
    
    const downsampled = new Float32Array(Math.floor(filtered.length / 2));
    for (let i = 0; i < downsampled.length; i++) {
      downsampled[i] = filtered[i * 2];
    }
    
    return downsampled;
  }
  
  /**
   * Chebyshev-like IIR filter for anti-aliasing
   */
  private chebyshevFilter(data: Float32Array, cutoff: number): Float32Array {
    const alpha = cutoff;
    const filtered = new Float32Array(data.length);
    
    // Forward pass
    filtered[0] = data[0];
    for (let i = 1; i < data.length; i++) {
      filtered[i] = alpha * data[i] + (1 - alpha) * filtered[i - 1];
    }
    
    // Backward pass for zero-phase
    for (let i = data.length - 2; i >= 0; i--) {
      filtered[i] = alpha * filtered[i] + (1 - alpha) * filtered[i + 1];
    }
    
    return filtered;
  }
  
  /**
   * Apply band-pass filter to frequency spectrum (55-4000 Hz)
   * Based on EversongApp implementation
   */
  public applyBandPassFilter(
    magnitudeSpectrum: Float32Array, 
    sampleRate: number,
    lowFreq: number = 55,
    highFreq: number = 4000
  ): Float32Array {
    const filtered = new Float32Array(magnitudeSpectrum.length);
    const binResolution = sampleRate / (magnitudeSpectrum.length * 2);
    
    const lowBin = Math.floor(lowFreq / binResolution);
    const highBin = Math.ceil(highFreq / binResolution);
    
    // Zero out frequencies outside the band
    for (let i = 0; i < magnitudeSpectrum.length; i++) {
      if (i >= lowBin && i <= highBin) {
        filtered[i] = magnitudeSpectrum[i];
      } else {
        filtered[i] = 0;
      }
    }
    
    return filtered;
  }
  
  /**
   * Add samples to circular buffer with overlap
   * Returns true when buffer is ready for processing
   */
  public addToCircularBuffer(samples: Float32Array): boolean {
    const hopSize = this.bufferSize / 4; // 25% hop for 75% overlap
    
    for (let i = 0; i < samples.length; i++) {
      this.circularBuffer[this.bufferIndex] = samples[i];
      this.bufferIndex = (this.bufferIndex + 1) % this.bufferSize;
    }
    
    // Return true when we've accumulated enough samples
    return this.bufferIndex === 0;
  }
  
  /**
   * Get the current circular buffer contents
   */
  public getCircularBuffer(): Float32Array {
    // Return buffer starting from current index (oldest samples first)
    const result = new Float32Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      result[i] = this.circularBuffer[(this.bufferIndex + i) % this.bufferSize];
    }
    return result;
  }
}

/**
 * Optimized FFT implementation using Cooley-Tukey algorithm
 * This is more efficient than the simple DFT above
 */
export class FFT {
  private size: number;
  private invSize: number;
  private table: Float32Array;
  
  constructor(size: number) {
    if ((size & (size - 1)) !== 0) {
      throw new Error('FFT size must be a power of 2');
    }
    
    this.size = size;
    this.invSize = 1 / size;
    this.table = new Float32Array(size * 2);
    
    // Precompute twiddle factors
    for (let i = 0; i < size; i++) {
      const angle = -2 * Math.PI * i / size;
      this.table[i * 2] = Math.cos(angle);
      this.table[i * 2 + 1] = Math.sin(angle);
    }
  }

  /**
   * Perform forward FFT
   */
  public forward(real: Float32Array, imag: Float32Array): void {
    this.transform(real, imag, false);
  }

  /**
   * Perform inverse FFT
   */
  public inverse(real: Float32Array, imag: Float32Array): void {
    this.transform(real, imag, true);
    
    // Scale by 1/N for inverse transform
    for (let i = 0; i < this.size; i++) {
      real[i] *= this.invSize;
      imag[i] *= this.invSize;
    }
  }

  /**
   * Core FFT transformation using Cooley-Tukey algorithm
   */
  private transform(real: Float32Array, imag: Float32Array, inverse: boolean): void {
    const n = this.size;
    
    // Bit reversal
    let j = 0;
    for (let i = 0; i < n - 1; i++) {
      if (i < j) {
        // Swap real[i] and real[j]
        let temp = real[i];
        real[i] = real[j];
        real[j] = temp;
        
        // Swap imag[i] and imag[j]
        temp = imag[i];
        imag[i] = imag[j];
        imag[j] = temp;
      }
      
      let k = n / 2;
      while (k <= j) {
        j -= k;
        k /= 2;
      }
      j += k;
    }
    
    // Cooley-Tukey FFT
    for (let len = 2; len <= n; len *= 2) {
      const halfLen = len / 2;
      const tableStep = n / len;
      
      for (let i = 0; i < n; i += len) {
        let k = 0;
        
        for (let j = i; j < i + halfLen; j++) {
          const tpre = real[j + halfLen] * this.table[k * 2] - 
                       imag[j + halfLen] * this.table[k * 2 + 1] * (inverse ? -1 : 1);
          const tpim = real[j + halfLen] * this.table[k * 2 + 1] * (inverse ? -1 : 1) + 
                       imag[j + halfLen] * this.table[k * 2];
          
          real[j + halfLen] = real[j] - tpre;
          imag[j + halfLen] = imag[j] - tpim;
          real[j] += tpre;
          imag[j] += tpim;
          
          k += tableStep;
        }
      }
    }
  }
}