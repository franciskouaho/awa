# AWA - Application de Prières pour les Défunts

## 📋 Description du Projet

**AWA** est une application mobile React Native permettant aux utilisateurs musulmans de prier pour leurs proches décédés à travers des fiches personnalisées. L'application offre une expérience spirituelle moderne et intuitive.

### 🎯 Objectifs Principaux

- Créer des **fiches de prière personnalisées** pour chaque défunt
- Permettre l'**ajout facile** de nouvelles personnes à commémorer
- Fournir des **formules de prière en arabe** avec translittération et traduction
- Offrir un **suivi statistique** des prières effectuées
- Planifier des **rappels de prière** personnalisés

### 🔧 Spécifications Techniques

- **React Native 0.80** avec **Expo SDK 54**
- **TypeScript** pour le typage statique et la robustesse du code
- **Expo Router** pour la navigation moderne
- **Firebase** (Firestore, Auth, Storage) pour la synchronisation future
- **Design responsive** optimisé pour iPhone 16 Pro
- **Contrainte importante** : Tous les écrans doivent tenir sans scroll

### 📱 Fonctionnalités Détaillées

#### 🏠 Écran d'Introduction (`intro.js`)

- Affichage de 1-2 versets coraniques ou hadiths avec traductions
- Bouton "Continuer" pour accéder à l'application
- Design élégant et inspirant

#### 📖 Écran Prières (`prayers.js`) - Écran Principal

- **Fiches de prière** individuelles pour chaque défunt
- **Maximum 10 fiches** préchargées (données mockées)
- **Informations par fiche** :
  - Avatar avec initiale du nom
  - Nom complet
  - Âge au décès
  - Date de décès
  - Lieu (ville, pays)
  - Message personnel
  - **Formule de prière complète** (arabe + translittération + traduction française)
- **Navigation** entre fiches (carrousel ou pagination)
- **Chaque carte** doit tenir entièrement sur un écran

#### ➕ Écran Ajout (`add.js`)

- **Formulaire complet** avec validation :
  - Nom complet (requis)
  - Âge (numérique)
  - Date de décès (date picker)
  - Lieu (ville, pays)
  - Message personnel (textarea)
- **Sauvegarde locale** (AsyncStorage)
- Fiche automatiquement visible dans l'écran Prières

#### 📊 Écran Statistiques (`stats.js`)

- **Bloc 1** : Nombre de personnes pour qui l'utilisateur a prié
- **Bloc 2** : Nombre de personnes ayant prié pour les défunts ajoutés
- **Données mockées** qui se réinitialisent à chaque session
- Design avec blocs visuels attractifs

#### ⚙️ Écran Paramètres (`settings.js`)

- **Configuration des rappels** :
  - Choix de l'heure (time picker)
  - Moment de la journée (matin/soir/tous les jours)
- **Interface simple** tenant sur une seule page
- **Sauvegarde locale** des préférences
- Simulation des notifications (pas de vraies notifications)

### 🎨 Contraintes de Design

- **Responsive Design** : Optimisé pour iPhone 16 Pro
- **Règle absolue** : Aucun scroll sur aucun écran
- **Polices** : Amiri (arabe) + Roboto (latin)
- **Navigation** : Bottom tabs persistants sur tous les écrans
- **Palette de couleurs** : Inspirée de l'interface prayer times moderne
- **Accessibilité** : Contraste et lisibilité optimaux

### 🎨 Palette de Couleurs

