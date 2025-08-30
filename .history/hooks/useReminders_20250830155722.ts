import { db } from '@/config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface Reminder {
  id?: string;
  title: string;
  description: string;
  arabic: string;
  transliteration: string;
  translation: string;
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
        const q = query(collection(db, 'reminders'), orderBy('order'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Reminder);
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
