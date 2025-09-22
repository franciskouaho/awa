import { Platform } from 'react-native';

// Pour un widget statique, on n'a pas besoin de module natif
// Les données sont partagées via UserDefaults/App Groups

export interface PrayerData {
  prayerId: string;
  name: string;
  age: number;
  location: string;
  personalMessage: string;
  deathDate: number; // Unix timestamp
}

export interface WidgetStatus {
  isAvailable: boolean;
  error?: string;
}

class PrayerWidgetService {
  private static instance: PrayerWidgetService;

  static getInstance(): PrayerWidgetService {
    if (!PrayerWidgetService.instance) {
      PrayerWidgetService.instance = new PrayerWidgetService();
    }
    return PrayerWidgetService.instance;
  }

  /**
   * Vérifie si les widgets sont disponibles
   */
  async checkWidgetStatus(): Promise<WidgetStatus> {
    if (Platform.OS !== 'ios') {
      return {
        isAvailable: false,
        error: 'Widgets are only available on iOS',
      };
    }

    return {
      isAvailable: true,
    };
  }

  /**
   * Sauvegarde les données d'une prière pour le widget
   */
  async savePrayerForWidget(prayerData: PrayerData): Promise<void> {
    try {
      // Pour un widget statique, on sauvegarde les données dans UserDefaults
      // via App Groups pour que le widget puisse les lire
      console.log(`Saving prayer data for widget: ${prayerData.name}`);

      // Ici, vous pourriez utiliser un module natif pour sauvegarder dans UserDefaults
      // ou utiliser AsyncStorage avec App Groups

      // Pour l'instant, on log juste les données
      console.log('Prayer data:', {
        name: prayerData.name,
        age: prayerData.age,
        location: prayerData.location,
        personalMessage: prayerData.personalMessage,
        deathDate: new Date(prayerData.deathDate).toISOString(),
      });
    } catch (error) {
      console.error('Error saving prayer data for widget:', error);
      throw error;
    }
  }
}

export default PrayerWidgetService.getInstance();
