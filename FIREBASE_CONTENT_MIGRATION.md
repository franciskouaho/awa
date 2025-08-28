# Migration Firebase - Formules de Prière et Versets

## Vue d'ensemble

Le système a été mis à jour pour récupérer les formules de prière et les versets depuis Firebase au lieu des données statiques locales. Cela permet une gestion dynamique du contenu et la possibilité d'ajouter de nouvelles formules et versets sans mettre à jour l'application.

## Nouvelles fonctionnalités

### 1. Service ContentService
- Gestion des formules de prière depuis Firebase
- Gestion des versets coraniques depuis Firebase  
- Gestion des hadiths depuis Firebase
- Fonctions pour récupérer du contenu aléatoire

### 2. Hook useContent
- État de chargement pour chaque type de contenu
- Gestion des erreurs
- Méthodes pour charger et actualiser le contenu
- Fonctions pour obtenir du contenu aléatoire

### 3. Migration automatique
- Script de migration pour transférer les données locales vers Firebase
- Composant MigrationStatus pour afficher le statut de la migration
- Fallback vers les données locales en cas d'échec

## Structure Firebase

### Collections créées :
- `prayerFormulas` : Formules de prière en arabe avec traductions
- `verses` : Versets coraniques avec références
- `hadiths` : Hadiths authentiques avec sources

### Structure des documents :

#### prayerFormulas
```json
{
  "arabic": "النص العربي",
  "transliteration": "Transcription phonétique",
  "translation": "Traduction en français",
  "order": 1,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### verses
```json
{
  "arabic": "النص العربي للآية",
  "transliteration": "Transcription phonétique",
  "translation": "Traduction en français",
  "reference": "Sourate Al-Baqarah (2:155)",
  "order": 1,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

#### hadiths
```json
{
  "text": "Texte du hadith en français",
  "source": "Source du hadith",
  "arabic": "النص العربي للحديث",
  "order": 1,
  "createdAt": "2025-01-01T00:00:00.000Z"
}
```

## Utilisation

### 1. Migration initiale
Pour migrer les données existantes vers Firebase :

```bash
npm run migrate-content
```

Ou depuis le code :
```typescript
import { migrateAllContent } from '@/scripts/migrateContent';
await migrateAllContent();
```

### 2. Utilisation du hook useContent
```typescript
import { useContent } from '@/hooks/useContent';

function MyComponent() {
  const {
    prayerFormulas,
    prayerFormulasLoading,
    prayerFormulasError,
    loadPrayerFormulas,
    getRandomPrayerFormula,
  } = useContent();

  useEffect(() => {
    loadPrayerFormulas();
  }, []);

  const handleGetRandomFormula = async () => {
    const result = await getRandomPrayerFormula();
    if (result.success) {
      console.log(result.data);
    }
  };
}
```

### 3. Utilisation directe du service
```typescript
import { ContentService } from '@/services/contentService';

// Récupérer toutes les formules
const result = await ContentService.getAllPrayerFormulas();

// Récupérer une formule aléatoire
const randomFormula = await ContentService.getRandomPrayerFormula();
```

### 4. Fallback automatique
Si Firebase n'est pas disponible, le système utilise automatiquement les données locales :

```typescript
import { getRandomFormula } from '@/data/prayerFormulas';

// Cette fonction essaie Firebase en premier, puis fallback local
const formula = await getRandomFormula();
```

## Avantages

1. **Contenu dynamique** : Possibilité d'ajouter/modifier du contenu sans mise à jour d'app
2. **Gestion centralisée** : Tout le contenu religieux est géré depuis Firebase
3. **Fallback robuste** : L'application fonctionne même hors ligne
4. **Performance** : Chargement à la demande et mise en cache
5. **Extensibilité** : Facile d'ajouter de nouveaux types de contenu

## Migration des données existantes

Le script de migration transfert automatiquement :
- 3 formules de prière existantes
- 2 versets coraniques existants  
- 2 hadiths existants

Les données sont migrées avec un champ `order` pour maintenir l'ordre d'affichage et un `createdAt` pour l'historique.

## Maintenance

Pour ajouter du nouveau contenu :
1. Accéder à la console Firebase
2. Aller dans Firestore Database
3. Ajouter des documents dans les collections appropriées
4. Respecter la structure des champs requis
5. Le contenu sera automatiquement disponible dans l'app

## Notes importantes

- La migration ne s'exécute que si les collections sont vides
- Les données locales restent comme fallback permanent
- Le hook useContent gère automatiquement la synchronisation
- Les erreurs Firebase sont gracieusement gérées avec des fallbacks
