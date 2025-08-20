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
   * Parse CAF (Core Audio Format) file - improved version
   */
  static parseCAF(base64Data: string): { samples: Float32Array; sampleRate: number } {
    const bytes = this.base64ToUint8Array(base64Data);
    const view = new DataView(bytes.buffer);
    
    // Check CAF header
    const caff = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3]);
    if (caff !== 'caff') {
      throw new Error('Not a valid CAF file');
    }
    
    console.log('CAF file detected, size:', bytes.length);
    
    // Default values for iOS recording
    let sampleRate = 44100;
    let bitsPerSample = 16;
    
    // Find the 'data' chunk - CAF uses big-endian
    let dataStart = 0;
    let dataSize = 0;
    let offset = 8; // Skip 'caff' and version
    
    // Parse chunks
    while (offset < bytes.length - 12) {
      // Read chunk type (4 bytes)
      const chunkType = String.fromCharCode(bytes[offset], bytes[offset+1], bytes[offset+2], bytes[offset+3]);
      // Read chunk size (8 bytes, big-endian)
      const chunkSize = Number(view.getBigInt64(offset + 4, false));
      
      console.log(`Found chunk: ${chunkType}, size: ${chunkSize}, at offset: ${offset}`);
      
      if (chunkType === 'data') {
        // Data chunk found
        // Skip edit count (4 bytes) after chunk header
        dataStart = offset + 16;
        dataSize = chunkSize - 4; // Subtract edit count size
        console.log(`Data chunk found at offset ${dataStart}, size: ${dataSize}`);
        break;
      }
      
      // Move to next chunk
      offset += 12 + chunkSize;
    }
    
    if (dataStart === 0 || dataSize <= 0) {
      console.log('Could not find data chunk, trying fallback approach');
      // Fallback: Look for PCM data pattern
      // PCM audio typically has values oscillating around 0
      // Skip first 8KB of headers
      dataStart = Math.min(8192, Math.floor(bytes.length * 0.1));
      dataSize = bytes.length - dataStart;
      console.log(`Using fallback: dataStart=${dataStart}, dataSize=${dataSize}`);
    }
    
    // Extract samples
    const maxSamples = Math.floor(dataSize / 2);
    const actualSamples = Math.min(maxSamples, Math.floor((bytes.length - dataStart) / 2));
    console.log(`Extracting ${actualSamples} samples from ${dataSize} bytes`);
    
    const samples = new Float32Array(actualSamples);
    let maxAmplitude = 0;
    
    for (let i = 0; i < actualSamples; i++) {
      const byteOffset = dataStart + i * 2;
      if (byteOffset + 1 < bytes.length) {
        // Try both big-endian and little-endian, use the one with reasonable values
        const int16BE = view.getInt16(byteOffset, false); // big-endian
        const int16LE = view.getInt16(byteOffset, true);  // little-endian
        
        // Use little-endian if big-endian produces mostly extreme values
        const valueBE = int16BE / 32768.0;
        const valueLE = int16LE / 32768.0;
        
        // iOS typically uses little-endian for PCM despite CAF being big-endian for headers
        samples[i] = valueLE;
        
        const absVal = Math.abs(samples[i]);
        if (absVal > maxAmplitude) {
          maxAmplitude = absVal;
        }
      }
    }
    
    console.log(`CAF parsing complete. Samples: ${samples.length}, Max amplitude: ${maxAmplitude}`);
    
    // If the signal is too weak, it might be using the wrong endianness
    if (maxAmplitude < 0.001 && actualSamples > 0) {
      console.log('Signal too weak with little-endian, trying big-endian');
      maxAmplitude = 0;
      for (let i = 0; i < actualSamples; i++) {
        const byteOffset = dataStart + i * 2;
        if (byteOffset + 1 < bytes.length) {
          const int16 = view.getInt16(byteOffset, false); // big-endian
          samples[i] = int16 / 32768.0;
          const absVal = Math.abs(samples[i]);
          if (absVal > maxAmplitude) {
            maxAmplitude = absVal;
          }
        }
      }
      console.log(`After big-endian: Max amplitude: ${maxAmplitude}`);
    }
    
    return { samples, sampleRate };
  }
}