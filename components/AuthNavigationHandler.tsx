import { useAuth } from '@/contexts/AuthContext';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthNavigationHandler({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  // Afficher un loader pendant le chargement de l'état d'authentification
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2D5A4A" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBF9',
  },
});
