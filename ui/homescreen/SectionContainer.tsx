import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';

interface SectionContainerProps {
  children: React.ReactNode;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
});