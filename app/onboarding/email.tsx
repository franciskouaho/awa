import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
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

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleContinue = async () => {
    if (!isValidEmail(email)) {
      Alert.alert('Email invalide', 'Veuillez entrer une adresse email valide.');
      return;
    }

    try {
      // Sauvegarder l'email localement pour l'utiliser plus tard
      await AsyncStorage.setItem('userEmail', email);

      // Aller à l'écran nom
      router.push('/onboarding/name');
    } catch (error: any) {
      Alert.alert('Erreur', "Impossible de sauvegarder l'email");
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor:
            Colors[colorScheme ?? 'light'].onboarding?.backgroundColor ||
            Colors[colorScheme ?? 'light'].background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Islamic Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.islamicContainer}>
            <Text style={styles.islamicEmoji}>📧</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Quelle est votre adresse email ?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Cela nous permet de synchroniser vos données en toute sécurité
        </Text>

        {/* Input */}
        <TextInput
          style={styles.input}
          placeholder="votre.email@exemple.com"
          placeholderTextColor="#A0A0A0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="done"
          onSubmitEditing={handleContinue}
        />

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.button, isValidEmail(email) ? styles.buttonActive : styles.buttonInactive]}
          disabled={!isValidEmail(email)}
          onPress={handleContinue}
        >
          <Text
            style={[
              styles.buttonText,
              isValidEmail(email) ? styles.buttonTextActive : styles.buttonTextInactive,
            ]}
          >
            Continuer
          </Text>
        </TouchableOpacity>

        {/* Information Text */}
        <Text style={styles.infoText}>
          Aucun mot de passe requis. Nous utilisons votre email uniquement pour sauvegarder vos
          prières.
        </Text>
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
    marginBottom: 60,
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
    marginBottom: 30,
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
  infoText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    position: 'absolute',
    bottom: 50,
  },
});
