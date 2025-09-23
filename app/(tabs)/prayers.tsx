import PrayerTutorialModal from '@/components/PrayerTutorialModal';
import SuggestionModal from '@/components/SuggestionModal';
import BottomDrawer from '@/components/ui/BottomDrawer';
import ShareDrawerContent from '@/components/ui/ShareDrawerContent';
import { useCategories } from '@/contexts/CategoryContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useContent } from '@/hooks/useContent';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useInAppReview } from '@/hooks/useInAppReview';
import { useLikes } from '@/hooks/useLikes';
import { usePrayerTutorial } from '@/hooks/usePrayerTutorial';
import { usePrayers } from '@/hooks/usePrayers';
import { useReminders } from '@/hooks/useReminders';
import { useUserPrayers } from '@/hooks/useUserPrayers';
import { LinearGradient } from 'expo-linear-gradient';

import { PrayerFormula } from '@/services/contentService';
import { PrayerData } from '@/services/prayerService';
import PrayerWidgetService, {
  PrayerData as WidgetPrayerData,
} from '@/services/prayerWidgetService';
import { formatDate, replaceNamePlaceholders } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
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

import { useAuth } from '@/contexts/AuthContext';
import { PRAYER_EVENTS, prayerEventEmitter } from '@/utils/eventEmitter';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardHeight = screenHeight; // Chaque carte prend toute la hauteur de l'écran

// Calculer la largeur optimale pour iPad
const getOptimalCardWidth = (isIPad: boolean) => {
  if (isIPad) {
    // Sur iPad, limiter la largeur à 600px maximum et centrer le contenu
    return Math.min(600, screenWidth * 0.8);
  }
  return screenWidth;
};

