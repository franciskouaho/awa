import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function FirebaseTest() {
  const colorScheme = useColorScheme();
  const { addPrayer, prayers, loadPrayers, loading, error } = usePrayers();
  
  const [testName, setTestName] = useState('');

  const handleTestAdd = async () => {
    if (!testName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom');
      return;
    }

    const testPrayer = {
      name: testName.trim(),
      age: 50,
      deathDate: new Date(),
      location: 'Test, Monde',
      personalMessage: 'Ceci est un test Firebase',
      prayerCount: 0,
    };

    const result = await addPrayer(testPrayer);
    
    if (result.success) {
      Alert.alert('Succès', 'Prière de test ajoutée!');
      setTestName('');
    } else {
      Alert.alert('Erreur', result.error || 'Erreur inconnue');
    }
  };

  const handleTestLoad = async () => {
    await loadPrayers();
    Alert.alert('Info', `${prayers.length} prières chargées`);
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
        Test Firebase
      </Text>
      
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            borderColor: Colors[colorScheme ?? 'light'].border,
            color: Colors[colorScheme ?? 'light'].text,
          }
        ]}
        value={testName}
        onChangeText={setTestName}
        placeholder="Nom de test"
        placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
      />
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
        onPress={handleTestAdd}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>
          {loading ? 'Ajout...' : 'Ajouter prière test'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
        onPress={handleTestLoad}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>
          Charger prières ({prayers.length})
        </Text>
      </TouchableOpacity>
      
      {error && (
        <Text style={[styles.error, { color: Colors[colorScheme ?? 'light'].error }]}>
          Erreur: {error}
        </Text>
      )}
      
      <View style={styles.status}>
        <Text style={[styles.statusText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          État: {loading ? 'Chargement...' : 'Prêt'}
        </Text>
        <Text style={[styles.statusText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Prières: {prayers.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  },
  status: {
    marginTop: 30,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    marginBottom: 5,
  },
});
