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
import { useStreak } from '@/hooks/useStreak';

import { usePrayers } from '@/hooks/usePrayers';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsDrawerContentProps {
  onClose: () => void;
}

export default function SettingsDrawerContent({ onClose }: SettingsDrawerContentProps) {
  const colorScheme = useColorScheme();
  const { streakData, getWeeklyProgress, refreshStreak } = useStreak();
  const { settings, saveSetting, error } = useUserSettings();
  const { loadPrayers } = usePrayers();

  const [remindersDrawerVisible, setRemindersDrawerVisible] = useState(false);
  const [generalDrawerVisible, setGeneralDrawerVisible] = useState(false);
  const [userPrayersDrawerVisible, setUserPrayersDrawerVisible] = useState(false);
  const [currentSubScreen, setCurrentSubScreen] = useState<string | null>(null);
  const router = useRouter();

  // Obtenir les données de progression de la semaine
  const weeklyProgress = getWeeklyProgress();

  React.useEffect(() => {
    refreshStreak();
  }, [refreshStreak]);

  const handleItemPress = (itemId: string) => {
    console.log(`Pressed ${itemId}`);
    if (itemId === 'general') {
      setGeneralDrawerVisible(true);
      return;
    } else if (itemId === 'reminders') {
      setRemindersDrawerVisible(true);
      return;
    } else if (itemId === 'userPrayers') {
      setUserPrayersDrawerVisible(true);
      return;
    }
    onClose();
  };

  const handleNavigateToSubScreen = (screenName: string) => {
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
        // Ici vous pourriez afficher une notification d'erreur à l'utilisateur
      }
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  };

  // Fonction pour tester le chargement des prières
  const handleTestLoadPrayers = async () => {
    console.log('🔍 DEBUG: Test de chargement des prières');
    try {
      await loadPrayers();
      console.log('✅ DEBUG: Chargement des prières terminé');
    } catch (error) {
      console.error('❌ DEBUG: Erreur lors du chargement:', error);
    }
  };

  // Fonction pour obtenir les valeurs actuelles
  const getCurrentValues = () => ({
    firstName: settings?.firstName || 'Utilisateur',
    gender: settings?.gender || 'Autre',
    language: settings?.language || 'Français',
  });

  return (
    <View style={styles.container}>
      {/* Header avec bouton Back et titre */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <Text style={[styles.backIcon, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            ✕
          </Text>
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Retour
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>AWA</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Streak Card */}
        <View
          style={[styles.streakCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          <View style={styles.streakLeft}>
            <View style={styles.streakNumberContainer}>
              <Text style={[styles.streakNumber, { color: Colors[colorScheme ?? 'light'].text }]}>
                {streakData?.currentStreak ?? 0}
              </Text>
              {(streakData?.currentStreak ?? 0) > 0 && <Text style={styles.fireEmoji}>🔥</Text>}
            </View>
            <Text style={[styles.streakLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Série
            </Text>
          </View>
          <View style={styles.streakDays}>
            {weeklyProgress.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text
                  style={[styles.dayText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
                >
                  {day.dayName}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: day.completed
                        ? Colors[colorScheme ?? 'light'].tint
                        : Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                >
                  {day.completed && (
                    <IconSymbol name="checkmark" size={12} color="white" style={styles.checkmark} />
                  )}
                </View>
              </View>
            ))}
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

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('widget')}
            activeOpacity={0.7}
          >
            <IconSymbol name="widget" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Widget
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
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
          <View
            style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
          />

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

          <View
            style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
          />
          <View
            style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
          />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('favorite')}
            activeOpacity={0.7}
          >
            <IconSymbol name="heart" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Favoris de prières ou rappels
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* FEEDBACK Section */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          COMMENTAIRES
        </Text>
        <View
          style={[styles.menuSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('contact')}
            activeOpacity={0.7}
          >
            <IconSymbol name="globe" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Nous contacter
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>

        {/* DEBUG Section */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          DÉBOGAGE
        </Text>
        <View
          style={[styles.menuSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTestLoadPrayers}
            activeOpacity={0.7}
          >
            <IconSymbol name="bug" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Test Chargement Prières
            </Text>
            <Text style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              ›
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Drawer Reminders */}
      <BottomDrawer
        isVisible={remindersDrawerVisible}
        onClose={() => setRemindersDrawerVisible(false)}
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
          // Affichage conditionnel des sous-écrans
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
          // Affichage du menu général avec la prop onNavigateToScreen
          <GeneralDrawerContent
            onClose={() => setGeneralDrawerVisible(false)}
            onNavigateToScreen={handleNavigateToSubScreen}
            currentValues={getCurrentValues()}
          />
        )}
      </BottomDrawer>
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
    marginBottom: 32, // Augmenté de 16 à 32 pour plus d'espace
  },
  backIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  streakCard: {
    flexDirection: 'row',
    padding: 20,
    marginBottom: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  streakLeft: {
    alignItems: 'center',
    marginRight: 20,
  },
  streakNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  fireEmoji: {
    fontSize: 20,
    marginLeft: 4,
  },
  streakLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  streakDays: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
  },
  dayColumn: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 12,
    marginBottom: 8,
  },
  dayCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 16,
  },
  menuSection: {
    borderRadius: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  separator: {
    height: 0.5,
    marginLeft: 56,
  },
  heartIcon: {
    fontSize: 18,
  },
  settingsIcon: {
    fontSize: 20,
  },
  bellIcon: {
    fontSize: 20,
  },
  widgetIcon: {
    fontSize: 20,
  },
  leafIcon: {
    fontSize: 20,
  },
  clockIcon: {
    fontSize: 20,
  },
  globeIcon: {
    fontSize: 20,
  },
  chevron: {
    fontSize: 16,
  },
  prayerButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prayerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
});
