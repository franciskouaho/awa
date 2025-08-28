import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface LanguageScreenProps {
  onBack: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}

export default function LanguageScreen({ onBack, initialValue, onSave }: LanguageScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [selectedLanguage, setSelectedLanguage] = useState(initialValue);

  const languageOptions = [
    { key: 'Français', label: 'Français', flag: '🇫🇷' },
    { key: 'English', label: 'English', flag: '🇺🇸' },
    { key: 'Español', label: 'Español', flag: '🇪🇸' },
    { key: 'Deutsch', label: 'Deutsch', flag: '🇩🇪' },
    { key: 'Italiano', label: 'Italiano', flag: '🇮🇹' },
    { key: 'العربية', label: 'العربية', flag: '🇸🇦' },
    { key: '中文', label: '中文', flag: '🇨🇳' },
    { key: '日本語', label: '日本語', flag: '🇯🇵' },
  ];

  const handleSelectLanguage = (language: string) => {
    setSelectedLanguage(language);
    onSave(language);
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
    flagContainer: {
      width: 24,
      height: 24,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    flagText: {
      fontSize: 18,
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

        <Text style={styles.title}>Langue</Text>
        <Text style={styles.subtitle}>Choisissez votre langue préférée</Text>
      </View>

      {/* Options */}
      <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
        {languageOptions.map(option => {
          const isSelected = selectedLanguage === option.key;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.optionButton, isSelected && styles.selectedOptionButton]}
              onPress={() => handleSelectLanguage(option.key)}
              activeOpacity={0.7}
            >
              <View style={styles.flagContainer}>
                <Text style={styles.flagText}>{option.flag}</Text>
              </View>
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {option.label}
              </Text>
              {isSelected && <Text style={styles.checkIcon}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
