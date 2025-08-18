import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveExerciseSettings, loadExerciseSettings, clearExerciseSettings } from '../storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveExerciseSettings', () => {
    it('should save exercise settings to AsyncStorage', async () => {
      const settings = {
        selectedKeys: ['C', 'G'],
        selectedQualities: ['major', 'minor'],
        selectedInversions: ['root', 'first'],
      };

      await saveExerciseSettings(settings);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'exercise_settings',
        JSON.stringify(settings)
      );
    });

    it('should handle save errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save failed'));

      const settings = {
        selectedKeys: ['C'],
        selectedQualities: ['major'],
        selectedInversions: ['root'],
      };

      await saveExerciseSettings(settings);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to save exercise settings:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadExerciseSettings', () => {
    it('should load exercise settings from AsyncStorage', async () => {
      const settings = {
        selectedKeys: ['C', 'G'],
        selectedQualities: ['major', 'minor'],
        selectedInversions: ['root', 'first'],
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(settings));

      const result = await loadExerciseSettings();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith('exercise_settings');
      expect(result).toEqual(settings);
    });

    it('should return null if no settings are stored', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await loadExerciseSettings();

      expect(result).toBeNull();
    });

    it('should handle load errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Load failed'));

      const result = await loadExerciseSettings();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load exercise settings:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('clearExerciseSettings', () => {
    it('should clear exercise settings from AsyncStorage', async () => {
      await clearExerciseSettings();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('exercise_settings');
    });

    it('should handle clear errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Clear failed'));

      await clearExerciseSettings();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to clear exercise settings:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
});