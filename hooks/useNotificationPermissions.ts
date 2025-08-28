import { NotificationPermissions, useNotifications } from '@/services/notificationService';
import { useEffect, useState } from 'react';

export function useNotificationPermissions() {
  const [permissions, setPermissions] = useState<NotificationPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getPermissions, requestPermissions } = useNotifications();

  // Charger les permissions au montage du composant
  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const perms = await getPermissions();
      setPermissions(perms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      const perms = await requestPermissions();
      setPermissions(perms);
      return perms.granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la demande de permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    permissions,
    isLoading,
    error,
    requestPermission,
    refreshPermissions: loadPermissions,
  };
}
