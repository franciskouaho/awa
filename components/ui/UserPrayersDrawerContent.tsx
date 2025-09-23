import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserCreatedPrayers } from '@/hooks/useUserCreatedPrayers';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
    <LinearGradient
      colors={['#2D5A4A', '#4A7C69', '#6BAF8A']}
      style={styles.container}
    >
      {/* Header avec bouton Back et titre */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <View style={styles.backButtonGlass}>
            <View style={styles.backButtonGlassInner}>
              <View style={styles.backButtonGlassHighlight} />
              <IconSymbol name="chevron.left" size={20} color="#2D5A4A" />
            </View>
          </View>
          <Text style={styles.backText}>
            Retour
          </Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          Mes Prières
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={refreshPrayers}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {loading && (
        <Text
          style={{
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center',
            marginTop: 16,
          }}
        >
          Chargement...
        </Text>
      )}

      {error && <Text style={{ color: '#FF6B6B', textAlign: 'center', marginTop: 16 }}>{error}</Text>}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {prayers.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="heart-outline"
              size={64}
              color="rgba(255, 255, 255, 0.8)"
            />
            <Text
              style={styles.emptyStateText}
            >
              Vous n'avez créé aucune prière.
            </Text>
            <Text
              style={styles.emptyStateSubtext}
            >
              Créez votre première prière depuis l'écran principal.
            </Text>
          </View>
        ) : (
          prayers.map(prayer => (
            <View
              key={prayer.id}
              style={styles.card}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <Ionicons
                  name="person"
                  size={22}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.cardTitle}>{prayer.name}</Text>
                {prayer.createdAt &&
                  new Date().getTime() - new Date(prayer.createdAt).getTime() <
                    7 * 24 * 3600 * 1000 && (
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
              <TouchableOpacity
                onPress={() => handleDelete(prayer.id!)}
                style={[styles.deleteButton, deletingId === prayer.id && { opacity: 0.5 }]}
                disabled={deletingId === prayer.id}
              >
                <Ionicons name="trash" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
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
    color: '#FFFFFF',
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
  backButtonGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    marginRight: 12,
  },
  backButtonGlassInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  backText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  cardMessage: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  badgeRecent: {
    backgroundColor: 'rgba(40, 167, 69, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: 'rgba(40, 167, 69, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
