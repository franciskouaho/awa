import BottomDrawer from '@/components/ui/BottomDrawer';
import ShareDrawerContent from '@/components/ui/ShareDrawerContent';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useContent } from '@/hooks/useContent';
import { useLikes } from '@/hooks/useLikes';
import { usePrayers } from '@/hooks/usePrayers';

import { PrayerFormula } from '@/services/contentService';
import { PrayerData } from '@/services/prayerService';
import { formatDate } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardHeight = screenHeight; // Chaque carte prend toute la hauteur de l'écran

export default function PrayersScreen() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [shareDrawerVisible, setShareDrawerVisible] = useState(false);
  const [selectedPrayerForShare, setSelectedPrayerForShare] = useState<PrayerData | null>(null);

  // Utiliser le hook Firebase pour les prières
  const { prayers, loading, error, loadPrayers, incrementPrayerCount, refreshPrayers } =
    usePrayers();

  // Utiliser le hook Firebase pour le contenu (formules, versets, etc.)
  const {
    prayerFormulas,
    prayerFormulasLoading,
    prayerFormulasError,
    loadPrayerFormulas,
    getRandomPrayerFormula,
  } = useContent();

  // Utiliser le hook Firebase pour les likes
  const {
    likedPrayers,
    loading: likesLoading,
    error: likesError,
    toggleLike,
    isLiked,
    loadUserLikes,
  } = useLikes();

  // Utiliser le hook Firebase pour les prières utilisateur
  const {
    completedPrayers,
    loading: userPrayersLoading,
    error: userPrayersError,
    togglePrayerCompleted,
    isPrayerCompleted,
    loadUserPrayers,
  } = useUserPrayers();

  // Mémoriser les formules assignées à chaque prière
  const [assignedFormulas, setAssignedFormulas] = useState<{ [key: string]: PrayerFormula }>({});

  // Charger les prières et formules au montage du composant
  useEffect(() => {
    console.log('🚀 PrayersScreen - Démarrage du chargement des données');
    const loadData = async () => {
      try {
        console.log('📡 Chargement des prières...');
        await loadPrayers();
        console.log('📝 Chargement des formules...');
        await loadPrayerFormulas();
        console.log('✅ Chargement terminé');
      } catch (error) {
        console.error('❌ Erreur lors du chargement:', error);
      }
    };
    loadData();
  }, [loadPrayers, loadPrayerFormulas]);

  // Assigner des formules aléatoires aux prières
  useEffect(() => {
    console.log(
      '🎲 Assignation des formules - prayers:',
      prayers.length,
      'formulas:',
      prayerFormulas.length
    );
    const assignFormulas = async () => {
      const newAssignedFormulas: { [key: string]: PrayerFormula } = { ...assignedFormulas };

      for (const prayer of prayers) {
        if (prayer.id && !newAssignedFormulas[prayer.id]) {
          console.log(`🔄 Assignation formule pour prière ${prayer.id}`);
          const result = await getRandomPrayerFormula();
          if (result.success && result.data) {
            newAssignedFormulas[prayer.id] = result.data;
            console.log(`✅ Formule assignée pour ${prayer.id}`);
          } else {
            console.log(`❌ Échec assignation pour ${prayer.id}:`, result.error);
          }
        }
      }

      setAssignedFormulas(newAssignedFormulas);
      console.log('📋 Formules assignées:', Object.keys(newAssignedFormulas).length);
    };

    if (prayers.length > 0 && prayerFormulas.length > 0) {
      assignFormulas();
    }
  }, [prayers, prayerFormulas, getRandomPrayerFormula]);

  const handlePray = async (prayerId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Marquer la prière comme effectuée par l'utilisateur
      const userPrayerResult = await togglePrayerCompleted(prayerId);

      // Incrémenter le compteur global seulement si la prière est nouvellement effectuée
      if (userPrayerResult.success && userPrayerResult.isCompleted) {
        const countResult = await incrementPrayerCount(prayerId);

        if (!countResult.success) {
          Alert.alert('Erreur', countResult.error || "Impossible d'enregistrer la prière");
          return;
        }
      }

      if (!userPrayerResult.success) {
        Alert.alert('Erreur', userPrayerResult.error || "Impossible d'enregistrer votre prière");
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);

      // Marquer la prière comme effectuée par l'utilisateur
      const userPrayerResult = await togglePrayerCompleted(prayerId);

      // Incrémenter le compteur global seulement si la prière est nouvellement effectuée
      if (userPrayerResult.success && userPrayerResult.isCompleted) {
        const countResult = await incrementPrayerCount(prayerId);

        if (!countResult.success) {
          Alert.alert('Erreur', countResult.error || "Impossible d'enregistrer la prière");
          return;
        }
      }

      if (!userPrayerResult.success) {
        Alert.alert('Erreur', userPrayerResult.error || "Impossible d'enregistrer votre prière");
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshPrayers(),
        loadPrayerFormulas(),
        loadUserLikes(),
        loadUserPrayers(),
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (prayerId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await toggleLike(prayerId);

      if (!result.success) {
        Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le like');
      }
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
      const result = await toggleLike(prayerId);

      if (!result.success) {
        Alert.alert('Erreur', result.error || 'Impossible de mettre à jour le like');
      }
    }
  };

  const handleScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / cardHeight);
    setCurrentIndex(index);
  };

  const handleShare = async (prayer: PrayerData) => {
    setSelectedPrayerForShare(prayer);
    setShareDrawerVisible(true);
  };

  const renderPrayerCard = (prayer: PrayerData, index: number) => {
    if (!prayer.id) return null;

    const formula = assignedFormulas[prayer.id];

    // Si pas de formule assignée, afficher un indicateur de chargement
    if (!formula) {
      return (
        <View key={prayer.id} style={styles.card}>
          <View style={styles.cardContent}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Chargement de la formule...
              </Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View key={prayer.id} style={styles.card}>
        {/* Contenu principal centré */}
        <View style={styles.cardContent}>
          {/* Formule de prière */}
          <View style={[styles.formulaSection]}>
            <View style={styles.formulaHeader}>
              <Ionicons
                name="heart-outline"
                size={18}
                color={Colors[colorScheme ?? 'light'].primary}
              />
              <Text
                style={[
                  styles.formulaTitle,
                  {
                    color: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
              >
                Prière pour le défunt
              </Text>
            </View>

            {/* Infos défunt juste après le titre */}
            <View style={styles.personInfoInFormula}>
              {/* Nom du défunt */}
              <Text
                style={[
                  styles.nameInFormula,
                  {
                    color: Colors[colorScheme ?? 'light'].primary,
                    fontWeight: 'bold',
                    fontSize: 24,
                    textAlign: 'center',
                    marginBottom: 8,
                  },
                ]}
              >
                {prayer.name}
              </Text>
              {/* Âge et date de décès sur la même ligne, bien alignés */}
              <View
                style={[
                  styles.detailsRowCentered,
                  {
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    flexDirection: 'row',
                    width: '100%',
                    flexShrink: 1,
                  },
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={Colors[colorScheme ?? 'light'].prayer.dateText}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.details,
                    {
                      color: Colors[colorScheme ?? 'light'].prayer.dateText,
                      fontSize: 16,
                      flexShrink: 1,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {prayer.age} ans
                </Text>
                <Text
                  style={{
                    marginHorizontal: 6,
                    color: Colors[colorScheme ?? 'light'].prayer.dateText,
                  }}
                >
                  •
                </Text>
                <Ionicons
                  name="flower-outline"
                  size={18}
                  color={Colors[colorScheme ?? 'light'].prayer.dateText}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.details,
                    {
                      color: Colors[colorScheme ?? 'light'].prayer.dateText,
                      fontSize: 16,
                      flexShrink: 1,
                    },
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {formatDate(prayer.deathDate)}
                </Text>
              </View>
              {/* Lieu sur une ligne séparée, bien aligné */}
              <View
                style={[
                  styles.detailsRowCentered,
                  { justifyContent: 'center', alignItems: 'center', width: '100%' },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={Colors[colorScheme ?? 'light'].prayer.dateText}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.location,
                    {
                      color: Colors[colorScheme ?? 'light'].prayer.dateText,
                      fontSize: 16,
                    },
                  ]}
                >
                  {prayer.location}
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.arabicFormula,
                {
                  color: Colors[colorScheme ?? 'light'].prayer.formulaArabic,
                },
              ]}
            >
              {formula.arabic}
            </Text>

            <Text
              style={[
                styles.transliterationFormula,
                {
                  color: Colors[colorScheme ?? 'light'].prayer.formulaTranslation,
                },
              ]}
            >
              {formula.transliteration}
            </Text>

            <Text
              style={[
                styles.translationFormula,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
            >
              {formula.translation}
            </Text>
          </View>
        </View>

        {/* Actions à droite style TikTok */}
        <View style={styles.sideActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.prayActionButton]}
            onPress={() => prayer.id && handlePray(prayer.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isPrayerCompleted(prayer.id || '') ? 'hand-left' : 'hand-left-outline'}
              size={36}
              color={
                isPrayerCompleted(prayer.id || '')
                  ? Colors[colorScheme ?? 'light'].primary
                  : Colors[colorScheme ?? 'light'].text
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => prayer.id && handleLike(prayer.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLiked(prayer.id || '') ? 'heart' : 'heart-outline'}
              size={36}
              color={isLiked(prayer.id || '') ? '#FF0000' : Colors[colorScheme ?? 'light'].text}
            />
            {/* Affichage optionnel du nombre de likes - peut être activé plus tard */}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(prayer)}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={36} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].drawer.backgroundColor },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Fallback simple pour éviter l'écran blanc */}
      {loading && prayers.length === 0 && prayerFormulasLoading ? (
        <View style={[styles.card, styles.loadingContainer]}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Chargement des prières...
          </Text>
          <Text style={[styles.debugText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Debug: Prayers: {prayers.length}, Formulas: {prayerFormulas.length}
          </Text>
        </View>
      ) : error || prayerFormulasError ? (
        <View style={[styles.card, styles.errorContainer]}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={Colors[colorScheme ?? 'light'].text}
          />
          <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}>
            {error || prayerFormulasError}
          </Text>
          <TouchableOpacity
            style={[
              styles.retryButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].primary },
            ]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : prayers.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors[colorScheme ?? 'light'].primary}
            />
          }
        >
          <View style={[styles.card, styles.emptyContainer]}>
            <Ionicons name="heart-outline" size={64} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Aucune prière disponible
            </Text>
            <Text style={[styles.emptySubtext, { color: Colors[colorScheme ?? 'light'].text }]}>
              Tirez vers le bas pour actualiser
            </Text>

            {/* Instructions pour ajouter une prière */}
            <View style={styles.instructionsContainer}>
              <Text
                style={[styles.instructionsTitle, { color: Colors[colorScheme ?? 'light'].text }]}
              >
                Comment ajouter une prière ?
              </Text>
              <View style={styles.instructionStep}>
                <View
                  style={[
                    styles.stepIcon,
                    { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                  ]}
                >
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Appuyez sur le bouton{' '}
                  <Text
                    style={[styles.boldText, { color: Colors[colorScheme ?? 'light'].primary }]}
                  >
                    +
                  </Text>{' '}
                  en bas au centre
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <View
                  style={[
                    styles.stepIcon,
                    { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                  ]}
                >
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Sélectionnez{' '}
                  <Text
                    style={[styles.boldText, { color: Colors[colorScheme ?? 'light'].primary }]}
                  >
                    Nouvelle prière
                  </Text>
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <View
                  style={[
                    styles.stepIcon,
                    { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                  ]}
                >
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Remplissez les informations du défunt
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={[
            styles.scrollView,
            { backgroundColor: Colors[colorScheme ?? 'light'].drawer.backgroundColor },
          ]}
          decelerationRate="fast"
          snapToInterval={cardHeight}
          snapToAlignment="start"
          contentInsetAdjustmentBehavior="never"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors[colorScheme ?? 'light'].primary}
            />
          }
        >
          {prayers.map((prayer, index) => renderPrayerCard(prayer, index))}
        </ScrollView>
      )}

      {/* Share Drawer */}
      <BottomDrawer
        isVisible={shareDrawerVisible}
        onClose={() => {
          setShareDrawerVisible(false);
          setSelectedPrayerForShare(null);
        }}
        height={Dimensions.get('window').height * 0.85}
      >
        {selectedPrayerForShare && (
          <ShareDrawerContent
            prayer={selectedPrayerForShare}
            onClose={() => {
              setShareDrawerVisible(false);
              setSelectedPrayerForShare(null);
            }}
          />
        )}
      </BottomDrawer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D5A4A', // Couleur verte principale de l'application AWA
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'transparent', // Transparent pour laisser voir le container
  },
  card: {
    width: screenWidth,
    height: cardHeight,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight || 44,
    paddingBottom: 120, // Espace pour la navigation
    paddingHorizontal: 24,
    justifyContent: 'center',
    backgroundColor: 'transparent', // Transparent pour laisser voir le fond
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  messageSection: {
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  messageText: {
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '300',
  },
  formulaSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  formulaTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  arabicFormula: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
    lineHeight: 32,
  },
  transliterationFormula: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  translationFormula: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  personInfoInFormula: {
    marginBottom: 16,
    alignItems: 'center',
  },
  nameInFormula: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailsRowCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  details: {
    fontSize: 15,
    marginLeft: 6,
  },
  location: {
    fontSize: 15,
    marginLeft: 6,
  },
  prayerSection: {
    alignItems: 'center',
  },
  prayButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    marginBottom: 16,
    minWidth: 200,
    shadowColor: 'rgba(0, 200, 81, 0.3)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  prayButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayButtonText: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayCount: {
    fontSize: 16,
    marginLeft: 6,
  },
  sideActions: {
    position: 'absolute',
    bottom: 140, // Position en bas au lieu d'en haut
    left: '50%',
    transform: [{ translateX: -88 }], // Centrer horizontalement pour 3 boutons (largeur totale des 3 boutons + espacement)
    flexDirection: 'row', // Alignement horizontal
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 50,
    padding: 10,
    marginLeft: 16, // Espacement horizontal au lieu de marginBottom
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  prayActionButton: {
    // backgroundColor: Colors.light.primary, // Supprimé le background du bouton de prière aussi
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.5,
  },
  instructionsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepNumber: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
});
