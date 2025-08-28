import { ContentService } from '@/services/contentService';

// Interface pour les versets coraniques
export interface Verse {
  id?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  order?: number;
}

// Interface pour les hadiths
export interface Hadith {
  id?: string;
  text: string;
  source: string;
  arabic: string;
  order?: number;
}

// Versets coraniques pour l'écran d'introduction (fallback local)
export const localVerses: Verse[] = [
  {
    arabic:
      'وَبَشِّرِ الصَّابِرِينَ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    transliteration:
      "Wa bashshiri as-sabirin. Alladhina idha asabat-hum musibatun qalu inna lillahi wa inna ilayhi raji'un",
    translation:
      'Et annonce la bonne nouvelle aux endurants, qui disent, quand un malheur les atteint : "Certes nous sommes à Allah, et c\'est à Lui que nous retournerons."',
    reference: 'Sourate Al-Baqarah (2:155-156)',
  },
  {
    arabic:
      'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ',
    transliteration: "Kullu nafsin dha'iqatul-mawt. Wa innama tuwaffawna ujurakum yawmal-qiyamah",
    translation:
      "Toute âme goûtera la mort. Et c'est seulement au Jour de la Résurrection que vous recevrez votre entière rétribution.",
    reference: "Sourate Ali 'Imran (3:185)",
  },
];

// Hadiths sur la mort et la prière pour les défunts (fallback local)
export const localHadiths: Hadith[] = [
  {
    text: 'Le Prophète (ﷺ) a dit : "Quand l\'homme meurt, ses œuvres s\'arrêtent sauf trois : une aumône continue, une science dont les gens tirent profit, et un enfant pieux qui invoque Allah pour lui."',
    source: 'Rapporté par Muslim',
    arabic:
      'إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ',
  },
  {
    text: 'Le Prophète (ﷺ) a dit : "Invoquez Allah en faveur de vos morts, car vos invocations les atteignent."',
    source: 'Rapporté par At-Tabarani',
    arabic: 'ادْعُوا لِمَوْتَاكُمْ فَإِنَّ دُعَاءَكُمْ يَبْلُغُهُمْ',
  },
];

// Fonction pour obtenir un verset aléatoire avec fallback local
export const getRandomVerse = async (): Promise<Verse> => {
  try {
    // Essayer d'abord de récupérer depuis Firebase
    const result = await ContentService.getRandomVerse();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.warn('Firebase non disponible, utilisation des données locales:', error);
  }
  
  // Fallback vers les données locales
  return localVerses[Math.floor(Math.random() * localVerses.length)];
};

// Fonction pour obtenir un hadith aléatoire avec fallback local
export const getRandomHadith = async (): Promise<Hadith> => {
  try {
    // Essayer d'abord de récupérer depuis Firebase
    const result = await ContentService.getRandomHadith();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.warn('Firebase non disponible, utilisation des données locales:', error);
  }
  
  // Fallback vers les données locales
  return localHadiths[Math.floor(Math.random() * localHadiths.length)];
};

// Fonctions synchrones pour compatibilité (utilisent les données locales)
export const getRandomVerseSync = (): Verse => {
  return localVerses[Math.floor(Math.random() * localVerses.length)];
};

export const getRandomHadithSync = (): Hadith => {
  return localHadiths[Math.floor(Math.random() * localHadiths.length)];
};

// Exports par défaut pour compatibilité
export const verses = localVerses;
export const hadiths = localHadiths;
