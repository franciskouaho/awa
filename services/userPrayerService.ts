import { db } from '@/config/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

// Interface pour les prières effectuées par l'utilisateur
export interface UserPrayerData {
  id?: string;
  prayerId: string;
  userId: string;
  deviceId?: string;
  createdAt: Date;
}

// Nom de la collection
const USER_PRAYERS_COLLECTION = 'user_prayers';

// Service pour gérer les prières effectuées par l'utilisateur
export class UserPrayerService {
  // Marquer une prière comme effectuée
  static async markPrayerAsCompleted(
    prayerId: string,
    userId: string
  ): Promise<{
    success: boolean;
    id?: string;
    error?: string;
  }> {
    try {
      // Vérifier si l'utilisateur a déjà prié pour cette prière
  const existingPrayer = await this.getUserPrayer(prayerId, userId);
      if (existingPrayer.success && existingPrayer.data) {
        return { success: false, error: 'Vous avez déjà prié pour cette personne' };
      }

      const prayerData = {
        prayerId,
        userId,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, USER_PRAYERS_COLLECTION), prayerData);

      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error("Erreur lors de l'ajout de la prière utilisateur:", error);
      return { success: false, error: error.message };
    }
  }

  // Retirer une prière effectuée (si l'utilisateur veut "dé-prier")
  static async removePrayerCompleted(
    prayerId: string,
    userId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
  const existingPrayer = await this.getUserPrayer(prayerId, userId);

      if (!existingPrayer.success || !existingPrayer.data) {
        return { success: false, error: 'Prière utilisateur non trouvée' };
      }

      await deleteDoc(doc(db, USER_PRAYERS_COLLECTION, existingPrayer.data.id!));

      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression de la prière utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier si un utilisateur a prié pour une prière spécifique
  static async getUserPrayer(
    prayerId: string,
    userId: string
  ): Promise<{
    success: boolean;
    data?: UserPrayerData;
    error?: string;
  }> {
    try {
      const q = query(
        collection(db, USER_PRAYERS_COLLECTION),
        where('prayerId', '==', prayerId),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { success: true, data: undefined };
      }

      const doc = querySnapshot.docs[0];
      if (!doc) {
        return { success: true, data: undefined };
      }
      const data = doc.data();

      const userPrayer: UserPrayerData = {
        id: doc.id,
        ...data,
        createdAt: new Date(data.createdAt),
      } as UserPrayerData;

      return { success: true, data: userPrayer };
    } catch (error: any) {
      console.error('Erreur lors de la vérification de la prière utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer toutes les prières effectuées par un utilisateur
  static async getUserPrayers(
    userId: string
  ): Promise<{
    success: boolean;
    data?: string[];
    error?: string;
  }> {
    try {
  const q = query(collection(db, USER_PRAYERS_COLLECTION), where('userId', '==', userId));

      const querySnapshot = await getDocs(q);

      const prayerIds: string[] = querySnapshot.docs.map(doc => doc.data().prayerId);

      return { success: true, data: prayerIds };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des prières utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Basculer l'état d'une prière (toggle)
  static async togglePrayerCompleted(
    prayerId: string,
    userId: string
  ): Promise<{
    success: boolean;
    isCompleted?: boolean;
    error?: string;
  }> {
    try {
      const existingPrayer = await this.getUserPrayer(prayerId, userId);

      if (existingPrayer.success && existingPrayer.data) {
        // Si déjà prié, retirer la prière
        const result = await this.removePrayerCompleted(prayerId, userId);
        return { ...result, isCompleted: false };
      } else {
        // Si pas encore prié, marquer comme prié
        const result = await this.markPrayerAsCompleted(prayerId, userId);
        return { ...result, isCompleted: true };
      }
    } catch (error: any) {
      console.error('Erreur lors du toggle de la prière:', error);
      return { success: false, error: error.message };
    }
  }
}
