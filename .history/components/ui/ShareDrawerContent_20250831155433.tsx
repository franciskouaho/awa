import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useContent } from '@/hooks/useContent';
import { PrayerFormula } from '@/services/contentService';
import { PrayerData } from '@/services/prayerService';
import { formatDate } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

interface ShareDrawerContentProps {
  prayer: PrayerData;
  onClose: () => void;
}

export default function ShareDrawerContent({ prayer, onClose }: ShareDrawerContentProps) {
  const colorScheme = useColorScheme();
  const viewShotRef = useRef<ViewShot>(null);
  const [prayerFormula, setPrayerFormula] = useState<PrayerFormula | null>(null);

  const isPrayer = prayer && prayer.hasOwnProperty('name');
  const isReminder = prayer && prayer.hasOwnProperty('title');

  // Utiliser le hook Firebase pour le contenu
  const { getRandomPrayerFormula } = useContent();

  // Charger une formule de prière aléatoire seulement si c'est une prière
  useEffect(() => {
    if (isPrayer) {
      const loadFormula = async () => {
        const result = await getRandomPrayerFormula();
        if (result.success && result.data) {
          setPrayerFormula(result.data);
        }
      };
      loadFormula();
    }
  }, [getRandomPrayerFormula, isPrayer]);

  // Déterminer le type de contenu et créer le texte de partage approprié
  const getShareText = () => {
    if (isPrayer) {
      return `Prière pour le défunt\n\n${prayer.name}\n${prayer.age} ans • ${formatDate(prayer.deathDate)}\n${prayer.location}`;
    } else if (isReminder) {
      return `Rappel: ${prayer.title}\n\n${prayer.description}\n\n${prayer.arabic}\n${prayer.transliteration}\n${prayer.translation}`;
    }
    return '';
  };

  const shareText = getShareText();

  const handleNativeShare = async () => {
    try {
      await Share.share({
        message: shareText,
      });
      onClose();
    } catch (error) {
      console.log('Erreur lors du partage:', error);
      Alert.alert('Erreur', 'Impossible de partager la prière. Veuillez réessayer plus tard.');
    }
  };

  const handleCopyText = async () => {
    try {
      await Clipboard.setStringAsync(shareText);
      Alert.alert('Copié', 'Le texte a été copié dans le presse-papiers');
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de copier le texte');
    }
  };

  const handleSaveImage = async () => {
    try {
      // Demander la permission d'accès aux médias
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin d\'accéder à votre galerie pour sauvegarder l\'image.'
        );
        return;
      }

      // Capturer la vue comme image
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();
        
        // Sauvegarder dans la galerie
        const asset = await MediaLibrary.createAssetAsync(uri);
        await MediaLibrary.createAlbumAsync('AWA Prayers', asset, false);
        
        Alert.alert('Succès', 'L\'image a été sauvegardée dans votre galerie');
        onClose();
      } else {
        Alert.alert('Erreur', 'Impossible de capturer l\'image');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'image');
    }
  };

  const handleAddToWidget = () => {
    // Cette fonctionnalité nécessiterait une implémentation native spécifique
    Alert.alert(
      'Widget',
      'Cette fonctionnalité sera disponible dans une prochaine mise à jour.\n\nElle permettra d\'ajouter vos prières favorites directement sur l\'écran d\'accueil de votre téléphone.',
      [{ text: 'Compris', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header avec fermeture */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons 
            name="close" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
      </View>

      {/* Contenu de la prière dans un cadre */}
      <ViewShot 
        ref={viewShotRef}
        options={{ 
          format: 'png', 
          quality: 1.0,
          result: 'tmpfile'
        }}
        style={styles.viewShotContainer}
      >
        <View style={[
          styles.prayerCard,
          { backgroundColor: Colors[colorScheme ?? 'light'].primary }
        ]}>
          {/* Informations du défunt */}
          <View style={styles.deceasedInfo}>
            <Text style={[
              styles.deceasedName,
              { color: 'white' }
            ]}>
              {prayer.name}
            </Text>
            
            <View style={styles.detailsRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="rgba(255, 255, 255, 0.8)"
              />
              <Text style={[
                styles.details,
                { color: 'rgba(255, 255, 255, 0.8)' }
              ]}>
                {prayer.age} ans • {formatDate(prayer.deathDate)}
              </Text>
            </View>
            
            <View style={styles.detailsRow}>
              <Ionicons
                name="location-outline"
                size={14}
                color="rgba(255, 255, 255, 0.8)"
              />
              <Text style={[
                styles.details,
                { color: 'rgba(255, 255, 255, 0.8)' }
              ]}>
                {prayer.location}
              </Text>
            </View>
          </View>

          {/* Formule de prière si disponible */}
          {prayerFormula && (
            <>
              <View style={styles.separator} />
              <View style={styles.formulaSection}>
                <Text style={[
                  styles.formulaTitle,
                  { color: 'rgba(255, 255, 255, 0.9)' }
                ]}>
                  Prière pour le défunt
                </Text>
                
                <Text style={[
                  styles.arabicFormula,
                  { color: 'white' }
                ]}>
                  {prayerFormula.arabic}
                </Text>
                
                <Text style={[
                  styles.transliterationFormula,
                  { color: 'rgba(255, 255, 255, 0.8)' }
                ]}>
                  {prayerFormula.transliteration}
                </Text>
                
                <Text style={[
                  styles.translationFormula,
                  { color: 'rgba(255, 255, 255, 0.8)' }
                ]}>
                  {prayerFormula.translation}
                </Text>
              </View>
            </>
          )}

          {/* Hashtag */}
          <View style={styles.hashtagContainer}>
            <Text style={[
              styles.hashtag,
              { color: 'rgba(255, 255, 255, 0.7)' }
            ]}>
              #awaprayers
            </Text>
          </View>
        </View>
      </ViewShot>

      {/* Options de partage */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSaveImage}
          >
            <Ionicons 
              name="download-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <Text style={[
              styles.actionText,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Sauvegarder l'image
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleNativeShare}
          >
            <Ionicons 
              name="share-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <Text style={[
              styles.actionText,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Partager
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCopyText}
          >
            <Ionicons 
              name="copy-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <Text style={[
              styles.actionText,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Copier le texte
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddToWidget}
          >
            <Ionicons 
              name="apps-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].text} 
            />
            <Text style={[
              styles.actionText,
              { color: Colors[colorScheme ?? 'light'].text }
            ]}>
              Mettre dans le widget
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 30,
  },
  closeButton: {
    padding: 8,
  },
  viewShotContainer: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  prayerCard: {
    padding: 30,
    borderRadius: 16,
    minHeight: 300,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  personalMessage: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  separator: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginVertical: 15,
  },
  deceasedInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  deceasedName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  details: {
    fontSize: 13,
    marginLeft: 6,
  },
  formulaSection: {
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  formulaTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  arabicFormula: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'System',
    lineHeight: 24,
  },
  transliterationFormula: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  translationFormula: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  hashtagContainer: {
    marginTop: 20,
  },
  hashtag: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionsContainer: {
    paddingHorizontal: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    padding: 16,
    minWidth: 80,
  },
  actionText: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 16,
  },
});
