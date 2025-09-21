# 🎯 Guide de configuration du widget dans Xcode

## ✅ Étape 1: Vérifier l'extension
Vous avez déjà créé l'extension `AwaWidgetExtension` - parfait !

## ✅ Étape 2: Ajouter les fichiers Swift à l'extension

1. **Dans Xcode, faites un clic droit** sur le dossier `AwaWidgetExtension` dans le navigateur de gauche
2. **Sélectionnez "Add Files to AwaWidgetExtension"**
3. **Naviguez vers** `ios/AwaWidgetExtension/`
4. **Sélectionnez ces 4 fichiers :**
   - ✅ `SharedTypes.swift`
   - ✅ `PrayerWidget.swift`
   - ✅ `PrayerLiveActivity.swift`
   - ✅ `PrayerWidgetBundle.swift`
5. **Cliquez "Add"**

## ✅ Étape 3: Configurer les App Groups

### Pour l'app principale (Awa) :
1. **Sélectionnez le target "Awa"** dans le navigateur de gauche
2. **Onglet "Signing & Capabilities"**
3. **Cliquez "+ Capability"**
4. **Ajoutez "App Groups"**
5. **Cliquez "+" et ajoutez :** `group.com.emplica.awa`

### Pour l'extension (AwaWidgetExtension) :
1. **Sélectionnez le target "AwaWidgetExtension"**
2. **Onglet "Signing & Capabilities"**
3. **Cliquez "+ Capability"**
4. **Ajoutez "App Groups"**
5. **Cliquez "+" et ajoutez :** `group.com.emplica.awa`

## ✅ Étape 4: Build et test

1. **Connectez votre iPhone** via USB
2. **Sélectionnez votre iPhone** comme destination
3. **Choisissez votre équipe de développement**
4. **Build et Run** (⌘+R)

## ✅ Étape 5: Tester les widgets

### Widget d'écran d'accueil :
1. **Appuyez longuement** sur l'écran d'accueil de votre iPhone
2. **Tapez "+"** en haut à gauche
3. **Cherchez "Awa"** dans la liste
4. **Ajoutez le widget**

### Live Activities :
1. **Ouvrez l'app Awa**
2. **Utilisez le composant PrayerWidgetTest** (si disponible)
3. **Testez les boutons "Start Live Activity"**

## 🔧 Vérifications importantes

- ✅ **iOS 16.1+** requis pour les Live Activities
- ✅ **App Groups** configurés sur les deux targets
- ✅ **Bundle ID** correct : `com.emplica.awa.AwaWidgetExtension`
- ✅ **Fichiers Swift** ajoutés à l'extension

## 🚨 Problèmes courants

1. **Widget ne s'affiche pas** → Vérifiez que l'extension est bien ajoutée au projet
2. **Live Activities ne fonctionnent pas** → Vérifiez iOS 16.1+ et les permissions
3. **Erreurs de build** → Vérifiez les App Groups et les entitlements
4. **Fichiers manquants** → Vérifiez que tous les fichiers .swift sont ajoutés à l'extension

## 📱 Test sur iPhone physique

Une fois l'app installée sur votre iPhone, vous devriez pouvoir :
- ✅ Voir le widget dans la liste des widgets disponibles
- ✅ Ajouter le widget à votre écran d'accueil
- ✅ Utiliser les Live Activities (si iOS 16.1+)
