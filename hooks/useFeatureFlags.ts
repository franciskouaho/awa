import { db } from '@/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface FeatureFlags {
  useFirebaseContent: boolean;
  enablePrayerFormulas: boolean;
  enableVerses: boolean;
  enableHadiths: boolean;
  migrationVersion: string;
}

const DEFAULT_FLAGS: FeatureFlags = {
  useFirebaseContent: false, // Désactivé par défaut pour les anciens utilisateurs
  enablePrayerFormulas: false,
  enableVerses: false,
  enableHadiths: false,
  migrationVersion: '1.0.0',
};

export function useFeatureFlags() {
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFeatureFlags();
  }, []);

  const loadFeatureFlags = async () => {
    try {
      // 1. Vérifier les flags locaux d'abord
      const localFlags = await AsyncStorage.getItem('featureFlags');
      if (localFlags) {
        const parsedFlags = JSON.parse(localFlags);
        setFlags(parsedFlags);
        setIsLoading(false);
        return;
      }

      // 2. Essayer de récupérer les flags depuis Firebase
      try {
        const flagsDoc = await getDoc(doc(db, 'config', 'featureFlags'));
        if (flagsDoc.exists()) {
          const firebaseFlags = flagsDoc.data() as FeatureFlags;
          setFlags(firebaseFlags);
          // Sauvegarder localement pour éviter les appels répétés
          await AsyncStorage.setItem('featureFlags', JSON.stringify(firebaseFlags));
        } else {
          // Pas de flags sur Firebase, utiliser les défauts
          setFlags(DEFAULT_FLAGS);
          await AsyncStorage.setItem('featureFlags', JSON.stringify(DEFAULT_FLAGS));
        }
      } catch (firebaseError) {
        console.log('Firebase non disponible, utilisation des flags par défaut');
        setFlags(DEFAULT_FLAGS);
        await AsyncStorage.setItem('featureFlags', JSON.stringify(DEFAULT_FLAGS));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des feature flags:', error);
      setFlags(DEFAULT_FLAGS);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFlag = async (key: keyof FeatureFlags, value: boolean | string) => {
    const newFlags = { ...flags, [key]: value };
    setFlags(newFlags);
    await AsyncStorage.setItem('featureFlags', JSON.stringify(newFlags));
  };

  const resetFlags = async () => {
    setFlags(DEFAULT_FLAGS);
    await AsyncStorage.setItem('featureFlags', JSON.stringify(DEFAULT_FLAGS));
  };

  return {
    flags,
    isLoading,
    updateFlag,
    resetFlags,
    loadFeatureFlags,
  };
}
