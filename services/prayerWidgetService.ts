import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

// Module natif pour sauvegarder les données dans App Groups
const { PrayerWidgetModule } = NativeModules;

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

export interface WidgetTheme {
  id: string;
  name: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface WidgetConfiguration {
  selectedPrayer: PrayerData;
  selectedTheme: string;
  widgetEnabled: boolean;
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

      if (Platform.OS === 'ios' && PrayerWidgetModule) {
        // Sauvegarder via le module natif dans App Groups
        console.log('📱 Using native module for iOS');
        await PrayerWidgetModule.savePrayerData(prayerData);
        console.log('✅ Prayer data saved successfully to App Groups');
      } else {
        // Fallback: sauvegarder dans UserDefaults local (accessible par le widget)
        console.log('📱 Native module not available, saving to UserDefaults local');

        try {
          // Sauvegarder dans UserDefaults standard (accessible par le widget)
          if (NativeModules.RNCAsyncStorage) {
            // Utiliser AsyncStorage qui écrit dans UserDefaults
            await NativeModules.RNCAsyncStorage.multiSet([
              ['currentPrayerData', JSON.stringify(prayerData)],
            ]);
            console.log('✅ Prayer data saved to UserDefaults via AsyncStorage');
          } else {
            // Fallback: sauvegarder dans AsyncStorage
            await AsyncStorage.setItem('currentPrayerData', JSON.stringify(prayerData));
            console.log('✅ Prayer data saved to AsyncStorage');
          }
        } catch {
          console.log('Error saving to UserDefaults, using AsyncStorage fallback');
          await AsyncStorage.setItem('currentPrayerData', JSON.stringify(prayerData));
          console.log('✅ Prayer data saved to AsyncStorage (fallback)');
        }

        console.log('Prayer data saved:', {
          name: prayerData.name,
          age: prayerData.age,
          location: prayerData.location,
          personalMessage: prayerData.personalMessage,
          deathDate: new Date(prayerData.deathDate).toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving prayer data for widget:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la configuration complète du widget
   */
  async saveWidgetConfiguration(config: WidgetConfiguration): Promise<void> {
    try {
      console.log(`Saving widget configuration:`, config);

      if (Platform.OS === 'ios' && PrayerWidgetModule) {
        // Sauvegarder la configuration complète
        await PrayerWidgetModule.saveWidgetConfiguration(config);
        console.log('Widget configuration saved successfully');
      } else {
        // Fallback: simulation
        console.log('Widget configuration to save:', {
          selectedPrayer: config.selectedPrayer.name,
          selectedTheme: config.selectedTheme,
          widgetEnabled: config.widgetEnabled,
        });
        console.log('✅ Widget configuration saved (simulated)');
      }
    } catch (error) {
      console.error('Error saving widget configuration:', error);
      throw error;
    }
  }

  /**
   * Récupère la configuration actuelle du widget
   */
  async getWidgetConfiguration(): Promise<WidgetConfiguration | null> {
    try {
      if (Platform.OS === 'ios' && PrayerWidgetModule) {
        return await PrayerWidgetModule.getWidgetConfiguration();
      } else {
        // Fallback: retourner null
        return null;
      }
    } catch (error) {
      console.error('Error getting widget configuration:', error);
      return null;
    }
  }
}

export default PrayerWidgetService.getInstance();
