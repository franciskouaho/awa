import { db } from '@/config/firebase';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    query,
    where
} from 'firebase/firestore';

// Interface pour les données de like
export interface LikeData {
  id?: string;
  prayerId: string;
  userId: string; // ID de l'utilisateur qui a liké
  deviceId?: string; // ID de l'appareil comme fallback
  createdAt: Date;
}

// Nom de la collection
const LIKES_COLLECTION = 'likes';

// Service pour gérer les likes
export class LikeService {
  // Ajouter un like
  static async addLike(prayerId: string, userId: string, deviceId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Vérifier si l'utilisateur a déjà liké cette prière
      const existingLike = await this.getUserLike(prayerId, userId, deviceId);
      if (existingLike.success && existingLike.data) {
        return { success: false, error: 'Vous avez déjà liké cette prière' };
      }

      const likeData = {
        prayerId,
        userId,
        deviceId,
        createdAt: new Date().toISOString(),
      };
      
      const docRef = await addDoc(collection(db, LIKES_COLLECTION), likeData);
      
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du like:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un like
  static async removeLike(prayerId: string, userId: string, deviceId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const existingLike = await this.getUserLike(prayerId, userId, deviceId);
      
      if (!existingLike.success || !existingLike.data) {
        return { success: false, error: 'Like non trouvé' };
      }

      await deleteDoc(doc(db, LIKES_COLLECTION, existingLike.data.id!));
      
      return { success: true };
    } catch (error: any) {
      console.error('Erreur lors de la suppression du like:', error);
      return { success: false, error: error.message };
    }
  }

  // Vérifier si un utilisateur a liké une prière
  static async getUserLike(prayerId: string, userId: string, deviceId?: string): Promise<{ success: boolean; data?: LikeData; error?: string }> {
    try {
      let q;
      
      // Rechercher par userId en priorité, sinon par deviceId
      if (userId) {
        q = query(
          collection(db, LIKES_COLLECTION),
          where('prayerId', '==', prayerId),
          where('userId', '==', userId)
        );
      } else if (deviceId) {
        q = query(
          collection(db, LIKES_COLLECTION),
          where('prayerId', '==', prayerId),
          where('deviceId', '==', deviceId)
        );
      } else {
        return { success: false, error: 'UserId ou deviceId requis' };
      }
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { success: true, data: undefined };
      }
      
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      
      const like: LikeData = {
        id: doc.id,
        ...data,
        createdAt: new Date(data.createdAt),
      } as LikeData;
      
      return { success: true, data: like };
    } catch (error: any) {
      console.error('Erreur lors de la vérification du like:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer tous les likes d'une prière
  static async getPrayerLikes(prayerId: string): Promise<{ success: boolean; data?: LikeData[]; count?: number; error?: string }> {
    try {
      const q = query(
        collection(db, LIKES_COLLECTION),
        where('prayerId', '==', prayerId)
      );
      
      const querySnapshot = await getDocs(q);
      
      const likes: LikeData[] = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: new Date(data.createdAt),
        } as LikeData;
      });
      
      return { success: true, data: likes, count: likes.length };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des likes:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer les likes d'un utilisateur
  static async getUserLikes(userId: string, deviceId?: string): Promise<{ success: boolean; data?: string[]; error?: string }> {
    try {
      let q;
      
      if (userId) {
        q = query(
          collection(db, LIKES_COLLECTION),
          where('userId', '==', userId)
        );
      } else if (deviceId) {
        q = query(
          collection(db, LIKES_COLLECTION),
          where('deviceId', '==', deviceId)
        );
      } else {
        return { success: false, error: 'UserId ou deviceId requis' };
      }
      
      const querySnapshot = await getDocs(q);
      
      const prayerIds: string[] = querySnapshot.docs.map(doc => doc.data().prayerId);
      
      return { success: true, data: prayerIds };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des likes utilisateur:', error);
      return { success: false, error: error.message };
    }
  }

  // Basculer un like (toggle)
  static async toggleLike(prayerId: string, userId: string, deviceId?: string): Promise<{ success: boolean; isLiked?: boolean; error?: string }> {
    try {
      const existingLike = await this.getUserLike(prayerId, userId, deviceId);
      
      if (existingLike.success && existingLike.data) {
        // Si déjà liké, supprimer le like
        const result = await this.removeLike(prayerId, userId, deviceId);
        return { ...result, isLiked: false };
      } else {
        // Si pas encore liké, ajouter le like
        const result = await this.addLike(prayerId, userId, deviceId);
        return { ...result, isLiked: true };
      }
    } catch (error: any) {
      console.error('Erreur lors du toggle du like:', error);
      return { success: false, error: error.message };
    }
  }
}
