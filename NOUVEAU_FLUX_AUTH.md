# 🔄 Nouveau Flux d'Authentification AWA

## 📋 Flux étape par étape

### 1. **Écran Intro** (`/intro`)
- Affiche le verset et le bouton "Continuer"
- ✅ **Pas d'authentification ici**
- Redirige vers `/onboarding/email`

### 2. **Onboarding - Email** (`/onboarding/email`)
- Utilisateur saisit son email
- ✅ **Sauvegarde locale uniquement** avec `AsyncStorage.setItem('userEmail', email)`
- ✅ **Pas d'authentification Firebase**
- Redirige vers `/onboarding/name`

### 3. **Onboarding - Nom** (`/onboarding/name`)
- Utilisateur saisit son prénom
- ✅ **Sauvegarde locale uniquement** avec `AsyncStorage.setItem('userName', name)`
- ✅ **Pas d'authentification Firebase**
- Redirige vers `/onboarding/affirmation`

### 4. **Onboarding - Affirmation, Time, etc.**
- L'utilisateur continue les étapes d'onboarding normalement
- Collecte des préférences et informations
- Redirige vers `/onboarding/plan`

### 5. **Onboarding - Plan (Final)** (`/onboarding/plan`)
- ✅ **ICI SE FAIT L'AUTHENTIFICATION !**
- Récupère `userEmail` et `userName` depuis AsyncStorage
- Appelle `signUp(email, name)` pour créer le compte Firebase
- Appelle `completeOnboarding()` pour marquer comme terminé
- Redirige vers `/(tabs)/prayers`

## 🔧 Avantages de cette approche

### ✅ **Expérience Utilisateur**
- Pas de friction pendant l'onboarding
- L'utilisateur n'a pas besoin de penser à l'authentification
- Toutes les données sont collectées avant la création du compte

### ✅ **Sécurité**
- Authentification anonyme Firebase (sécurisé)
- Pas de mots de passe fixes
- Création de compte uniquement à la fin

### ✅ **Robustesse**
- Si l'authentification échoue, l'utilisateur peut réessayer
- Les données d'onboarding sont sauvegardées localement
- Gestion d'erreur complète

## 🛠️ Gestion des erreurs

### Si l'authentification échoue dans `/onboarding/plan`
- Affichage d'une alerte avec le message d'erreur
- L'utilisateur peut réessayer
- Les données (email, nom) sont toujours disponibles

### Si l'utilisateur ferme l'app pendant l'onboarding
- `useAuthNavigation` détecte la présence de `userEmail` et `userName`
- Redirige vers l'onboarding pour terminer le processus
- Pas de perte de données

## 📱 États de l'application

1. **Première visite** : `intro` → `onboarding/email`
2. **Onboarding en cours** : `onboarding/plan` (pour terminer l'auth)
3. **Utilisateur connecté** : `(tabs)/prayers`

## 🔄 Flux de données

```
Email Input → AsyncStorage('userEmail')
  ↓
Name Input → AsyncStorage('userName')
  ↓
Onboarding Steps...
  ↓
Plan Screen → Firebase Auth + Firestore
  ↓
App Principal
```

Cette approche respecte parfaitement votre demande : **l'authentification se passe dans l'onboarding** après avoir collecté l'email et le nom ! 🎯
