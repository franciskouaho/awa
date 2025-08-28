import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface GenderScreenProps {
  onBack: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}

export default function GenderScreen({ onBack, initialValue, onSave }: GenderScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedGender, setSelectedGender] = useState(initialValue);

  const genderOptions = [
    { key: 'Homme', label: 'Homme', icon: 'person.fill' },
    { key: 'Femme', label: 'Femme', icon: 'person.fill' },
    { key: 'Autre', label: 'Autre', icon: 'person.2.fill' },
    { key: 'Non spécifié', label: 'Non spécifié', icon: 'shield' },
  ];

  const handleSelectGender = (gender: string) => {
    setSelectedGender(gender);
    onSave(gender);
    onBack();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingVertical: 20,
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
    },
    backIcon: {
      fontSize: 20,
      marginRight: 8,
      color: colors.textSecondary,
    },
    backText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    optionsContainer: {
      paddingHorizontal: 16,
    },
    optionButton: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedOptionButton: {
      backgroundColor: colors.text,
      borderColor: colors.text,
    },
    iconContainer: {
      width: 24,
      height: 24,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    optionText: {
      flex: 1,
      fontSize: 18,
      color: colors.text,
    },
    selectedOptionText: {
      color: colors.background,
    },
    checkIcon: {
      fontSize: 20,
      color: colors.background,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Général</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Genre</Text>
        <Text style={styles.subtitle}>Choisissez le genre auquel vous vous identifiez</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {genderOptions.map(option => {
          const isSelected = selectedGender === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
              onPress={() => handleSelectGender(option.key)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <IconSymbol
                  name={option.icon}
                  size={20}
                  color={isSelected ? colors.background : colors.text}
                />
              </View>
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {option.label}
              </Text>
              {isSelected && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
