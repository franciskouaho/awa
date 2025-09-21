import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
      color: 'rgba(255, 255, 255, 0.8)',
    },
    backText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#FFFFFF',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      color: '#FFFFFF',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 32,
    },
    optionsContainer: {
      paddingHorizontal: 16,
    },
    optionButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      marginBottom: 12,
      paddingHorizontal: 20,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    selectedOptionButton: {
      backgroundColor: '#FFFFFF',
      borderColor: '#FFFFFF',
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
      color: '#FFFFFF',
    },
    selectedOptionText: {
      color: '#2D5A4A',
    },
    checkIcon: {
      fontSize: 20,
      color: '#2D5A4A',
    },
  });

  return (
    <LinearGradient
      colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
      style={styles.container}
    >
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
    </LinearGradient>
  );
}
