import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrayerWidgetService, { LiveActivityStatus, PrayerData } from '../services/PrayerWidgetService';

interface PrayerWidgetTestProps {
  prayerData?: PrayerData;
}

const PrayerWidgetTest: React.FC<PrayerWidgetTestProps> = ({ prayerData }) => {
  const [status, setStatus] = useState<LiveActivityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prayerCount, setPrayerCount] = useState(0);

  // Données de test par défaut
  const defaultPrayerData: PrayerData = {
    prayerId: 'test-prayer-123',
    name: 'Marie Dubois',
    age: 72,
    location: 'Lyon, France',
    personalMessage: 'Que Dieu ait son âme en paix. Elle était une mère aimante et une grand-mère attentionnée.',
    deathDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // Il y a 30 jours
  };

  const currentPrayerData = prayerData || defaultPrayerData;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const liveActivityStatus = await PrayerWidgetService.checkLiveActivityStatus();
      setStatus(liveActivityStatus);
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le statut des Live Activities');
    }
  };

  const startLiveActivity = async () => {
    if (!status?.canStart) {
      Alert.alert('Impossible', status?.error || 'Les Live Activities ne sont pas disponibles');
      return;
    }

    setIsLoading(true);
    try {
      const activityId = await PrayerWidgetService.startLiveActivity(currentPrayerData);
      Alert.alert('Succès', `Live Activity démarrée avec l'ID: ${activityId}`);
      setPrayerCount(0);
    } catch (error) {
      console.error('Error starting Live Activity:', error);
      Alert.alert('Erreur', 'Impossible de démarrer la Live Activity');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrayerCount = async () => {
    const newCount = prayerCount + 1;
    setPrayerCount(newCount);
    
    try {
      await PrayerWidgetService.updateLiveActivity(currentPrayerData.prayerId, newCount);
      console.log(`Prayer count updated to ${newCount}`);
    } catch (error) {
      console.error('Error updating prayer count:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le compteur de prières');
    }
  };

  const endLiveActivity = async () => {
    setIsLoading(true);
    try {
      await PrayerWidgetService.endLiveActivity(currentPrayerData.prayerId);
      Alert.alert('Succès', 'Live Activity terminée');
      setPrayerCount(0);
    } catch (error) {
      console.error('Error ending Live Activity:', error);
      Alert.alert('Erreur', 'Impossible de terminer la Live Activity');
    } finally {
      setIsLoading(false);
    }
  };

  if (Platform.OS !== 'ios') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Widget de Prière</Text>
        <Text style={styles.errorText}>
          Les widgets et Live Activities ne sont disponibles que sur iOS
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Widget de Prière - Test</Text>
      
      {/* Statut des Live Activities */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusTitle}>Statut des Live Activities:</Text>
        <Text style={[
          styles.statusText,
          { color: status?.isEnabled ? '#4CAF50' : '#F44336' }
        ]}>
          {status?.isEnabled ? '✅ Activées' : '❌ Désactivées'}
        </Text>
        {status?.error && (
          <Text style={styles.errorText}>{status.error}</Text>
        )}
      </View>

      {/* Informations de la prière */}
      <View style={styles.prayerInfo}>
        <Text style={styles.prayerTitle}>Prière pour {currentPrayerData.name}</Text>
        <Text style={styles.prayerDetails}>
          {currentPrayerData.age} ans • {currentPrayerData.location}
        </Text>
        <Text style={styles.prayerMessage}>{currentPrayerData.personalMessage}</Text>
      </View>

      {/* Compteur de prières */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterLabel}>Nombre de prières:</Text>
        <Text style={styles.counterValue}>{prayerCount}</Text>
      </View>

      {/* Boutons d'action */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.startButton, (!status?.canStart || isLoading) && styles.disabledButton]}
          onPress={startLiveActivity}
          disabled={!status?.canStart || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Démarrage...' : 'Démarrer Live Activity'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={updatePrayerCount}
          disabled={!PrayerWidgetService.hasActiveActivity(currentPrayerData.prayerId)}
        >
          <Text style={styles.buttonText}>+1 Prière</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.endButton]}
          onPress={endLiveActivity}
          disabled={!PrayerWidgetService.hasActiveActivity(currentPrayerData.prayerId) || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Arrêt...' : 'Terminer Live Activity'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Vérifiez que les Live Activities sont activées dans les paramètres iOS
        </Text>
        <Text style={styles.instructionText}>
          2. Appuyez sur "Démarrer Live Activity" pour créer une notification dynamique
        </Text>
        <Text style={styles.instructionText}>
          3. Utilisez "+1 Prière" pour mettre à jour le compteur
        </Text>
        <Text style={styles.instructionText}>
          4. La Live Activity apparaîtra sur l'écran de verrouillage et dans le Dynamic Island
        </Text>
      </View>
    </View>
  );
};

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
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 5,
  },
  prayerInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  prayerDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  prayerMessage: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  counterContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  counterLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  buttonContainer: {
    gap: 10,
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  updateButton: {
    backgroundColor: '#2196F3',
  },
  endButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default PrayerWidgetTest;
