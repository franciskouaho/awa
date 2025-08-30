import { db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface CategoryContextType {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  toggleCategory: (categoryId: string) => void;
  isCategorySelected: (categoryId: string) => boolean;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedCategories, setSelectedCategoriesState] = useState<string[]>(['prayers']);

  // Charger les catégories sélectionnées au montage
  useEffect(() => {
    const loadSelectedCategories = async () => {
      try {
        // 1. Charger depuis AsyncStorage (fallback local)
        const saved = await AsyncStorage.getItem('selectedCategories');
        if (saved) {
          setSelectedCategoriesState(JSON.parse(saved));
        }
        // 2. Charger depuis Firestore (si userId dispo)
        if (user?.uid) {
          const ref = doc(db, 'users', user.uid, 'settings', 'categories');
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.selectedCategories) {
              setSelectedCategoriesState(data.selectedCategories);
              // Met à jour le local aussi
              AsyncStorage.setItem('selectedCategories', JSON.stringify(data.selectedCategories));
            }
          }
        }
      } catch (e) {
        console.log('Erreur chargement selectedCategories:', e);
      }
    };
    loadSelectedCategories();
  }, [user?.uid]);

  const setSelectedCategories = async (categories: string[]) => {
    setSelectedCategoriesState(categories);
    try {
      // Sauvegarder localement
      await AsyncStorage.setItem('selectedCategories', JSON.stringify(categories));
      // Sauvegarder sur Firestore
      if (user?.uid) {
        const ref = doc(db, 'users', user.uid, 'settings', 'categories');
        await setDoc(ref, { selectedCategories: categories });
      }
    } catch (e) {
      console.log('Erreur sauvegarde selectedCategories:', e);
    }
  };

  const toggleCategory = async (categoryId: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId];

      // Sauvegarder immédiatement
      setSelectedCategories(newCategories);
      return newCategories;
    });
  };

  const isCategorySelected = (categoryId: string) => {
    return selectedCategories.includes(categoryId);
  };

  return (
    <CategoryContext.Provider
      value={{
        selectedCategories,
        setSelectedCategories,
        toggleCategory,
        isCategorySelected,
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
}
