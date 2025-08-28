import { db } from '@/config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

// Interface pour les formules de prière Firebase
export interface PrayerFormula {
  id?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  order?: number;
  createdAt?: Date;
}

// Interface pour les versets Firebase
export interface Verse {
  id?: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  order?: number;
  createdAt?: Date;
}

// Interface pour les hadiths Firebase
export interface Hadith {
  id?: string;
  text: string;
  source: string;
  arabic: string;
  order?: number;
  createdAt?: Date;
}

// Noms des collections
const PRAYER_FORMULAS_COLLECTION = 'prayerFormulas';
const VERSES_COLLECTION = 'verses';
const HADITHS_COLLECTION = 'hadiths';

// Service pour gérer le contenu (formules, versets, hadiths)
export class ContentService {
  // Récupérer toutes les formules de prière
  static async getAllPrayerFormulas(): Promise<{ success: boolean; data?: PrayerFormula[]; error?: string }> {
    try {
      const q = query(collection(db, PRAYER_FORMULAS_COLLECTION), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const formulas: PrayerFormula[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        } as PrayerFormula;
      });
      
      return { success: true, data: formulas };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des formules:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les versets
  static async getAllVerses(): Promise<{ success: boolean; data?: Verse[]; error?: string }> {
    try {
      const q = query(collection(db, VERSES_COLLECTION), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const verses: Verse[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        } as Verse;
      });
      
      return { success: true, data: verses };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des versets:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les hadiths
  static async getAllHadiths(): Promise<{ success: boolean; data?: Hadith[]; error?: string }> {
    try {
      const q = query(collection(db, HADITHS_COLLECTION), orderBy('order', 'asc'));
      const querySnapshot = await getDocs(q);
      
      const hadiths: Hadith[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
        } as Hadith;
      });
      
      return { success: true, data: hadiths };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des hadiths:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir une formule de prière aléatoire
  static async getRandomPrayerFormula(): Promise<{ success: boolean; data?: PrayerFormula; error?: string }> {
    try {
      const result = await this.getAllPrayerFormulas();
      if (result.success && result.data && result.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * result.data.length);
        return { success: true, data: result.data[randomIndex] };
      }
      return { success: false, error: 'Aucune formule disponible' };
    } catch (error: any) {
      console.error('Erreur lors de la récupération d\'une formule aléatoire:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir un verset aléatoire
  static async getRandomVerse(): Promise<{ success: boolean; data?: Verse; error?: string }> {
    try {
      const result = await this.getAllVerses();
      if (result.success && result.data && result.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * result.data.length);
        return { success: true, data: result.data[randomIndex] };
      }
      return { success: false, error: 'Aucun verset disponible' };
    } catch (error: any) {
      console.error('Erreur lors de la récupération d\'un verset aléatoire:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir un hadith aléatoire
  static async getRandomHadith(): Promise<{ success: boolean; data?: Hadith; error?: string }> {
    try {
      const result = await this.getAllHadiths();
      if (result.success && result.data && result.data.length > 0) {
        const randomIndex = Math.floor(Math.random() * result.data.length);
        return { success: true, data: result.data[randomIndex] };
      }
      return { success: false, error: 'Aucun hadith disponible' };
    } catch (error: any) {
      console.error('Erreur lors de la récupération d\'un hadith aléatoire:', error);
      return { success: false, error: error.message };
    }
  }
}
