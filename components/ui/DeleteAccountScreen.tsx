import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface DeleteAccountScreenProps {
  onBack: () => void;
}

export default function DeleteAccountScreen({ onBack }: DeleteAccountScreenProps) {
  const colorScheme = useColorScheme();
  const { deleteAccount } = useAuth();
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'SUPPRIMER') {
      Alert.alert(
        'Erreur',
        'Veuillez taper "SUPPRIMER" pour confirmer la suppression de votre compte.'
      );
      return;
    }

    Alert.alert(
      'Supprimer le compte',
      'Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible et toutes vos données seront perdues.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteAccount();
              Alert.alert(
                'Compte supprimé',
                "Votre compte a été supprimé avec succès. Merci d'avoir utilisé AWA.",
                [{ text: 'OK' }]
              );
            } catch (error: any) {
              console.error('Error deleting account:', error);
              Alert.alert(
                'Erreur',
                error.message || 'Impossible de supprimer le compte. Veuillez réessayer.'
              );
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <IconSymbol
            name="chevron.left"
            size={20}
            color={Colors[colorScheme ?? 'light'].textSecondary}
          />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Retour
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Supprimer le compte
        </Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color="#FF6B6B" />
          <Text style={[styles.warningTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Attention
          </Text>
          <Text
            style={[styles.warningText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
          >
            La suppression de votre compte est définitive. Toutes vos données, prières et paramètres
            seront définitivement supprimés.
          </Text>
        </View>

        <View style={styles.confirmationContainer}>
          <Text style={[styles.confirmationLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
            Pour confirmer, tapez &quot;SUPPRIMER&quot; ci-dessous :
          </Text>
          <TextInput
            style={[
              styles.confirmationInput,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                color: Colors[colorScheme ?? 'light'].text,
                borderColor: Colors[colorScheme ?? 'light'].border,
              },
            ]}
            value={confirmationText}
            onChangeText={setConfirmationText}
            placeholder="SUPPRIMER"
            placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.deleteButton,
            {
              backgroundColor:
                confirmationText === 'SUPPRIMER'
                  ? '#FF6B6B'
                  : Colors[colorScheme ?? 'light'].border,
            },
          ]}
          onPress={handleDeleteAccount}
          disabled={confirmationText !== 'SUPPRIMER' || isDeleting}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>
            {isDeleting ? 'Suppression...' : 'Supprimer définitivement mon compte'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  warningContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  warningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  warningText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  confirmationContainer: {
    marginVertical: 32,
  },
  confirmationLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  confirmationInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
