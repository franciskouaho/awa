import { LikeService } from '@/services/likeService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { useCallback, useEffect, useState } from 'react';

export interface UseLikesResult {
  likedPrayers: Set<string>;
  loading: boolean;
  error: string | null;
  toggleLike: (prayerId: string) => Promise<{ success: boolean; isLiked?: boolean; error?: string }>;
  isLiked: (prayerId: string) => boolean;
  loadUserLikes: () => Promise<void>;
  getLikeCount: (prayerId: string) => Promise<{ success: boolean; count?: number; error?: string }>;
}

const USER_ID_KEY = 'user_id';

export function useLikes(): UseLikesResult {
  const [likedPrayers, setLikedPrayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');

  // Initialiser les IDs utilisateur et appareil
  useEffect(() => {
    const initializeIds = async () => {
      try {
        // Récupérer ou créer un ID utilisateur persistant
        let storedUserId = await AsyncStorage.getItem(USER_ID_KEY);
        if (!storedUserId) {
          storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await AsyncStorage.setItem(USER_ID_KEY, storedUserId);
        }
        setUserId(storedUserId);

        // Récupérer l'ID de l'appareil
        let appDeviceId = `device_${Date.now()}`;
        try {
          const androidId = await Application.getAndroidId();
          if (androidId) {
            appDeviceId = androidId;
          } else {
            const iosId = await Application.getIosIdForVendorAsync();
            if (iosId) {
              appDeviceId = iosId;
            }
          }
        } catch (error) {
          console.warn('Impossible de récupérer l\'ID de l\'appareil:', error);
        }
        setDeviceId(appDeviceId);

        // Charger les likes de l'utilisateur
        await loadUserLikes();
      } catch (error) {
        console.error('Erreur lors de l\'initialisation des IDs:', error);
      }
    };

    initializeIds();
  }, []);

  // Charger les likes de l'utilisateur
  const loadUserLikes = useCallback(async () => {
    if (!userId && !deviceId) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await LikeService.getUserLikes(userId, deviceId);
      
      if (result.success && result.data) {
        setLikedPrayers(new Set(result.data));
      } else {
        setError(result.error || 'Erreur lors du chargement des likes');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }, [userId, deviceId]);

  // Recharger les likes quand les IDs sont disponibles
  useEffect(() => {
    if (userId || deviceId) {
      loadUserLikes();
    }
  }, [userId, deviceId, loadUserLikes]);

  // Basculer un like
  const toggleLike = useCallback(async (prayerId: string) => {
    if (!userId && !deviceId) {
      return { success: false, error: 'IDs utilisateur non disponibles' };
    }

    try {
      const result = await LikeService.toggleLike(prayerId, userId, deviceId);
      
      if (result.success) {
        // Mettre à jour localement pour un feedback immédiat
        setLikedPrayers(current => {
          const newSet = new Set(current);
          if (result.isLiked) {
            newSet.add(prayerId);
          } else {
            newSet.delete(prayerId);
          }
          return newSet;
        });
      }
      
      return result;
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors du toggle du like' };
    }
  }, [userId, deviceId]);

  // Vérifier si une prière est likée
  const isLiked = useCallback((prayerId: string) => {
    return likedPrayers.has(prayerId);
  }, [likedPrayers]);

  // Obtenir le nombre de likes d'une prière
  const getLikeCount = useCallback(async (prayerId: string) => {
    try {
      const result = await LikeService.getPrayerLikes(prayerId);
      
      if (result.success) {
        return { success: true, count: result.count || 0 };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la récupération du nombre de likes' };
    }
  }, []);

  return {
    likedPrayers,
    loading,
    error,
    toggleLike,
    isLiked,
    loadUserLikes,
    getLikeCount,
  };
}
