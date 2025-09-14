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
    } catch (error) {
      console.error('Error saving email:', error);
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
          {/* Top Section - Text Only */}
          <View style={styles.topSection}>
            {/* Title */}
            <Text style={[styles.title, isIPad && styles.titleIPad]}>
              Quelle est votre adresse email ?
            </Text>

            {/* Subtitle */}
            <Text style={[styles.subtitle, isIPad && styles.subtitleIPad]}>
              Cela nous permet de synchroniser vos données en toute sécurité
            </Text>
          </View>

          {/* Middle Section - Input and Button */}
          <View style={styles.middleSection}>
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
          </View>

          {/* Bottom Section - Information Text */}
          <View style={styles.bottomSection}>
            <Text style={[styles.infoText, isIPad && styles.infoTextIPad]}>
              Aucun mot de passe requis. Nous utilisons votre email uniquement pour sauvegarder vos
              prières.
            </Text>
          </View>
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
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  topSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
  },
  middleSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 40,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
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
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 0,
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
    marginTop: 20,
    marginBottom: 20,
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
    marginBottom: 0,
  },
  buttonActive: {
    backgroundColor: '#2D5A4A',
  },
  buttonInactive: {
    backgroundColor: 'rgba(45, 90, 74, 0.3)',
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
    lineHeight: 18,
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
  titleIPad: {
    fontSize: 36,
    marginBottom: 16,
  },
  subtitleIPad: {
    fontSize: 20,
    marginBottom: 0,
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
