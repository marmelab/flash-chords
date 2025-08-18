import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  EXERCISE_SETTINGS: 'exercise_settings',
} as const;

export interface ExerciseSettings {
  selectedKeys: string[];
  selectedQualities: string[];
  selectedInversions: string[];
}

/**
 * Save exercise settings to persistent storage
 */
export const saveExerciseSettings = async (settings: ExerciseSettings): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.EXERCISE_SETTINGS,
      JSON.stringify(settings)
    );
  } catch (error) {
    console.error('Failed to save exercise settings:', error);
  }
};

/**
 * Load exercise settings from persistent storage
 */
export const loadExerciseSettings = async (): Promise<ExerciseSettings | null> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_SETTINGS);
    if (stored) {
      return JSON.parse(stored) as ExerciseSettings;
    }
    return null;
  } catch (error) {
    console.error('Failed to load exercise settings:', error);
    return null;
  }
};

/**
 * Clear all stored settings
 */
export const clearExerciseSettings = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.EXERCISE_SETTINGS);
  } catch (error) {
    console.error('Failed to clear exercise settings:', error);
  }
};