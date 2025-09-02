import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PlanScreen() {
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { signUp, completeOnboarding } = useAuth();

  const handleCreateAccount = async () => {
    setIsCreatingAccount(true);
    try {
      // Récupérer les données d'onboarding depuis AsyncStorage
      const userEmail = await AsyncStorage.getItem('userEmail');
      const userName = await AsyncStorage.getItem('userName');
      const userAffirmation = await AsyncStorage.getItem('userAffirmation');

      if (!userEmail || !userName) {
        Alert.alert('Erreur', "Informations manquantes. Veuillez recommencer l'onboarding.");
        router.push('/onboarding/email');
        return;
      }

      console.log('🚀 Création du compte Firebase...', { userEmail, userName });

      // Créer le compte Firebase
      await signUp(userEmail, userName);

      console.log("✅ Compte créé, finalisation de l'onboarding...");

      // Marquer l'onboarding comme terminé avec les préférences
      await completeOnboarding({
        affirmation: userAffirmation,
      });

      console.log("🎉 Onboarding terminé ! Redirection vers l'app...");

      // Rediriger vers l'application principale
      router.replace('/(tabs)/prayers');
    } catch (error: any) {
      console.error('❌ Erreur lors de la création du compte:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de créer votre compte. Veuillez réessayer.',
        [
          {
            text: 'Réessayer',
            onPress: handleCreateAccount,
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsCreatingAccount(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Bienvenue dans AWA ! 🎉
        </Text>

        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Nous allons créer votre compte et personnaliser votre expérience spirituelle.
        </Text>

        <View style={styles.features}>
          <Text style={[styles.feature, { color: Colors[colorScheme ?? 'light'].text }]}>
            ✅ Prières personnalisées
          </Text>
          <Text style={[styles.feature, { color: Colors[colorScheme ?? 'light'].text }]}>
            ✅ Rappels et notifications
          </Text>
          <Text style={[styles.feature, { color: Colors[colorScheme ?? 'light'].text }]}>
            ✅ Suivi de vos pratiques
          </Text>
          <Text style={[styles.feature, { color: Colors[colorScheme ?? 'light'].text }]}>
            ✅ Synchronisation cloud
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.createButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].primary },
            isCreatingAccount && styles.disabledButton,
          ]}
          onPress={handleCreateAccount}
          disabled={isCreatingAccount}
        >
          {isCreatingAccount ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" />
              <Text style={styles.loadingText}>Création en cours...</Text>
            </View>
          ) : (
            <Text style={styles.createButtonText}>Créer mon compte</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.disclaimer, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          En créant votre compte, vous acceptez nos conditions d'utilisation et notre politique de
          confidentialité.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: {
    marginBottom: 40,
    alignSelf: 'stretch',
  },
  feature: {
    fontSize: 16,
    marginBottom: 12,
    paddingLeft: 8,
  },
  createButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.7,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
