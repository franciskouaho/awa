import BottomDrawer from '@/components/ui/BottomDrawer';
import FirstNameScreen from '@/components/ui/FirstNameScreen';
import GenderScreen from '@/components/ui/GenderScreen';
import GeneralDrawerContent from '@/components/ui/GeneralDrawerContent';
import { IconSymbol } from '@/components/ui/IconSymbol';
import LanguageScreen from '@/components/ui/LanguageScreen';
import RemindersDrawerContent from '@/components/ui/RemindersDrawerContent';
import UserPrayersDrawerContent from '@/components/ui/UserPrayersDrawerContent';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLikes } from '@/hooks/useLikes';
import { usePrayers } from '@/hooks/usePrayers';
import { useUserSettings } from '@/hooks/useUserSettings';
import { authService } from '@/services/auth';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View /*, Linking*/,
} from 'react-native';

interface SettingsDrawerContentProps {
  onClose: () => void;
}

// Si tu es en TS, tu peux typer explicitement :
type SubScreen = 'firstName' | 'gender' | 'language' | null;

export default function SettingsDrawerContent({ onClose }: SettingsDrawerContentProps) {
  const colorScheme = useColorScheme();
  const { settings, saveSetting, error /*, deleteAccount*/ } = useUserSettings();
  const { prayers, loadPrayers } = usePrayers();
  const { likeCounts, refreshLikeCount } = useLikes();

  const [remindersDrawerVisible, setRemindersDrawerVisible] = useState(false);
  const [generalDrawerVisible, setGeneralDrawerVisible] = useState(false);
  const [userPrayersDrawerVisible, setUserPrayersDrawerVisible] = useState(false);
  const [currentSubScreen, setCurrentSubScreen] = useState<SubScreen>(null);
  const [totalLikesCount, setTotalLikesCount] = useState(0);

  // Charger les prières
  useEffect(() => {
    loadPrayers();
  }, [loadPrayers]);

  // Charger les compteurs de likes pour toutes les prières
  useEffect(() => {
    if (prayers?.length) {
      prayers.forEach(prayer => {
        if (prayer.id) refreshLikeCount(prayer.id);
      });
    }
  }, [prayers, refreshLikeCount]);

  // Calculer le nombre total de likes
  useEffect(() => {
    if (prayers?.length) {
      const total = prayers.reduce((sum, prayer) => {
        const prayerId = prayer.id || '';
        return sum + (likeCounts[prayerId] || 0);
      }, 0);
      setTotalLikesCount(total);
    } else {
      setTotalLikesCount(0);
    }
  }, [prayers, likeCounts]);

  const handleDeleteAccountPress = () => {
    Alert.alert(
      'Supprimer le compte',
      'Cette action est définitive et effacera vos données. Voulez-vous continuer ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.deleteAccount();
              onClose();
              Alert.alert('Succès', 'Votre compte a été supprimé avec succès.', [
                {
                  text: 'OK',
                  onPress: () => {
                    // Rediriger vers la page d'intro (Commencer)
                    router.replace('/onboarding/intro');
                  },
                },
              ]);
            } catch (e) {
              console.error('Erreur lors de la suppression du compte', e);
              Alert.alert('Erreur', 'La suppression du compte a échoué. Réessayez plus tard.');
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (itemId: string) => {
    console.log(`Pressed ${itemId}`);
    switch (itemId) {
      case 'general':
        setGeneralDrawerVisible(true);
        break;
      case 'reminders':
        setRemindersDrawerVisible(true);
        break;
      case 'userPrayers':
        setUserPrayersDrawerVisible(true);
        break;
      case 'deleteAccount':
        handleDeleteAccountPress();
        break;
      default:
        break;
    }
  };

  const handleNavigateToSubScreen = (screenName: SubScreen) => {
    setCurrentSubScreen(screenName);
  };

  const handleBackFromSubScreen = () => {
    setCurrentSubScreen(null);
  };

  const handleSaveValue = async (key: string, value: string) => {
    try {
      const success = await saveSetting(key as keyof typeof settings, value);
      if (!success && error) {
        console.error('Failed to save setting:', error);
      }
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  };

  // Valeurs actuelles mémoïsées
  const currentValues = useMemo(
    () => ({
      firstName: settings?.firstName,
      gender: settings?.gender,
      language: settings?.language,
    }),
    [settings?.firstName, settings?.gender, settings?.language]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <IconSymbol
            name="chevron.left"
            size={20}
            color={Colors[colorScheme ?? 'light'].textSecondary}
          />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Retour
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>AWA</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Card */}
        <View
          style={[styles.statsCard, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
        >
          <View style={styles.statsCardBackground}>
            <View style={styles.statContainer}>
              <View style={styles.heartIconContainer}>
                <IconSymbol name="heart" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statNumber}>{totalLikesCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>
                  {totalLikesCount === 1 ? 'like reçu' : 'likes reçus'}
                </Text>
                <Text style={styles.statSubtitle}>dans la communauté AWA</Text>
              </View>
            </View>
            <View style={styles.decorativeElements}>
              <View style={styles.decorativeCircle1} />
              <View style={styles.decorativeCircle2} />
              <View style={styles.decorativeCircle3} />
            </View>
          </View>
        </View>

        {/* SETTINGS Section */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          PARAMÈTRES
        </Text>
        <View
          style={[styles.menuSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('general')}
            activeOpacity={0.7}
          >
            <IconSymbol name="settings" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Général
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
          <View
            style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
          />
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('reminders')}
            activeOpacity={0.7}
          >
            <IconSymbol name="bell" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Rappels
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
          <View
            style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
          />
        </View>

        {/* JUST FOR YOU Section */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          JUSTE POUR VOUS
        </Text>
        <View
          style={[styles.menuSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('userPrayers')}
            activeOpacity={0.7}
          >
            <IconSymbol name="clock" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Mes Prières
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT MANAGEMENT Section */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          GESTION DU COMPTE
        </Text>
        <View
          style={[
            styles.menuSection,
            {
              backgroundColor: Colors[colorScheme ?? 'light'].surface,
              borderWidth: 1,
              borderColor: 'rgba(255, 107, 107, 0.3)',
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: 'rgba(255, 107, 107, 0.05)' }]}
            onPress={() => handleItemPress('deleteAccount')}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
              <IconSymbol name="trash" size={20} color="#FF6B6B" />
            </View>
            <Text style={[styles.menuItemText, { color: '#FF6B6B', fontWeight: '600' }]}>
              Supprimer le compte
            </Text>
            <Text style={[styles.chevron, { color: '#FF6B6B' }]}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Drawer Reminders */}
      <BottomDrawer
        isVisible={remindersDrawerVisible}
        onClose={() => setRemindersDrawerVisible(false)}
        disableSwipeToClose
        disableOverlayClose
      >
        <RemindersDrawerContent onClose={() => setRemindersDrawerVisible(false)} />
      </BottomDrawer>

      {/* Drawer Mes Prières */}
      <BottomDrawer
        isVisible={userPrayersDrawerVisible}
        onClose={() => setUserPrayersDrawerVisible(false)}
      >
        <UserPrayersDrawerContent onClose={() => setUserPrayersDrawerVisible(false)} />
      </BottomDrawer>

      {/* Drawer General */}
      <BottomDrawer isVisible={generalDrawerVisible} onClose={() => setGeneralDrawerVisible(false)}>
        {currentSubScreen ? (
          <>
            {currentSubScreen === 'firstName' && (
              <FirstNameScreen
                onBack={handleBackFromSubScreen}
                initialValue={settings?.firstName || 'Utilisateur'}
                onSave={value => handleSaveValue('firstName', value)}
              />
            )}
            {currentSubScreen === 'gender' && (
              <GenderScreen
                onBack={handleBackFromSubScreen}
                initialValue={settings?.gender || 'Autre'}
                onSave={value => handleSaveValue('gender', value)}
              />
            )}
            {currentSubScreen === 'language' && (
              <LanguageScreen
                onBack={handleBackFromSubScreen}
                initialValue={settings?.language || 'Français'}
                onSave={value => handleSaveValue('language', value)}
              />
            )}
          </>
        ) : (
          <GeneralDrawerContent
            onClose={() => setGeneralDrawerVisible(false)}
            onNavigateToScreen={handleNavigateToSubScreen}
            currentValues={currentValues}
          />
        )}
      </BottomDrawer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 20, fontWeight: '600', letterSpacing: 0.5 },
  content: { flex: 1 },
  statsCard: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: 'rgba(45, 90, 74, 0.3)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  statsCardBackground: { position: 'relative', padding: 24, paddingVertical: 28 },
  statContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    zIndex: 2,
  },
  heartIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  statTextContainer: { flex: 1, alignItems: 'flex-start' },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  statSubtitle: { fontSize: 13, fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)' },
  decorativeElements: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1 },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -15,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 16,
  },
  menuSection: { borderRadius: 16, marginBottom: 16 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: { flex: 1, fontSize: 16, marginLeft: 16 },
  separator: { height: 0.5, marginLeft: 56 },
  chevron: { fontSize: 16 },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
});
