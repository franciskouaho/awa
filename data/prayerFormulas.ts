import { ContentService } from '@/services/contentService';

// Interface pour les formules de prière
export interface PrayerFormula {
  id?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  order?: number;
}

// Formules de prière en arabe avec translittération et traduction (fallback local)
export const localPrayerFormulas: PrayerFormula[] = [
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
    transliteration: "Allahumma ighfir lahu warhamhu wa 'afihi wa'fu 'anhu",
    translation:
      'Ô Allah, pardonne-lui, fais-lui miséricorde, accorde-lui le salut et pardonne-lui',
  },
  {
    arabic:
      'اللَّهُمَّ أَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ',
    transliteration:
      "Allahumma akrim nuzulahu wa wassi' mudkhalahu waghsilhu bil-ma'i wath-thalji wal-barad",
    translation:
      "Ô Allah, honore sa demeure, élargis son entrée et lave-le avec l'eau, la neige et la grêle",
  },
  {
    arabic: 'اللَّهُمَّ أَدْخِلْهُ الْجَنَّةَ وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ وَعَذَابِ النَّارِ',
    transliteration: "Allahumma adkhilhul-jannata wa a'idhhu min 'adhabil-qabri wa 'adhabin-nar",
    translation:
      'Ô Allah, fais-le entrer au Paradis et protège-le du châtiment de la tombe et du châtiment du Feu',
  },
];

// Fonction pour obtenir une formule aléatoire avec fallback local
export const getRandomFormula = async (): Promise<PrayerFormula> => {
  try {
    // Essayer d'abord de récupérer depuis Firebase
    const result = await ContentService.getRandomPrayerFormula();
    if (result.success && result.data) {
      return result.data;
    }
  } catch (error) {
    console.warn('Firebase non disponible, utilisation des données locales:', error);
  }
  
  // Fallback vers les données locales
  const randomIndex = Math.floor(Math.random() * localPrayerFormulas.length);
  return localPrayerFormulas[randomIndex];
};

// Fonction synchrone pour compatibilité (utilise les données locales)
export const getRandomFormulaSync = (): PrayerFormula => {
  const randomIndex = Math.floor(Math.random() * localPrayerFormulas.length);
  return localPrayerFormulas[randomIndex];
};

// Export par défaut pour compatibilité
export const prayerFormulas = localPrayerFormulas;