export default function PrayersScreen() {
  const { user } = useAuth();
  const userId = user?.uid || '';
  const [suggestionModalVisible, setSuggestionModalVisible] = useState(false);

  // Hook pour le tutorial
  const { showTutorial, markTutorialAsShown } = usePrayerTutorial();

  // Hook pour les reviews
  const { triggerReviewAfterScroll } = useInAppReview();

  // Utiliser le hook pour les prières utilisateur
  const {
    completedPrayers,
    loading: userPrayersLoading,
    error: userPrayersError,
    togglePrayerCompleted,
    isPrayerCompleted,
    loadUserPrayers,
  } = useUserPrayers(userId);
  const colorScheme = useColorScheme();
  const { isIPad } = useDeviceType();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [shareDrawerVisible, setShareDrawerVisible] = useState(false);
  const [selectedPrayerForShare, setSelectedPrayerForShare] = useState<PrayerData | null>(null);
  const [savedPrayers, setSavedPrayers] = useState<Set<string>>(new Set());

  // Charger les bookmarks sauvegardés au démarrage
  useEffect(() => {
    const loadSavedPrayers = async () => {
      try {
        const saved = await AsyncStorage.getItem('savedPrayers');
        if (saved) {
          const savedArray = JSON.parse(saved);
          setSavedPrayers(new Set(savedArray));
          console.log('✅ Loaded saved prayers:', savedArray);
        }
      } catch (error) {
        console.error('❌ Error loading saved prayers:', error);
      }
    };

    loadSavedPrayers();
  }, []);

  // Sauvegarder les bookmarks quand ils changent
  const saveBookmarksToStorage = async (bookmarks: Set<string>) => {
    try {
      const bookmarksArray = Array.from(bookmarks);
      await AsyncStorage.setItem('savedPrayers', JSON.stringify(bookmarksArray));
      console.log('✅ Saved bookmarks to storage:', bookmarksArray);

      // Sauvegarder les prières complètes pour le widget
      const bookmarkedPrayers = prayers.filter(prayer => bookmarks.has(prayer.id || ''));
      const widgetPrayers = bookmarkedPrayers.map(prayer => ({
        prayerId: prayer.id || '',
        name: prayer.name || 'Nom inconnu',
        age: prayer.age || 0,
        deathDate: prayer.deathDate?.toDate ? prayer.deathDate.toDate().getTime() : Date.now(),
        location: prayer.location || 'Lieu non spécifié',
        personalMessage: prayer.personalMessage || 'Que Dieu ait son âme en paix',
      }));

      await PrayerWidgetService.saveBookmarksForWidget(widgetPrayers);
      console.log('✅ Bookmarks saved for widget:', widgetPrayers);
    } catch (error) {
      console.error('❌ Error saving bookmarks:', error);
    }
  };

  // Animation pour l'icône de scroll
  const scrollIconAnimation = useRef(new Animated.Value(0)).current;

  // Utiliser le contexte des catégories
  const { selectedCategories } = useCategories();

  // Utiliser le hook Firebase pour les prières
  const { prayers, loading, error, loadPrayers, incrementPrayerCount, refreshPrayers } =
    usePrayers();

  // Utiliser le hook Firebase pour les rappels
  const { reminders, loading: remindersLoading, error: remindersError } = useReminders();

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
    likeCounts,
    loading: likesLoading,
    error: likesError,
    toggleLike,
    isLiked,
    loadUserLikes,
    refreshLikeCount,
  } = useLikes();

  // Mémoriser les formules assignées à chaque prière
  const [assignedFormulas, setAssignedFormulas] = useState<{ [key: string]: PrayerFormula }>({});

  // Fonction pour convertir les données de prière pour le widget
  const convertPrayerForWidget = (prayer: PrayerData): WidgetPrayerData => {
    try {
      console.log('🔄 Starting conversion for prayer:', prayer.name);

      let deathDate = Date.now();
      if (prayer.deathDate) {
        console.log('📅 Processing death date:', prayer.deathDate, typeof prayer.deathDate);
        if (typeof prayer.deathDate === 'string') {
          deathDate = new Date(prayer.deathDate).getTime();
        } else if (prayer.deathDate instanceof Date) {
          deathDate = prayer.deathDate.getTime();
        } else if (typeof prayer.deathDate === 'number') {
          deathDate = prayer.deathDate;
        }
      }

      const result = {
        prayerId: prayer.id || `prayer-${Math.random()}`,
        name: prayer.name || 'Nom non disponible',
        age: prayer.age || 0,
        location: prayer.location || 'Lieu non disponible',
        personalMessage:
          prayer.personalMessage && prayer.personalMessage.trim() !== ''
            ? prayer.personalMessage
            : 'Que Dieu ait son âme en paix',
        deathDate: deathDate,
      };

      console.log('✅ Conversion result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in convertPrayerForWidget:', error);
      throw error;
    }
  };

  // Charger les prières et formules au montage du composant
  useEffect(() => {
    console.log('🚀 PrayersScreen - Démarrage du chargement des données');
    const loadData = async () => {
      try {
        // Toujours charger les prières en arrière-plan pour avoir les données disponibles
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

  // Recharger les prières quand les catégories changent
  useEffect(() => {
    if (selectedCategories.includes('prayers')) {
      console.log('🔄 Catégorie prayers sélectionnée, rechargement des prières...');
      loadPrayers();
    }
  }, [selectedCategories, loadPrayers]);

  // Écouter les événements d'ajout de prière pour recharger la liste
  useEffect(() => {
    const handlePrayerAdded = () => {
      console.log('🔄 PrayersScreen: Prière ajoutée détectée, rechargement de la liste...');
      // Recharger les prières même si la catégorie n'est pas sélectionnée
      loadPrayers();
    };

    // Écouter l'événement d'ajout
    prayerEventEmitter.on(PRAYER_EVENTS.PRAYER_ADDED, handlePrayerAdded);

    return () => {
      prayerEventEmitter.off(PRAYER_EVENTS.PRAYER_ADDED, handlePrayerAdded);
    };
  }, [loadPrayers]);

  // Charger les compteurs de likes pour les prières
  useEffect(() => {
    if (prayers.length > 0 && selectedCategories.includes('prayers')) {
      console.log('💖 Chargement des compteurs de likes...');
      prayers.forEach(prayer => {
        if (prayer.id) {
          refreshLikeCount(prayer.id);
        }
      });
    }
  }, [prayers, refreshLikeCount, selectedCategories]);

  // Démarrer l'animation de l'icône de scroll
  useEffect(() => {
    const startScrollAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scrollIconAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scrollIconAnimation, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Démarrer l'animation seulement si on a des prières
    if (prayers.length > 0) {
      startScrollAnimation();
    }
  }, [prayers.length, scrollIconAnimation]);

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

  // Handler pour marquer une prière comme effectuée
  const handlePray = async (prayerId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const userPrayerResult = await togglePrayerCompleted(prayerId);
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
      const userPrayerResult = await togglePrayerCompleted(prayerId);
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
      const promises = [loadPrayerFormulas(), loadUserLikes()];
      if (selectedCategories.includes('prayers')) {
        promises.push(refreshPrayers());
        // Rafraîchir les compteurs de likes aussi
        prayers.forEach(prayer => {
          if (prayer.id) refreshLikeCount(prayer.id);
        });
      }
      await Promise.all(promises);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (prayerId: string) => {
    // Vérifier si l'utilisateur est connecté avant de permettre le like
    if (!user?.uid) {
      Alert.alert('Connexion requise', 'Vous devez être connecté pour aimer une prière.');
      return;
    }

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

    // Déclencher la review après le scroll
    triggerReviewAfterScroll();
  };

  const handleShare = async (item: PrayerData | any) => {
    setSelectedPrayerForShare(item);
    setShareDrawerVisible(true);
  };

  // Fonction pour afficher le contenu des rappels
  const renderReminderCard = (reminder: any, index: number) => {
    const optimalWidth = getOptimalCardWidth(isIPad);
    return (
      <View key={reminder.id} style={[styles.card, { width: optimalWidth }]}>
        {/* Contenu principal centré */}
        <View style={styles.cardContent}>
          {/* Section rappel */}
          <View style={[styles.formulaSection]}>
            <View style={styles.formulaHeader}>
              <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
              <Text
                style={[
                  styles.formulaTitle,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                Rappel
              </Text>
            </View>

            {/* Infos du rappel juste après le titre */}
            <View style={styles.personInfoInFormula}>
              {/* Titre du rappel */}
              <Text
                style={[
                  styles.nameInFormula,
                  {
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: 24,
                    textAlign: 'center',
                    marginBottom: 8,
                  },
                ]}
              >
                {reminder.title}
              </Text>

              {/* Description du rappel */}
              <Text
                style={[
                  styles.translationFormula,
                  {
                    color: '#FFFFFF',
                    fontSize: 16,
                    textAlign: 'center',
                    marginBottom: 16,
                    lineHeight: 22,
                  },
                ]}
              >
                {reminder.description}
              </Text>

              {/* Texte en arabe */}
              <Text
                style={[
                  styles.arabicFormula,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                {reminder.arabic}
              </Text>

              {/* Translittération */}
              <Text
                style={[
                  styles.transliterationFormula,
                  {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                ]}
              >
                {reminder.transliteration}
              </Text>

              {/* Traduction */}
              <Text
                style={[
                  styles.translationFormula,
                  {
                    color: '#FFFFFF',
                  },
                ]}
              >
                {reminder.translation}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions à droite style TikTok - exactement comme pour les prières */}
        <View style={[styles.sideActions, { transform: [{ translateX: -44 }] }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => reminder.id && handleLike(reminder.id)}
            activeOpacity={0.8}
          >
            <View style={styles.actionGlassBackground}>
              <View style={styles.actionGlassInner}>
                <View style={styles.actionGlassHighlight} />
                <Ionicons
                  name={isLiked(reminder.id || '') ? 'heart' : 'heart-outline'}
                  size={36}
                  color={isLiked(reminder.id || '') ? '#FF0000' : '#FFFFFF'}
                />
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(reminder)}
            activeOpacity={0.8}
          >
            <View style={styles.actionGlassBackground}>
              <View style={styles.actionGlassInner}>
                <View style={styles.actionGlassHighlight} />
                <Ionicons name="share-outline" size={36} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPrayerCard = (prayer: PrayerData, index: number) => {
    if (!prayer.id) return null;

    const formula = assignedFormulas[prayer.id];
    const optimalWidth = getOptimalCardWidth(isIPad);

    // Si pas de formule assignée, afficher un indicateur de chargement
    if (!formula) {
      return (
        <View key={prayer.id} style={[styles.card, { width: optimalWidth }]}>
          <View style={styles.cardContent}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Chargement de la formule...</Text>
            </View>
          </View>
        </View>
      );
    }

    // Remplacer les placeholders de nom dans la formule avec le nom du défunt
    const personalizedFormula = replaceNamePlaceholders(formula, prayer.name);

    return (
      <View key={prayer.id} style={[styles.card, { width: optimalWidth }]}>
        {/* Contenu principal centré */}
        <View style={styles.cardContent}>
          {/* Formule de prière */}
          <View style={[styles.formulaSection]}>
            <View style={styles.formulaHeader}>
              <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
              <Text
                style={[
                  styles.formulaTitle,
                  {
                    color: '#FFFFFF',
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
                    color: '#FFFFFF',
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
                  color="rgba(255, 255, 255, 0.8)"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.details,
                    {
                      color: 'rgba(255, 255, 255, 0.8)',
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
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  •
                </Text>
                <Ionicons
                  name="flower-outline"
                  size={18}
                  color="rgba(255, 255, 255, 0.8)"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.details,
                    {
                      color: 'rgba(255, 255, 255, 0.8)',
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
                  color="rgba(255, 255, 255, 0.8)"
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.location,
                    {
                      color: 'rgba(255, 255, 255, 0.8)',
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
                  color: '#FFFFFF',
                },
              ]}
            >
              {personalizedFormula.arabic}
            </Text>

            <Text
              style={[
                styles.transliterationFormula,
                {
                  color: 'rgba(255, 255, 255, 0.9)',
                },
              ]}
            >
              {personalizedFormula.transliteration}
            </Text>

            <Text
              style={[
                styles.translationFormula,
                {
                  color: 'rgba(255, 255, 255, 0.9)',
                },
              ]}
            >
              {personalizedFormula.translation}
            </Text>
          </View>
        </View>

        {/* Actions à droite style TikTok */}
        <View style={styles.sideActions}>
          {/* Bouton Like */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => prayer.id && handleLike(prayer.id)}
            activeOpacity={0.8}
          >
            <View style={styles.actionGlassBackground}>
              <View style={styles.actionGlassInner}>
                <View style={styles.actionGlassHighlight} />
                <Ionicons
                  name={isLiked(prayer.id || '') ? 'heart' : 'heart-outline'}
                  size={36}
                  color={isLiked(prayer.id || '') ? '#FF0000' : '#FFFFFF'}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Bouton Bookmark pour le widget */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={async () => {
              try {
                const isCurrentlySaved = savedPrayers.has(prayer.id || '');
                console.log(
                  `🔖 Bookmark button pressed for prayer: ${prayer.name} (currently saved: ${isCurrentlySaved})`
                );

                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

                if (isCurrentlySaved) {
                  // Débookmarker la prière
                  const newSavedPrayers = new Set(savedPrayers);
                  newSavedPrayers.delete(prayer.id || '');
                  setSavedPrayers(newSavedPrayers);
                  await saveBookmarksToStorage(newSavedPrayers);
                  console.log('✅ Prayer unbookmarked and persisted');
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } else {
                  // Bookmarker la prière
                  console.log('🔍 Prayer data:', {
                    id: prayer.id,
                    name: prayer.name,
                    age: prayer.age,
                    location: prayer.location,
                    deathDate: prayer.deathDate,
                    personalMessage: prayer.personalMessage,
                  });

                  // Convertir la prière pour le widget
                  console.log('🔄 Converting prayer for widget...');
                  let widgetPrayer;
                  try {
                    widgetPrayer = convertPrayerForWidget(prayer);
                    console.log('✅ Prayer converted:', widgetPrayer);
                  } catch (conversionError) {
                    console.error('❌ Error converting prayer:', conversionError);
                    throw conversionError;
                  }

                  // Sauvegarder la prière pour le widget
                  console.log('💾 Saving prayer for widget...');
                  // Marquer comme sauvegardé
                  const newSavedPrayers = new Set([...savedPrayers, prayer.id || '']);
                  setSavedPrayers(newSavedPrayers);
                  await saveBookmarksToStorage(newSavedPrayers);
                  console.log('✅ Prayer marked as saved and persisted');

                  // Feedback visuel et haptique
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  console.log('✅ Bookmark process completed successfully');
                }
              } catch (error) {
                console.error('❌ Error in bookmark process:', error);
                console.error('❌ Error details:', {
                  message: (error as Error).message,
                  stack: (error as Error).stack,
                  prayer: prayer.name,
                  prayerId: prayer.id,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={styles.actionGlassBackground}>
              <View style={styles.actionGlassInner}>
                <View style={styles.actionGlassHighlight} />
                <Ionicons
                  name={savedPrayers.has(prayer.id || '') ? 'bookmark' : 'bookmark-outline'}
                  size={36}
                  color={savedPrayers.has(prayer.id || '') ? '#FFD700' : '#FFFFFF'}
                />
              </View>
            </View>
          </TouchableOpacity>

          {/* Bouton Share */}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(prayer)}
            activeOpacity={0.8}
          >
            <View style={styles.actionGlassBackground}>
              <View style={styles.actionGlassInner}>
                <View style={styles.actionGlassHighlight} />
                <Ionicons name="share-outline" size={36} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Icône de scroll animée - seulement sur la première prière */}
        {index === 0 && prayers.length > 1 && (
          <Animated.View
            style={[
              styles.scrollIndicator,
              {
                transform: [
                  {
                    translateY: scrollIconAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 10],
                    }),
                  },
                ],
                opacity: scrollIconAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.7, 1, 0.7],
                }),
              },
            ]}
          >
            <Ionicons name="chevron-down" size={24} color="#FFFFFF" />
            <Text style={styles.scrollText}>Glissez pour voir plus</Text>
          </Animated.View>
        )}
      </View>
    );
  };

  // Déterminer le contenu à afficher selon les catégories sélectionnées
  const getContentToDisplay = () => {
    const content = [];

    if (selectedCategories.includes('prayers') && prayers.length > 0) {
      content.push(...prayers.map((prayer, index) => renderPrayerCard(prayer, index)));
    }

    if (selectedCategories.includes('reminders') && reminders.length > 0) {
      content.push(...reminders.map((reminder, index) => renderReminderCard(reminder, index)));
    }

    return content;
  };

  const contentToDisplay = getContentToDisplay();
  const hasContent = contentToDisplay.length > 0;

  return (
    <LinearGradient colors={['#2D5A4A', '#4A7C69', '#6BAF8A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Bouton de suggestion */}
      <View style={styles.suggestionButtonContainer}>
        <TouchableOpacity
          style={styles.suggestionButton}
          onPress={() => setSuggestionModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.glassBackground}>
            <View style={styles.glassInner}>
              <View style={styles.glassHighlight} />
              <Ionicons name="bulb-outline" size={20} color="#FFFFFF" />
              <Text style={styles.suggestionButtonText}>Suggestion</Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Fallback simple pour éviter l'écran blanc */}
      {loading && prayers.length === 0 && prayerFormulasLoading ? (
        <View style={[styles.card, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Chargement des prières...</Text>
          <Text style={styles.debugText}>
            Debug: Prayers: {prayers.length}, Formulas: {prayerFormulas.length}
          </Text>
        </View>
      ) : error || prayerFormulasError ? (
        <View style={[styles.card, styles.errorContainer]}>
          <Ionicons name="alert-circle-outline" size={64} color="#FFFFFF" />
          <Text style={styles.errorText}>{error || prayerFormulasError}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}
            onPress={handleRefresh}
          >
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : !hasContent ? (
        <ScrollView
          style={{ backgroundColor: 'transparent' }}
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />
          }
        >
          <View style={[styles.card, styles.emptyContainer]}>
            <Ionicons name="heart-outline" size={64} color="#FFFFFF" />
            <Text style={styles.emptyText}>
              {selectedCategories.length === 0
                ? 'Aucune catégorie sélectionnée'
                : 'Aucun contenu disponible pour les catégories sélectionnées'}
            </Text>
            <Text style={styles.emptySubtext}>Tirez vers le bas pour actualiser</Text>

            {/* Instructions pour ajouter une prière */}
            {selectedCategories.includes('prayers') && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Comment ajouter une prière ?</Text>
                <View style={styles.instructionStep}>
                  <View style={[styles.stepIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                    <Text style={styles.stepNumber}>1</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Appuyez sur le bouton{' '}
                    <Text style={[styles.boldText, { color: '#FFFFFF' }]}>+</Text> en bas au centre
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={[styles.stepIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                    <Text style={styles.stepNumber}>2</Text>
                  </View>
                  <Text style={styles.stepText}>
                    Sélectionnez{' '}
                    <Text style={[styles.boldText, { color: '#FFFFFF' }]}>Nouvelle prière</Text>
                  </Text>
                </View>
                <View style={styles.instructionStep}>
                  <View style={[styles.stepIcon, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                    <Text style={styles.stepNumber}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Remplissez les informations du défunt</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={[styles.scrollView, { backgroundColor: 'transparent' }]}
          contentContainerStyle={isIPad ? styles.scrollViewContentIPad : undefined}
          decelerationRate="fast"
          snapToInterval={cardHeight}
          snapToAlignment="start"
          contentInsetAdjustmentBehavior="never"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#FFFFFF" />
          }
        >
          {contentToDisplay}
        </ScrollView>
      )}

      {/* Share Drawer */}
      <BottomDrawer
        isVisible={shareDrawerVisible}
        onClose={() => {
          setShareDrawerVisible(false);
          setSelectedPrayerForShare(null);
        }}
        height={
          isIPad ? Dimensions.get('window').height * 0.7 : Dimensions.get('window').height * 0.85
        }
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

      {/* Modal de suggestion */}
      <SuggestionModal
        visible={suggestionModalVisible}
        onClose={() => setSuggestionModalVisible(false)}
      />

      {/* Modal du tutorial */}
      <PrayerTutorialModal visible={showTutorial} onClose={markTutorialAsShown} />
    </LinearGradient>
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
  scrollViewContentIPad: {
    alignItems: 'center', // Centrer le contenu sur iPad
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
    color: '#FFFFFF', // Couleur blanche par défaut
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
    color: '#FFFFFF', // Couleur blanche par défaut
  },
  arabicFormula: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'System',
    lineHeight: 32,
    color: '#FFFFFF', // Couleur blanche par défaut
  },
  transliterationFormula: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.8)', // Couleur blanche semi-transparente par défaut
  },
  translationFormula: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.8)', // Couleur blanche semi-transparente par défaut
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
    color: '#FFFFFF', // Couleur blanche par défaut
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
    color: 'rgba(255, 255, 255, 0.8)', // Couleur blanche semi-transparente par défaut
  },
  location: {
    fontSize: 15,
    marginLeft: 6,
    color: 'rgba(255, 255, 255, 0.8)', // Couleur blanche semi-transparente par défaut
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
    color: '#FFFFFF', // Couleur blanche par défaut
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayCount: {
    fontSize: 16,
    marginLeft: 6,
    color: '#FFFFFF', // Couleur blanche par défaut
  },
  sideActions: {
    position: 'absolute',
    bottom: 200, // Remonté pour être plus visible
    left: '50%',
    transform: [{ translateX: -84 }], // Centrer horizontalement pour 3 boutons (largeur totale des 3 boutons + espacement)
    flexDirection: 'row', // Alignement horizontal
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButton: {
    borderRadius: 50,
    padding: 0, // Pas de padding pour laisser place au glassmorphisme
    marginLeft: 16, // Espacement horizontal au lieu de marginBottom
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    backgroundColor: 'transparent', // Transparent pour laisser voir l'effet glass
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
    margin: 16,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    margin: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  suggestionButtonContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 100,
  },
  suggestionButton: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glassBackground: {
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  glassInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  // Styles spécifiques pour les boutons d'actions circulaires
  actionGlassBackground: {
    borderRadius: 28, // 56/2 pour un bouton circulaire
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
    width: 56,
    height: 56,
  },
  actionGlassInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
    borderRadius: 28,
  },
  actionGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  suggestionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    margin: 16,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  debugText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.5,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionsContainer: {
    marginTop: 32,
    paddingHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    marginHorizontal: 16,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#FFFFFF', // Couleur blanche par défaut
  },
  scrollText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    opacity: 0.8,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  scrollIndicator: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
