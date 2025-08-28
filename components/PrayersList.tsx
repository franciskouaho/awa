import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import { PrayerData } from '@/services/prayerService';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrayersList() {
  const colorScheme = useColorScheme();
  const { prayers, loading, error, loadPrayers, incrementPrayerCount } = usePrayers();
  const [selectedPrayer, setSelectedPrayer] = useState<string | null>(null);

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const handlePrayerPress = async (prayer: PrayerData) => {
    if (!prayer.id) return;
    
    setSelectedPrayer(prayer.id);
    const result = await incrementPrayerCount(prayer.id);
    
    if (result.success) {
      Alert.alert('Prière comptabilisée', `Prière pour ${prayer.name} ajoutée.`);
    } else {
      Alert.alert('Erreur', result.error || 'Impossible de comptabiliser la prière');
    }
    
    setSelectedPrayer(null);
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
      
      {prayers.map((prayer) => (
        <TouchableOpacity
          key={prayer.id}
          style={[
            styles.prayerCard,
            { 
              backgroundColor: Colors[colorScheme ?? 'light'].surface,
              borderColor: Colors[colorScheme ?? 'light'].border,
            }
          ]}
          onPress={() => handlePrayerPress(prayer)}
          disabled={selectedPrayer === prayer.id}
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
      ))}
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
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
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
});
