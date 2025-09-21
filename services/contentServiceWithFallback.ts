import { db } from '@/config/firebase';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// Données locales de fallback - Prières pour les défunts
const LOCAL_PRAYER_FORMULAS = [
  {
    id: 'local-1',
    arabic:
      'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْفَعْ دَرَجَتَهُ فِي الْمَهْدِيِّينَ وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ وَاغْفِرْ لَنَا وَلَهُ يَا رَبَّ الْعَالَمِينَ',
    transliteration:
      "Allaahummaghfir li [Name] warfa' darajatahu fil-mahdiyyina wa akhlufhu fi 'aqibihi fil-ghabirina wa ighfir lana wa lahu ya rabba al-'alamin",
    translation:
      "Ô Allah, pardonne à [nom du défunt] et élève son statut parmi les vertueux, remplace-le par de bons descendants parmi ceux qui restent, et pardonne-nous ainsi qu'à lui, ô Seigneur des mondes",
    order: 1,
  },
  {
    id: 'local-2',
    arabic:
      'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ',
    transliteration:
      "Allahumma ighfir li [Name] warhamhu wa 'afihi wa'fu 'anhu wa akrim nuzulahu wa wassi' mudkhalahu",
    translation:
      'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde, accorde-lui le salut, pardonne-lui, honore son arrivée et élargis son entrée',
    order: 2,
  },
  {
    id: 'local-3',
    arabic:
      'اللَّهُمَّ اجْعَلْ قَبْرَ [Name] رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ وَلَا تَجْعَلْهُ حُفْرَةً مِنْ حُفَرِ النَّارِ',
    transliteration:
      "Allahumma ij'al qabra [Name] rawdatan min riyadi al-jannati wa la taj'alhu hufratan min hufari an-nar",
    translation:
      "Ô Allah, fais du tombeau de [nom du défunt] un jardin parmi les jardins du Paradis, et ne le fais pas être une fosse parmi les fosses de l'Enfer",
    order: 3,
  },
  {
    id: 'local-4',
    arabic:
      'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَسَكِّنْهُ فِي الْجَنَّةِ وَاجْعَلْهُ مِنْ أَهْلِ الْجَنَّةِ',
    transliteration:
      "Allahumma ighfir li [Name] warhamhu wa sakkinhu fil-jannati wa ij'alhu min ahli al-jannati",
    translation:
      "Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde, installe-le dans le Paradis et fais qu'il soit parmi les habitants du Paradis",
    order: 4,
  },
  {
    id: 'local-5',
    arabic:
      'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَنْزِلْهُ مَنْزِلًا مُبَارَكًا وَأَنْزِلْهُ مَنْزِلًا صَالِحًا',
    transliteration:
      "Allahumma ighfir li [Name] warhamhu wa 'afihi wa'fu 'anhu wa anzilhu manzilan mubarakan wa anzilhu manzilan salihan",
    translation:
      'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde, accorde-lui le salut, pardonne-lui et fais-le descendre dans une demeure bénie et une demeure vertueuse',
    order: 5,
  },
  {
    id: 'local-6',
    arabic:
      'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَاجْعَلْهُ فِي الْجَنَّةِ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ',
    transliteration:
      "Allahumma ighfir li [Name] warhamhu wa ij'alhu fil-jannati ma'a an-nabiyyina was-siddiqina wash-shuhada'i was-saliheen",
    translation:
      'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde et place-le dans le Paradis avec les prophètes, les véridiques, les martyrs et les vertueux',
    order: 6,
  },
];

export class ContentServiceWithFallback {
  private static instance: ContentServiceWithFallback;
  private cache: Map<string, any> = new Map();

  static getInstance(): ContentServiceWithFallback {
    if (!ContentServiceWithFallback.instance) {
      ContentServiceWithFallback.instance = new ContentServiceWithFallback();
    }
    return ContentServiceWithFallback.instance;
  }

  async getPrayerFormulas(useFirebase: boolean = true): Promise<any[]> {
    const cacheKey = `prayerFormulas_${useFirebase}`;

    // Vérifier le cache d'abord
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let formulas = [];

    if (useFirebase) {
      try {
        // Essayer Firebase d'abord
        const formulasRef = collection(db, 'prayerFormulas');
        const q = query(formulasRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          formulas = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          console.log('✅ Formules chargées depuis Firebase');
        } else {
          throw new Error('Aucune donnée Firebase trouvée');
        }
      } catch (error) {
        console.warn('⚠️ Erreur Firebase, utilisation des données locales:', error);
        formulas = LOCAL_PRAYER_FORMULAS;
      }
    } else {
      // Utiliser directement les données locales
      formulas = LOCAL_PRAYER_FORMULAS;
    }

    // Mettre en cache
    this.cache.set(cacheKey, formulas);
    return formulas;
  }

  async getVerses(useFirebase: boolean = true): Promise<any[]> {
    // Implémentation similaire pour les versets
    return [];
  }

  async getHadiths(useFirebase: boolean = true): Promise<any[]> {
    // Implémentation similaire pour les hadiths
    return [];
  }

  // Méthode pour vider le cache (utile pour les tests ou les mises à jour)
  clearCache(): void {
    this.cache.clear();
  }

  // Méthode pour forcer le rechargement depuis Firebase
  async refreshFromFirebase(): Promise<void> {
    this.clearCache();
    await this.getPrayerFormulas(true);
  }
}

// Hook React pour utiliser le service
export function useContentService() {
  const { flags } = useFeatureFlags();
  const service = ContentServiceWithFallback.getInstance();

  return {
    getPrayerFormulas: () => service.getPrayerFormulas(flags.useFirebaseContent),
    getVerses: () => service.getVerses(flags.useFirebaseContent),
    getHadiths: () => service.getHadiths(flags.useFirebaseContent),
    refreshFromFirebase: () => service.refreshFromFirebase(),
    clearCache: () => service.clearCache(),
  };
}
