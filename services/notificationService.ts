import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

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
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🕊️ Prière pour le défunt',
        body: 'Ceci est une notification de test pour la prière du défunt.',
        data: { type: 'deceasedPrayer' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
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
    for (const isEnabled of settings.selectedDays) {
      const dayIndex = settings.selectedDays.indexOf(isEnabled);
      if (!isEnabled) continue;
      // Convertir l'index (0 = dimanche) au format attendu (1 = lundi)
      const weekday = dayIndex === 0 ? 7 : dayIndex;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕊️ Prière pour les défunts',
          body: 'Prenez un moment pour prier pour les âmes des défunts.',
          data: { type: 'deceasedPrayer' },
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

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🙏 Temps de prière',
            body: this.getPrayerReminderMessage(settings.selectedFeed),
            data: {
              type: 'prayer-reminder',
              feed: settings.selectedFeed,
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

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Notification de test',
        body: 'Votre système de notifications fonctionne parfaitement !',
        data: { type: 'test' },
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 1,
      },
    });
  }

  /**
   * Obtient le message de rappel selon le feed sélectionné
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
    getScheduledReminders: () => notificationService.getScheduledReminders(),
    getExpoPushToken: () => notificationService.getExpoPushToken(),
  };
}
