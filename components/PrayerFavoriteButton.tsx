import { useColorScheme } from '@/hooks/useColorScheme';
import PrayerWidgetService, { PrayerData } from '@/services/prayerWidgetService';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity } from 'react-native';

interface PrayerFavoriteButtonProps {
  prayer: PrayerData;
  isFavorite?: boolean;
  onFavoriteChange?: (isFavorite: boolean) => void;
  size?: 'small' | 'medium' | 'large';
}

const PrayerFavoriteButton: React.FC<PrayerFavoriteButtonProps> = ({
  prayer,
  isFavorite = false,
  onFavoriteChange,
  size = 'medium',
}) => {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setIsLoading(true);
    try {
      if (!isFavorite) {
        // Marquer comme favori et sauvegarder pour le widget
        await PrayerWidgetService.savePrayerForWidget(prayer);
        Alert.alert(
          '⭐ Prière mise en favori',
          `${prayer.name} est maintenant affichée dans le widget !`
        );
      } else {
        // Retirer des favoris (optionnel - pour l'instant on garde)
        Alert.alert('💝 Prière en favori', 'Cette prière reste affichée dans le widget');
      }

      onFavoriteChange?.(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', 'Impossible de modifier les favoris');
    } finally {
      setIsLoading(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          icon: styles.smallIcon,
        };
      case 'large':
        return {
          container: styles.largeContainer,
          icon: styles.largeIcon,
        };
      default:
        return {
          container: styles.mediumContainer,
          icon: styles.mediumIcon,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        sizeStyles.container,
        isFavorite && styles.favoriteContainer,
        {
          backgroundColor: isFavorite
            ? '#FFD700'
            : colorScheme === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.8)',
        },
      ]}
      onPress={handleToggleFavorite}
      disabled={isLoading}
    >
      <Text style={[styles.icon, sizeStyles.icon, isFavorite && styles.favoriteIcon]}>
        {isLoading ? '⏳' : isFavorite ? '⭐' : '☆'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteContainer: {
    shadowColor: '#FFD700',
    shadowOpacity: 0.3,
  },
  icon: {
    color: '#666',
  },
  favoriteIcon: {
    color: '#FF6B35',
  },
  // Tailles
  smallContainer: {
    width: 32,
    height: 32,
  },
  smallIcon: {
    fontSize: 16,
  },
  mediumContainer: {
    width: 40,
    height: 40,
  },
  mediumIcon: {
    fontSize: 20,
  },
  largeContainer: {
    width: 48,
    height: 48,
  },
  largeIcon: {
    fontSize: 24,
  },
});

export default PrayerFavoriteButton;
export { PrayerFavoriteButton };
