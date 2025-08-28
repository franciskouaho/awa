import { notificationService } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

export default function NotificationInitializer() {
  useEffect(() => {
    // Configurer les catégories de notifications
    notificationService.setupNotificationCategories();

    // Écouter les notifications reçues
    const notificationListener = notificationService.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification reçue:', notification);
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
            break;
          case 'REMIND_LATER':
            // Programmer un rappel plus tard
            console.log('Rappel plus tard demandé');
            break;
          case 'OPEN_APP':
            // Ouvrir l'application
            console.log('Ouverture de l\'app demandée');
            break;
          case Notifications.DEFAULT_ACTION_IDENTIFIER:
            // Tap sur la notification
            console.log('Notification tappée');
            break;
        }
      }
    );

    // Nettoyage
    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  // Ce composant ne rend rien, il sert juste à initialiser
  return null;
}
