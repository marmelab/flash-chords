import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';

interface ToggleRowProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  isLast?: boolean;
}

export const ToggleRow: React.FC<ToggleRowProps> = ({
  label,
  value,
  onValueChange,
  isLast = false,
}) => {
  return (
    <View style={[styles.container, isLast && styles.lastRow]}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#3e3e3e', true: '#34c759' }}
        thumbColor={Platform.OS === 'ios' ? '#ffffff' : value ? '#ffffff' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Platform.OS === 'ios' ? 10 : 12,
    borderBottomWidth: Platform.OS === 'ios' ? 0.5 : 1,
    borderBottomColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.1)' : '#2c3e50',
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    fontSize: 16,
    color: 'white',
  },
});