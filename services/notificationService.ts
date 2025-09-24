import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ContentService } from './contentService';

export interface NotificationSettings {
  enableReminders: boolean;
  sound: boolean;
  enableDeceasedReminder: boolean;
  dailyCount: number;
  startTime: string;
  endTime: string;
  selectedFeed: string;
  selectedDays: boolean[];
}

export interface NotificationPermissions {
  granted: boolean;
  canAskAgain: boolean;
  status: string;
}

class NotificationService {
  /**
   * Envoie une notification de test pour la prière du défunt
   */
  async sendTestDeceasedPrayerNotification(prayerData?: any): Promise<void> {
    await this.initializeNotifications();
    const permissions = await this.getPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }

    // Obtenir du contenu enrichi pour la prière du défunt
    const deceasedPrayerContent = await this.getDeceasedPrayerContent(prayerData);

    await Notifications.scheduleNotificationAsync({
      content: {
        title: deceasedPrayerContent.title,
        body: deceasedPrayerContent.body,
        data: deceasedPrayerContent.data,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  }

  /**
   * Obtient le contenu enrichi pour les prières de défunts
   */
  private async getDeceasedPrayerContent(
    prayerData?: any
  ): Promise<{ title: string; body: string; data: any }> {
    try {
      // Si on a des données de prière de l'utilisateur, utiliser une vraie prière
      if (prayerData && prayerData.length > 0) {
        // Prendre une prière aléatoire parmi les vraies prières de l'utilisateur
        const randomPrayer = prayerData[Math.floor(Math.random() * prayerData.length)];

        // Utiliser directement le message de la prière de l'utilisateur
        const prayerMessage =
          randomPrayer.message || randomPrayer.prayer || 'Prière pour les défunts';

        return {
          title: `🕊️ Prière pour ${randomPrayer.name}`,
          body: `Prière pour ${randomPrayer.name}\n\n${prayerMessage}\n\nQue Dieu accorde Sa miséricorde à ${randomPrayer.name} et à tous les défunts.`,
          data: {
            type: 'deceasedPrayer',
            hasContent: true,
            deceasedName: randomPrayer.name,
            prayerId: randomPrayer.id,
            prayerMessage: prayerMessage,
          },
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu pour les défunts:', error);
    }

    // Fallback si pas de prières utilisateur
    return {
      title: '🕊️ Prière pour les défunts',
      body: 'Prenez un moment pour prier pour les âmes des défunts. Que Dieu leur accorde Sa miséricorde.',
      data: {
        type: 'deceasedPrayer',
        hasContent: false,
      },
    };
  }

  /**
   * Remplace les placeholders de nom dans une formule de prière
   */
  private replaceNamePlaceholders(formula: any, name: string): any {
    if (!formula) return formula;

    return {
      ...formula,
      translation:
        formula.translation?.replace(/\[nom de la personne\]/g, name) || formula.translation,
      transliteration:
        formula.transliteration?.replace(/\[nom de la personne\]/g, name) ||
        formula.transliteration,
      arabic: formula.arabic?.replace(/\[nom de la personne\]/g, name) || formula.arabic,
    };
  }

  private isInitialized = false;

  private async initializeNotifications() {
    if (this.isInitialized) return;

    // Configuration du handler de notifications
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Configuration du canal Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('prayer-reminders', {
        name: 'Prayer Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    // Configuration des catégories de notifications
    await this.setupNotificationCategories();

    this.isInitialized = true;
  }

  /**
   * Demande les permissions pour les notifications
   */
  async requestPermissions(): Promise<NotificationPermissions> {
    if (!Device.isDevice) {
      throw new Error('Must use physical device for Push Notifications');
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return {
      granted: finalStatus === 'granted',
      canAskAgain: finalStatus !== 'denied',
      status: finalStatus,
    };
  }

  /**
   * Vérifie les permissions actuelles
   */
  async getPermissions(): Promise<NotificationPermissions> {
    const { status } = await Notifications.getPermissionsAsync();
    return {
      granted: status === 'granted',
      canAskAgain: status !== 'denied',
      status: status,
    };
  }

  /**
   * Obtient le token push Expo
   */
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (!Device.isDevice) {
        console.log('Must use physical device for push notifications');
        return null;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

      if (!projectId) {
        console.log('Project ID not found');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Programme les notifications de rappel selon les paramètres
   */
  async scheduleReminders(settings: NotificationSettings, userPrayers?: any[]): Promise<void> {
    await this.initializeNotifications();
    // Annuler toutes les notifications programmées précédemment
    await this.cancelAllReminders();
    if (!settings.enableReminders) {
      return;
    }
    const permissions = await this.getPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }
    // Programmer les rappels de prière
    await this.schedulePrayerReminders(settings);
    // Programmer les rappels de prière pour les défunts
    if (settings.enableDeceasedReminder) {
      await this.scheduleDeceasedPrayerReminders(settings, userPrayers);
    }
    // Programmer les rappels de streak quotidien
    // await this.scheduleDailyStreakReminders(settings); // Temporairement désactivé
  }

  /**
   * Programme les notifications de prière pour les défunts
   */
  private async scheduleDeceasedPrayerReminders(
    settings: NotificationSettings,
    userPrayers?: any[]
  ): Promise<void> {
    const [startHourRaw, startMinuteRaw] = settings.startTime.split(':');
    const startHour = Number(startHourRaw) || 9;
    const startMinute = Number(startMinuteRaw) || 0;

    // Obtenir le contenu enrichi pour les prières de défunts
    const deceasedPrayerContent = await this.getDeceasedPrayerContent(userPrayers);

    for (const isEnabled of settings.selectedDays) {
      const dayIndex = settings.selectedDays.indexOf(isEnabled);
      if (!isEnabled) continue;
      // Convertir l'index (0 = dimanche) au format attendu (1 = lundi)
      const weekday = dayIndex === 0 ? 7 : dayIndex;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: deceasedPrayerContent.title,
          body: deceasedPrayerContent.body,
          data: deceasedPrayerContent.data,
          sound: settings.sound ? 'default' : undefined,
          categoryIdentifier: 'DECEASED_PRAYER_REMINDER',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday,
          hour: startHour,
          minute: startMinute,
        },
      });
    }
  }

  /**
   * Programme les rappels de prière - DÉSACTIVÉ (on garde seulement les prières pour défunts)
   */
  private async schedulePrayerReminders(settings: NotificationSettings): Promise<void> {
    // Désactivé : on ne programme plus de rappels génériques
    // Seules les notifications de prières pour défunts sont programmées
    console.log(
      'Rappels de prières génériques désactivés - seules les prières pour défunts sont programmées'
    );
    return;
  }

  /**
   * Annule tous les rappels programmés
   */
  async cancelAllReminders(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Annule un rappel spécifique
   */
  async cancelReminder(identifier: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(identifier);
  }

  /**
   * Obtient tous les rappels programmés
   */
  async getScheduledReminders(): Promise<Notifications.NotificationRequest[]> {
    return await Notifications.getAllScheduledNotificationsAsync();
  }

  /**
   * Envoie une notification de test
   */
  async sendTestNotification(): Promise<void> {
    await this.initializeNotifications();

    const permissions = await this.getPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }

    // Notification de test simple et directe
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test de notification',
        body: 'Si vous voyez ce message, les notifications fonctionnent correctement !',
        data: {
          type: 'test',
          timestamp: Date.now(),
        },
        sound: 'default',
        categoryIdentifier: 'PRAYER_REMINDER',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });

    console.log('✅ Notification de test programmée avec succès');
  }

  /**
   * Obtient le contenu de prière enrichi selon le feed sélectionné
   */
  private async getPrayerContent(
    feedName: string
  ): Promise<{ title: string; body: string; data: any }> {
    try {
      // Récupérer du contenu aléatoire selon le feed
      const content = await this.getRandomContentForFeed(feedName);

      if (content) {
        return {
          title: '🙏 Temps de prière',
          body: content,
          data: {
            type: 'prayer-reminder',
            feed: feedName,
            hasContent: true,
          },
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu:', error);
    }

    // Fallback vers les messages statiques si pas de contenu
    return {
      title: '🙏 Temps de prière',
      body: this.getPrayerReminderMessage(feedName),
      data: {
        type: 'prayer-reminder',
        feed: feedName,
        hasContent: false,
      },
    };
  }

  /**
   * Récupère du contenu aléatoire selon le feed sélectionné
   */
  private async getRandomContentForFeed(feedName: string): Promise<string | null> {
    try {
      const feedContentMap: { [key: string]: () => Promise<string | null> } = {
        'Feed actuel': () => this.getRandomPrayerContent(),
        'Current feed': () => this.getRandomPrayerContent(),
        'Les bases': () => this.getRandomPrayerFormula(),
        'The basics': () => this.getRandomPrayerFormula(),
        'Paix mentale': () => this.getRandomVerse(),
        'Mental Peace': () => this.getRandomVerse(),
        'Feu matinal': () => this.getRandomHadith(),
        'Morning Fire': () => this.getRandomHadith(),
        'Abondance et richesse': () => this.getRandomVerse(),
        'Abundance & Wealth': () => this.getRandomVerse(),
        'Boost de confiance': () => this.getRandomHadith(),
        'Confidence Boost': () => this.getRandomHadith(),
        'Mes favoris': () => this.getRandomPrayerContent(),
        'My favorites': () => this.getRandomPrayerContent(),
        'Anti-dépression': () => this.getRandomVerse(),
        'Anti-depression': () => this.getRandomVerse(),
        'Nourrir votre foi': () => this.getRandomHadith(),
        'Nurture your faith': () => this.getRandomHadith(),
        'Brut et sans filtre': () => this.getRandomPrayerContent(),
        'Unfiltered Raw': () => this.getRandomPrayerContent(),
      };

      const contentGetter = feedContentMap[feedName] || feedContentMap['Feed actuel'];
      return contentGetter ? await contentGetter() : null;
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu pour le feed:', error);
      return null;
    }
  }

  /**
   * Récupère une formule de prière aléatoire
   */
  private async getRandomPrayerFormula(): Promise<string | null> {
    try {
      const result = await ContentService.getRandomPrayerFormula();
      if (result.success && result.data) {
        return `${result.data.translation}\n\n"${result.data.arabic}"`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la formule:', error);
    }
    return null;
  }

  /**
   * Récupère un verset aléatoire
   */
  private async getRandomVerse(): Promise<string | null> {
    try {
      const result = await ContentService.getRandomVerse();
      if (result.success && result.data) {
        return `${result.data.translation}\n\n${result.data.reference}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du verset:', error);
    }
    return null;
  }

  /**
   * Récupère un hadith aléatoire
   */
  private async getRandomHadith(): Promise<string | null> {
    try {
      const result = await ContentService.getRandomHadith();
      if (result.success && result.data) {
        return `${result.data.text}\n\n- ${result.data.source}`;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du hadith:', error);
    }
    return null;
  }

  /**
   * Récupère du contenu de prière mixte (formule, verset ou hadith)
   */
  private async getRandomPrayerContent(): Promise<string | null> {
    const contentTypes = [
      () => this.getRandomPrayerFormula(),
      () => this.getRandomVerse(),
      () => this.getRandomHadith(),
    ];

    const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
    return randomType ? await randomType() : null;
  }

  /**
   * Obtient le message de rappel selon le feed sélectionné (fallback)
   */
  private getPrayerReminderMessage(feedName: string): string {
    const messages: { [key: string]: string[] } = {
      'Feed actuel': [
        'Il est temps de vous connecter avec votre spiritualité.',
        'Prenez un moment pour la prière et la réflexion.',
        'Votre moment de paix spirituelle vous attend.',
      ],
      'Current feed': [
        'Il est temps de vous connecter avec votre spiritualité.',
        'Prenez un moment pour la prière et la réflexion.',
        'Votre moment de paix spirituelle vous attend.',
      ],
      'Les bases': [
        'Retournez aux fondements de votre foi.',
        'Cultivez les bases de votre spiritualité.',
        "Un moment pour revenir à l'essentiel.",
      ],
      'The basics': [
        'Retournez aux fondements de votre foi.',
        'Cultivez les bases de votre spiritualité.',
        "Un moment pour revenir à l'essentiel.",
      ],
      'Paix mentale': [
        'Trouvez la paix intérieure par la prière.',
        'Accordez-vous un moment de sérénité mentale.',
        'Laissez la tranquillité envahir votre esprit.',
      ],
      'Mental Peace': [
        'Trouvez la paix intérieure par la prière.',
        'Accordez-vous un moment de sérénité mentale.',
        'Laissez la tranquillité envahir votre esprit.',
      ],
      'Feu matinal': [
        'Allumez le feu de votre spiritualité !',
        'Démarrez avec énergie et détermination.',
        'Votre flamme spirituelle brille en vous.',
      ],
      'Morning Fire': [
        'Allumez le feu de votre spiritualité !',
        'Démarrez avec énergie et détermination.',
        'Votre flamme spirituelle brille en vous.',
      ],
    };
    const feedMessages = messages[feedName] || messages['Feed actuel'];
    if (!feedMessages || feedMessages.length === 0) return '';
    const randomIndex = Math.floor(Math.random() * feedMessages.length);
    return feedMessages[randomIndex] || '';
  }

  /**
   * Écoute les notifications reçues
   */
  addNotificationReceivedListener(listener: (notification: Notifications.Notification) => void) {
    return Notifications.addNotificationReceivedListener(listener);
  }

  /**
   * Écoute les réponses aux notifications
   */
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ) {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  /**
   * Envoie une notification personnalisée avec du contenu enrichi
   */
  async sendCustomPrayerNotification(feedName: string, customMessage?: string): Promise<void> {
    await this.initializeNotifications();

    const permissions = await this.getPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }

    let content;
    if (customMessage) {
      content = {
        title: '🙏 Message de prière',
        body: customMessage,
        data: {
          type: 'custom-prayer',
          feed: feedName,
          hasContent: true,
        },
      };
    } else {
      content = await this.getPrayerContent(feedName);
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: content.title,
        body: content.body,
        data: content.data,
        sound: 'default',
        categoryIdentifier: 'PRAYER_REMINDER',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  }

  /**
   * Configure les catégories de notifications interactives
   */
  async setupNotificationCategories(): Promise<void> {
    await Notifications.setNotificationCategoryAsync('PRAYER_REMINDER', [
      {
        identifier: 'PRAY_NOW',
        buttonTitle: 'Prier maintenant',
        options: { opensAppToForeground: true },
      },
      {
        identifier: 'REMIND_LATER',
        buttonTitle: 'Plus tard',
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('DECEASED_PRAYER_REMINDER', [
      {
        identifier: 'PRAY_FOR_DECEASED',
        buttonTitle: 'Prier pour les défunts',
        options: { opensAppToForeground: true },
      },
    ]);
  }

  /**
   * Diagnostic complet du système de notifications
   */
  async diagnosticNotifications(): Promise<{
    permissions: NotificationPermissions;
    isDevice: boolean;
    scheduledCount: number;
    canSchedule: boolean;
    error?: string;
  }> {
    try {
      const permissions = await this.getPermissions();
      const isDevice = Device.isDevice;
      const scheduled = await this.getScheduledReminders();

      return {
        permissions,
        isDevice,
        scheduledCount: scheduled.length,
        canSchedule: permissions.granted && isDevice,
      };
    } catch (error) {
      return {
        permissions: { granted: false, canAskAgain: false, status: 'unknown' },
        isDevice: false,
        scheduledCount: 0,
        canSchedule: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
      };
    }
  }
}

// Instance singleton
export const notificationService = new NotificationService();

// Hook pour utiliser les notifications dans les composants React
export function useNotifications() {
  return {
    requestPermissions: () => notificationService.requestPermissions(),
    getPermissions: () => notificationService.getPermissions(),
    scheduleReminders: (settings: NotificationSettings, userPrayers?: any[]) =>
      notificationService.scheduleReminders(settings, userPrayers),
    cancelAllReminders: () => notificationService.cancelAllReminders(),
    sendTestNotification: () => notificationService.sendTestNotification(),
    sendTestDeceasedPrayerNotification: (prayerData?: any) =>
      notificationService.sendTestDeceasedPrayerNotification(prayerData),
    sendCustomPrayerNotification: (feedName: string, customMessage?: string) =>
      notificationService.sendCustomPrayerNotification(feedName, customMessage),
    getScheduledReminders: () => notificationService.getScheduledReminders(),
    getExpoPushToken: () => notificationService.getExpoPushToken(),
    setupNotificationCategories: () => notificationService.setupNotificationCategories(),
    diagnosticNotifications: () => notificationService.diagnosticNotifications(),
  };
}
