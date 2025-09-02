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
import { usePrayers } from '@/hooks/usePrayers';
import { useUserSettings } from '@/hooks/useUserSettings';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SettingsDrawerContentProps {
  onClose: () => void;
}

export default function SettingsDrawerContent({ onClose }: SettingsDrawerContentProps) {
  const colorScheme = useColorScheme();
  const { settings, saveSetting, error } = useUserSettings();
  const { prayers, loadPrayers } = usePrayers();

  const [remindersDrawerVisible, setRemindersDrawerVisible] = useState(false);
  const [generalDrawerVisible, setGeneralDrawerVisible] = useState(false);
  const [userPrayersDrawerVisible, setUserPrayersDrawerVisible] = useState(false);
  const [currentSubScreen, setCurrentSubScreen] = useState<string | null>(null);
  const [totalPrayerCount, setTotalPrayerCount] = useState(0);

  // Charger les prières et calculer le total
  useEffect(() => {
    loadPrayers();
  }, []);

  // Calculer le nombre total de personnes qui ont prié
  useEffect(() => {
    if (prayers && prayers.length > 0) {
      const total = prayers.reduce((sum, prayer) => sum + (prayer.prayerCount || 0), 0);
      setTotalPrayerCount(total);
    }
  }, [prayers]);

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
      }
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  };

  // Fonction pour obtenir les valeurs actuelles
  const getCurrentValues = () => ({
    firstName: settings?.firstName,
    gender: settings?.gender,
    language: settings?.language,
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
                <Text style={styles.statNumber}>{totalPrayerCount.toLocaleString()}</Text>
                <Text style={styles.statLabel}>
                  {totalPrayerCount === 1 ? 'personne a prié' : 'personnes ont prié'}
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
    marginBottom: 16,
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
  statsCard: {
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: 'rgba(45, 90, 74, 0.3)',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  statsCardBackground: {
    position: 'relative',
    padding: 24,
    paddingVertical: 28,
  },
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
  statTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
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
  statSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
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

  chevron: {
    fontSize: 16,
  },
});
