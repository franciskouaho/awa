import { ContentService, Hadith, PrayerFormula, Verse } from '@/services/contentService';
import { useCallback, useState } from 'react';

export interface UseContentResult {
  // Formules de prière
  prayerFormulas: PrayerFormula[];
  prayerFormulasLoading: boolean;
  prayerFormulasError: string | null;
  loadPrayerFormulas: () => Promise<void>;
  getRandomPrayerFormula: () => Promise<{ success: boolean; data?: PrayerFormula; error?: string }>;

  // Versets
  verses: Verse[];
  versesLoading: boolean;
  versesError: string | null;
  loadVerses: () => Promise<void>;
  getRandomVerse: () => Promise<{ success: boolean; data?: Verse; error?: string }>;

  // Hadiths
  hadiths: Hadith[];
  hadithsLoading: boolean;
  hadithsError: string | null;
  loadHadiths: () => Promise<void>;
  getRandomHadith: () => Promise<{ success: boolean; data?: Hadith; error?: string }>;

  // Actions globales
  loadAllContent: () => Promise<void>;
  refreshAllContent: () => Promise<void>;
}

export function useContent(): UseContentResult {
  // États pour les formules de prière
  const [prayerFormulas, setPrayerFormulas] = useState<PrayerFormula[]>([]);
  const [prayerFormulasLoading, setPrayerFormulasLoading] = useState(false);
  const [prayerFormulasError, setPrayerFormulasError] = useState<string | null>(null);

  // États pour les versets
  const [verses, setVerses] = useState<Verse[]>([]);
  const [versesLoading, setVersesLoading] = useState(false);
  const [versesError, setVersesError] = useState<string | null>(null);

  // États pour les hadiths
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [hadithsLoading, setHadithsLoading] = useState(false);
  const [hadithsError, setHadithsError] = useState<string | null>(null);

  // Charger les formules de prière
  const loadPrayerFormulas = useCallback(async () => {
    setPrayerFormulasLoading(true);
    setPrayerFormulasError(null);
    
    try {
      const result = await ContentService.getAllPrayerFormulas();
      
      if (result.success && result.data) {
        setPrayerFormulas(result.data);
      } else {
        setPrayerFormulasError(result.error || 'Erreur lors du chargement des formules');
      }
    } catch (err: any) {
      setPrayerFormulasError(err.message || 'Erreur inattendue');
    } finally {
      setPrayerFormulasLoading(false);
    }
  }, []);

  // Charger les versets
  const loadVerses = useCallback(async () => {
    setVersesLoading(true);
    setVersesError(null);
    
    try {
      const result = await ContentService.getAllVerses();
      
      if (result.success && result.data) {
        setVerses(result.data);
      } else {
        setVersesError(result.error || 'Erreur lors du chargement des versets');
      }
    } catch (err: any) {
      setVersesError(err.message || 'Erreur inattendue');
    } finally {
      setVersesLoading(false);
    }
  }, []);

  // Charger les hadiths
  const loadHadiths = useCallback(async () => {
    setHadithsLoading(true);
    setHadithsError(null);
    
    try {
      const result = await ContentService.getAllHadiths();
      
      if (result.success && result.data) {
        setHadiths(result.data);
      } else {
        setHadithsError(result.error || 'Erreur lors du chargement des hadiths');
      }
    } catch (err: any) {
      setHadithsError(err.message || 'Erreur inattendue');
    } finally {
      setHadithsLoading(false);
    }
  }, []);

  // Obtenir une formule de prière aléatoire
  const getRandomPrayerFormula = useCallback(async () => {
    return await ContentService.getRandomPrayerFormula();
  }, []);

  // Obtenir un verset aléatoire
  const getRandomVerse = useCallback(async () => {
    return await ContentService.getRandomVerse();
  }, []);

  // Obtenir un hadith aléatoire
  const getRandomHadith = useCallback(async () => {
    return await ContentService.getRandomHadith();
  }, []);

  // Charger tout le contenu
  const loadAllContent = useCallback(async () => {
    await Promise.all([
      loadPrayerFormulas(),
      loadVerses(),
      loadHadiths(),
    ]);
  }, [loadPrayerFormulas, loadVerses, loadHadiths]);

  // Actualiser tout le contenu
  const refreshAllContent = useCallback(async () => {
    await loadAllContent();
  }, [loadAllContent]);

  return {
    // Formules de prière
    prayerFormulas,
    prayerFormulasLoading,
    prayerFormulasError,
    loadPrayerFormulas,
    getRandomPrayerFormula,

    // Versets
    verses,
    versesLoading,
    versesError,
    loadVerses,
    getRandomVerse,

    // Hadiths
    hadiths,
    hadithsLoading,
    hadithsError,
    loadHadiths,
    getRandomHadith,

    // Actions globales
    loadAllContent,
    refreshAllContent,
  };
}
