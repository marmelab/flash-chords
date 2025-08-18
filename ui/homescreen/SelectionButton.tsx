import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';

interface SelectionButtonProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  style?: 'default' | 'compact';
}

export const SelectionButton: React.FC<SelectionButtonProps> = ({
  label,
  isSelected,
  onPress,
  style = 'default',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        style === 'compact' && styles.compactButton,
        isSelected && styles.selectedButton
      ]}
      onPress={onPress}>
      <Text style={[
        styles.buttonText,
        style === 'compact' && styles.compactButtonText,
        isSelected && styles.selectedButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#2c3e50',
    borderRadius: 8,
    alignItems: 'center',
  },
  compactButton: {
    flex: 0,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selectedButton: {
    backgroundColor: '#3498db',
  },
  buttonText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '500',
  },
  compactButtonText: {
    color: '#3498db',
  },
  selectedButtonText: {
    color: 'white',
  },
});