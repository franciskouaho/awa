import { useColorScheme } from '@/hooks/useColorScheme';
import { PrayerData } from '@/services/prayerWidgetService';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import PrayerFavoriteButton from './PrayerFavoriteButton';

interface PrayerCardWithWidgetProps {
  prayer: PrayerData;
  onPress?: () => void;
}

const PrayerCardWithWidget: React.FC<PrayerCardWithWidgetProps> = ({ prayer, onPress }) => {
  const colorScheme = useColorScheme();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteChange = (favorite: boolean) => {
    setIsFavorite(favorite);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#ffffff' },
      ]}
      onPress={onPress}
    >
      {/* Header avec nom et bouton favori */}
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Text style={[styles.name, { color: colorScheme === 'dark' ? '#ffffff' : '#333333' }]}>
            {prayer.name}
          </Text>
          <Text style={[styles.details, { color: colorScheme === 'dark' ? '#cccccc' : '#666666' }]}>
            {prayer.age} ans • {prayer.location}
          </Text>
        </View>

        <PrayerFavoriteButton
          prayer={prayer}
          isFavorite={isFavorite}
          onFavoriteChange={handleFavoriteChange}
          size="medium"
        />
      </View>

      {/* Message personnel */}
      <Text style={[styles.message, { color: colorScheme === 'dark' ? '#cccccc' : '#555555' }]}>
        {prayer.personalMessage}
      </Text>

      {/* Footer avec date */}
      <View style={styles.footer}>
        <Text style={[styles.date, { color: colorScheme === 'dark' ? '#999999' : '#888888' }]}>
          📅 Décédé le {formatDate(prayer.deathDate)}
        </Text>

        {isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteBadgeText}>⭐ Widget</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
  },
  favoriteBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoriteBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF6B35',
  },
});

export default PrayerCardWithWidget;
