import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function PersonalizeScreen() {
  React.useEffect(() => {
    // Rediriger automatiquement vers l'écran de temps
    // ou implémenter la logique de personnalisation ici
    router.replace('/onboarding/time');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personnalisation</Text>
      <Text style={styles.subtitle}>Configuration de vos préférences...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
