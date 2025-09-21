import { useDeviceType } from '@/hooks/useDeviceType';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
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

    await Haptics.selectionAsync();

    try {
      // Sauvegarder l'email localement pour l'utiliser plus tard
      await AsyncStorage.setItem('userEmail', email);

      // Aller à l'écran notifications
      router.push('/onboarding/notifications');
    } catch (error) {
      console.error('Error saving email:', error);
      Alert.alert('Erreur', "Impossible de sauvegarder l'email");
    }
  };

  return (
    <LinearGradient
      colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
      style={[styles.container, isIPad && styles.containerIPad]}
    >
      <SafeAreaView style={styles.safeArea}>
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
              <View style={styles.inputContainer}>
                <View style={styles.glassInputBackground}>
                  <TextInput
                    style={[styles.input, isIPad && styles.inputIPad]}
                    placeholder="votre.email@exemple.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="done"
                    onSubmitEditing={handleContinue}
                  />
                </View>
              </View>

              {/* Continue Button */}
              <TouchableOpacity
                style={[styles.button, isIPad && styles.buttonIPad]}
                disabled={!isValidEmail(email)}
                onPress={handleContinue}
              >
                <View
                  style={[
                    styles.glassBackground,
                    !isValidEmail(email) && styles.glassBackgroundDisabled,
                  ]}
                >
                  <View style={styles.glassInner}>
                    <View style={styles.glassHighlight} />
                    <Text
                      style={[
                        styles.buttonText,
                        isIPad && styles.buttonTextIPad,
                        isValidEmail(email) ? styles.buttonTextActive : styles.buttonTextInactive,
                      ]}
                    >
                      Continuer
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Bottom Section - Information Text */}
            <View style={styles.bottomSection}>
              <Text style={[styles.infoText, isIPad && styles.infoTextIPad]}>
                Aucun mot de passe requis. Nous utilisons votre email uniquement pour sauvegarder
                vos prières.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingTop: 20,
    paddingBottom: 20,
  },
  middleSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 20,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#F0F9F4',
    textAlign: 'center',
    marginBottom: 0,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    width: '100%',
    marginTop: 0,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  glassInputBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  input: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#FFFFFF',
    borderWidth: 0,
  },
  glassBackground: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  glassBackgroundDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glassInner: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  button: {
    width: '100%',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  buttonTextActive: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  buttonTextInactive: {
    color: 'rgba(255, 255, 255, 0.5)',
  },
  infoText: {
    fontSize: 13,
    color: '#F0F9F4',
    textAlign: 'center',
    paddingHorizontal: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
