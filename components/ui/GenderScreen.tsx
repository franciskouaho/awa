import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
    backButtonGlass: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      marginRight: 12,
    },
    backButtonGlassInner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      overflow: 'hidden',
    },
    backButtonGlassHighlight: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    backIcon: {
      fontSize: 20,
      marginRight: 8,
      color: '#2D5A4A',
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
          <View style={styles.backButtonGlass}>
            <View style={styles.backButtonGlassInner}>
              <View style={styles.backButtonGlassHighlight} />
              <Text style={styles.backIcon}>←</Text>
            </View>
          </View>
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
                  color={isSelected ? '#2D5A4A' : '#FFFFFF'}
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
    </LinearGradient>
  );
}
