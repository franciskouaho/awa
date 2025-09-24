import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { useOnboardingNotifications } from '@/hooks/useOnboardingNotifications';
import { useNotifications } from '@/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationTestScreen() {
  const { permissions, requestPermission, isLoading } = useNotificationPermissions();
  const { sendTestNotification, sendTestDeceasedPrayerNotification, getScheduledReminders, cancelAllReminders, diagnosticNotifications } = useNotifications();
  const { hasProcessedOnboarding, isProcessing, resetOnboardingNotifications } = useOnboardingNotifications();
  
  const [scheduledCount, setScheduledCount] = useState<number>(0);
  const [diagnostic, setDiagnostic] = useState<any>(null);

  const handleGetScheduled = async () => {
    try {
      const scheduled = await getScheduledReminders();
      setScheduledCount(scheduled.length);
      Alert.alert(
        'Notifications programmées',
        `Il y a ${scheduled.length} notifications programmées.\n\n${scheduled.map(n => `${n.content.title} - ${JSON.stringify(n.trigger)}`).join('\n\n')}`
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer les notifications programmées');
    }
  };

  const handleCancelAll = async () => {
    try {
      await cancelAllReminders();
      Alert.alert('Succès', 'Toutes les notifications ont été annulées');
      setScheduledCount(0);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'annuler les notifications');
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test envoyé', 'Une notification de test va apparaître dans 1 seconde');
    } catch (error) {
      Alert.alert('Erreur', `Impossible d'envoyer la notification de test: ${error}`);
    }
  };

  const handleTestDeceasedPrayer = async () => {
    try {
      // Simuler des prières de défunts pour le test
      const mockPrayerData = [
        {
          id: '1',
          name: 'Papa',
          message: 'Que Dieu accorde Sa miséricorde à Papa et lui accorde le paradis.',
          prayer: 'Que Dieu accorde Sa miséricorde à Papa et lui accorde le paradis.'
        },
        {
          id: '2', 
          name: 'Maman',
          message: 'Prière pour Maman, que Dieu lui accorde Sa miséricorde infinie.',
          prayer: 'Prière pour Maman, que Dieu lui accorde Sa miséricorde infinie.'
        }
      ];
      
      await sendTestDeceasedPrayerNotification(mockPrayerData);
      Alert.alert('Test envoyé', 'Une notification pour les défunts va apparaître dans 1 seconde');
    } catch (error) {
      Alert.alert('Erreur', `Impossible d'envoyer la notification pour les défunts: ${error}`);
    }
  };

  const handleDiagnostic = async () => {
    try {
      const result = await diagnosticNotifications();
      setDiagnostic(result);
      Alert.alert(
        'Diagnostic des notifications',
        `Permissions: ${result.permissions.granted ? '✅' : '❌'}\n` +
        `Appareil physique: ${result.isDevice ? '✅' : '❌'}\n` +
        `Notifications programmées: ${result.scheduledCount}\n` +
        `Peut programmer: ${result.canSchedule ? '✅' : '❌'}\n` +
        (result.error ? `Erreur: ${result.error}` : '')
      );
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de faire le diagnostic');
    }
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Réinitialiser l\'onboarding',
      'Êtes-vous sûr de vouloir réinitialiser les paramètres d\'onboarding ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            await resetOnboardingNotifications();
            Alert.alert('Succès', 'Paramètres d\'onboarding réinitialisés');
          }
        }
      ]
    );
  };

  const handleClearAllStorage = async () => {
    Alert.alert(
      'Effacer toutes les données',
      'Êtes-vous sûr de vouloir effacer toutes les données de notification ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Effacer',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                'notificationSettings',
                'onboardingNotificationSettings',
                'onboardingNotificationsProcessed'
              ]);
              await cancelAllReminders();
              Alert.alert('Succès', 'Toutes les données ont été effacées');
              setScheduledCount(0);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'effacer les données');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Test du Système de Notifications</Text>
      
      {/* État des permissions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <Text style={styles.info}>
          État: {permissions?.granted ? '✅ Accordées' : '❌ Non accordées'}
        </Text>
        <Text style={styles.info}>
          Peut demander: {permissions?.canAskAgain ? '✅ Oui' : '❌ Non'}
        </Text>
        <Text style={styles.info}>
          Statut: {permissions?.status || 'Inconnu'}
        </Text>
        
        {!permissions?.granted && (
          <TouchableOpacity 
            style={styles.button} 
            onPress={requestPermission}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? 'Demande en cours...' : 'Demander les permissions'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* État de l'onboarding */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Onboarding</Text>
        <Text style={styles.info}>
          Traité: {hasProcessedOnboarding ? '✅ Oui' : '❌ Non'}
        </Text>
        <Text style={styles.info}>
          En cours: {isProcessing ? '🔄 Oui' : '✅ Non'}
        </Text>
        
        <TouchableOpacity style={styles.button} onPress={handleResetOnboarding}>
          <Text style={styles.buttonText}>Réinitialiser l'onboarding</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications programmées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications programmées</Text>
        <Text style={styles.info}>Nombre: {scheduledCount}</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleGetScheduled}>
          <Text style={styles.buttonText}>Voir les notifications programmées</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleCancelAll}>
          <Text style={styles.buttonText}>Annuler toutes les notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tests</Text>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleDiagnostic}
        >
          <Text style={styles.buttonText}>🔍 Diagnostic complet</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleTestNotification}
          disabled={!permissions?.granted}
        >
          <Text style={styles.buttonText}>🧪 Envoyer une notification de test</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleTestDeceasedPrayer}
          disabled={!permissions?.granted}
        >
          <Text style={styles.buttonText}>🕊️ Test notification défunts (avec noms)</Text>
        </TouchableOpacity>
      </View>

      {/* Actions destructives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions destructives</Text>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearAllStorage}>
          <Text style={styles.buttonText}>Effacer toutes les données</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  info: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
