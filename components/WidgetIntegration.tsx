import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import React from 'react';
import WidgetSection from './WidgetSection';

/**
 * Composant d'intégration simple pour ajouter la section widget
 * à n'importe quel écran de votre application
 */
const WidgetIntegration: React.FC = () => {
  const colorScheme = useColorScheme();
  const { prayers, loading, error } = usePrayers();

  // Convertir les données de prières pour le widget
  const convertPrayersForWidget = (prayers: any[]) => {
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

  // Ne pas afficher si en cours de chargement ou erreur
  if (loading || error) {
    return null;
  }

  return <WidgetSection prayers={widgetPrayers} />;
};

export default WidgetIntegration;
