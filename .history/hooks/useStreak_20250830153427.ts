import { useAuth } from '@/contexts/AuthContext';
import { StreakData, StreakService } from '@/services/streakService';
import { useCallback, useEffect, useState } from 'react';

export interface UseStreakResult {
  streakData: StreakData | null;
  loading: boolean;
  error: string | null;
  recordPrayer: () => Promise<{ success: boolean; error?: string }>;
  refreshStreak: () => Promise<void>;
  getWeeklyProgress: () => { date: string; completed: boolean; dayName: string }[];
}

export function useStreak(): UseStreakResult {
  const { user, firebaseUser } = useAuth();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'ID utilisateur Firebase
  const getCurrentUserId = useCallback((): string | null => {
    if (user?.uid) return user.uid;
    if (firebaseUser?.uid) return firebaseUser.uid;
    return null;
  }, [user, firebaseUser]);

  // Charger le streak de l'utilisateur
  const loadStreak = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      setError('Utilisateur non connecté');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await StreakService.getUserStreak(userId, userId); // Utiliser userId comme deviceId aussi

      if (result.success && result.data) {
        setStreakData(result.data);
      } else {
        setError(result.error || 'Erreur lors du chargement du streak');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  }, [getCurrentUserId]);

  // Charger le streak quand l'utilisateur change
  useEffect(() => {
    loadStreak();
  }, [loadStreak]);

  // Enregistrer une prière et mettre à jour le streak
  const recordPrayer = useCallback(async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Utilisateur non connecté' };
    }

    try {
      const result = await StreakService.recordPrayerSession(userId, userId);

      if (result.success && result.data) {
        // Mettre à jour le streak local
        setStreakData(result.data.streak);
        return { success: true };
      } else {
        return { success: false, error: result.error || "Erreur lors de l'enregistrement" };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur inattendue' };
    }
  }, [getCurrentUserId]);

  // Rafraîchir le streak
  const refreshStreak = useCallback(async () => {
    await loadStreak();
  }, [loadStreak]);

  // Obtenir la progression hebdomadaire
  const getWeeklyProgress = useCallback(() => {
    if (!streakData) return [];

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weekProgress = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const dateString = date.toISOString().split('T')[0];
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });

      // Vérifier si cette date est dans le streak
      const completed =
        streakData.lastPrayerDate &&
        new Date(streakData.lastPrayerDate).toDateString() === date.toDateString();

      weekProgress.push({
        date: dateString,
        completed: !!completed,
        dayName,
      });
    }

    return weekProgress;
  }, [streakData]);

  return {
    streakData,
    loading,
    error,
    recordPrayer,
    refreshStreak,
    getWeeklyProgress,
  };
}
