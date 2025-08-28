# 🔐 Configuration des Règles Firestore pour la Migration

## ❌ Problème rencontré

L'erreur `PERMISSION_DENIED: Missing or insufficient permissions` indique que les règles Firestore actuelles ne permettent pas l'accès aux nouvelles collections.

## ✅ Solution - Déployer les nouvelles règles

### Option 1: Via la Console Firebase (Recommandé)

1. **Aller dans la Console Firebase** : https://console.firebase.google.com
2. **Sélectionner votre projet** : `awaa-9c731`
3. **Naviguer vers Firestore Database** → **Rules**
4. **Remplacer les règles** par le contenu mis à jour du fichier `firestore.rules`
5. **Cliquer sur "Publier"**

### Option 2: Via Firebase CLI

```bash
# Installer Firebase CLI si pas déjà fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Déployer les règles
firebase deploy --only firestore:rules
```

## 📋 Règles mises à jour

Les nouvelles règles dans `firestore.rules` incluent maintenant :

```javascript
// Règles pour les formules de prière
match /prayerFormulas/{formulaId} {
  allow read: if true;
  allow write: if true; // Temporaire pour la migration
}

// Règles pour les versets
match /verses/{verseId} {
  allow read: if true;
  allow write: if true; // Temporaire pour la migration
}

// Règles pour les hadiths
match /hadiths/{hadithId} {
  allow read: if true;
  allow write: if true; // Temporaire pour la migration
}
```

## 🚨 Alternative Temporaire (Développement uniquement)

Si vous voulez migrer immédiatement, vous pouvez temporairement utiliser des règles permissives :

**⚠️ ATTENTION : À utiliser uniquement en développement !**

1. Dans la Console Firebase → Firestore → Rules
2. Remplacer temporairement par :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Exécuter la migration : `npm run migrate-content`
4. **IMPORTANT** : Remettre les règles sécurisées après la migration

## 🔄 Après la migration

Une fois la migration terminée, vous pouvez sécuriser les règles :

```javascript
// Règles sécurisées pour la production
match /prayerFormulas/{formulaId} {
  allow read: if true;
  allow write: if request.auth != null; // Seulement les utilisateurs authentifiés
}

match /verses/{verseId} {
  allow read: if true;
  allow write: if request.auth != null;
}

match /hadiths/{hadithId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

## 📝 Étapes recommandées

1. **Déployer les nouvelles règles** (Option 1 ou 2 ci-dessus)
2. **Attendre 1-2 minutes** que les règles se propagent
3. **Exécuter la migration** : `npm run migrate-content`
4. **Vérifier dans Firebase Console** que les collections sont créées
5. **Optionnel** : Sécuriser les règles d'écriture si souhaité

## 🔍 Vérification

Après déploiement des règles, vous pouvez vérifier dans la Console Firebase :
- Aller dans **Firestore Database**
- Vérifier que les collections `prayerFormulas`, `verses`, `hadiths` apparaissent après la migration
- Vérifier que les documents contiennent les bonnes données

## 📞 Support

Si vous continuez à avoir des problèmes :
1. Vérifiez que les règles sont bien déployées
2. Attendez quelques minutes pour la propagation
3. Vérifiez les logs de la Console Firebase pour plus de détails
