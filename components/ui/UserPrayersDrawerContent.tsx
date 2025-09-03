import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserCreatedPrayers } from '@/hooks/useUserCreatedPrayers';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface UserPrayersDrawerContentProps {
  onClose: () => void;
}

export default function UserPrayersDrawerContent({ onClose }: UserPrayersDrawerContentProps) {
  const colorScheme = useColorScheme();
  const { prayers, deletePrayer, loading, error, refreshPrayers } = useUserCreatedPrayers();
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
            const result = await deletePrayer(prayerId);
            setDeletingId(null);

            if (!result.success) {
              Alert.alert('Erreur', result.error || 'Erreur lors de la suppression');
            }
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
          <IconSymbol name="chevron.left" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Retour
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Mes Prières
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshPrayers}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={Colors[colorScheme ?? 'light'].tint} />
        </TouchableOpacity>
      </View>

      {loading && (
        <Text
          style={{
            color: Colors[colorScheme ?? 'light'].textSecondary,
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          Chargement...
        </Text>
      )}

      {error && <Text style={{ color: Colors[colorScheme ?? 'light'].error, textAlign: 'center', marginTop: 16 }}>{error}</Text>}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {prayers.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="heart-outline"
              size={64}
              color={Colors[colorScheme ?? 'light'].textSecondary}
            />
            <Text
              style={[
                styles.emptyStateText,
                { color: Colors[colorScheme ?? 'light'].textSecondary },
              ]}
            >
              Vous n'avez créé aucune prière.
            </Text>
            <Text
              style={[
                styles.emptyStateSubtext,
                { color: Colors[colorScheme ?? 'light'].textSecondary },
              ]}
            >
              Créez votre première prière depuis l'écran principal.
            </Text>
          </View>
        ) : (
          prayers.map(prayer => (
            <View
              key={prayer.id}
              style={[
                styles.card,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  shadowColor: Colors[colorScheme ?? 'light'].border,
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons
                  name="person"
                  size={22}
                  color={Colors[colorScheme ?? 'light'].tint}
                  style={{ marginRight: 8 }}
                />
                <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>{prayer.name}</Text>
                {prayer.prayerCount > 10 && (
                  <View style={[styles.badgePopular, { backgroundColor: Colors[colorScheme ?? 'light'].warning }]}>
                    <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>Populaire</Text>
                  </View>
                )}
                {prayer.createdAt &&
                  new Date().getTime() - new Date(prayer.createdAt).getTime() <
                    7 * 24 * 3600 * 1000 && (
                    <View style={[styles.badgeRecent, { backgroundColor: Colors[colorScheme ?? 'light'].success }]}>
                      <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}>Nouveau</Text>
                    </View>
                  )}
              </View>
              <Text style={[styles.cardMessage, { color: Colors[colorScheme ?? 'light'].text }]}>{prayer.personalMessage}</Text>
              <View style={styles.cardInfoRow}>
                {prayer.age && <Text style={[styles.cardInfo, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Âge : {prayer.age}</Text>}
                {prayer.location && <Text style={[styles.cardInfo, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Lieu : {prayer.location}</Text>}
                {prayer.deathDate && (
                  <Text style={[styles.cardInfo, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Décès : {formatDate(prayer.deathDate)}</Text>
                )}
              </View>
              <View style={styles.cardInfoRow}>
                <Text style={[styles.cardInfo, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Ajoutée le : {formatDate(prayer.createdAt)}</Text>
                <Text style={[styles.cardInfo, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>Prières : {prayer.prayerCount ?? 0}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(prayer.id!)}
                style={[styles.deleteButton, { backgroundColor: Colors[colorScheme ?? 'light'].error }, deletingId === prayer.id && { opacity: 0.5 }]}
                disabled={deletingId === prayer.id}
              >
                <Ionicons name="trash" size={18} color={Colors[colorScheme ?? 'light'].textOnPrimary} style={{ marginRight: 4 }} />
                <Text style={{ color: Colors[colorScheme ?? 'light'].textOnPrimary, fontSize: 14 }}>Supprimer</Text>
              </TouchableOpacity>
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

    borderRadius: 8,
  },
  badgePopular: {

    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeRecent: {

    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 20,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
