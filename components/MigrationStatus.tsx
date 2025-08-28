import { migrateAllContent } from '@/scripts/migrateContent';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

interface MigrationStatusProps {
  onMigrationComplete?: () => void;
}

export function MigrationStatus({ onMigrationComplete }: MigrationStatusProps) {
  const [migrationStatus, setMigrationStatus] = useState<'pending' | 'running' | 'completed' | 'error'>('pending');
  const [statusMessage, setStatusMessage] = useState('Préparation de la migration...');

  useEffect(() => {
    const runMigration = async () => {
      setMigrationStatus('running');
      setStatusMessage('Migration du contenu vers Firebase...');

      try {
        await migrateAllContent();
        setMigrationStatus('completed');
        setStatusMessage('Migration terminée avec succès !');
        onMigrationComplete?.();
      } catch (error) {
        console.error('Erreur lors de la migration:', error);
        setMigrationStatus('error');
        setStatusMessage('Erreur lors de la migration. Vérifiez votre connexion Firebase.');
        
        Alert.alert(
          'Erreur de migration',
          'Impossible de migrer les données vers Firebase. L\'application utilisera les données locales.',
          [{ text: 'OK', onPress: onMigrationComplete }]
        );
      }
    };

    // Délai pour permettre à Firebase de s'initialiser
    const timer = setTimeout(runMigration, 1000);
    return () => clearTimeout(timer);
  }, [onMigrationComplete]);

  if (migrationStatus === 'completed') {
    return null; // Ne rien afficher si la migration est terminée
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
