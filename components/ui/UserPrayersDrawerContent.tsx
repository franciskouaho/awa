import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserPrayers } from '@/hooks/useUserPrayers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserPrayersDrawerContentProps {
  onClose: () => void;
}

export default function UserPrayersDrawerContent({ onClose }: UserPrayersDrawerContentProps) {
  const colorScheme = useColorScheme();
  const { prayers, deletePrayer, loading, error } = useUserPrayers();
  // On suppose que l'ID utilisateur est stocké dans useUserPrayers
  const [userId, setUserId] = React.useState<string>('');
  React.useEffect(() => {
    // Récupérer l'ID utilisateur depuis AsyncStorage (même logique que useUserPrayers)
    import('@react-native-async-storage/async-storage').then(AsyncStorage => {
      AsyncStorage.default.getItem('user_id').then(id => {
        if (id) setUserId(id);
      });
    });
  }, []);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  // Confirmation avant suppression
  const handleDelete = (prayerId: string) => {
    Alert.alert(
      'Supprimer la prière',
      'Voulez-vous vraiment supprimer cette prière ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(prayerId);
            await deletePrayer(prayerId);
            setDeletingId(null);
          },
        },
      ]
    );
  };

  // Formatage date
  const formatDate = (date?: Date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header avec bouton Back et titre */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={[styles.backIcon, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>✕</Text>
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>Retour</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Mes Prières</Text>
      </View>
      {loading && (
        <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, textAlign: 'center', marginTop: 16 }}>Chargement...</Text>
      )}
      {error && <Text style={{ color: 'red', textAlign: 'center', marginTop: 16 }}>{error}</Text>}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {prayers.filter(prayer => prayer.creatorId === userId).length === 0 && !loading ? (
          <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, marginTop: 32, textAlign: 'center' }}>
            Vous n'avez ajouté aucune prière.
          </Text>
        ) : (
          prayers.filter(prayer => prayer.creatorId === userId).map(prayer => (
            <View key={prayer.id} style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].surface, shadowColor: Colors[colorScheme ?? 'light'].border }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons name="person" size={22} color={Colors[colorScheme ?? 'light'].tint} style={{ marginRight: 8 }} />
                <Text style={styles.cardTitle}>{prayer.name}</Text>
                {prayer.prayerCount > 10 && (
                  <View style={styles.badgePopular}>
                    <Text style={styles.badgeText}>Populaire</Text>
                  </View>
                )}
                {prayer.createdAt && new Date().getTime() - new Date(prayer.createdAt).getTime() < 7 * 24 * 3600 * 1000 && (
                  <View style={styles.badgeRecent}>
                    <Text style={styles.badgeText}>Nouveau</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardMessage}>{prayer.personalMessage}</Text>
              <View style={styles.cardInfoRow}>
                {prayer.age && <Text style={styles.cardInfo}>Âge : {prayer.age}</Text>}
                {prayer.location && <Text style={styles.cardInfo}>Lieu : {prayer.location}</Text>}
                {prayer.deathDate && (
                  <Text style={styles.cardInfo}>Décès : {formatDate(prayer.deathDate)}</Text>
                )}
              </View>
              <View style={styles.cardInfoRow}>
                <Text style={styles.cardInfo}>Ajoutée le : {formatDate(prayer.createdAt)}</Text>
                <Text style={styles.cardInfo}>Prières : {prayer.prayerCount ?? 0}</Text>
              </View>
              {prayer.creatorId === userId && (
                <TouchableOpacity onPress={() => handleDelete(prayer.id!)} style={[styles.deleteButton, deletingId === prayer.id && { opacity: 0.5 }]} disabled={deletingId === prayer.id}>
                  <Ionicons name="trash" size={18} color="#fff" style={{ marginRight: 4 }} />
                  <Text style={{ color: 'white', fontSize: 14 }}>Supprimer</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  backIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    flex: 1,
  },
  cardMessage: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
    marginTop: 2,
  },
  cardInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  cardInfo: {
    fontSize: 13,
    color: '#666',
    marginRight: 16,
    marginBottom: 2,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  badgePopular: {
    backgroundColor: '#f1c40f',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeRecent: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
