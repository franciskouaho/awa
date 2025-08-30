// --- Interface pour les formules de prière ---
export interface PrayerFormula {
  id?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  order?: number;
}
// --- Fonctions de récupération aléatoire avec fallback local ---

// Données locales à utiliser en fallback (à adapter selon votre structure)

// Toutes les fonctions doivent utiliser Firebase uniquement
import { ContentService } from '@/services/contentService';

// Fonction pour obtenir une formule aléatoire avec fallback local
export const getRandomFormula = async (): Promise<PrayerFormula> => {
  const result = await ContentService.getRandomPrayerFormula();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error('Aucune formule trouvée dans Firebase');
};

// Fonction synchrone pour compatibilité (utilise les données locales)
export const getRandomFormulaSync = (): PrayerFormula => {
  throw new Error(
    'getRandomFormulaSync n’est pas supporté, utilisez la version asynchrone avec Firebase'
  );
};

// Export par défaut pour compatibilité
// Utilisez ContentService pour récupérer les formules depuis Firebase

// Fonction pour obtenir un verset aléatoire avec fallback local
export const getRandomVerse = async (): Promise<Verse> => {
  const result = await ContentService.getRandomVerse();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error('Aucun verset trouvé dans Firebase');
};

// Fonction pour obtenir un hadith aléatoire avec fallback local
export const getRandomHadith = async (): Promise<Hadith> => {
  const result = await ContentService.getRandomHadith();
  if (result.success && result.data) {
    return result.data;
  }
  throw new Error('Aucun hadith trouvé dans Firebase');
};

// Fonctions synchrones pour compatibilité (utilisent les données locales)
export const getRandomVerseSync = (): Verse => {
  throw new Error(
    'getRandomVerseSync n’est pas supporté, utilisez la version asynchrone avec Firebase'
  );
};

export const getRandomHadithSync = (): Hadith => {
  throw new Error(
    'getRandomHadithSync n’est pas supporté, utilisez la version asynchrone avec Firebase'
  );
};

// Exports par défaut pour compatibilité
// Utilisez ContentService pour récupérer les versets depuis Firebase
// Utilisez ContentService pour récupérer les hadiths depuis Firebase

// --- Interfaces ---
export interface Verse {
  id?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  order?: number;
}

export interface Hadith {
  id?: string;
  text: string;
  source: string;
  arabic: string;
  order?: number;
}
// Fonction utilitaire pour obtenir les initiales d'un nom
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Fonction pour formater une date Firestore (string ou Timestamp)
export const formatDate = (date: string | Date): string => {
  let jsDate: Date;
  if (typeof date === 'string') {
    jsDate = new Date(date);
  } else {
    jsDate = date;
  }
  return jsDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};
