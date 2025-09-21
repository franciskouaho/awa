import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import { usePrayerWidget } from '@/hooks/usePrayerWidget';
import { PrayerData } from '@/services/prayerService';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PrayersList() {
  const colorScheme = useColorScheme();
  const { prayers, loading, error, loadPrayers, incrementPrayerCount } = usePrayers();
  const { 
    isSupported, 
    activitiesEnabled, 
    activeActivities, 
    startPrayerActivity, 
    updatePrayerActivity, 
    endPrayerActivity,
    loading: widgetLoading 
  } = usePrayerWidget();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);
  const [widgetActivities, setWidgetActivities] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const handlePrayerPress = async (prayer: PrayerData) => {
    if (!prayer.id) return;
    
    setSelectedPrayer(prayer.id);
    const result = await incrementPrayerCount(prayer.id);
    
    if (result.success) {
      Alert.alert('Prière comptabilisée', `Prière pour ${prayer.name} ajoutée.`);
      
      // Mettre à jour la Live Activity si elle existe
      const activityId = widgetActivities.get(prayer.id);
      if (activityId) {
        await updatePrayerActivity(activityId, prayer.prayerCount + 1);
      }
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de comptabiliser la prière');
    }
    
    setSelectedPrayer(null);
  };

  const handleWidgetToggle = async (prayer: PrayerData) => {
    if (!prayer.id) return;

    const activityId = widgetActivities.get(prayer.id);
    
    if (activityId) {
      // Arrêter la Live Activity
      const success = await endPrayerActivity(activityId);
      if (success) {
        setWidgetActivities(prev => {
          const newMap = new Map(prev);
          newMap.delete(prayer.id!);
          return newMap;
        });
        Alert.alert('Widget arrêté', `Live Activity pour ${prayer.name} arrêtée.`);
      }
    } else {
      // Démarrer la Live Activity
      const newActivityId = await startPrayerActivity(prayer);
      if (newActivityId) {
        setWidgetActivities(prev => {
          const newMap = new Map(prev);
          newMap.set(prayer.id!, newActivityId);
          return newMap;
        });
        Alert.alert('Widget démarré', `Live Activity pour ${prayer.name} démarrée.`);
      } else {
        Alert.alert('Erreur', 'Impossible de démarrer la Live Activity');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Chargement des prières...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
          Erreur: {error}
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={loadPrayers}
        >
          <Text style={[styles.retryButtonText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (prayers.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Aucune prière trouvée.{'\n'}Ajoutez votre première prière!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Prières Firebase ({prayers.length})
      </Text>
      
      {prayers.map((prayer) => {
        const hasWidget = widgetActivities.has(prayer.id!);
        const isWidgetSupported = Platform.OS === 'ios' && isSupported && activitiesEnabled;
        
        return (
          <View
            key={prayer.id}
            style={[
              styles.prayerCard,
              { 
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                borderColor: Colors[colorScheme ?? 'light'].border,
              }
            ]}
          >
            <TouchableOpacity
              onPress={() => handlePrayerPress(prayer)}
              disabled={selectedPrayer === prayer.id}
              style={styles.prayerContent}
            >
              <View style={styles.prayerHeader}>
                <Text style={[styles.prayerName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {prayer.name}
                </Text>
                <Text style={[styles.prayerCount, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  {prayer.prayerCount} prières
                </Text>
              </View>
              
              <Text style={[styles.prayerDetails, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {prayer.age} ans • {prayer.location}
              </Text>
              
              <Text style={[styles.prayerMessage, { color: Colors[colorScheme ?? 'light'].text }]}>
                {prayer.personalMessage}
              </Text>
              
              <Text style={[styles.prayerDate, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Décédé(e) le {prayer.deathDate.toLocaleDateString('fr-FR')}
              </Text>
              
              {selectedPrayer === prayer.id && (
                <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  Ajout de la prière...
                </Text>
              )}
            </TouchableOpacity>
            
            {/* Bouton Widget */}
            {isWidgetSupported && (
              <TouchableOpacity
                style={[
                  styles.widgetButton,
                  {
                    backgroundColor: hasWidget 
                      ? Colors[colorScheme ?? 'light'].error 
                      : Colors[colorScheme ?? 'light'].primary
                  }
                ]}
                onPress={() => handleWidgetToggle(prayer)}
                disabled={widgetLoading}
              >
                <Ionicons
                  name={hasWidget ? "stop-circle" : "play-circle"}
                  size={20}
                  color={Colors[colorScheme ?? 'light'].textOnPrimary}
                />
                <Text style={[styles.widgetButtonText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>
                  {hasWidget ? 'Arrêter Widget' : 'Démarrer Widget'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  prayerCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  prayerContent: {
    padding: 16,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  prayerName: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  prayerCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  prayerDetails: {
    fontSize: 14,
    marginBottom: 8,
  },
  prayerMessage: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  prayerDate: {
    fontSize: 12,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  widgetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  widgetButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
