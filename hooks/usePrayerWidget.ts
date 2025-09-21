import { PrayerData } from '@/services/prayerService';
import PrayerWidgetService, {
  ActivePrayerActivity,
  PrayerActivityState,
} from '@/services/prayerWidgetService';
import { useCallback, useEffect, useState } from 'react';

export interface UsePrayerWidgetResult {
  // État
  isSupported: boolean;
  activitiesEnabled: boolean;
  activeActivities: ActivePrayerActivity[];
  loading: boolean;
  error: string | null;

  // Actions
  startPrayerActivity: (prayerData: PrayerData) => Promise<string | null>;
  updatePrayerActivity: (activityId: string, prayerCount: number) => Promise<boolean>;
  endPrayerActivity: (activityId: string) => Promise<boolean>;
  refreshActiveActivities: () => Promise<void>;
  checkActivitiesEnabled: () => Promise<void>;
}

export function usePrayerWidget(): UsePrayerWidgetResult {
  const [isSupported, setIsSupported] = useState(false);
  const [activitiesEnabled, setActivitiesEnabled] = useState(false);
  const [activeActivities, setActiveActivities] = useState<ActivePrayerActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const widgetService = PrayerWidgetService.getInstance();

  // Vérifier le support et l'état des Live Activities
  const checkActivitiesEnabled = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const enabled = await widgetService.areActivitiesEnabled();
      setActivitiesEnabled(enabled);
      setIsSupported(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la vérification des Live Activities');
      setIsSupported(false);
    } finally {
      setLoading(false);
    }
  }, [widgetService]);

  // Démarrer une Live Activity pour une prière
  const startPrayerActivity = useCallback(
    async (prayerData: PrayerData): Promise<string | null> => {
      if (!isSupported || !activitiesEnabled) {
        console.warn('Live Activities non disponibles');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const widgetData = PrayerWidgetService.convertPrayerDataForWidget(prayerData);
        const activityId = await widgetService.startPrayerActivity(widgetData);

        if (activityId) {
          // Rafraîchir la liste des activités actives
          await refreshActiveActivities();
        }

        return activityId;
      } catch (err: any) {
        setError(err.message || 'Erreur lors du démarrage de la Live Activity');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [isSupported, activitiesEnabled, widgetService]
  );

  // Mettre à jour une Live Activity
  const updatePrayerActivity = useCallback(
    async (activityId: string, prayerCount: number): Promise<boolean> => {
      if (!isSupported) {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const state: PrayerActivityState = {
          prayerCount,
          lastPrayerTime: Date.now(),
          isActive: true,
        };

        const success = await widgetService.updatePrayerActivity(activityId, state);

        if (success) {
          // Rafraîchir la liste des activités actives
          await refreshActiveActivities();
        }

        return success;
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la mise à jour de la Live Activity');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isSupported, widgetService]
  );

  // Terminer une Live Activity
  const endPrayerActivity = useCallback(
    async (activityId: string): Promise<boolean> => {
      if (!isSupported) {
        return false;
      }

      setLoading(true);
      setError(null);

      try {
        const success = await widgetService.endPrayerActivity(activityId);

        if (success) {
          // Rafraîchir la liste des activités actives
          await refreshActiveActivities();
        }

        return success;
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la fin de la Live Activity');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [isSupported, widgetService]
  );

  // Rafraîchir la liste des activités actives
  const refreshActiveActivities = useCallback(async () => {
    if (!isSupported) {
      return;
    }

    try {
      const activities = await widgetService.getActiveActivities();
      setActiveActivities(activities);
    } catch (err: any) {
      console.error('Erreur lors du rafraîchissement des activités:', err);
    }
  }, [isSupported, widgetService]);

  // Initialisation
  useEffect(() => {
    checkActivitiesEnabled();
  }, [checkActivitiesEnabled]);

  return {
    isSupported,
    activitiesEnabled,
    activeActivities,
    loading,
    error,
    startPrayerActivity,
    updatePrayerActivity,
    endPrayerActivity,
    refreshActiveActivities,
    checkActivitiesEnabled,
  };
}
