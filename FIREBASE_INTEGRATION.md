# Intégration Firebase - AWA

## 📋 Vue d'ensemble

L'intégration Firebase a été ajoutée à l'application AWA pour permettre la sauvegarde et la synchronisation des prières en temps réel. Cette implémentation utilise Firebase Firestore comme base de données principale.

## 🔧 Architecture

### Services
- **`services/prayerService.ts`** : Service principal pour toutes les opérations CRUD sur les prières
- **`hooks/usePrayers.ts`** : Hook React personnalisé pour utiliser facilement le service de prières
- **`config/firebase.ts`** : Configuration Firebase existante

### Composants modifiés
- **`components/ui/AddDrawerContent.tsx`** : Formulaire d'ajout de prières avec intégration Firebase
- **`components/PrayersList.tsx`** : Composant exemple pour afficher les prières Firebase

## 📊 Structure des données

### Interface PrayerData
```typescript
interface PrayerData {
  id?: string;                 // ID Firestore automatique
  name: string;               // Nom complet du défunt
  age: number;                // Âge au décès
  deathDate: Date;            // Date de décès
  location: string;           // Lieu (ville, pays)
  personalMessage: string;    // Message personnel
  prayerCount: number;        // Nombre de prières effectuées
  createdAt?: Date;           // Date de création automatique
  updatedAt?: Date;           // Date de dernière modification automatique
}
```

## 🚀 Utilisation

### 1. Ajouter une prière
```typescript
import { usePrayers } from '@/hooks/usePrayers';

const { addPrayer } = usePrayers();

const prayerData = {
  name: 'Ahmed Ben Ali',
  age: 68,
  deathDate: new Date('2023-03-15'),
  location: 'Casablanca, Maroc',
  personalMessage: 'Un père aimant...',
  prayerCount: 0
};

const result = await addPrayer(prayerData);
```

### 2. Charger toutes les prières
```typescript
const { prayers, loading, error, loadPrayers } = usePrayers();

useEffect(() => {
  loadPrayers();
}, []);
```

### 3. Incrémenter le compteur de prières
```typescript
const { incrementPrayerCount } = usePrayers();

const result = await incrementPrayerCount(prayerId);
```

## 🔒 Sécurité

### Règles Firestore recommandées
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour la collection prayers
    match /prayers/{prayerId} {
      // Lecture : autorisée pour tous les utilisateurs authentifiés
      allow read: if request.auth != null;
      
      // Écriture : autorisée pour tous les utilisateurs authentifiés
      allow write: if request.auth != null 
        && validatePrayerData(resource.data);
    }
  }
}

function validatePrayerData(data) {
  return data.keys().hasAll(['name', 'age', 'deathDate', 'location', 'personalMessage', 'prayerCount'])
    && data.name is string && data.name.size() > 0
    && data.age is number && data.age > 0
    && data.deathDate is timestamp
    && data.location is string && data.location.size() > 0
    && data.personalMessage is string && data.personalMessage.size() > 0
    && data.prayerCount is number && data.prayerCount >= 0;
}
```

## 📱 Fonctionnalités implémentées

### AddDrawerContent
- ✅ Formulaire de saisie avec validation
- ✅ Sélecteur de date pour la date de décès
- ✅ Sauvegarde dans Firebase Firestore
- ✅ Gestion des états de chargement
- ✅ Messages d'erreur et de succès
- ✅ Reset automatique du formulaire après ajout

### PrayerService
- ✅ Ajouter une prière
- ✅ Récupérer toutes les prières (triées par date de création)
- ✅ Incrémenter le compteur de prières
- ✅ Rechercher par nom
- ✅ Mettre à jour une prière
- ✅ Gestion d'erreurs complète

### Hook usePrayers
- ✅ États de chargement et d'erreur
- ✅ Mise à jour automatique de l'état local
- ✅ Méthodes pour toutes les opérations CRUD
- ✅ Feedback immédiat pour l'UI

## 🔄 Migration des données existantes

Pour migrer les données mockées vers Firebase :

```typescript
import { mockPrayers } from '@/data/mockPrayers';
import { PrayerService } from '@/services/prayerService';

const migrateMockData = async () => {
  for (const prayer of mockPrayers) {
    const { id, createdAt, ...prayerData } = prayer;
    await PrayerService.addPrayer(prayerData);
  }
};
```

## 🎯 Prochaines étapes

1. **Authentification** : Intégrer Firebase Auth pour sécuriser les données
2. **Synchronisation offline** : Ajouter le support hors ligne
3. **Optimizations** : Pagination pour les grandes listes
4. **Notifications** : Rappels de prières avec Firebase Cloud Messaging
5. **Partage** : Fonctionnalité de partage de prières entre utilisateurs

## 🐛 Dépannage

### Erreurs courantes

1. **Connexion Firebase échoue**
   - Vérifier la configuration dans `config/firebase.ts`
   - Vérifier les règles Firestore

2. **Données non synchronisées**
   - Vérifier la connexion Internet
   - Vérifier les permissions Firestore

3. **Erreurs de validation**
   - Vérifier que tous les champs requis sont remplis
   - Vérifier les types de données

## 📖 Documentation Firebase

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [React Native Firebase](https://rnfirebase.io/)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
