import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth, useFirestore } from '@/hooks/useFirebase';

export default function FirebaseExample() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [prayerText, setPrayerText] = useState('');
  const { user, signIn, signUp, logout } = useAuth();
  const { addDocument, getCollection } = useFirestore();

  const handleSignIn = async () => {
    const result = await signIn(email, password);
    if (result.success) {
      Alert.alert('Succès', 'Connexion réussie !');
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  const handleSignUp = async () => {
    const result = await signUp(email, password);
    if (result.success) {
      Alert.alert('Succès', 'Compte créé avec succès !');
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      Alert.alert('Succès', 'Déconnexion réussie !');
    }
  };

  const addPrayer = async () => {
    if (!user) {
      Alert.alert('Erreur', 'Vous devez être connecté pour ajouter une prière');
      return;
    }

    const result = await addDocument('prayers', {
      text: prayerText,
      userId: user.uid,
      userEmail: user.email,
    });

    if (result.success) {
      Alert.alert('Succès', 'Prière ajoutée !');
      setPrayerText('');
    } else {
      Alert.alert('Erreur', result.error);
    }
  };

  const loadPrayers = async () => {
    const result = await getCollection('prayers', 'createdAt');
    if (result.success && result.data) {
      console.log('Prières:', result.data);
      Alert.alert('Succès', `${result.data.length} prières chargées (voir console)`);
    } else {
      Alert.alert('Erreur', result.error || 'Erreur lors du chargement');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase avec Expo</Text>

      {user ? (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Connecté en tant que: {user.email}</Text>

          <TextInput
            style={styles.input}
            placeholder="Texte de la prière"
            value={prayerText}
            onChangeText={setPrayerText}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={addPrayer}>
            <Text style={styles.buttonText}>Ajouter une prière</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={loadPrayers}>
            <Text style={styles.buttonText}>Charger les prières</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            <Text style={styles.buttonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  section: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});
