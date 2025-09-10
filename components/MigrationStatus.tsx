import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { migrateAllContent } from '@/scripts/migrateContent';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

interface MigrationStatusProps {
  onMigrationComplete?: () => void;
}

export function MigrationStatus({ onMigrationComplete }: MigrationStatusProps) {
  const [migrationStatus, setMigrationStatus] = useState<
    'pending' | 'running' | 'completed' | 'error' | 'skipped'
  >('pending');
  const [statusMessage, setStatusMessage] = useState('Préparation de la migration...');
  const { flags, isLoading } = useFeatureFlags();

  useEffect(() => {
    const runMigration = async () => {
      // Vérifier si la migration est déjà faite
      const migrationDone = await AsyncStorage.getItem('migration_completed');
      if (migrationDone === 'true') {
        setMigrationStatus('completed');
        setStatusMessage('Migration déjà effectuée');
        onMigrationComplete?.();
        return;
      }

      // Vérifier si Firebase est activé
      if (!flags.useFirebaseContent) {
        setMigrationStatus('skipped');
        setStatusMessage('Utilisation des données locales');
        onMigrationComplete?.();
        return;
      }

      setMigrationStatus('running');
      setStatusMessage('Migration du contenu vers Firebase...');

      try {
        const results = await migrateAllContent();

        if (results.totalSuccess) {
          setMigrationStatus('completed');
          setStatusMessage('Migration terminée avec succès !');
          await AsyncStorage.setItem('migration_completed', 'true');
        } else {
          setMigrationStatus('error');
          setStatusMessage('Migration partiellement échouée. Utilisation des données locales.');
          console.warn('Migration partielle:', results);
        }

        onMigrationComplete?.();
      } catch (error) {
        console.error('Erreur lors de la migration:', error);
        setMigrationStatus('error');
        setStatusMessage('Erreur lors de la migration. Utilisation des données locales.');

        Alert.alert(
          'Migration échouée',
          "Impossible de migrer les données vers Firebase. L'application utilisera les données locales.",
          [{ text: 'OK', onPress: onMigrationComplete }]
        );
      }
    };

    if (!isLoading) {
      // Délai pour permettre à Firebase de s'initialiser
      const timer = setTimeout(runMigration, 1000);
      return () => clearTimeout(timer);
    }

    // Retourner une fonction de nettoyage même si isLoading est true
    return () => {};
  }, [flags, isLoading, onMigrationComplete]);

  if (migrationStatus === 'completed' || migrationStatus === 'skipped') {
    return null; // Ne rien afficher si la migration est terminée ou ignorée
  }

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{statusMessage}</Text>
      {migrationStatus === 'running' && (
        <View style={styles.loadingDots}>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.dot}>•</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    fontSize: 20,
    color: '#2D5A4A',
    marginHorizontal: 2,
  },
});
