import { useAuth } from '@/contexts/AuthContext';
import { LikeService } from '@/services/likeService';
import { useCallback, useEffect, useState } from 'react';

export interface UseLikesResult {
  likedPrayers: Set<string>;
  likeCounts: { [prayerId: string]: number };
  loading: boolean;
  error: string | null;
  toggleLike: (
    prayerId: string
  ) => Promise<{ success: boolean; isLiked?: boolean; error?: string }>;
  isLiked: (prayerId: string) => boolean;
  loadUserLikes: () => Promise<void>;
  getLikeCount: (prayerId: string) => Promise<{ success: boolean; count?: number; error?: string }>;
  refreshLikeCount: (prayerId: string) => Promise<void>;
}

export function useLikes(): UseLikesResult {
  const { user, firebaseUser, isLoading } = useAuth();
  const [likedPrayers, setLikedPrayers] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<{ [prayerId: string]: number }>({});
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
    // Attendre que l'authentification soit prête
    if (isLoading) {
      return; // Ne rien faire si l'auth est encore en cours
    }

    const userId = getCurrentUserId();
    if (!userId) {
      // Ne pas afficher d'erreur si l'auth n'est simplement pas encore prête
      setError(null);
      setLikedPrayers(new Set()); // Reset à vide
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
  }, [getCurrentUserId, isLoading]);

  // Recharger les likes quand l'utilisateur change ou quand l'auth est prête
  useEffect(() => {
    if (!isLoading) {
      loadUserLikes();
    }
  }, [loadUserLikes, isLoading]);

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

          // Mettre à jour le compteur de likes
          setLikeCounts(current => ({
            ...current,
            [prayerId]: (current[prayerId] || 0) + (result.isLiked ? 1 : -1),
          }));
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

  // Rafraîchir le compteur de likes pour une prière spécifique
  const refreshLikeCount = useCallback(async (prayerId: string) => {
    try {
      const result = await LikeService.getPrayerLikes(prayerId);
      if (result.success && typeof result.count === 'number') {
        setLikeCounts(current => ({
          ...current,
          [prayerId]: result.count || 0,
        }));
      }
    } catch (err: any) {
      console.error('Error refreshing like count:', err);
    }
  }, []);

  return {
    likedPrayers,
    likeCounts,
    loading,
    error,
    toggleLike,
    isLiked,
    loadUserLikes,
    getLikeCount,
    refreshLikeCount,
  };
}
