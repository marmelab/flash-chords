import React from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { SectionContainer } from './SectionContainer';
import { SectionTitle } from './SectionTitle';
import { SelectionButton } from './SelectionButton';
import { ToggleRow } from './ToggleRow';
import type { ChordQuality, ExtensionType } from '../../types';

interface ChordTypesSectionProps {
  selectedQualities: ChordQuality[];
  setSelectedQualities: (qualities: ChordQuality[]) => void;
  selectedExtensions: ExtensionType[];
  setSelectedExtensions: (extensions: ExtensionType[]) => void;
  setSelectedInversions: (inversions: string[]) => void;
  selectedInversions: string[];
}

export const getChordTypesSummary = (
  selectedQualities: ChordQuality[],
  selectedExtensions: ExtensionType[]
): string => {
  const qualityNames: Record<ChordQuality, string> = {
    'major': 'Maj',
    'minor': 'Min',
    'diminished': 'Dim',
    'dominant': 'Dom7',
  };
  
  const qualitiesText = selectedQualities.length === 0
    ? 'None'
    : selectedQualities.map(q => qualityNames[q]).join(', ');
  
  const extensionsText = selectedExtensions.length === 0
    ? ''
    : selectedExtensions.length === 2
      ? ' (Triads & 7ths)'
      : selectedExtensions.includes('triads')
        ? ' (Triads)'
        : ' (7ths)';
  
  return qualitiesText === 'None' 
    ? 'None selected'
    : qualitiesText + extensionsText;
};

export const ChordTypesSection: React.FC<ChordTypesSectionProps> = ({
  selectedQualities,
  setSelectedQualities,
  selectedExtensions,
  setSelectedExtensions,
  setSelectedInversions,
  selectedInversions,
}) => {
  const qualityOptions = [
    { label: 'Major', value: 'major' as ChordQuality },
    { label: 'Minor', value: 'minor' as ChordQuality },
    { label: 'Diminished', value: 'diminished' as ChordQuality },
    { label: 'Dominant 7th', value: 'dominant' as ChordQuality },
  ];

  return (
    <SectionContainer>
      {/* Chord Extensions */}
      <View style={styles.extensionSection}>
        <SectionTitle title="Chord Extensions" />
        <View style={styles.extensionButtons}>
          <SelectionButton
            label="Triads (3 notes)"
            isSelected={selectedExtensions.includes('triads')}
            onPress={() => {
              if (selectedExtensions.includes('triads')) {
                setSelectedExtensions(selectedExtensions.filter(e => e !== 'triads'));
              } else {
                setSelectedExtensions([...selectedExtensions, 'triads']);
              }
            }}
          />
          <View style={styles.buttonSpacer} />
          <SelectionButton
            label="7ths (4 notes)"
            isSelected={selectedExtensions.includes('sevenths')}
            onPress={() => {
              if (selectedExtensions.includes('sevenths')) {
                setSelectedExtensions(selectedExtensions.filter(e => e !== 'sevenths'));
                // Remove 3rd inversion if deselecting 7ths
                setSelectedInversions(selectedInversions.filter(i => i !== 'third'));
              } else {
                setSelectedExtensions([...selectedExtensions, 'sevenths']);
              }
            }}
          />
        </View>
      </View>
      
      {/* Chord Qualities */}
      <SectionTitle title="Chord Qualities" />
      {qualityOptions.map((quality, index) => (
        <ToggleRow
          key={quality.value}
          label={quality.label}
          value={selectedQualities.includes(quality.value)}
          onValueChange={() => {
            if (selectedQualities.includes(quality.value)) {
              setSelectedQualities(selectedQualities.filter(q => q !== quality.value));
            } else {
              setSelectedQualities([...selectedQualities, quality.value]);
            }
          }}
          isLast={index === qualityOptions.length - 1}
        />
      ))}
    </SectionContainer>
  );
};

const styles = StyleSheet.create({
  extensionSection: {
    marginBottom: 15,
  },
  extensionButtons: {
    flexDirection: 'row',
  },
  buttonSpacer: {
    width: 10,
  },
});