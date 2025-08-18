import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ScreenOrientation from 'expo-screen-orientation';
import type { DeckStats } from '../logic/flashcardLogic';

interface SummaryScreenProps {
  deckStats: DeckStats;
  onGoHome: () => void;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ deckStats, onGoHome }) => {
  useEffect(() => {
    // Lock to landscape on mount
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
        .catch(error => console.log('Could not lock orientation:', error));
    }
    
    // Cleanup: unlock orientation when going home
    return () => {
      if (Platform.OS !== 'web') {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
          .then(() => ScreenOrientation.unlockAsync())
          .catch(error => console.log('Could not reset orientation:', error));
      }
    };
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => {
          if (Platform.OS !== 'web') {
            ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
              .then(() => ScreenOrientation.unlockAsync())
              .then(() => onGoHome())
              .catch(() => onGoHome());
          } else {
            onGoHome();
          }
        }}
      >
        <Text style={styles.backButtonText}>‹</Text>
      </TouchableOpacity>
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Exercise Complete! 🎉</Text>
          <Text style={styles.subtitle}>All chords mastered</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{deckStats.totalCards}</Text>
            <Text style={styles.statLabel}>Total Chords</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {deckStats.cardsByDifficulty.reduce((sum, card) => sum + card.attempts, 0)}
            </Text>
            <Text style={styles.statLabel}>Total Attempts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>
              {Math.round(
                (deckStats.cardsByDifficulty.reduce((sum, card) => sum + card.correctAttempts, 0) /
                deckStats.cardsByDifficulty.reduce((sum, card) => sum + card.attempts, 0)) * 100
              )}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>
        
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Chords by Difficulty</Text>
          {deckStats.cardsByDifficulty.map((card, index) => (
            <View key={index} style={styles.listItem}>
              <View style={styles.listItemLeft}>
                <Text style={styles.listItemRank}>#{index + 1}</Text>
                <Text style={styles.listItemName}>
                  {card.name} - {card.inversion}
                </Text>
              </View>
              <View style={styles.listItemRight}>
                <Text style={styles.listItemAttempts}>
                  {card.attempts} attempts
                </Text>
                <Text style={styles.listItemAccuracy}>
                  {card.attempts > 0 
                    ? `${Math.round((card.correctAttempts / card.attempts) * 100)}% correct`
                    : '0% correct'
                  }
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    backgroundColor: 'transparent',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 40,
    fontWeight: '200',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  content: {
    width: '90%',
    maxWidth: 600,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    minWidth: 90,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  listContainer: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemRank: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    marginRight: 12,
    width: 30,
  },
  listItemName: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  listItemRight: {
    alignItems: 'flex-end',
  },
  listItemAttempts: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  listItemAccuracy: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});

export default SummaryScreen;