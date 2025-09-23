import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Module natif pour sauvegarder les données dans App Groups
const { PrayerWidgetModule, PrayerWidgetDataManager } = NativeModules;

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
      console.log(`💾 Saving prayer data for widget: ${prayerData.name}`);

      if (Platform.OS === 'ios' && PrayerWidgetDataManager) {
        // Utiliser le module natif pour App Groups
        console.log('📱 Using PrayerWidgetDataManager for App Groups');
        await PrayerWidgetDataManager.savePrayerData(prayerData);
        console.log('✅ Prayer data saved to App Groups');
      } else {
        // Fallback: AsyncStorage
        console.log('📱 Using AsyncStorage fallback');
        await AsyncStorage.setItem('currentPrayerData', JSON.stringify(prayerData));
        console.log('✅ Prayer data saved to AsyncStorage');
      }
    } catch (error) {
      console.error('Error saving prayer data for widget:', error);
      throw error;
    }
  }
}

export default PrayerWidgetService.getInstance();
