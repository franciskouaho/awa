import { useAuth } from '@/contexts/AuthContext';
import { LikeService } from '@/services/likeService';
import { useCallback, useEffect, useState } from 'react';

export interface UseLikesResult {
  likedPrayers: Set<string>;
  loading: boolean;
  error: string | null;
  toggleLike: (
    prayerId: string
  ) => Promise<{ success: boolean; isLiked?: boolean; error?: string }>;
  isLiked: (prayerId: string) => boolean;
  loadUserLikes: () => Promise<void>;
  getLikeCount: (prayerId: string) => Promise<{ success: boolean; count?: number; error?: string }>;
}

export function useLikes(): UseLikesResult {
  const { user, firebaseUser } = useAuth();
  const [likedPrayers, setLikedPrayers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'ID utilisateur Firebase
  const getCurrentUserId = useCallback((): string | null => {
    if (user?.uid) return user.uid;
    if (firebaseUser?.uid) return firebaseUser.uid;
    return null;
  }, [user, firebaseUser]);

  // Charger les likes de l'utilisateur
  const loadUserLikes = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await LikeService.getUserLikes(userId, userId); // Utiliser userId comme deviceId aussi

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
  }, [getCurrentUserId]);

  // Recharger les likes quand l'utilisateur change
  useEffect(() => {
    loadUserLikes();
  }, [loadUserLikes]);

  // Basculer un like
  const toggleLike = useCallback(
    async (prayerId: string) => {
      const userId = getCurrentUserId();
      if (!userId) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      try {
        const result = await LikeService.toggleLike(prayerId, userId, userId);

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
    },
    [getCurrentUserId]
  );

  // Vérifier si une prière est likée
  const isLiked = useCallback(
    (prayerId: string) => {
      return likedPrayers.has(prayerId);
    },
    [likedPrayers]
  );

  // Obtenir le nombre de likes d'une prière
  const getLikeCount = useCallback(async (prayerId: string) => {
    try {
      const result = await LikeService.getPrayerLikes(prayerId);
      return result;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Erreur lors de la récupération du nombre de likes',
      };
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