```typescript
// constants/Colors.ts
export const Colors = {
  // Couleurs principales (inspirées du design prayer times)
  primary: '#2D5A4A', // Vert foncé élégant (fond principal)
  primaryLight: '#4A7C69', // Vert moyen
  primaryDark: '#1A3D30', // Vert très foncé

  // Couleurs d'accentuation
  accent: '#00C851', // Vert vif pour les actions (boutons, validations)
  accentLight: '#33D374', // Vert clair pour hover/focus

  // Couleurs de fond et surfaces
  background: '#F8FBF9', // Blanc cassé verdâtre très subtil
  surface: '#FFFFFF', // Blanc pur pour les cartes
  surfaceDark: '#1E2D28', // Surface sombre pour mode dark

  // Couleurs de texte
  text: '#1A1A1A', // Noir pour texte principal
  textSecondary: '#666666', // Gris pour texte secondaire
  textOnPrimary: '#FFFFFF', // Blanc sur fond coloré
  textArabic: '#2D5A4A', // Vert foncé pour texte arabe (importance spirituelle)

  // Couleurs utilitaires
  success: '#00C851', // Vert pour succès
  warning: '#FF8F00', // Orange pour avertissement
  error: '#FF4444', // Rouge pour erreur
  info: '#33B5E5', // Bleu pour information

  // Couleurs de bordure et séparation
  border: '#E0E0E0', // Gris clair pour bordures
  borderDark: '#4A7C69', // Vert moyen pour bordures importantes

  // Couleurs d'ombre et overlay
  shadow: 'rgba(45, 90, 74, 0.1)', // Ombre verte subtile
  overlay: 'rgba(26, 61, 48, 0.5)', // Overlay foncé

  // Couleurs spécifiques aux prières
  prayer: {
    cardBackground: '#FFFFFF',
    cardShadow: 'rgba(45, 90, 74, 0.08)',
    avatarBackground: '#4A7C69',
    dateText: '#666666',
    formulaBackground: '#F8FBF9',
    formulaArabic: '#2D5A4A',
    formulaTranslation: '#666666',
  },

  // Couleurs des statistiques
  stats: {
    blockBackground: '#FFFFFF',
    blockShadow: 'rgba(45, 90, 74, 0.08)',
    numberText: '#2D5A4A',
    labelText: '#666666',
    accentBar: '#00C851',
  },

  // Navigation
  navigation: {
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E0E0E0',
    activeTab: '#2D5A4A',
    inactiveTab: '#999999',
    tabShadow: 'rgba(0, 0, 0, 0.05)',
  },
};

// Gradient combinations pour les effets visuels
export const Gradients = {
  primary: ['#4A7C69', '#2D5A4A'], // Dégradé vert principal
  card: ['#FFFFFF', '#F8FBF9'], // Dégradé subtil pour cartes
  background: ['#F8FBF9', '#FFFFFF'], // Dégradé arrière-plan
  accent: ['#33D374', '#00C851'], // Dégradé accent
};
```

### 🎨 Philosophie des Couleurs

Cette palette s'inspire de l'**esthétique islamique moderne** :

- **Vert** : Couleur sacrée de l'Islam, paix et spiritualité
- **Tons naturels** : Harmonie et sérénité
- **Contrastes doux** : Lisibilité sans agressivité
- **Blancs purs** : Pureté et clarté spirituelle

### 📊 Navigation Structure

```
Bottom Tabs (persistants) :
├── 📖 Prières (défaut) → prayers.js
├── ➕ Ajoutez → add.js
├── 📊 Stats → stats.js
└── ⚙️ Paramètres → settings.js
```

### 🔄 État de l'Application

- **Prototype fonctionnel** sans backend
- **Données mockées** dans `data/mockPrayers.js`
- **Stockage local** avec AsyncStorage
- **Firebase configuré** mais pas utilisé (préparation future)
- **Pas d'authentification** requise pour ce prototype

### 🚀 Version Future (Post-Prototype)

- Authentification utilisateur sécurisée
- Synchronisation Firebase en temps réel
- Notifications push réelles
- Partage de fiches entre utilisateurs
- Historique détaillé des prières
- Sauvegarde cloud des données

## 📱 Application de Prières pour les Défunts

### 🏗️ Structure du Projet

