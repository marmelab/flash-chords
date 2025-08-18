import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';

interface SectionTitleProps {
  title: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => {
  return <Text style={styles.title}>{title}</Text>;
};

const styles = StyleSheet.create({
  title: {
    fontSize: 14,
    color: '#95a5a6',
    marginBottom: 10,
  },
});