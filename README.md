# Piano Chord Practice

An interactive React Native app for learning and practicing piano chords with real-time feedback and spaced repetition.

## Features

- **Interactive Piano Keyboard**: Full-featured piano with realistic sound synthesis
- **Chord Recognition**: Practice major, minor, diminished, and dominant 7th chords
- **Multiple Inversions**: Learn root position, first, and second inversions
- **Smart Practice**: Spaced repetition algorithm focuses on chords you find difficult
- **Visual Feedback**: Instant visual feedback showing correct, incorrect, and missed notes
- **Customizable Sessions**: Choose specific keys, chord types, and inversions to practice
- **Progress Tracking**: Track your accuracy and see completion percentage
- **High-Quality Audio**: Multi-harmonic piano synthesis with ADSR envelope for realistic sound

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo Go app on your phone (optional, for mobile testing)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/marmelab/chord-cards.git
cd chord-cards
```

2. Install dependencies:
```bash
npm install
```

## Running the App

Start the development server:
```bash
npm start
```

Then choose how to run the app:
- Press `w` to open in web browser
- Press `i` to run on iOS simulator (requires Xcode)
- Press `a` to run on Android emulator (requires Android Studio)
- Scan the QR code with Expo Go app on your phone

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run web` - Start directly in web mode
- `npm run ios` - Start directly on iOS
- `npm run android` - Start directly on Android
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run typecheck` - Run TypeScript type checking

## How to Use

1. **Select Practice Settings**: Choose which keys, chord qualities, and inversions you want to practice
2. **Start Practice**: The app will display a chord name and inversion
3. **Play the Chord**: Tap the piano keys to play the requested chord
4. **Submit Answer**: Press the submit button to check your answer
5. **Get Feedback**: 
   - Green keys show correctly played notes
   - Red keys show incorrect notes
   - Yellow keys show notes you should have played
6. **Continue Learning**: The app uses spaced repetition to show you chords you need more practice with

## Architecture

The app is built with:
- **React Native & Expo**: Cross-platform mobile development
- **TypeScript**: Type-safe code with better IDE support
- **Jest**: Unit testing framework
- **Web Audio API**: Real-time audio synthesis

Key components:
- `PianoKeyboard`: Main keyboard interface with touch handling
- `ChordValidation`: Logic for checking chord answers with enharmonic equivalent support
- `FlashcardLogic`: Spaced repetition algorithm for optimal learning
- `PianoAudio`: Audio synthesis engine with pre-generation and caching

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Releasing

To push the app on a connected iOS device, type the following commands:

```bash
npx expo prebuild --clean    
npx expo run:ios --configuration Release --device
```

## CI/CD

The project includes GitHub Actions workflow that automatically:
- Runs TypeScript type checking
- Executes all unit tests
- Generates coverage reports
- Tests against Node.js 18.x and 20.x