```
awa-app/
├── .expo/
├── .git/
├── .gitignore
├── App.js
├── app.json
├── babel.config.js
├── firebase.js
├── package.json
├── yarn.lock
├──
├── app/                           # Dossier principal de l'application
│   ├── (auth)/                   # Groupe d'authentification
│   │   ├── login.js
│   │   └── register.js
│   ├── (tabs)/                   # Navigation par onglets
│   │   ├── prayers.js           # Écran des prières
│   │   ├── add.js               # Écran d'ajout
│   │   ├── stats.js             # Écran des statistiques
│   │   ├── settings.js          # Écran des paramètres
│   │   └── _layout.js           # Layout des tabs
│   ├── intro.js                 # Écran d'introduction
│   ├── _layout.js               # Layout principal
│   └── +not-found.js            # Écran 404
│
├── assets/                       # Ressources statiques
│   ├── images/
│   │   ├── intro/
│   │   ├── icons/
│   │   └── backgrounds/
│   ├── fonts/
│   │   ├── Amiri-Regular.ttf    # Police arabe
│   │   ├── Amiri-Bold.ttf
│   │   ├── Roboto-Regular.ttf
│   │   └── Roboto-Medium.ttf
│   └── sounds/
│       └── notification.mp3
│
├── components/                   # Composants réutilisables
│   ├── common/
│   │   ├── Button.js
│   │   ├── Input.js
│   │   ├── Loading.js
│   │   ├── Avatar.js
│   │   └── Card.js
│   ├── prayer/
│   │   ├── PrayerCard.js        # Carte de prière individuelle
│   │   ├── PrayerCarousel.js    # Carrousel des prières
│   │   └── PrayerFormula.js     # Formule de prière en arabe
│   ├── stats/
│   │   ├── StatBlock.js         # Bloc statistique
│   │   └── StatsGrid.js         # Grille des statistiques
│   └── settings/
│       ├── TimeSelector.js      # Sélecteur d'heure
│       └── SettingsItem.js      # Item de paramètre
│
├── constants/                    # Constantes de l'application
│   ├── Colors.js                # Palette de couleurs
│   ├── Layout.js                # Dimensions et layout
│   └── Settings.js              # Paramètres par défaut
│
├── contexts/                     # Contextes React (state management)
│   ├── AppContext.js            # Context principal
│   ├── PrayersContext.js        # Context des prières
│   └── SettingsContext.js       # Context des paramètres
│
├── data/                         # Données statiques et mock
│   ├── mockPrayers.js           # Prières mockées
│   ├── verses.js                # Versets coraniques
│   ├── hadiths.js               # Hadiths
│   └── prayerFormulas.js        # Formules de prière
│
├── hooks/                        # Hooks personnalisés
│   ├── useAsyncStorage.js       # Hook AsyncStorage
│   ├── useScreenDimensions.js   # Hook dimensions écran
│   ├── usePrayers.js            # Hook gestion prières
│   └── useNotifications.js      # Hook notifications
│
├── ios/                          # Configuration iOS
├── android/                      # Configuration Android
│
├── services/                     # Services et APIs
│   ├── firebase/
│   │   ├── firestore.js         # Opérations Firestore
│   │   ├── auth.js              # Authentification
│   │   └── storage.js           # Firebase Storage
│   ├── storage.js               # AsyncStorage operations
│   ├── notifications.js         # Service notifications
│   └── api.js                   # API calls
│
├── types/                        # Types TypeScript (si utilisé)
│   ├── prayer.ts
│   ├── user.ts
│   └── settings.ts
│
└── utils/                        # Utilitaires
    ├── helpers.js               # Fonctions utilitaires
    ├── validation.js            # Validation des formulaires
    ├── dateUtils.js             # Utilitaires de date
    └── formatters.js            # Formatage des données
```

## 🔧 Technologies Utilisées

- **React Native 0.80**
- **Expo SDK 54** with Expo Router
- **TypeScript** pour le typage statique
- **Firebase** (Firestore, Auth, Storage)
- **AsyncStorage**
- **React Native Paper**

### 📊 Types TypeScript Principaux

```typescript
// types/prayer.ts
interface Prayer {
  id: string;
  name: string;
  age: number;
  deathDate: Date;
  location: string;
  personalMessage: string;
  createdAt: Date;
  prayerCount: number;
}

// types/user.ts
interface User {
  id: string;
  name: string;
  email: string;
  preferences: UserPreferences;
}

// types/settings.ts
interface ReminderSettings {
  enabled: boolean;
  time: string; // "09:00"
  frequency: 'morning' | 'evening' | 'daily';
}
```

## 📋 Structure des Écrans (app/)

### 🔐 Groupe Auth - `(auth)/`

- **login.js** - Écran de connexion
- **register.js** - Écran d'inscription

### 📱 Groupe Tabs - `(tabs)/`

- **prayers.js** - Écran principal des prières (carrousel/fiches)
- **add.js** - Formulaire d'ajout de personne
- **stats.js** - Statistiques de prières
- **settings.js** - Configuration des rappels
- **\_layout.js** - Configuration des onglets

### 🏠 Écrans Principaux

- **intro.js** - Écran d'introduction avec versets
- **\_layout.js** - Layout principal de navigation
- **+not-found.js** - Écran d'erreur 404

## 🎨 Design

- **Contrainte** : Tout doit tenir sur un écran iPhone 16 Pro sans scroll
- **Navigation** : Expo Router avec bottom tabs
- **Thème** : Moderne avec polices arabes (Amiri) et latines (Roboto)

## 📦 Organisation Simple

- **État local** avec useState dans chaque écran
- **Contexts** pour le state management léger
- **Données mockées** dans le dossier `data/`
- **Firebase** configuré dans `services/`
- **Expo Router** pour la navigation moderne
