import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserCreatedPrayers } from '@/hooks/useUserCreatedPrayers';
import { PrayerService } from '@/services/prayerService';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function PrayersDebug() {
  const colorScheme = useColorScheme();
  const { user, firebaseUser } = useAuth();
  const { prayers, loading, error, refreshPrayers } = useUserCreatedPrayers();
  const [allPrayers, setAllPrayers] = useState<any[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    loadDebugInfo();
  }, [user, firebaseUser]);

  const loadDebugInfo = async () => {
    try {
      // Récupérer toutes les prières
      const allPrayersResult = await PrayerService.getAllPrayers();
      if (allPrayersResult.success && allPrayersResult.data) {
        setAllPrayers(allPrayersResult.data);
      }

      // Informations de débogage
      const info = {
        contextUser: user
          ? {
              uid: user.uid,
              email: user.email,
              name: user.name,
            }
          : null,
        firebaseUser: firebaseUser
          ? {
              uid: firebaseUser.uid,
              isAnonymous: firebaseUser.isAnonymous,
            }
          : null,
        prayersCount: prayers.length,
        allPrayersCount: allPrayers.length,
        prayersWithCreatorId: allPrayers.filter(p => p.creatorId).length,
        prayersWithoutCreatorId: allPrayers.filter(p => !p.creatorId).length,
        uniqueCreatorIds: [...new Set(allPrayers.filter(p => p.creatorId).map(p => p.creatorId))],
      };

      setDebugInfo(info);
    } catch (error) {
      console.error('Erreur lors du chargement des informations de débogage:', error);
    }
  };

  const testUserPrayers = async () => {
    try {
      const userId = user?.uid || firebaseUser?.uid;
      if (!userId) {
        Alert.alert('Erreur', 'Aucun utilisateur connecté');
        return;
      }

      const result = await PrayerService.getPrayersByCreator(userId);
      if (result.success) {
        Alert.alert(
          'Test réussi',
          `Trouvé ${result.data?.length || 0} prières pour l'utilisateur ${userId}`
        );
      } else {
        Alert.alert('Erreur', result.error || 'Erreur lors du test');
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Erreur inattendue');
    }
  };

  const refreshAll = async () => {
    await Promise.all([refreshPrayers(), loadDebugInfo()]);
  };

  if (!debugInfo) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement des informations de débogage...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Débogage des Prières</Text>

      {/* Informations utilisateur */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 Utilisateur</Text>
        <Text style={styles.detail}>
          Contexte User: {debugInfo.contextUser ? 'Présent' : 'Absent'}
        </Text>
        {debugInfo.contextUser && (
          <View style={styles.userDetails}>
            <Text style={styles.detail}>UID: {debugInfo.contextUser.uid}</Text>
            <Text style={styles.detail}>Email: {debugInfo.contextUser.email}</Text>
            <Text style={styles.detail}>Nom: {debugInfo.contextUser.name}</Text>
          </View>
        )}

        <Text style={styles.detail}>
          Firebase User: {debugInfo.firebaseUser ? 'Présent' : 'Absent'}
        </Text>
        {debugInfo.firebaseUser && (
          <View style={styles.userDetails}>
            <Text style={styles.detail}>UID: {debugInfo.firebaseUser.uid}</Text>
            <Text style={styles.detail}>
              Anonyme: {debugInfo.firebaseUser.isAnonymous ? 'Oui' : 'Non'}
            </Text>
          </View>
        )}
      </View>

      {/* Statistiques des prières */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Statistiques</Text>
        <Text style={styles.detail}>Vos prières: {debugInfo.prayersCount}</Text>
        <Text style={styles.detail}>Total prières: {debugInfo.allPrayersCount}</Text>
        <Text style={styles.detail}>Avec creatorId: {debugInfo.prayersWithCreatorId}</Text>
        <Text style={styles.detail}>Sans creatorId: {debugInfo.prayersWithoutCreatorId}</Text>
      </View>

      {/* IDs des créateurs uniques */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆔 IDs des Créateurs</Text>
        {debugInfo.uniqueCreatorIds.length > 0 ? (
          debugInfo.uniqueCreatorIds.map((creatorId: string, index: number) => (
            <Text key={index} style={styles.detail}>
              {creatorId}
            </Text>
          ))
        ) : (
          <Text style={styles.detail}>Aucun creatorId trouvé</Text>
        )}
      </View>

      {/* Vos prières */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🙏 Vos Prières</Text>
        {loading ? (
          <Text style={styles.detail}>Chargement...</Text>
        ) : error ? (
          <Text style={[styles.detail, styles.error]}>{error}</Text>
        ) : prayers.length === 0 ? (
          <Text style={styles.detail}>Aucune prière trouvée</Text>
        ) : (
          prayers.map((prayer, index) => (
            <View key={prayer.id || index} style={styles.prayerItem}>
              <Text style={styles.prayerName}>{prayer.name}</Text>
              <Text style={styles.prayerDetail}>ID: {prayer.id}</Text>
              <Text style={styles.prayerDetail}>Creator ID: {prayer.creatorId}</Text>
              <Text style={styles.prayerDetail}>
                Créée le: {prayer.createdAt?.toLocaleDateString()}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠️ Actions</Text>

        <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={testUserPrayers}>
          <Text style={styles.buttonText}>🧪 Tester la récupération</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={refreshAll}>
          <Text style={styles.buttonText}>🔄 Actualiser tout</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.infoButton]} onPress={loadDebugInfo}>
          <Text style={styles.buttonText}>📊 Recharger les infos</Text>
        </TouchableOpacity>
      </View>

      {/* Détails de toutes les prières */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Toutes les Prières</Text>
        {allPrayers.map((prayer, index) => (
          <View key={prayer.id || index} style={styles.prayerItem}>
            <Text style={styles.prayerName}>{prayer.name}</Text>
            <Text style={styles.prayerDetail}>ID: {prayer.id}</Text>
            <Text style={styles.prayerDetail}>Creator ID: {prayer.creatorId || 'Aucun'}</Text>
            <Text style={styles.prayerDetail}>
              Créée le: {prayer.createdAt?.toLocaleDateString()}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userDetails: {
    marginTop: 8,
    paddingLeft: 16,
    borderLeftWidth: 2,
    borderLeftColor: '#e0e0e0',
  },
  prayerItem: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  prayerDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007bff',
  },
  secondaryButton: {
    backgroundColor: '#28a745',
  },
  infoButton: {
    backgroundColor: '#17a2b8',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  error: {
    color: '#dc3545',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
