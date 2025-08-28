import { useOnboardingNotifications } from '@/hooks/useOnboardingNotifications';
import { notificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function NotificationInitializer() {
  const { processOnboardingNotifications } = useOnboardingNotifications();

  useEffect(() => {
    initializeNotifications();
  }, []);

  const initializeNotifications = async () => {
    try {
      // Configurer les catégories de notifications
      await notificationService.setupNotificationCategories();

      // Traiter les notifications d'onboarding en attente
      await processOnboardingNotifications();

      // Écouter les notifications reçues
      const notificationListener = notificationService.addNotificationReceivedListener(
        (notification) => {
          console.log('Notification reçue:', notification);
          
          // Vous pouvez ajouter ici des actions spécifiques selon le type de notification
          const notificationType = notification.request.content.data?.type;
          switch (notificationType) {
            case 'prayer-reminder':
              console.log('Rappel de prière reçu');
              break;
            case 'morning-streak':
              console.log('Rappel de streak matinal reçu');
              break;
            case 'evening-streak':
              console.log('Rappel de streak du soir reçu');
              break;
            case 'test':
              console.log('Notification de test reçue');
              break;
          }
        }
      );

      // Écouter les réponses aux notifications
      const responseListener = notificationService.addNotificationResponseReceivedListener(
        (response) => {
          console.log('Réponse à la notification:', response);
          
          // Gérer les actions des notifications
          switch (response.actionIdentifier) {
            case 'PRAY_NOW':
              // Ouvrir l'écran de prière
              console.log('Utilisateur veut prier maintenant');
              // TODO: Navigation vers l'écran de prière
              break;
            case 'REMIND_LATER':
              // Programmer un rappel plus tard (dans 30 minutes par exemple)
              console.log('Rappel plus tard demandé');
              // TODO: Programmer un rappel différé
              break;
            case 'OPEN_APP':
              // Ouvrir l'application
              console.log('Ouverture de l\'app demandée');
              // TODO: Navigation vers l'écran principal
              break;
            case Notifications.DEFAULT_ACTION_IDENTIFIER:
              // Tap sur la notification
              console.log('Notification tappée');
              // TODO: Navigation selon le type de notification
              break;
          }
        }
      );

      // Nettoyage
      return () => {
        notificationListener.remove();
        responseListener.remove();
      };

    } catch (error) {
      console.error('Erreur lors de l\'initialisation des notifications:', error);
    }
  };

  // Ce composant ne rend rien, il sert juste à initialiser
  return null;
}
