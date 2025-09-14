import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useDeviceType } from '@/hooks/useDeviceType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function NameScreen() {
  const [name, setName] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isIPad } = useDeviceType();

  const handleContinue = async () => {
    if (name.trim()) {
      try {
        // Sauvegarder le nom localement
        await AsyncStorage.setItem('userName', name.trim());

        // Continuer vers l'étape suivante de l'onboarding
        router.push('./affirmation');
      } catch (error: any) {
        console.error('Error saving name:', error);
        Alert.alert('Erreur', 'Impossible de sauvegarder le nom');
      }
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor },
      ]}
    >
      <KeyboardAvoidingView
        style={[styles.content, isIPad && styles.contentIPad]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.contentWrapper, isIPad && styles.contentWrapperIPad]}>
        {/* Islamic Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.islamicContainer}>
            <Text style={styles.islamicEmoji}>�</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Quel est votre prénom ?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Cela nous aide à personnaliser votre expérience spirituelle
        </Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="Entrez votre prénom"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, name.trim() ? styles.buttonActive : styles.buttonInactive]}
          disabled={!name.trim()}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.buttonText,
              name.trim() ? styles.buttonTextActive : styles.buttonTextInactive,
            ]}
          >
            Continuer
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  contentWrapper: {
    width: '100%',
  },
  iconContainer: {
    marginBottom: 60,
  },
  islamicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2D5A4A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  islamicEmoji: {
    fontSize: 60,
    color: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subtitle: {
    fontSize: 18,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 60,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#2D3748',
    marginBottom: 80,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
  },
  buttonActive: {
    backgroundColor: '#4299E1',
  },
  buttonInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonTextActive: {
    color: '#FFFFFF',
  },
  buttonTextInactive: {
    color: '#A0A0A0',
  },
  // Styles iPad
  containerIPad: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentIPad: {
    width: '100%',
    alignItems: 'center',
  },
  contentWrapperIPad: {
    width: 500,
    maxWidth: '90%',
  },
  iconContainerIPad: {
    marginBottom: 50,
  },
  islamicContainerIPad: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  islamicEmojiIPad: {
    fontSize: 70,
  },
  titleIPad: {
    fontSize: 36,
    marginBottom: 16,
  },
  subtitleIPad: {
    fontSize: 20,
    marginBottom: 50,
  },
  inputIPad: {
    height: 64,
    fontSize: 20,
    marginBottom: 50,
  },
  buttonIPad: {
    height: 64,
    position: 'relative',
    bottom: 0,
  },
  buttonTextIPad: {
    fontSize: 22,
  },
});
