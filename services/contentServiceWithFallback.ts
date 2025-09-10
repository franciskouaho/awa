import { db } from '@/config/firebase';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// Données locales de fallback
const LOCAL_PRAYER_FORMULAS = [
  {
    id: 'local-1',
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْفَعْ دَرَجَتَهُ فِي الْمَهْدِيِّينَ',
    transliteration: "Allaahummaghfir li [Name] warfa' darajatahu fil-mahdiyyina",
    translation: 'Ô Allah, pardonne à [nom de la personne] et élève son statut parmi les vertueux',
    order: 1,
  },
  {
    id: 'local-2',
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
    transliteration: "Allahumma ighfir li [Name] warhamhu wa 'afihi wa'fu 'anhu",
    translation:
      'Ô Allah, pardonne à [nom de la personne], fais-lui miséricorde, accorde-lui le salut et pardonne-lui',
    order: 2,
  },
  // ... autres formules
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
