import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlanScreen() {
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { completeOnboarding, user, signUp, refreshUser } = useAuth();

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) {
        setUserName(name);
      } else if (user?.name) {
        setUserName(user.name);
      }
    } catch (error) {
      console.error('Error loading user name:', error);
    }
  };

  const handleLetsGo = async () => {
    setIsLoading(true);
    try {
      // Récupérer l'email et le nom sauvegardés pendant l'onboarding
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');

      if (!email || !name) {
        Alert.alert('Erreur', 'Informations manquantes. Veuillez recommencer l\'onboarding.');
        router.replace('/onboarding/email');
        return;
      }

      // Créer le compte Firebase avec les données collectées
      await signUp(email, name);

      // Collecter les préférences de l'onboarding
      const preferences = {
        notificationsEnabled: true,
        reminderTime: '21:00', // Default evening time
        reminderFrequency: 'daily' as const,
        completedAt: new Date().toISOString(),
      };

      // Marquer l'onboarding comme terminé dans Firebase
      await completeOnboarding(preferences);

      // Forcer la mise à jour du cache local et du contexte utilisateur
  await AsyncStorage.setItem('onboardingCompleted', 'true');
  await refreshUser();

      // Naviguer vers l'application principale
      router.replace('/(tabs)/prayers');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const goals = [
    {
      icon: '🤲',
      text: 'Faire 3 invocations quotidiennes',
      color: '#2D5A4A',
    },
    {
      icon: '📿',
      text: 'Réciter des versets pour les défunts',
      color: '#4A7C69',
    },
    {
      icon: '💚',
      text: 'Prier pour 3 défunts avant le coucher',
      color: '#00C851',
    },
    {
      icon: '🔔',
      text: '> 1 rappel / jour',
      color: '#FBBF24',
    },
    {
      icon: '📱',
      text: "Widget sur l'écran de verrouillage",
      color: '#60A5FA',
    },
    {
      icon: '✏️',
      text: 'Ajouter 1 prière personnelle',
      color: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor },
      ]}
    >
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Commençons votre parcours spirituel !</Text>

        {/* Plan Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plan pour {userName || 'Vous'}</Text>
          <Text style={styles.planSubtitle}>Vos premiers objectifs avec AWA</Text>

          {/* Goals List */}
          <View style={styles.goalsList}>
            {goals.map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <View style={[styles.goalIcon, { backgroundColor: goal.color }]}>
                  <Text style={styles.goalEmoji}>{goal.icon}</Text>
                </View>
                <Text style={styles.goalText}>{goal.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Let's Go Button */}
        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.7 }]} 
          onPress={handleLetsGo}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>C'est parti !</Text>
          )}
        </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    marginBottom: 30,
  },
  islamicContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 40,
    color: '#FFFFFF',
  },
  planCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 60,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  planTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 8,
  },
  planSubtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 24,
  },
  goalsList: {
    gap: 16,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  goalEmoji: {
    fontSize: 20,
  },
  goalText: {
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
    flex: 1,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: '#22C55E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
