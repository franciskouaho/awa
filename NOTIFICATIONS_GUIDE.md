# Guide d'utilisation des notifications dans AWA

## Installation et configuration

Le système de notifications a été configuré avec les éléments suivants :

### 1. Packages installés
- `expo-notifications` : Gestion des notifications
- `expo-device` : Détection de l'appareil

### 2. Configuration dans app.json
```json
{
  "plugins": [
    [
      "expo-notifications",
      {
        "icon": "./assets/images/notification_icon.png",
        "color": "#ffffff",
        "sounds": [],
        "enableBackgroundRemoteNotifications": false
      }
    ]
  ],
  "android": {
    "permissions": [
      "RECEIVE_BOOT_COMPLETED",
      "SCHEDULE_EXACT_ALARM"
    ]
  }
}
```

## Utilisation

### 1. Dans RemindersDrawerContent
Le composant `RemindersDrawerContent` maintenant :
- ✅ Demande automatiquement les permissions
- ✅ Programme les notifications selon les paramètres
- ✅ Gère les rappels de prière quotidiens
- ✅ Gère les rappels de streak matin/soir
- ✅ Permet de tester les notifications
- ✅ Affiche le statut des permissions

### 2. Service de notifications
Le service `notificationService` offre :
- 📅 Planification de notifications récurrentes
- 🔔 Notifications locales et push
- ⚙️ Gestion des permissions
- 🎯 Catégories de notifications interactives
- 🧪 Notifications de test

### 3. Fonctionnalités implémentées

#### Rappels de prière
- Fréquence configurable (1-10 par jour)
- Horaires configurables (heure de début/fin)
- Jours de la semaine sélectionnables
- Messages adaptés au feed sélectionné

#### Rappels de streak
- Rappel matinal (8h00)
- Rappel du soir (21h00)
- Configurable individuellement

#### Gestion des permissions
- Demande automatique des permissions
- Gestion des refus de permissions
- Status en temps réel

## Fonctions principales

### useNotifications()
```typescript
const {
  requestPermissions,
  scheduleReminders,
  cancelAllReminders,
  sendTestNotification,
  getScheduledReminders
} = useNotifications();
```

### useNotificationPermissions()
```typescript
const {
  permissions,
  isLoading,
  error,
  requestPermission,
  refreshPermissions
} = useNotificationPermissions();
```

## Types de notifications

1. **Prayer Reminders** : Rappels de prière programmés
2. **Daily Streak** : Rappels de maintien du streak
3. **Test Notifications** : Notifications de test

## Workflow

1. **Configuration** : L'utilisateur configure ses préférences
2. **Permissions** : L'app demande les permissions si nécessaire
3. **Planification** : Les notifications sont programmées
4. **Réception** : L'utilisateur reçoit les notifications
5. **Interaction** : Actions possibles (Prier maintenant, Plus tard, etc.)

## Debug

Un composant `NotificationDebugScreen` est disponible pour :
- Voir les permissions actuelles
- Lister les notifications programmées
- Tester les notifications
- Déboguer les problèmes

## Notes importantes

- ⚠️ Les notifications ne fonctionnent que sur un appareil physique
- ⚠️ Les permissions doivent être accordées avant la planification
- ⚠️ Android 13+ demande une permission explicite pour les notifications
- ⚠️ iOS nécessite des permissions spécifiques pour les sons et badges

## Prochaines étapes

1. Tester sur un appareil physique
2. Configurer les sons personnalisés si nécessaire
3. Implémenter les actions interactives (Prier maintenant, etc.)
4. Ajouter la gestion des notifications push distantes
5. Optimiser les messages selon l'utilisateur
