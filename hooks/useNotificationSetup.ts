import { useOnboardingNotifications } from '@/hooks/useOnboardingNotifications';
import { notificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export function useNotificationSetup() {
  const { processOnboardingNotifications } = useOnboardingNotifications();

  useEffect(() => {
    let notificationListener: any = null;
    let responseListener: any = null;

    const initializeNotifications = async () => {
      try {
        console.log('🔧 Initialisation du système de notifications...');

        // Vérifier les permissions d'abord
        const permissions = await notificationService.getPermissions();
        console.log('📋 Permissions de notifications:', permissions);

        if (!permissions.granted) {
          console.log('⚠️ Permissions non accordées, initialisation limitée');
          return;
        }

        // Configurer les catégories de notifications
        await notificationService.setupNotificationCategories();
        console.log('✅ Catégories de notifications configurées');

        // Traiter les notifications d'onboarding en attente
        await processOnboardingNotifications();

        // Écouter les notifications reçues
        notificationListener = notificationService.addNotificationReceivedListener(notification => {
          console.log('📱 Notification reçue:', notification);

          // Actions spécifiques selon le type de notification
          const notificationType = notification.request.content.data?.type;
          switch (notificationType) {
            case 'prayer-reminder':
              console.log('🙏 Rappel de prière reçu');
              // TODO: Ajouter des actions spécifiques
              break;
            case 'morning-streak':
              console.log('🌅 Rappel de streak matinal reçu');
              break;
            case 'evening-streak':
              console.log('🌙 Rappel de streak du soir reçu');
              break;
            case 'test':
              console.log('🧪 Notification de test reçue');
              break;
            case 'deceasedPrayer':
              console.log('🕊️ Notification de prière pour défunts reçue');
              break;
          }
        });

        // Écouter les réponses aux notifications
        responseListener = notificationService.addNotificationResponseReceivedListener(response => {
          console.log('Réponse à la notification:', response);

          // Gérer les actions des notifications
          switch (response.actionIdentifier) {
            case 'PRAY_NOW':
              console.log('Utilisateur veut prier maintenant');
              // TODO: Navigation vers l'écran de prière
              break;
            case 'REMIND_LATER':
              console.log('Rappel plus tard demandé');
              // TODO: Programmer un rappel différé
              break;
            case 'OPEN_APP':
              console.log("Ouverture de l'app demandée");
              // TODO: Navigation vers l'écran principal
              break;
            case Notifications.DEFAULT_ACTION_IDENTIFIER:
              console.log('Notification tappée');
              // TODO: Navigation selon le type de notification
              break;
          }
        });
      } catch (error) {
        console.error("Erreur lors de l'initialisation des notifications:", error);
      }
    };

    initializeNotifications();

    // Nettoyage
    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, [processOnboardingNotifications]);
}
