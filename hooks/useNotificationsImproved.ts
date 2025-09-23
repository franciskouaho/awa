import { userService } from "@/services/userService";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";

interface NotificationPreferences {
  enabled: boolean;
  eveningReminders: boolean;
  milestoneAlerts: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  reminderTime: string;
  sound: boolean;
  enableDeceasedReminder: boolean;
  dailyCount: number;
  startTime: string;
  endTime: string;
  selectedFeed: string;
  selectedDays: boolean[];
}

interface ScheduledNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  trigger: any;
}

interface NotificationState {
  isInitialized: boolean;
  hasPermissions: boolean;
  isLoading: boolean;
  preferences: NotificationPreferences;
  scheduledNotifications: ScheduledNotification[];
  error: string | null;
}

interface NotificationActions {
  requestPermissions: () => Promise<boolean>;
  scheduleReminder: (time?: string) => Promise<void>;
  notifyMilestone: (rollCount: number) => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  cancelAll: () => Promise<void>;
  refreshScheduled: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
  sendTestDeceasedPrayerNotification: () => Promise<void>;
}

const defaultPreferences: NotificationPreferences = {
  enabled: true,
  eveningReminders: true,
  milestoneAlerts: true,
  weeklyDigest: false,
  marketingEmails: false,
  reminderTime: "19:00",
  sound: true,
  enableDeceasedReminder: false,
  dailyCount: 3,
  startTime: "09:00",
  endTime: "22:00",
  selectedFeed: "Feed actuel",
  selectedDays: [true, true, true, true, true, true, true],
};

