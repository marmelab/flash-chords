import { Audio } from 'expo-av';

export const initAudio = (): Promise<void> => {
  return Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    staysActiveInBackground: false,
  });
};

const generateTone = (frequency: number): string => {
  const sampleRate = 44100;
  const duration = 0.3;
  const numSamples = sampleRate * duration;
  const amplitude = 0.3;
  
  const header: number[] = [
    0x52, 0x49, 0x46, 0x46,
    0x24, 0x08, 0x00, 0x00,
    0x57, 0x41, 0x56, 0x45,
    0x66, 0x6d, 0x74, 0x20,
    0x10, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x01, 0x00,
    0x44, 0xac, 0x00, 0x00,
    0x88, 0x58, 0x01, 0x00,
    0x02, 0x00, 0x10, 0x00,
    0x64, 0x61, 0x74, 0x61,
    0x00, 0x08, 0x00, 0x00
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
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  
  return btoa(binary);
};

export const playTone = (frequency: number): void => {
  Audio.Sound.createAsync(
    { uri: `data:audio/wav;base64,${generateTone(frequency)}` },
    { shouldPlay: true }
  ).then(({ sound }) => {
    setTimeout(() => {
      sound.unloadAsync();
    }, 500);
  }).catch(error => {
    console.log('Error playing sound:', error);
  });
};