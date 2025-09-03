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
    where,
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
  creatorId: string;
  isPinned?: boolean; // Pour épingler une prière en première position
  createdAt?: Date;
  updatedAt?: Date;
}

// Nom de la collection
const PRAYERS_COLLECTION = 'prayers';

// Service pour gérer les prières
export class PrayerService {
  // Supprimer une prière
  static async deletePrayer(prayerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await (await import('firebase/firestore')).deleteDoc(doc(db, PRAYERS_COLLECTION, prayerId));
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la prière:', error);
      return { success: false, error: error.message };
    }
  }
  // Ajouter une nouvelle prière
  static async addPrayer(
    prayerData: Omit<PrayerData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Convertir la date en timestamp pour Firestore
      const dataToSave = {
        ...prayerData,
        creatorId: prayerData.creatorId,
        deathDate: prayerData.deathDate.toISOString(), // Convertir en string ISO
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, PRAYERS_COLLECTION), dataToSave);

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la prière:", error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer toutes les prières
  static async getAllPrayers(): Promise<{ success: boolean; data?: PrayerData[]; error?: string }> {
    try {
      console.log('🔍 PrayerService: Début de getAllPrayers');
      console.log('🔍 PrayerService: Collection:', PRAYERS_COLLECTION);

      const q = query(collection(db, PRAYERS_COLLECTION), orderBy('createdAt', 'desc'));
      console.log('🔍 PrayerService: Query créée, récupération des documents...');

      const querySnapshot = await getDocs(q);
      console.log('🔍 PrayerService: Documents récupérés:', querySnapshot.size);

      const prayers: PrayerData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('🔍 PrayerService: Document data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data,
          deathDate: new Date(data.deathDate), // Reconvertir en Date
          createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
          updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
        } as PrayerData;
      });

      // Trier les prières : les épinglées en premier, puis par date de création
      const sortedPrayers = prayers.sort((a, b) => {
        // Si une prière est épinglée et pas l'autre, la priorité va à l'épinglée
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        // Si les deux ont le même statut d'épinglage, trier par date de création
        if (a.createdAt && b.createdAt) {
          return b.createdAt.getTime() - a.createdAt.getTime();
        }
        return 0;
      });

      console.log('🔍 PrayerService: Prières triées:', sortedPrayers.length);
      return { success: true, data: sortedPrayers };
    } catch (error: any) {
      console.error('💥 PrayerService: Erreur lors de la récupération des prières:', error);
      return { success: false, error: error.message };
    }
  }

  // Incrémenter le compteur de prières
  static async incrementPrayerCount(
    prayerId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const prayerRef = doc(db, PRAYERS_COLLECTION, prayerId);
      await updateDoc(prayerRef, {
        prayerCount: increment(1),
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erreur lors de l'incrémentation du compteur:", error);
      return { success: false, error: error.message };
    }
  }

  // Épingler/désépingler une prière
  static async togglePinPrayer(
    prayerId: string,
    isPinned: boolean
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const prayerRef = doc(db, PRAYERS_COLLECTION, prayerId);
      await updateDoc(prayerRef, {
        isPinned: isPinned,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error: any) {
      console.error("Erreur lors de l'épinglage/désépinglage de la prière:", error);
      return { success: false, error: error.message };
    }
  }

  // Rechercher des prières par nom
  static async searchPrayersByName(
    searchTerm: string
  ): Promise<{ success: boolean; data?: PrayerData[]; error?: string }> {
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
  static async updatePrayer(
    prayerId: string,
    updates: Partial<PrayerData>
  ): Promise<{ success: boolean; error?: string }> {
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

  // Récupérer les prières créées par un utilisateur spécifique
  static async getPrayersByCreator(
    creatorId: string
  ): Promise<{ success: boolean; data?: PrayerData[]; error?: string }> {
    try {
      console.log('🔍 PrayerService.getPrayersByCreator: Début avec creatorId:', creatorId);

      // Solution alternative : récupérer toutes les prières et filtrer côté client
      // Cela évite d'avoir besoin d'un index composite
      const q = query(collection(db, PRAYERS_COLLECTION), orderBy('createdAt', 'desc'));
      console.log(
        '🔍 PrayerService.getPrayersByCreator: Query créée (sans filtre), récupération des documents...'
      );

      const querySnapshot = await getDocs(q);
      console.log('🔍 PrayerService.getPrayersByCreator: Documents récupérés:', querySnapshot.size);

      // Filtrer côté client pour éviter l'index composite
      const prayers: PrayerData[] = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            deathDate: new Date(data.deathDate),
            createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
            updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
          } as PrayerData;
        })
        .filter(prayer => prayer.creatorId === creatorId); // Filtrage côté client

      console.log(
        "🔍 PrayerService.getPrayersByCreator: Prières filtrées pour l'utilisateur:",
        prayers.length
      );
      return { success: true, data: prayers };
    } catch (error: any) {
      console.error(
        "💥 PrayerService.getPrayersByCreator: Erreur lors de la récupération des prières de l'utilisateur:",
        error
      );
      return { success: false, error: error.message };
    }
  }
}
