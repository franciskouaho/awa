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

export default function EmailScreen() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { isIPad } = useDeviceType();

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
        isIPad && styles.containerIPad,
        {
          backgroundColor:
            Colors[colorScheme ?? 'light'].onboarding?.backgroundColor ||
            Colors[colorScheme ?? 'light'].background,
        },
      ]}
    >
      <KeyboardAvoidingView
        style={[styles.content, isIPad && styles.contentIPad]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.contentWrapper, isIPad && styles.contentWrapperIPad]}>
          {/* Islamic Icon */}
          <View style={[styles.iconContainer, isIPad && styles.iconContainerIPad]}>
            <View style={[styles.islamicContainer, isIPad && styles.islamicContainerIPad]}>
              <Text style={[styles.islamicEmoji, isIPad && styles.islamicEmojiIPad]}>📧</Text>
            </View>
          </View>

          {/* Title */}
          <Text style={[styles.title, isIPad && styles.titleIPad]}>
            Quelle est votre adresse email ?
          </Text>

          {/* Subtitle */}
          <Text style={[styles.subtitle, isIPad && styles.subtitleIPad]}>
            Cela nous permet de synchroniser vos données en toute sécurité
          </Text>

          {/* Input */}
          <TextInput
            style={[styles.input, isIPad && styles.inputIPad]}
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
            style={[
              styles.button,
              isIPad && styles.buttonIPad,
              isValidEmail(email) ? styles.buttonActive : styles.buttonInactive,
            ]}
            disabled={!isValidEmail(email)}
            onPress={handleContinue}
          >
            <Text
              style={[
                styles.buttonText,
                isIPad && styles.buttonTextIPad,
                isValidEmail(email) ? styles.buttonTextActive : styles.buttonTextInactive,
              ]}
            >
              Continuer
            </Text>
          </TouchableOpacity>

          {/* Information Text */}
          <Text style={[styles.infoText, isIPad && styles.infoTextIPad]}>
            Aucun mot de passe requis. Nous utilisons votre email uniquement pour sauvegarder vos
            prières.
          </Text>
        </View>
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
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    position: 'absolute',
    bottom: 50,
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
    marginBottom: 40,
  },
  buttonTextIPad: {
    fontSize: 22,
  },
  infoTextIPad: {
    fontSize: 16,
    position: 'relative',
    bottom: 0,
    marginTop: 20,
  },
});
