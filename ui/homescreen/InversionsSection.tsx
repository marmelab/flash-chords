import React from 'react';
import {
  Text,
  StyleSheet,
} from 'react-native';
import { SectionContainer } from './SectionContainer';
import { ToggleRow } from './ToggleRow';
import type { ExtensionType } from '../../types';

interface InversionsSectionProps {
  selectedInversions: string[];
  setSelectedInversions: (inversions: string[]) => void;
  selectedExtensions: ExtensionType[];
}

export const getInversionsSummary = (
  selectedInversions: string[],
  selectedExtensions: ExtensionType[]
): string => {
  const inversionNames: Record<string, string> = {
    'root': 'Root',
    'first': '1st',
    'second': '2nd',
    'third': '3rd',
  };
  
  if (selectedInversions.length === 0) {
    return 'None selected';
  }
  
  const inversionsText = selectedInversions.map(i => inversionNames[i]).join(', ');
  
  // Add extension context to inversions
  const extensionPrefix = selectedExtensions.length === 2
    ? 'Triads & 7ths: '
    : selectedExtensions.includes('triads')
      ? 'Triads: '
      : selectedExtensions.includes('sevenths')
        ? '7ths: '
        : '';
  
  return extensionPrefix + inversionsText;
};

export const InversionsSection: React.FC<InversionsSectionProps> = ({
  selectedInversions,
  setSelectedInversions,
  selectedExtensions,
}) => {
  const inversionOptions = [
    { label: 'Root Position', value: 'root' },
    { label: '1st Inversion', value: 'first' },
    { label: '2nd Inversion', value: 'second' },
    ...(selectedExtensions.includes('sevenths') ? [{ label: '3rd Inversion (7ths only)', value: 'third' }] : []),
  ];

  return (
    <SectionContainer>
      {inversionOptions.map((inversion, index) => (
        <ToggleRow
          key={inversion.value}
          label={inversion.label}
          value={selectedInversions.includes(inversion.value)}
          onValueChange={() => {
            if (selectedInversions.includes(inversion.value)) {
              setSelectedInversions(selectedInversions.filter(i => i !== inversion.value));
            } else {
              setSelectedInversions([...selectedInversions, inversion.value]);
            }
          }}
          isLast={index === inversionOptions.length - 1}
        />
      ))}
      
      {!selectedExtensions.includes('sevenths') && selectedInversions.includes('third') && (
        <Text style={styles.warningText}>
          Note: 3rd inversion requires 7th chords. Please enable 7ths in Chord Types.
        </Text>
      )}
    </SectionContainer>
  );
};

const styles = StyleSheet.create({
  warningText: {
    color: '#e74c3c',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 10,
    paddingHorizontal: 10,
  },
});