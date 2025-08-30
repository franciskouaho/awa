import { auth } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { clearCacheAndRestart, fixUserIds } from '@/scripts/fixUserIds';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function UserIdDiagnostic() {
  const { user, firebaseUser, syncFirebaseUid } = useAuth();
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    runDiagnostic();
  }, [user, firebaseUser]);

  const runDiagnostic = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      const userEmail = await AsyncStorage.getItem('userEmail');
      const firebaseUid = await AsyncStorage.getItem('firebaseUid');
      const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');

      const data = {
        localUser: user ? JSON.parse(user) : null,
        userEmail,
        firebaseUid,
        onboardingCompleted,
        firebaseCurrentUser: auth.currentUser
          ? {
              uid: auth.currentUser.uid,
              isAnonymous: auth.currentUser.isAnonymous,
            }
          : null,
        contextUser: user
          ? {
              uid: user.uid,
              email: user.email,
              name: user.name,
              onboardingCompleted: user.onboardingCompleted,
            }
          : null,
        contextFirebaseUser: firebaseUser
          ? {
              uid: firebaseUser.uid,
              isAnonymous: firebaseUser.isAnonymous,
            }
          : null,
      };

      setDiagnosticData(data);
    } catch (error) {
      console.error('Error running diagnostic:', error);
    }
  };

  const handleFixUserIds = async () => {
    try {
      setIsLoading(true);
      Alert.alert(
        'Correction des IDs',
        'Voulez-vous corriger automatiquement les IDs utilisateur ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Corriger',
            onPress: async () => {
              try {
                const success = await fixUserIds();
                if (success) {
                  Alert.alert('Succès', 'Les IDs utilisateur ont été corrigés !');
                  await runDiagnostic();
                } else {
                  Alert.alert(
                    'Erreur',
                    'La correction a échoué. Vérifiez la console pour plus de détails.'
                  );
                }
              } catch (error) {
                Alert.alert('Erreur', `Erreur lors de la correction: ${error}`);
              }
            },
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearCache = async () => {
    try {
      setIsLoading(true);
      Alert.alert(
        'Nettoyage du cache',
        'ATTENTION: Cela va supprimer toutes les données locales. Voulez-vous continuer ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Nettoyer',
            style: 'destructive',
            onPress: async () => {
              try {
                await clearCacheAndRestart();
                Alert.alert('Succès', "Le cache a été nettoyé. Redémarrez l'application.");
                await runDiagnostic();
              } catch (error) {
                Alert.alert('Erreur', `Erreur lors du nettoyage: ${error}`);
              }
            },
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncFirebaseUid = async () => {
    try {
      setIsLoading(true);
      await syncFirebaseUid();
      Alert.alert('Succès', 'ID Firebase synchronisé !');
      await runDiagnostic();
    } catch (error) {
      Alert.alert('Erreur', `Erreur lors de la synchronisation: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (isConsistent: boolean) => {
    return isConsistent ? '#4CAF50' : '#F44336';
  };

  const getStatusText = (isConsistent: boolean) => {
    return isConsistent ? '✅ Cohérent' : '❌ Incohérent';
  };

  if (!diagnosticData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Chargement du diagnostic...</Text>
      </View>
    );
  }

  const localUid = diagnosticData.localUser?.uid;
  const firebaseUid = diagnosticData.firebaseUid;
  const currentFirebaseUid = diagnosticData.firebaseCurrentUser?.uid;
  const contextUid = diagnosticData.contextUser?.uid;

  const isLocalConsistent = localUid === firebaseUid;
  const isFirebaseConsistent = firebaseUid === currentFirebaseUid;
  const isContextConsistent = contextUid === currentFirebaseUid;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Diagnostic des IDs Utilisateur</Text>

      {/* État général */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 État Général</Text>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Cache local ↔ Firebase UID:</Text>
          <Text style={[styles.status, { color: getStatusColor(isLocalConsistent) }]}>
            {getStatusText(isLocalConsistent)}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Firebase UID ↔ Utilisateur actuel:</Text>
          <Text style={[styles.status, { color: getStatusColor(isFirebaseConsistent) }]}>
            {getStatusText(isFirebaseConsistent)}
          </Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.label}>Contexte ↔ Firebase actuel:</Text>
          <Text style={[styles.status, { color: getStatusColor(isContextConsistent) }]}>
            {getStatusText(isContextConsistent)}
          </Text>
        </View>
      </View>

      {/* Détails du cache local */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Cache Local</Text>
        <Text style={styles.detail}>User: {diagnosticData.localUser ? 'Présent' : 'Absent'}</Text>
        <Text style={styles.detail}>Email: {diagnosticData.userEmail || 'Absent'}</Text>
        <Text style={styles.detail}>Firebase UID: {diagnosticData.firebaseUid || 'Absent'}</Text>
        <Text style={styles.detail}>
          Onboarding: {diagnosticData.onboardingCompleted || 'Absent'}
        </Text>

        {diagnosticData.localUser && (
          <View style={styles.userDetails}>
            <Text style={styles.detail}>ID: {diagnosticData.localUser.uid}</Text>
            <Text style={styles.detail}>Nom: {diagnosticData.localUser.name}</Text>
            <Text style={styles.detail}>Email: {diagnosticData.localUser.email}</Text>
          </View>
        )}
      </View>

      {/* Détails Firebase */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Firebase</Text>
        <Text style={styles.detail}>
          Utilisateur actuel: {diagnosticData.firebaseCurrentUser ? 'Connecté' : 'Non connecté'}
        </Text>
        {diagnosticData.firebaseCurrentUser && (
          <View style={styles.userDetails}>
            <Text style={styles.detail}>UID: {diagnosticData.firebaseCurrentUser.uid}</Text>
            <Text style={styles.detail}>
              Anonyme: {diagnosticData.firebaseCurrentUser.isAnonymous ? 'Oui' : 'Non'}
            </Text>
          </View>
        )}
      </View>

      {/* Contexte d'authentification */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎭 Contexte d'Authentification</Text>
        <Text style={styles.detail}>User: {diagnosticData.contextUser ? 'Présent' : 'Absent'}</Text>
        <Text style={styles.detail}>
          Firebase User: {diagnosticData.contextFirebaseUser ? 'Présent' : 'Absent'}
        </Text>

        {diagnosticData.contextUser && (
          <View style={styles.userDetails}>
            <Text style={styles.detail}>ID: {diagnosticData.contextUser.uid}</Text>
            <Text style={styles.detail}>Nom: {diagnosticData.contextUser.name}</Text>
            <Text style={styles.detail}>Email: {diagnosticData.contextUser.email}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠️ Actions</Text>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleFixUserIds}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Correction...' : '🔧 Corriger les IDs'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleSyncFirebaseUid}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Synchronisation...' : '🔄 Synchroniser Firebase UID'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={handleClearCache}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Nettoyage...' : '🧹 Nettoyer le cache'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.infoButton]}
          onPress={runDiagnostic}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Actualisation...' : '🔄 Actualiser le diagnostic'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Résumé des problèmes */}
      {(!isLocalConsistent || !isFirebaseConsistent || !isContextConsistent) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Problèmes Détectés</Text>
          {!isLocalConsistent && (
            <Text style={styles.problem}>
              • L'ID utilisateur dans le cache local ne correspond pas à l'ID Firebase stocké
            </Text>
          )}
          {!isFirebaseConsistent && (
            <Text style={styles.problem}>
              • L'ID Firebase stocké ne correspond pas à l'utilisateur Firebase actuel
            </Text>
          )}
          {!isContextConsistent && (
            <Text style={styles.problem}>
              • L'ID utilisateur dans le contexte ne correspond pas à l'utilisateur Firebase actuel
            </Text>
          )}
          <Text style={styles.solution}>
            💡 Solution: Utilisez le bouton "Corriger les IDs" pour résoudre automatiquement ces
            problèmes.
          </Text>
        </View>
      )}
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
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
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
  button: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  infoButton: {
    backgroundColor: '#FF9800',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  problem: {
    fontSize: 14,
    color: '#F44336',
    marginBottom: 8,
    paddingLeft: 8,
  },
  solution: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 8,
    fontStyle: 'italic',
  },
  loading: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
