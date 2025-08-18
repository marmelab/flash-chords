import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  Easing,
} from 'react-native';

interface CollapsibleSectionProps {
  title: string;
  summary: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  summary,
  isExpanded,
  onToggle,
  children,
}) => {
  // Manage animations internally
  const chevronAnimation = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;
  const heightAnimation = useRef(new Animated.Value(isExpanded ? 1 : 0)).current;

  useEffect(() => {
    // Animation configuration
    const duration = Platform.OS === 'ios' ? 350 : 300;
    const easing = Platform.OS === 'ios' 
      ? Easing.bezier(0.25, 0.1, 0.25, 1) // iOS ease-out curve
      : Easing.out(Easing.ease);
    
    // Animate when expanded state changes
    Animated.parallel([
      Animated.timing(chevronAnimation, {
        toValue: isExpanded ? 1 : 0,
        duration,
        useNativeDriver: true,
        easing,
      }),
      Animated.timing(heightAnimation, {
        toValue: isExpanded ? 1 : 0,
        duration,
        useNativeDriver: false, // Height animations can't use native driver
        easing,
      }),
    ]).start();
  }, [isExpanded, chevronAnimation, heightAnimation]);

  return (
    <>
      <TouchableOpacity 
        style={styles.sectionHeader}
        onPress={onToggle}
        activeOpacity={0.7}>
        <View style={styles.sectionHeaderContent}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionSummary}>{summary}</Text>
        </View>
        <Animated.Text 
          style={[
            styles.chevron,
            {
              transform: [{
                rotate: chevronAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '90deg'],
                })
              }]
            }
          ]}>
          ›
        </Animated.Text>
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          {
            backgroundColor: Platform.OS === 'ios' ? '#1c1c1e' : '#34495e',
            maxHeight: heightAnimation.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 600], // Adjust based on content
            }),
            opacity: heightAnimation,
            overflow: 'hidden',
          }
        ]}>
        {isExpanded && children}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Platform.OS === 'ios' ? '#1c1c1e' : '#34495e',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 1,
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  sectionSummary: {
    fontSize: 14,
    color: '#95a5a6',
  },
  chevron: {
    fontSize: 28,
    color: Platform.OS === 'ios' ? '#8e8e93' : '#95a5a6',
    marginLeft: 10,
  },
});