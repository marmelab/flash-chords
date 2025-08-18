import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
} from 'react-native';

interface KeyButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export const KeyButton: React.FC<KeyButtonProps> = ({
  label,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.keyButton}
      onPress={onPress}>
      <View style={[styles.keyButtonInner, isSelected && styles.selectedKeyButtonInner]}>
        <Text style={[styles.keyButtonText, isSelected && styles.selectedKeyButtonText]}>
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  keyButton: {
    width: '25%',
    aspectRatio: 1.5,
    padding: 5,
  },
  keyButtonInner: {
    flex: 1,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2c3e50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedKeyButtonInner: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  keyButtonText: {
    color: '#95a5a6',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedKeyButtonText: {
    color: 'white',
  },
});