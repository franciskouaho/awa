import firestore from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';

export interface Reminder {
  id?: string;
  title: string;
  description: string;
  time: string;
  order: number;
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const snapshot = await firestore().collection('reminders').orderBy('order').get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
        setReminders(data);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement des rappels');
      } finally {
        setLoading(false);
      }
    };
    fetchReminders();
  }, []);

  return { reminders, loading, error };
}
