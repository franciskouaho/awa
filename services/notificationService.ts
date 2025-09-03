import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ContentService } from './contentService';

export interface NotificationSettings {
  enableReminders: boolean;
  sound: boolean;
  morningReminder: boolean;
  eveningReminder: boolean;
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
  async sendTestDeceasedPrayerNotification(): Promise<void> {
    await this.initializeNotifications();
    const permissions = await this.getPermissions();
    if (!permissions.granted) {
      throw new Error('Notification permissions not granted');
    }

    // Obtenir du contenu enrichi pour la prière du défunt
    const deceasedPrayerContent = await this.getDeceasedPrayerContent();

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
  private async getDeceasedPrayerContent(): Promise<{ title: string; body: string; data: any }> {
    try {
      // Récupérer une formule de prière appropriée pour les défunts
      const result = await ContentService.getRandomPrayerFormula();
      if (result.success && result.data) {
        return {
          title: '🕊️ Prière pour les défunts',
          body: `${result.data.translation}\n\n"${result.data.arabic}"\n\nQue Dieu accorde Sa miséricorde à tous les défunts.`,
          data: {
            type: 'deceasedPrayer',
            hasContent: true,
          },
        };
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du contenu pour les défunts:', error);
    }

    // Fallback
    return {
      title: '🕊️ Prière pour les défunts',
      body: 'Prenez un moment pour prier pour les âmes des défunts. Que Dieu leur accorde Sa miséricorde.',
      data: {
        type: 'deceasedPrayer',
        hasContent: false,
      },
    };
  }

  private isInitialized = false;

  constructor() {
    this.initializeNotifications();
  }

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

      await Notifications.setNotificationChannelAsync('daily-streaks', {
        name: 'Daily Streak Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

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
  async scheduleReminders(settings: NotificationSettings): Promise<void> {
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
      await this.scheduleDeceasedPrayerReminders(settings);
    }
    // Programmer les rappels de streak quotidien
    await this.scheduleDailyStreakReminders(settings);
  }

  /**
   * Programme les notifications de prière pour les défunts
   */
  private async scheduleDeceasedPrayerReminders(settings: NotificationSettings): Promise<void> {
    const [startHourRaw, startMinuteRaw] = settings.startTime.split(':');
    const startHour = Number(startHourRaw) || 9;
    const startMinute = Number(startMinuteRaw) || 0;

    // Obtenir le contenu enrichi pour les prières de défunts
    const deceasedPrayerContent = await this.getDeceasedPrayerContent();

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
   * Programme les rappels de prière
   */
  private async schedulePrayerReminders(settings: NotificationSettings): Promise<void> {
    const [startHourRaw, startMinuteRaw] = settings.startTime.split(':');
    const [endHourRaw, endMinuteRaw] = settings.endTime.split(':');
    const startHour = Number(startHourRaw) || 9;
    const startMinute = Number(startMinuteRaw) || 0;
    const endHour = Number(endHourRaw) || 22;
    const endMinute = Number(endMinuteRaw) || 0;

    // Calculer l'intervalle entre les notifications
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;
    const totalMinutes = endTimeMinutes - startTimeMinutes;
    const intervalMinutes = Math.floor(totalMinutes / Math.max(1, Number(settings.dailyCount) - 1));

    for (let i = 0; i < Number(settings.dailyCount); i++) {
      const notificationMinutes = startTimeMinutes + i * intervalMinutes;
      const notificationHour = Math.floor(notificationMinutes / 60);
      const notificationMinute = notificationMinutes % 60;

      // Pour chaque jour sélectionné
      for (const isEnabled of settings.selectedDays) {
        const dayIndex = settings.selectedDays.indexOf(isEnabled);
        if (!isEnabled) continue;

        // Convertir l'index (0 = dimanche) au format attendu (1 = lundi)
        const weekday = dayIndex === 0 ? 7 : dayIndex;

        // Obtenir le contenu enrichi de la prière
        const prayerContent = await this.getPrayerContent(settings.selectedFeed);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: prayerContent.title,
            body: prayerContent.body,
            data: {
              ...prayerContent.data,
              reminderIndex: i + 1,
              totalReminders: settings.dailyCount,
            },
            sound: settings.sound ? 'default' : undefined,
            categoryIdentifier: 'PRAYER_REMINDER',
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday: weekday,
            hour: notificationHour,
            minute: notificationMinute,
            channelId: 'prayer-reminders',
          },
        });
      }
    }
  }

  /**
   * Programme les rappels de streak quotidien
   */
  private async scheduleDailyStreakReminders(settings: NotificationSettings): Promise<void> {
    // Rappel du matin
    if (settings.morningReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌅 Bonjour !',
          body: 'Commencez votre journée avec une prière pour maintenir votre streak !',
          data: { type: 'morning-streak' },
          sound: settings.sound ? 'default' : undefined,
          categoryIdentifier: 'STREAK_REMINDER',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 8,
          minute: 0,
          channelId: 'daily-streaks',
        },
      });
    }

    // Rappel du soir
    if (settings.eveningReminder) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌙 Bonsoir !',
          body: "N'oubliez pas de terminer votre journée en beauté. Maintenez votre streak !",
          data: { type: 'evening-streak' },
          sound: settings.sound ? 'default' : undefined,
          categoryIdentifier: 'STREAK_REMINDER',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 21,
          minute: 0,
          channelId: 'daily-streaks',
        },
      });
    }
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

    // Obtenir du contenu enrichi pour le test
    const prayerContent = await this.getPrayerContent('Feed actuel');

    await Notifications.scheduleNotificationAsync({
      content: {
        title: prayerContent.title,
        body: prayerContent.body,
        data: {
          ...prayerContent.data,
          type: 'test',
        },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
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
      return await contentGetter();
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
    return await randomType();
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

    await Notifications.setNotificationCategoryAsync('STREAK_REMINDER', [
      {
        identifier: 'OPEN_APP',
        buttonTitle: "Ouvrir l'app",
        options: { opensAppToForeground: true },
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
}

// Instance singleton
export const notificationService = new NotificationService();

// Hook pour utiliser les notifications dans les composants React
export function useNotifications() {
  return {
    requestPermissions: () => notificationService.requestPermissions(),
    getPermissions: () => notificationService.getPermissions(),
    scheduleReminders: (settings: NotificationSettings) =>
      notificationService.scheduleReminders(settings),
    cancelAllReminders: () => notificationService.cancelAllReminders(),
    sendTestNotification: () => notificationService.sendTestNotification(),
    sendTestDeceasedPrayerNotification: () =>
      notificationService.sendTestDeceasedPrayerNotification(),
    sendCustomPrayerNotification: (feedName: string, customMessage?: string) =>
      notificationService.sendCustomPrayerNotification(feedName, customMessage),
    getScheduledReminders: () => notificationService.getScheduledReminders(),
    getExpoPushToken: () => notificationService.getExpoPushToken(),
    setupNotificationCategories: () => notificationService.setupNotificationCategories(),
  };
}
