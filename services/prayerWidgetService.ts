import { ExtensionStorage } from '@bacons/apple-targets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Module natif pour sauvegarder les données dans App Groups

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
  private appGroupIdentifier = 'group.com.emplica.awa';
  private widgetStorage = new ExtensionStorage(this.appGroupIdentifier);

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

      // Fallback: AsyncStorage
      console.log('📱 Using AsyncStorage fallback');
      await AsyncStorage.setItem('currentPrayerData', JSON.stringify(prayerData));
      console.log('✅ Prayer data saved to AsyncStorage');
    } catch (error) {
      console.error('Error saving prayer data for widget:', error);
      throw error;
    }
  }

  /**
   * Sauvegarde la liste complète des bookmarks pour le widget (clé 'bookmarkedPrayers')
   */
  async saveBookmarksForWidget(bookmarks: PrayerData[]): Promise<void> {
    try {
      console.log('💾 Saving bookmarks for widget:', bookmarks);
      console.log(
        '📊 Bookmark details:',
        bookmarks.map(b => ({
          name: b.name,
          age: b.age,
          location: b.location,
          deathDate: new Date(b.deathDate).toISOString(),
        }))
      );

      const appGroupIdentifier = 'group.com.emplica.awa';
      const bookmarksKey = 'bookmarkedPrayers';

      if (Platform.OS === 'ios') {
        console.log('📱 Using ExtensionStorage for App Groups');
        // Convertir les données au format attendu par ExtensionStorage
        const formattedBookmarks = bookmarks.map(bookmark => ({
          prayerId: bookmark.prayerId,
          name: bookmark.name,
          age: bookmark.age,
          location: bookmark.location,
          personalMessage: bookmark.personalMessage,
          deathDate: bookmark.deathDate,
        }));
        await this.widgetStorage.set('bookmarkedPrayers', formattedBookmarks);
        console.log('✅ Bookmarks saved to App Groups via ExtensionStorage');
      } else {
        console.log('📱 Using AsyncStorage fallback');
        // Fallback: AsyncStorage
        await AsyncStorage.setItem('bookmarkedPrayers', JSON.stringify(bookmarks));
        console.log('✅ Bookmarks saved to AsyncStorage');
      }
    } catch (error) {
      console.error('❌ Error saving bookmarks for widget:', error);
      throw error;
    }
  }

  /**
   * Récupère les bookmarks depuis App Groups (pour debug)
   */
  async getBookmarksFromWidget(): Promise<PrayerData[]> {
    try {
      if (Platform.OS === 'ios') {
        console.log('📱 Reading bookmarks from App Groups via ExtensionStorage');
        const bookmarks = await this.widgetStorage.get('bookmarkedPrayers');
        console.log('✅ Bookmarks retrieved from ExtensionStorage:', bookmarks);
        // Convertir les données au format PrayerData
        if (Array.isArray(bookmarks)) {
          return bookmarks.map((bookmark: any) => ({
            prayerId: bookmark.prayerId || '',
            name: bookmark.name || '',
            age: bookmark.age || 0,
            location: bookmark.location || '',
            personalMessage: bookmark.personalMessage || '',
            deathDate: bookmark.deathDate || Date.now(),
          }));
        }
        return [];
      } else {
        console.log('📱 Reading bookmarks from AsyncStorage');
        const bookmarks = await AsyncStorage.getItem('bookmarkedPrayers');
        return bookmarks ? JSON.parse(bookmarks) : [];
      }
    } catch (error) {
      console.error('❌ Error reading bookmarks from widget:', error);
      return [];
    }
  }
}

export default PrayerWidgetService.getInstance();
