import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { SectionContainer } from './SectionContainer';
import { KeyButton } from './KeyButton';
import { SelectionButton } from './SelectionButton';
import type { KeyOption } from '../../types';

interface KeysSectionProps {
  keyTab: 'major' | 'minor';
  setKeyTab: (tab: 'major' | 'minor') => void;
  selectedKeys: string[];
  setSelectedKeys: (keys: string[]) => void;
  keyOptions: KeyOption[];
}

export const getKeysSummary = (selectedKeys: string[]): string => {
  if (selectedKeys.length === 0) {
    return 'None selected';
  }
  if (selectedKeys.length <= 4) {
    return selectedKeys.join(', ');
  }
  return `${selectedKeys.slice(0, 3).join(', ')}... (+${selectedKeys.length - 3})`;
};

export const KeysSection: React.FC<KeysSectionProps> = ({
  keyTab,
  setKeyTab,
  selectedKeys,
  setSelectedKeys,
  keyOptions,
}) => {
  return (
    <SectionContainer>
      {/* Tab selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, keyTab === 'major' && styles.activeTab]}
          onPress={() => setKeyTab('major')}>
          <Text style={[styles.tabText, keyTab === 'major' && styles.activeTabText]}>
            Major Keys
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, keyTab === 'minor' && styles.activeTab]}
          onPress={() => setKeyTab('minor')}>
          <Text style={[styles.tabText, keyTab === 'minor' && styles.activeTabText]}>
            Minor Keys
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Keys grid */}
      <View style={styles.keyGrid}>
        {keyOptions
          .slice(keyTab === 'major' ? 0 : 12, keyTab === 'major' ? 12 : 24)
          .map((key) => (
            <KeyButton
              key={key.value}
              label={key.label}
              isSelected={selectedKeys.includes(key.value)}
              onPress={() => {
                if (selectedKeys.includes(key.value)) {
                  setSelectedKeys(selectedKeys.filter(k => k !== key.value));
                } else {
                  setSelectedKeys([...selectedKeys, key.value]);
                }
              }}
            />
          ))}
      </View>
      
      {/* Quick actions */}
      <View style={styles.quickActions}>
        <SelectionButton
          label="Select All"
          isSelected={false}
          style="compact"
          onPress={() => {
            const allKeysInTab = keyOptions
              .slice(keyTab === 'major' ? 0 : 12, keyTab === 'major' ? 12 : 24)
              .map(k => k.value);
            setSelectedKeys(allKeysInTab);
          }}
        />
        <View style={styles.buttonSpacer} />
        <SelectionButton
          label="Clear All"
          isSelected={false}
          style="compact"
          onPress={() => setSelectedKeys([])}
        />
      </View>
    </SectionContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Platform.OS === 'ios' ? 'rgba(118, 118, 128, 0.12)' : '#2c3e50',
    borderRadius: Platform.OS === 'ios' ? 9 : 8,
    padding: Platform.OS === 'ios' ? 2 : 4,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Platform.OS === 'ios' ? '#ffffff' : '#3498db',
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 3 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 3 : undefined,
    elevation: Platform.OS === 'ios' ? 2 : undefined,
  },
  tabText: {
    color: '#95a5a6',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: Platform.OS === 'ios' ? '#000000' : 'white',
    fontWeight: Platform.OS === 'ios' ? '600' : '500',
  },
  keyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  buttonSpacer: {
    width: 15,
  },
});