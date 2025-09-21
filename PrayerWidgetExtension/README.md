# Awa Prayer Widget

Ce widget iOS permet d'afficher une prière pour un défunt directement sur l'écran d'accueil et l'écran de verrouillage de l'iPhone.

## Fonctionnalités

- **Widget d'écran d'accueil** : Affiche les informations de base de la prière
- **Live Activity** : Affichage en temps réel sur l'écran de verrouillage et le Dynamic Island
- **Compteur de prières** : Mise à jour en temps réel du nombre de prières
- **Interface intuitive** : Design cohérent avec l'application Awa

## Structure des fichiers

- `Attributes.swift` : Définit les données de la prière pour le widget
- `Module.swift` : Module de communication entre React Native et Swift
- `PrayerWidget.swift` : Widget principal pour l'écran d'accueil
- `PrayerLiveActivity.swift` : Live Activity pour l'écran de verrouillage
- `PrayerWidgetBundle.swift` : Bundle principal du widget
- `PrayerWidgetModule.m` : Bridge Objective-C pour React Native
- `Info.plist` : Configuration du widget extension

## Utilisation

Le widget est automatiquement intégré dans l'application React Native via le hook `usePrayerWidget`. Les utilisateurs peuvent :

1. Démarrer une Live Activity pour une prière spécifique
2. Voir le compteur de prières se mettre à jour en temps réel
3. Arrêter la Live Activity quand souhaité

## Configuration requise

- iOS 16.2 ou plus récent
- Live Activities activées dans les paramètres
- App Group configuré : `group.com.emplica.awa`

## Développement

Pour tester le widget :

1. Compiler l'application avec `expo run:ios`
2. Ajouter le widget à l'écran d'accueil
3. Démarrer une Live Activity depuis l'application
4. Vérifier l'affichage sur l'écran de verrouillage
