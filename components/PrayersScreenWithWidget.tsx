import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import { PrayerData } from '@/services/prayerWidgetService';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrayerCardWithWidget from './PrayerCardWithWidget';
import WidgetSection from './WidgetSection';

const PrayersScreenWithWidget: React.FC = () => {
  const colorScheme = useColorScheme();

  // Utiliser le hook pour récupérer les vraies données de prières
  const { prayers, loading, error, refreshPrayers } = usePrayers();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPrayers();
    } catch (error) {
      console.error('Error refreshing prayers:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handlePrayerPress = (prayer: PrayerData) => {
    // Navigation vers les détails de la prière
    console.log('Navigate to prayer details:', prayer.prayerId);
  };

  // Convertir les données de prières pour le widget
  const convertPrayersForWidget = (prayers: any[]): PrayerData[] => {
    return prayers.map(prayer => {
      // Gérer la date de décès
      let deathDate = Date.now();
      if (prayer.deathDate) {
        if (typeof prayer.deathDate === 'string') {
          deathDate = new Date(prayer.deathDate).getTime();
        } else if (prayer.deathDate instanceof Date) {
          deathDate = prayer.deathDate.getTime();
        } else if (typeof prayer.deathDate === 'number') {
          deathDate = prayer.deathDate;
        }
      }

      return {
        prayerId: prayer.id || prayer.prayerId || `prayer-${Math.random()}`,
        name: prayer.name || prayer.deceasedName || 'Nom non disponible',
        age: prayer.age || prayer.deceasedAge || 0,
        location: prayer.location || prayer.deceasedLocation || 'Lieu non disponible',
        personalMessage:
          prayer.personalMessage || prayer.message || 'Message personnel non disponible',
        deathDate: deathDate,
      };
    });
  };

  const widgetPrayers = convertPrayersForWidget(prayers);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5' },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text
          style={[styles.headerTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#2D5A4A' }]}
        >
          📿 Prières
        </Text>
        <Text
          style={[styles.headerSubtitle, { color: colorScheme === 'dark' ? '#cccccc' : '#666666' }]}
        >
          {widgetPrayers.length} prière{widgetPrayers.length > 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Widget */}
        <WidgetSection prayers={widgetPrayers} />

        {/* Liste des prières */}
        <View style={styles.prayersSection}>
          <Text
            style={[styles.sectionTitle, { color: colorScheme === 'dark' ? '#ffffff' : '#2D5A4A' }]}
          >
            📖 Toutes les prières
          </Text>

          {/* État de chargement */}
          {loading && (
            <View style={styles.loadingContainer}>
              <Text
                style={[
                  styles.loadingText,
                  { color: colorScheme === 'dark' ? '#cccccc' : '#666666' },
                ]}
              >
                Chargement des prières...
              </Text>
            </View>
          )}

          {/* État d'erreur */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: '#F44336' }]}>❌ Erreur: {error}</Text>
            </View>
          )}

          {/* Liste des prières */}
          {!loading && !error && widgetPrayers.length === 0 && (
            <View style={styles.emptyContainer}>
              <Text
                style={[
                  styles.emptyText,
                  { color: colorScheme === 'dark' ? '#cccccc' : '#666666' },
                ]}
              >
                📿 Aucune prière disponible
              </Text>
              <Text
                style={[
                  styles.emptySubtext,
                  { color: colorScheme === 'dark' ? '#999999' : '#888888' },
                ]}
              >
                Ajoutez une prière pour commencer
              </Text>
            </View>
          )}

          {!loading &&
            !error &&
            widgetPrayers.map(prayer => (
              <PrayerCardWithWidget
                key={prayer.prayerId}
                prayer={prayer}
                onPress={() => handlePrayerPress(prayer)}
              />
            ))}
        </View>

        {/* Espace en bas */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60, // Pour la barre de statut
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  prayersSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 100,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default PrayersScreenWithWidget;