export const useNotificationsImproved = (): NotificationState & NotificationActions & {
  isReminderEnabled: boolean;
  isMilestoneEnabled: boolean;
  reminderCount: number;
} => {
  const [state, setState] = useState<NotificationState>({
    isInitialized: false,
    hasPermissions: false,
    isLoading: true,
    preferences: defaultPreferences,
    scheduledNotifications: [],
    error: null,
  });

  // Initialiser les notifications au montage du hook
  useEffect(() => {
    let mounted = true;

    // Attendre que Firebase soit prêt avant d'initialiser
    const checkFirebaseAndInit = async () => {
      let attempts = 0;
      const maxAttempts = 10;

      while (attempts < maxAttempts && mounted) {
        try {
          // Vérifier si on a un utilisateur connecté
          const user = await userService.getCurrentUser();
          if (user) {
            // Firebase est prêt
            await initializeNotificationService();
            break;
          }
        } catch (error) {
          // Firebase pas encore prêt
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      if (attempts >= maxAttempts && mounted) {
        // Initialiser quand même avec les valeurs par défaut
        await initializeNotificationService();
      }
    };

    checkFirebaseAndInit();

    // Configurer les listeners
    const listeners = addNotificationListeners();

    // Gérer les changements d'état de l'app
    const appStateSubscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      mounted = false;
      listeners.foregroundSubscription?.remove();
      listeners.responseSubscription?.remove();
      appStateSubscription?.remove();
    };
  }, []);

  // Initialiser le service de notifications
  const initializeNotificationService = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

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

      const hasPermissions = await checkPermissions();

      // Charger les préférences sauvegardées
      await loadUserPreferences();

      // Charger les notifications programmées
      const scheduled = await getScheduledNotifications();

      setState((prev) => ({
        ...prev,
        isInitialized: true,
        hasPermissions,
        isLoading: false,
        scheduledNotifications: scheduled,
      }));

    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Erreur initialisation",
      }));
    }
  }, []);

  // Vérifier les permissions
  const checkPermissions = useCallback(async (): Promise<boolean> => {
    try {
      if (!Device.isDevice) {
        return false;
      }

      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      return false;
    }
  }, []);

  // Charger les préférences utilisateur depuis Firestore
  const loadUserPreferences = useCallback(async () => {
    try {
      const user = await userService.getCurrentUser();
      if (!user) {
        // Utiliser les préférences par défaut si pas d'utilisateur
        setState((prev) => ({
          ...prev,
          preferences: defaultPreferences,
        }));
        return;
      }

      // Charger les préférences depuis le profil utilisateur
      const userSettings = await userService.getUserSettings();
      const preferences = {
        ...defaultPreferences,
        ...userSettings.notificationPreferences,
      };

      setState((prev) => ({
        ...prev,
        preferences,
      }));
    } catch (error) {
      // En cas d'erreur, utiliser les préférences par défaut
      setState((prev) => ({
        ...prev,
        preferences: defaultPreferences,
      }));
    }
  }, []);

  // Ajouter les listeners de notifications
  const addNotificationListeners = useCallback(() => {
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification reçue:', notification);
      }
    );

    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Réponse à la notification:', response);
      }
    );

    return {
      foregroundSubscription,
      responseSubscription,
    };
  }, []);

  // Rafraîchir la liste des notifications programmées
  const refreshScheduled = useCallback(async (): Promise<void> => {
    try {
      const scheduled = await getScheduledNotifications();
      setState((prev) => ({
        ...prev,
        scheduledNotifications: scheduled,
      }));
    } catch (error) {
      // Erreur rafraîchissement notifications ignorée
    }
  }, []);

  // Obtenir les notifications programmées
  const getScheduledNotifications = useCallback(async (): Promise<ScheduledNotification[]> => {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      return scheduled.map(notification => ({
        id: notification.identifier,
        type: notification.content.data?.type || 'unknown',
        title: notification.content.title || '',
        body: notification.content.body || '',
        trigger: notification.trigger,
      }));
    } catch (error) {
      return [];
    }
  }, []);

  // Programmer un rappel quotidien - DÉSACTIVÉ (on garde seulement les prières)
  const scheduleReminder = useCallback(
    async (time?: string): Promise<void> => {
      try {
        // Désactivé : on ne programme plus de rappels génériques
        // Seules les notifications de prières pour défunts sont programmées
        console.log('Rappels quotidiens désactivés - seules les prières sont programmées');
        
        // Rafraîchir la liste des notifications programmées
        await refreshScheduled();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Impossible de programmer le rappel",
        }));
      }
    },
    [refreshScheduled],
  );

  // Gérer les changements d'état de l'application
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === "active") {
      // Rafraîchir les notifications programmées quand l'app revient au premier plan
      getScheduledNotifications()
        .then((scheduled) => {
          setState((prev) => ({
            ...prev,
            scheduledNotifications: scheduled,
          }));
        })
        .catch((error) => {
          // Erreur rafraîchissement notifications ignorée
        });
    }
  }, [getScheduledNotifications]);

  // Demander les permissions de notifications
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      if (!Device.isDevice) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Les notifications ne fonctionnent que sur un appareil physique",
        }));
        return false;
      }

      const { status } = await Notifications.requestPermissionsAsync();
      const granted = status === "granted";

      setState((prev) => ({
        ...prev,
        hasPermissions: granted,
        isLoading: false,
      }));

      if (granted) {
        // Programmer les rappels par défaut
        await scheduleReminder();
      }

      return granted;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Impossible de demander les permissions",
      }));
      return false;
    }
  }, [scheduleReminder]);

  // Notifier un milestone
  const notifyMilestone = useCallback(
    async (rollCount: number): Promise<void> => {
      try {
        if (!state.hasPermissions || !state.preferences.milestoneAlerts) {
          return;
        }

        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎉 Félicitations !',
            body: `Vous avez atteint ${rollCount} prières ! Continuez comme ça !`,
            data: { type: 'milestone', count: rollCount },
            sound: state.preferences.sound ? 'default' : undefined,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
          },
        });
      } catch (error) {
        // Erreur notification milestone ignorée
      }
    },
    [state.hasPermissions, state.preferences.milestoneAlerts, state.preferences.sound],
  );

  // Mettre à jour les préférences
  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>): Promise<void> => {
      try {
        const newPreferences = { ...state.preferences, ...prefs };

        // Sauvegarder dans Firestore
        await userService.updateUserSettings({
          notificationPreferences: newPreferences,
        });

        // Mettre à jour l'état local
        setState((prev) => ({
          ...prev,
          preferences: newPreferences,
        }));

        // Reprogrammer les rappels si nécessaire
        if (prefs.eveningReminders !== undefined || prefs.reminderTime) {
          if (newPreferences.eveningReminders && newPreferences.enabled) {
            await scheduleReminder(newPreferences.reminderTime);
          } else {
            // Annuler les rappels si désactivés
            await cancelAll();
          }
        }
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: "Impossible de sauvegarder les préférences",
        }));
      }
    },
    [state.preferences, scheduleReminder],
  );

  // Annuler toutes les notifications
  const cancelAll = useCallback(async (): Promise<void> => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      setState((prev) => ({
        ...prev,
        scheduledNotifications: [],
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "Impossible d'annuler les notifications",
      }));
    }
  }, []);

  // Envoyer une notification de test
  const sendTestNotification = useCallback(async (): Promise<void> => {
    try {
      if (!state.hasPermissions) {
        throw new Error('Permissions not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test de notification',
          body: 'Si vous voyez ce message, les notifications fonctionnent !',
          data: { type: 'test' },
          sound: state.preferences.sound ? 'default' : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });
    } catch (error) {
      throw error;
    }
  }, [state.hasPermissions, state.preferences.sound]);

  // Envoyer une notification de test pour les défunts
  const sendTestDeceasedPrayerNotification = useCallback(async (): Promise<void> => {
    try {
      if (!state.hasPermissions) {
        throw new Error('Permissions not granted');
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🕊️ Prière pour les défunts',
          body: 'Prenez un moment pour prier pour les âmes des défunts. Que Dieu leur accorde Sa miséricorde.',
          data: { type: 'deceasedPrayer' },
          sound: state.preferences.sound ? 'default' : undefined,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
        },
      });
    } catch (error) {
      throw error;
    }
  }, [state.hasPermissions, state.preferences.sound]);

  // Méthodes utilitaires
  const isReminderEnabled =
    state.preferences.enabled && state.preferences.eveningReminders;
  const isMilestoneEnabled =
    state.preferences.enabled && state.preferences.milestoneAlerts;
  const reminderCount = state.scheduledNotifications.filter(
    (n) => n.type === "evening_reminder",
  ).length;

  return {
    // État
    isInitialized: state.isInitialized,
    hasPermissions: state.hasPermissions,
    isLoading: state.isLoading,
    preferences: state.preferences,
    scheduledNotifications: state.scheduledNotifications,
    error: state.error,

    // Actions
    requestPermissions,
    scheduleReminder,
    notifyMilestone,
    updatePreferences,
    cancelAll,
    refreshScheduled,
    sendTestNotification,
    sendTestDeceasedPrayerNotification,

    // Helpers
    isReminderEnabled,
    isMilestoneEnabled,
    reminderCount,
  } as NotificationState &
    NotificationActions & {
      isReminderEnabled: boolean;
      isMilestoneEnabled: boolean;
      reminderCount: number;
    };
};

export default useNotificationsImproved;
