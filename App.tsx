import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import HomeScreen from './ui/homescreen/HomeScreen';
import PianoKeyboard from './ui/PianoKeyboard';
import SummaryScreen from './ui/SummaryScreen';
import type { RootStackParamList } from './navigation/types';

// Suppress the expo-av deprecation warning since we're still using it until SDK 54
LogBox.ignoreLogs(['[expo-av]: Expo AV has been deprecated']);

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): React.ReactElement {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { 
              backgroundColor: '#2c3e50' 
            },
            gestureEnabled: false,
            presentation: 'card',
            cardStyleInterpolator: ({ current }) => ({
              cardStyle: {
                opacity: current.progress,
              },
            }), // Simple fade transition instead of slide
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Practice" component={PianoKeyboard} />
          <Stack.Screen name="Summary" component={SummaryScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}