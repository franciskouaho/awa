import { NotificationSettings, useNotifications } from '@/services/notificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

interface OnboardingNotificationSettings {
  enabled: boolean;
  frequency: number;
  fromTime: string;
  toTime: string;
}

export function useOnboardingNotifications() {
  const [hasProcessedOnboarding, setHasProcessedOnboarding] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { scheduleReminders, getPermissions } = useNotifications();

  useEffect(() => {
    processOnboardingNotifications();
  }, []);

  const processOnboardingNotifications = async () => {
    if (hasProcessedOnboarding || isProcessing) return;

    setIsProcessing(true);

    try {
      // Vérifier s'il y a des paramètres d'onboarding en attente
      const onboardingSettingsString = await AsyncStorage.getItem('onboardingNotificationSettings');
      const processedFlag = await AsyncStorage.getItem('onboardingNotificationsProcessed');

      if (!onboardingSettingsString || processedFlag === 'true') {
        setHasProcessedOnboarding(true);
        setIsProcessing(false);
        return;
      }

      const onboardingSettings: OnboardingNotificationSettings = JSON.parse(onboardingSettingsString);

      if (onboardingSettings.enabled) {
        // Vérifier les permissions
        const permissions = await getPermissions();
        
        if (permissions.granted) {
          // Convertir les paramètres d'onboarding en paramètres complets
          const fullSettings: NotificationSettings = {
            enableReminders: true,
            sound: true,
            morningReminder: true,
            eveningReminder: true,
            dailyCount: onboardingSettings.frequency,
            startTime: onboardingSettings.fromTime,
            endTime: onboardingSettings.toTime,
            selectedFeed: 'Feed actuel',
            selectedDays: [true, true, true, true, true, true, true], // Tous les jours
          };

          // Programmer les rappels
          await scheduleReminders(fullSettings);

          // Sauvegarder les paramètres complets
          await AsyncStorage.setItem('notificationSettings', JSON.stringify(fullSettings));

          console.log('Notifications d\'onboarding configurées avec succès');
        } else {
          console.log('Permissions non accordées, notifications non configurées');
        }
      }

      // Marquer comme traité
      await AsyncStorage.setItem('onboardingNotificationsProcessed', 'true');
      setHasProcessedOnboarding(true);

    } catch (error) {
      console.error('Erreur lors du traitement des notifications d\'onboarding:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetOnboardingNotifications = async () => {
    try {
      await AsyncStorage.multiRemove([
        'onboardingNotificationSettings',
        'onboardingNotificationsProcessed'
      ]);
      setHasProcessedOnboarding(false);
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
    }
  };

  return {
    hasProcessedOnboarding,
    isProcessing,
    resetOnboardingNotifications,
    processOnboardingNotifications,
  };
}
