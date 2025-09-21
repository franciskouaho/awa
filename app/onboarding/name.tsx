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

export default function NameScreen() {
  const [name, setName] = useState('');
  const router = useRouter();
  const { isIPad } = useDeviceType();

  const handleContinue = async () => {
    if (name.trim()) {
      await Haptics.selectionAsync();
      try {
        // Sauvegarder le nom localement
        await AsyncStorage.setItem('userName', name.trim());

        // Aller à l'écran email
        router.push('/onboarding/email');
      } catch (error: any) {
        console.error('Error saving name:', error);
        Alert.alert('Erreur', 'Impossible de sauvegarder le nom');
      }
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
            {/* Title */}
            <Text style={[styles.title, isIPad && styles.titleIPad]}>Quel est votre prénom ?</Text>

            {/* Subtitle */}
            <Text style={[styles.subtitle, isIPad && styles.subtitleIPad]}>
              Cela nous aide à personnaliser votre expérience spirituelle
            </Text>

            {/* Input */}
            <View style={styles.inputContainer}>
              <View style={styles.glassInputBackground}>
                <TextInput
                  style={[styles.input, isIPad && styles.inputIPad]}
                  placeholder="Entrez votre prénom"
                  placeholderTextColor="rgba(255, 255, 255, 0.7)"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
              style={[styles.button, isIPad && styles.buttonIPad]}
              disabled={!name.trim()}
              onPress={handleContinue}
            >
              <View
                style={[styles.glassBackground, !name.trim() && styles.glassBackgroundDisabled]}
              >
                <View style={styles.glassInner}>
                  <View style={styles.glassHighlight} />
                  <Text
                    style={[
                      styles.buttonText,
                      isIPad && styles.buttonTextIPad,
                      name.trim() ? styles.buttonTextActive : styles.buttonTextInactive,
                    ]}
                  >
                    Continuer
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
    width: '100%',
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
    marginBottom: 60,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 40,
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
    marginBottom: 30,
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
