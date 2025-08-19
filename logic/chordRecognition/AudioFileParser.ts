/**
 * Audio File Parser for React Native
 * Supports both WAV and CAF (Core Audio Format) files
 */

export interface AudioFileInfo {
  sampleRate: number;
  bitsPerSample: number;
  numChannels: number;
  dataLength: number;
  format: 'wav' | 'caf' | 'unknown';
}

export class AudioFileParser {
  /**
   * Convert base64 to Uint8Array (works in React Native)
   */
  private static base64ToUint8Array(base64: string): Uint8Array {
    // Remove any whitespace
    base64 = base64.replace(/\s/g, '');
    
    // Calculate the length of the binary data
    const binaryLength = Math.floor(base64.length * 0.75);
    const bytes = new Uint8Array(binaryLength);
    
    // Decode base64
    let p = 0;
    for (let i = 0; i < base64.length; i += 4) {
      const encoded1 = this.base64Chars.indexOf(base64[i]);
      const encoded2 = this.base64Chars.indexOf(base64[i + 1]);
      const encoded3 = base64[i + 2] === '=' ? -1 : this.base64Chars.indexOf(base64[i + 2]);
      const encoded4 = base64[i + 3] === '=' ? -1 : this.base64Chars.indexOf(base64[i + 3]);
      
      bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
      if (encoded3 !== -1) bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
      if (encoded4 !== -1) bytes[p++] = ((encoded3 & 3) << 6) | encoded4;
    }
    
    return bytes.slice(0, p);
  }
  
  private static base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  
  /**
   * Detect file format from header
   */
  static detectFormat(base64Data: string): 'wav' | 'caf' | 'unknown' {
    const bytes = this.base64ToUint8Array(base64Data.slice(0, 100)); // Just check first few bytes
    
    // Check for WAV
    if (bytes.length >= 12) {
      const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
      const wave = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (riff === 'RIFF' && wave === 'WAVE') {
        return 'wav';
      }
    }
    
    // Check for CAF
    if (bytes.length >= 8) {
      const caff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
      if (caff === 'caff') {
        return 'caf';
      }
    }
    
    return 'unknown';
  }
  
  /**
   * Parse audio file (auto-detects format)
   */
  static parseAudioFile(base64Data: string): { samples: Float32Array; sampleRate: number } {
    const format = this.detectFormat(base64Data);
    console.log('Detected audio format:', format);
    
    switch (format) {
      case 'wav':
        return this.parseWav(base64Data);
      case 'caf':
        return this.parseCAF(base64Data);
      default:
        // Try WAV parser as fallback
        console.log('Unknown format, trying WAV parser...');
        return this.parseWav(base64Data);
    }
  }
  
  /**
   * Parse WAV file
   */
  static parseWav(base64Data: string): { samples: Float32Array; sampleRate: number } {
    const bytes = this.base64ToUint8Array(base64Data);
    const view = new DataView(bytes.buffer);
    
    // Parse WAV header
    const riff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (riff !== 'RIFF') {
      throw new Error('Not a valid WAV file');
    }
    
    const wave = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (wave !== 'WAVE') {
      throw new Error('Not a valid WAV file');
    }
    
    // Find fmt and data chunks
    let offset = 12;
    let sampleRate = 44100;
    let bitsPerSample = 16;
    let numChannels = 1;
    let dataStart = 0;
    let dataSize = 0;
    
    while (offset < bytes.length - 8) {
      const chunkId = String.fromCharCode(bytes[offset], bytes[offset + 1], bytes[offset + 2], bytes[offset + 3]);
      const chunkSize = view.getUint32(offset + 4, true);
      
      if (chunkId === 'fmt ') {
        numChannels = view.getUint16(offset + 10, true);
        sampleRate = view.getUint32(offset + 12, true);
        bitsPerSample = view.getUint16(offset + 22, true);
      } else if (chunkId === 'data') {
        dataStart = offset + 8;
        dataSize = chunkSize;
        break;
      }
      
      offset += 8 + chunkSize;
    }
    
    if (dataStart === 0) {
      throw new Error('Could not find audio data in WAV file');
    }
    
    // Extract samples
    const numSamples = Math.floor(dataSize / (bitsPerSample / 8) / numChannels);
    const samples = new Float32Array(numSamples);
    
    if (bitsPerSample === 16) {
      for (let i = 0; i < numSamples; i++) {
        const sampleOffset = dataStart + i * 2 * numChannels;
        let value = 0;
        for (let ch = 0; ch < numChannels; ch++) {
          const int16 = view.getInt16(sampleOffset + ch * 2, true);
          value += int16 / 32768.0;
        }
        samples[i] = value / numChannels;
      }
    } else if (bitsPerSample === 8) {
      for (let i = 0; i < numSamples; i++) {
        const sampleOffset = dataStart + i * numChannels;
        let value = 0;
        for (let ch = 0; ch < numChannels; ch++) {
          const uint8 = bytes[sampleOffset + ch];
          value += (uint8 - 128) / 128.0;
        }
        samples[i] = value / numChannels;
      }
    }
    
    return { samples, sampleRate };
  }
  
  /**
   * Parse CAF (Core Audio Format) file - simplified version
   */
  static parseCAF(base64Data: string): { samples: Float32Array; sampleRate: number } {
    const bytes = this.base64ToUint8Array(base64Data);
    const view = new DataView(bytes.buffer);
    
    // Check CAF header
    const caff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (caff !== 'caff') {
      throw new Error('Not a valid CAF file');
    }
    
    // For CAF files, we'll use a simplified approach
    // CAF format is complex, so we'll extract basic PCM data
    console.log('CAF file detected, using simplified extraction');
    
    // Default values for iOS recording
    const sampleRate = 44100;
    const bitsPerSample = 16;
    const numChannels = 1;
    
    // Find the audio data (simplified - look for 'data' chunk)
    let dataStart = 0;
    let dataSize = 0;
    
    for (let i = 0; i < bytes.length - 8; i++) {
      if (bytes[i] === 0x64 && bytes[i+1] === 0x61 && bytes[i+2] === 0x74 && bytes[i+3] === 0x61) { // 'data'
        // Found data chunk
        dataSize = view.getUint32(i + 4, false); // CAF uses big-endian
        dataStart = i + 12; // Skip chunk header
        break;
      }
    }
    
    if (dataStart === 0) {
      // If we can't find the data chunk, try to extract raw PCM data
      // Assume data starts after header (simplified approach)
      dataStart = 4096; // Skip first 4KB which typically contains headers
      dataSize = bytes.length - dataStart;
    }
    
    // Extract samples (assuming 16-bit PCM)
    const numSamples = Math.floor(dataSize / 2);
    const samples = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples && dataStart + i * 2 < bytes.length - 1; i++) {
      // CAF typically uses big-endian
      const int16 = view.getInt16(dataStart + i * 2, false);
      samples[i] = int16 / 32768.0;
    }
    
    return { samples, sampleRate };
  }
}