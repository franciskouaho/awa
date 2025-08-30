import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrayerDebug() {
  const colorScheme = useColorScheme();
  const { prayers, loading, error, loadPrayers } = usePrayers();
  const { user, firebaseUser } = useAuth();
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  const handleTestLoad = async () => {
    console.log('🧪 PrayerDebug: Test de chargement manuel');
    setDebugInfo('Chargement en cours...');

    try {
      await loadPrayers();
      setDebugInfo(`Chargement terminé. ${prayers.length} prières trouvées.`);
    } catch (error) {
      setDebugInfo(`Erreur: ${error}`);
    }
  };

  const showUserInfo = () => {
    const currentUserId = user?.uid || firebaseUser?.uid;
    Alert.alert(
      'Info Utilisateur',
      `User UID: ${user?.uid || 'null'}\nFirebase UID: ${firebaseUser?.uid || 'null'}\nCurrent User ID: ${currentUserId || 'null'}`
    );
  };

  return (
    <View
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
    >
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Débogage Prières
      </Text>

      <View style={styles.infoSection}>
        <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
          État: {loading ? 'Chargement...' : 'Prêt'}
        </Text>
        <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Prières: {prayers.length}
        </Text>
        <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Erreur: {error || 'Aucune'}
        </Text>
        <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
          Utilisateur connecté: {user || firebaseUser ? 'Oui' : 'Non'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
        onPress={handleTestLoad}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>
          {loading ? 'Chargement...' : 'Recharger Prières'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
        onPress={showUserInfo}
      >
        <Text style={[styles.buttonText, { color: 'white' }]}>Info Utilisateur</Text>
      </TouchableOpacity>

      <Text style={[styles.debugText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {debugInfo}
      </Text>

      {prayers.length > 0 && (
        <View style={styles.prayersList}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Prières trouvées:
          </Text>
          {prayers.map((prayer, index) => (
            <View
              key={prayer.id || index}
              style={[
                styles.prayerItem,
                { backgroundColor: Colors[colorScheme ?? 'light'].surface },
              ]}
            >
              <Text style={[styles.prayerName, { color: Colors[colorScheme ?? 'light'].text }]}>
                {prayer.name} (ID: {prayer.id})
              </Text>
              <Text
                style={[
                  styles.prayerDetails,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}
              >
                Créateur: {prayer.creatorId || 'Non défini'}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoSection: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  debugText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
  prayersList: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  prayerItem: {
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  prayerDetails: {
    fontSize: 14,
  },
});
