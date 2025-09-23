import { useColorScheme } from '@/hooks/useColorScheme';
import PrayerWidgetService, { PrayerData, WidgetStatus } from '@/services/prayerWidgetService';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import WidgetConfigurationDrawer from './WidgetConfigurationDrawer';

interface WidgetSectionProps {
  prayers: PrayerData[];
}

const WidgetSection: React.FC<WidgetSectionProps> = ({ prayers }) => {
  const colorScheme = useColorScheme();
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [widgetStatus, setWidgetStatus] = useState<WidgetStatus | null>(null);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerData | undefined>();

  React.useEffect(() => {
    checkWidgetStatus();
  }, []);

  const checkWidgetStatus = async () => {
    try {
      const status = await PrayerWidgetService.checkWidgetStatus();
      setWidgetStatus(status);
    } catch (error) {
      console.error('Error checking widget status:', error);
    }
  };

  const handleConfigureWidget = () => {
    if (!widgetStatus?.isAvailable) {
      Alert.alert(
        'Widget indisponible',
        "Les widgets ne sont disponibles que sur iOS. Assurez-vous d'être sur un appareil iOS."
      );
      return;
    }
    setIsDrawerVisible(true);
  };

  const handlePrayerSelect = (prayer: PrayerData) => {
    setSelectedPrayer(prayer);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
  };

  const getStatusIcon = () => {
    if (!widgetStatus?.isAvailable) return '❌';
    return '✅';
  };

  const getStatusText = () => {
    if (!widgetStatus?.isAvailable) return 'Indisponible';
    return 'Disponible';
  };

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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.widgetIcon}>📱</Text>
          <View>
            <Text style={[styles.title, { color: colorScheme === 'dark' ? '#FFFFFF' : '#2D5A4A' }]}>
              Widget de Prière
            </Text>
            <Text
              style={[styles.subtitle, { color: colorScheme === 'dark' ? '#CCCCCC' : '#666666' }]}
            >
              Affichez une prière sur votre écran d'accueil
            </Text>
          </View>
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text
            style={[
              styles.statusText,
              { color: widgetStatus?.isAvailable ? '#4CAF50' : '#F44336' },
            ]}
          >
            {getStatusText()}
          </Text>
        </View>
      </View>

      {/* Configuration actuelle */}
      {selectedPrayer && (
        <View
          style={[
            styles.currentConfig,
            { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' },
          ]}
        >
          <Text
            style={[styles.configTitle, { color: colorScheme === 'dark' ? '#FFFFFF' : '#333333' }]}
          >
            📿 Prière sélectionnée
          </Text>
          <Text
            style={[
              styles.configPrayerName,
              { color: colorScheme === 'dark' ? '#FFFFFF' : '#2D5A4A' },
            ]}
          >
            {selectedPrayer.name}
          </Text>
          <Text
            style={[
              styles.configPrayerDetails,
              { color: colorScheme === 'dark' ? '#CCCCCC' : '#666666' },
            ]}
          >
            {selectedPrayer.age} ans • {selectedPrayer.location}
          </Text>
        </View>
      )}

      {/* Instructions */}
      <View
        style={[
          styles.instructions,
          { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f8f8' },
        ]}
      >
        <Text
          style={[
            styles.instructionsTitle,
            { color: colorScheme === 'dark' ? '#FFFFFF' : '#333333' },
          ]}
        >
          📋 Comment ajouter le widget
        </Text>
        <Text
          style={[
            styles.instructionText,
            { color: colorScheme === 'dark' ? '#CCCCCC' : '#666666' },
          ]}
        >
          1. Appuyez longuement sur l'écran d'accueil
        </Text>
        <Text
          style={[
            styles.instructionText,
            { color: colorScheme === 'dark' ? '#CCCCCC' : '#666666' },
          ]}
        >
          2. Cliquez sur le "+" en haut à gauche
        </Text>
        <Text
          style={[
            styles.instructionText,
            { color: colorScheme === 'dark' ? '#CCCCCC' : '#666666' },
          ]}
        >
          3. Recherchez "Awa" et ajoutez le widget
        </Text>
      </View>

      {/* Bouton de configuration */}
      <TouchableOpacity
        style={[styles.configureButton, !widgetStatus?.isAvailable && styles.disabledButton]}
        onPress={handleConfigureWidget}
        disabled={!widgetStatus?.isAvailable}
      >
        <Text style={styles.configureButtonIcon}>⚙️</Text>
        <Text style={styles.configureButtonText}>
          {selectedPrayer ? 'Modifier la configuration' : 'Configurer le widget'}
        </Text>
      </TouchableOpacity>

      {/* Drawer de configuration */}
      <WidgetConfigurationDrawer
        isVisible={isDrawerVisible}
        onClose={handleCloseDrawer}
        prayers={prayers}
        onPrayerSelect={handlePrayerSelect}
        selectedPrayer={selectedPrayer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    margin: 10,
    padding: 20,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  widgetIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  statusContainer: {
    alignItems: 'center',
  },
  statusIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  currentConfig: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  configTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  configPrayerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  configPrayerDetails: {
    fontSize: 14,
  },
  instructions: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  configureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  configureButtonIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  configureButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WidgetSection;
