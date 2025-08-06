import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import PianoKeyboard from './components/PianoKeyboard';

export default function App() {
  return (
    <View style={styles.container}>
      <PianoKeyboard />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
});
