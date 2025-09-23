import { useColorScheme } from '@/hooks/useColorScheme';
import PrayerWidgetService, {
    PrayerData,
    WidgetStatus,
} from '@/services/prayerWidgetService';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PrayerWidgetTestProps {
  prayerData?: PrayerData;
}

const PrayerWidgetTest: React.FC<PrayerWidgetTestProps> = ({ prayerData }) => {
  const colorScheme = useColorScheme();
  const [status, setStatus] = useState<WidgetStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Données de test par défaut
  const defaultPrayerData: PrayerData = {
    prayerId: 'test-prayer-123',
    name: 'Marie Dubois',
    age: 72,
    location: 'Lyon, France',
    personalMessage:
      'Que Dieu ait son âme en paix. Elle était une mère aimante et une grand-mère attentionnée.',
    deathDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // Il y a 30 jours
  };

  const currentPrayerData = prayerData || defaultPrayerData;

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const widgetStatus = await PrayerWidgetService.checkWidgetStatus();
      setStatus(widgetStatus);
    } catch (error) {
      console.error('Error checking status:', error);
      Alert.alert('Erreur', 'Impossible de vérifier le statut des widgets');
    }
  };

  const savePrayerForWidget = async () => {
    if (!status?.isAvailable) {
      Alert.alert('Impossible', status?.error || 'Les widgets ne sont pas disponibles');
      return;
    }

    setIsLoading(true);
    try {
      await PrayerWidgetService.savePrayerForWidget(currentPrayerData);
      Alert.alert('Succès', 'Données de prière sauvegardées pour le widget');
    } catch (error) {
      console.error('Error saving prayer for widget:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder les données pour le widget');
    } finally {
      setIsLoading(false);
    }
  };


  if (Platform.OS !== 'ios') {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
          },
        ]}
      >
        <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#2D5A4A' }]}>
          Widget de Prière
        </Text>
        <Text
          style={[
            styles.errorText,
            { color: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.8)' : '#F44336' },
          ]}
        >
          Les widgets ne sont disponibles que sur iOS
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
        },
      ]}
    >
      <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#2D5A4A' }]}>
        Widget de Prière - Test
      </Text>

      {/* Statut des Widgets */}
      <View style={styles.statusContainer}>
        <Text
          style={[styles.statusTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#2D5A4A' }]}
        >
          Statut des Widgets:
        </Text>
        <Text style={[styles.statusText, { color: status?.isAvailable ? '#4CAF50' : '#F44336' }]}>
          {status?.isAvailable ? '✅ Disponibles' : '❌ Indisponibles'}
        </Text>
        {status?.error && (
          <Text
            style={[styles.errorText, { color: colorScheme === 'dark' ? '#FF6B6B' : '#F44336' }]}
          >
            {status.error}
          </Text>
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


      {/* Boutons d'action */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.startButton,
            (!status?.isAvailable || isLoading) && styles.disabledButton,
          ]}
          onPress={savePrayerForWidget}
          disabled={!status?.isAvailable || isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder pour le Widget'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionText}>
          1. Appuyez sur "Sauvegarder pour le Widget" pour enregistrer les données
        </Text>
        <Text style={styles.instructionText}>
          2. Allez sur l'écran d'accueil de votre iPhone
        </Text>
        <Text style={styles.instructionText}>
          3. Appuyez longuement sur un espace vide
        </Text>
        <Text style={styles.instructionText}>
          4. Cliquez sur le "+" en haut à gauche
        </Text>
        <Text style={styles.instructionText}>
          5. Recherchez "Awa" et ajoutez le widget de prière
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    margin: 10,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
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
