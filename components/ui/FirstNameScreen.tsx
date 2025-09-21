import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FirstNameScreenProps {
  onBack: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}

export default function FirstNameScreen({ onBack, initialValue, onSave }: FirstNameScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [firstName, setFirstName] = useState(initialValue);

  const handleSave = () => {
    onSave(firstName);
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
    inputContainer: {
      paddingHorizontal: 16,
      marginBottom: 40,
    },
    textInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 18,
      color: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    saveButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginHorizontal: 16,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
    suggestion: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    suggestionText: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.8)',
    },
  });

  return (
    <LinearGradient
      colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backText}>Général</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Prénom</Text>
          <Text style={styles.subtitle}>Comment souhaitez-vous être appelé(e) ?</Text>
        </View>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Entrez votre prénom"
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            autoFocus
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
