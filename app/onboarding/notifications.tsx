import { useAuth } from '@/contexts/AuthContext';
import { notificationService } from '@/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingNotificationsScreen() {
  const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
  const [actionCompleted, setActionCompleted] = useState(false);
  const { signUp, completeOnboarding } = useAuth();

  const handleEnableNotifications = async () => {
    setIsRequestingPermissions(true);
    await Haptics.selectionAsync();

    try {
      // Demander les permissions de notifications
      const permissions = await notificationService.requestPermissions();

      // Récupérer les données d'onboarding
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userName = await AsyncStorage.getItem('userName');
      const userAffirmation = await AsyncStorage.getItem('userAffirmation');

      if (!userEmail || !userName || !userAffirmation) {
        Alert.alert('Erreur', "Informations manquantes. Veuillez recommencer l'onboarding.");
        router.replace('/onboarding/intro');
        return;
      }

      console.log('🚀 Création du compte Firebase...', { userEmail, userName });

      // Créer le compte Firebase
      await signUp(userEmail, userName);

      console.log("✅ Compte créé, finalisation de l'onboarding...");

      // Marquer l'onboarding comme terminé
      await completeOnboarding({
        affirmation: userAffirmation,
      });

      console.log("🎉 Onboarding terminé ! Redirection vers l'app...");

      if (permissions.granted) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }

      setActionCompleted(true);

      setTimeout(() => {
        router.replace('/(tabs)/prayers');
      }, 1000);
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du compte:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer votre compte. Veuillez réessayer.'
      );
      setActionCompleted(true);

      setTimeout(() => {
        router.replace('/(tabs)/prayers');
      }, 500);
    } finally {
      setIsRequestingPermissions(false);
    }
  };

  const handleSkip = async () => {
    await Haptics.selectionAsync();
    router.replace('/(tabs)/prayers');
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
        hidden={false}
      />

      <LinearGradient colors={['#2D5A4A', '#4A7C69', '#6BAF8A']} style={styles.gradient}>
        <View style={styles.safeArea}>
          <View style={styles.main}>
            <View style={styles.content}>
              {/* Icône notifications */}
              <View style={styles.iconContainer}>
                <Text style={styles.notificationIcon}>🕌</Text>
                <View style={styles.sparkles}>
                  <Text style={styles.sparkle}>✨</Text>
                  <Text style={styles.sparkle}>✨</Text>
                  <Text style={styles.sparkle}>✨</Text>
                </View>
              </View>

              {/* Titre principal */}
              <Text style={styles.title}>Ne ratez rien !</Text>

              {/* Sous-titre */}
              <Text style={styles.subtitle}>
                Activez les notifications pour des rappels personnalisés
              </Text>

              {/* Description */}
              <Text style={styles.description}>
                Recevez des rappels quotidiens pour vos prières et des notifications spéciales pour
                vos moments spirituels importants. Vos données restent privées et sécurisées.
              </Text>

              {/* Avantages des notifications */}
              <View style={styles.benefitsContainer}>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitEmoji}>⏰</Text>
                  <Text style={styles.benefitText}>Rappels quotidiens</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitEmoji}>🕌</Text>
                  <Text style={styles.benefitText}>Moments spirituels</Text>
                </View>
                <View style={styles.benefitItem}>
                  <Text style={styles.benefitEmoji}>🔒</Text>
                  <Text style={styles.benefitText}>100% privé</Text>
                </View>
              </View>

              {/* Indicateurs de progression */}
              <View style={styles.progressContainer}>
                <View style={styles.progressDot} />
                <View style={styles.progressDot} />
                <View style={styles.progressDot} />
                <View style={[styles.progressDot, styles.activeDot]} />
                <View style={styles.progressDot} />
              </View>
            </View>

            {/* Message d'instruction si aucune action n'a été effectuée */}
            {!actionCompleted && (
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  👆 Choisissez une option ci-dessous pour continuer
                </Text>
              </View>
            )}

            {/* Boutons d'action */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.enableButton, isRequestingPermissions && styles.buttonDisabled]}
                onPress={handleEnableNotifications}
                activeOpacity={0.8}
                disabled={isRequestingPermissions}
              >
                <View style={styles.glassBackground}>
                  <View style={styles.glassInner}>
                    <View style={styles.glassHighlight} />
                    <Text style={styles.buttonText}>
                      {isRequestingPermissions
                        ? 'Demande en cours...'
                        : 'Activer les notifications'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
                <Text style={styles.skipButtonText}>Passer pour l&apos;instant</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D5A4A',
  },
  gradient: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  safeArea: {
    flex: 1,
    paddingTop: 0,
    marginTop: 0,
  },
  main: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 80,
  },
  notificationIcon: {
    fontSize: 80,
    textAlign: 'center',
  },
  sparkles: {
    position: 'absolute',
    top: -10,
    left: -20,
    right: -20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sparkle: {
    fontSize: 20,
    opacity: 0.8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontFamily: 'System',
  },
  subtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'System',
    opacity: 0.9,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontFamily: 'System',
    opacity: 0.9,
    paddingHorizontal: 16,
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  benefitItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
  },
  benefitEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'System',
    opacity: 0.9,
    fontWeight: '500',
    lineHeight: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  instructionContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.8,
  },
  buttonContainer: {
    paddingHorizontal: 32,
    paddingBottom: 48,
  },
  enableButton: {
    borderRadius: 48,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  glassBackground: {
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  glassInner: {
    paddingVertical: 18,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
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
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'System',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  skipButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'System',
    opacity: 0.8,
    textDecorationLine: 'underline',
  },
});
