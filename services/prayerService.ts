import { db } from '@/config/firebase';
import {
    addDoc,
    collection,
    doc,
    getDocs,
    increment,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore';

// Interface pour les données de prière
export interface PrayerData {
  id?: string;
  name: string;
  age: number;
  deathDate: Date;
  location: string;
  personalMessage: string;
  prayerCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Nom de la collection
const PRAYERS_COLLECTION = 'prayers';

// Service pour gérer les prières
export class PrayerService {
  // Ajouter une nouvelle prière
  static async addPrayer(prayerData: Omit<PrayerData, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Convertir la date en timestamp pour Firestore
      const dataToSave = {
        ...prayerData,
        deathDate: prayerData.deathDate.toISOString(), // Convertir en string ISO
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, PRAYERS_COLLECTION), dataToSave);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout de la prière:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer toutes les prières
  static async getAllPrayers(): Promise<{ success: boolean; data?: PrayerData[]; error?: string }> {
    try {
      const q = query(collection(db, PRAYERS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const prayers: PrayerData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          deathDate: new Date(data.deathDate), // Reconvertir en Date
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        } as PrayerData;
      });
      
      return { success: true, data: prayers };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des prières:', error);
      return { success: false, error: error.message };
    }
  }

  // Incrémenter le compteur de prières
  static async incrementPrayerCount(prayerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const prayerRef = doc(db, PRAYERS_COLLECTION, prayerId);
      await updateDoc(prayerRef, {
        prayerCount: increment(1),
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de l\'incrémentation du compteur:', error);
      return { success: false, error: error.message };
    }
  }

  // Rechercher des prières par nom
  static async searchPrayersByName(searchTerm: string): Promise<{ success: boolean; data?: PrayerData[]; error?: string }> {
    try {
      const q = query(
        collection(db, PRAYERS_COLLECTION),
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        orderBy('name')
      );
      
      const querySnapshot = await getDocs(q);
      const prayers: PrayerData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          deathDate: new Date(data.deathDate),
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        } as PrayerData;
      });
      
      return { success: true, data: prayers };
    } catch (error: any) {
      console.error('Erreur lors de la recherche:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour une prière
  static async updatePrayer(prayerId: string, updates: Partial<PrayerData>): Promise<{ success: boolean; error?: string }> {
    try {
      const prayerRef = doc(db, PRAYERS_COLLECTION, prayerId);
      
      // Préparer les mises à jour avec conversion de dates si nécessaire
      const updatesToSave = { ...updates };
      if (updatesToSave.deathDate && updatesToSave.deathDate instanceof Date) {
        updatesToSave.deathDate = updatesToSave.deathDate.toISOString() as any;
      }
      
      await updateDoc(prayerRef, {
        ...updatesToSave,
        updatedAt: new Date().toISOString(),
      });
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      return { success: false, error: error.message };
    }
  }
}
