import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { formatDate, mockPrayers, Prayer } from '@/data/mockPrayers';
import { getRandomFormula } from '@/data/prayerFormulas';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const cardHeight = screenHeight; // Chaque carte prend toute la hauteur de l'écran

interface PrayerCounts {
  [key: string]: number;
}

export default function PrayersScreen() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prayerCounts, setPrayerCounts] = useState<PrayerCounts>(
    mockPrayers.reduce(
      (acc, prayer) => ({ ...acc, [prayer.id]: prayer.prayerCount }),
      {} as PrayerCounts
    )
  );
  const [prayedPrayers, setPrayedPrayers] = useState<Set<string>>(new Set());

  const handlePray = async (prayerId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setPrayerCounts(prev => ({
        ...prev,
        [prayerId]: (prev[prayerId] || 0) + 1,
      }));
      setPrayedPrayers(prev => new Set([...prev, prayerId]));
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
      setPrayerCounts(prev => ({
        ...prev,
        [prayerId]: (prev[prayerId] || 0) + 1,
      }));
      setPrayedPrayers(prev => new Set([...prev, prayerId]));
    }
  };

  const handleScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.y / cardHeight);
    setCurrentIndex(index);
  };

  const handleShare = async (prayer: Prayer) => {
    try {
      await Share.share({
        message: `Prière pour le défunt\n\n${prayer.personalMessage}\n\n${formatDate(prayer.deathDate)}\n${prayer.location}`,
      });
    } catch (error) {
      console.log('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager la prière. Veuillez réessayer plus tard.');
    }
  };

  const renderPrayerCard = (prayer: Prayer, index: number) => {
    const formula = getRandomFormula();

    return (
      <View key={prayer.id} style={styles.card}>
        {/* Actions à droite style TikTok */}
        <View style={styles.sideActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.prayActionButton]}
            onPress={() => handlePray(prayer.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={prayedPrayers.has(prayer.id) ? 'hand-left' : 'hand-left-outline'}
              size={36}
              color={
                prayedPrayers.has(prayer.id)
                  ? Colors[colorScheme ?? 'light'].primary
                  : Colors[colorScheme ?? 'light'].text
              }
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(prayer)}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={36} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>

        {/* Contenu principal centré */}
        <View style={styles.cardContent}>
          {/* Message personnel en haut */}
          <View style={styles.messageSection}>
            <Text
              style={[
                styles.messageText,
                {
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
            >
              {prayer.personalMessage}
            </Text>
          </View>

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

            {/* Informations de la personne dans la section prière */}
            <View style={styles.personInfoInFormula}>
              <Text
                style={[
                  styles.nameInFormula,
                  {
                    color: Colors[colorScheme ?? 'light'].primary,
                  },
                ]}
              >
                {prayer.name}
              </Text>
              <View style={styles.detailsRowCentered}>
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={Colors[colorScheme ?? 'light'].prayer.dateText}
                />
                <Text
                  style={[
                    styles.details,
                    {
                      color: Colors[colorScheme ?? 'light'].prayer.dateText,
                    },
                  ]}
                >
                  {prayer.age} ans • {formatDate(prayer.deathDate)}
                </Text>
              </View>
              <View style={styles.detailsRowCentered}>
                <Ionicons
                  name="location-outline"
                  size={16}
                  color={Colors[colorScheme ?? 'light'].prayer.dateText}
                />
                <Text
                  style={[
                    styles.location,
                    {
                      color: Colors[colorScheme ?? 'light'].prayer.dateText,
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
      >
        {mockPrayers.map((prayer, index) => renderPrayerCard(prayer, index))}
      </ScrollView>
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
    transform: [{ translateX: -56 }], // Centrer horizontalement (largeur totale des 2 boutons + espacement)
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
  prayActionButton: {
    // backgroundColor: Colors.light.primary, // Supprimé le background du bouton de prière aussi
  },
});
