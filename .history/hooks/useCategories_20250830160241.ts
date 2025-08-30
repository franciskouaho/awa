import { db } from '@/config/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export interface Category {
  id: string;
  title: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  order: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'categories'), orderBy('order'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Category);
        setCategories(data);
        setError(null);
      } catch (e: any) {
        setError(e.message || 'Erreur lors du chargement des catégories');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return { categories, loading, error };
}
