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
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
    inputContainer: {
      paddingHorizontal: 16,
      marginBottom: 40,
    },
    textInput: {
      backgroundColor: '#fff',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 18,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.text,
      marginHorizontal: 16,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 20,
    },
    saveButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: '600',
    },
    suggestion: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    suggestionText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

  return (
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
          placeholderTextColor={colors.textSecondary}
          autoFocus
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
        <Text style={styles.saveButtonText}>Enregistrer</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
