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
import React, { useState, useEffect } from 'react';
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
        <View style={[styles.statsCard, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <View style={styles.statContainer}>
            <IconSymbol name="heart" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            <View style={styles.statTextContainer}>
              <Text style={[styles.statNumber, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {totalPrayerCount}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {totalPrayerCount === 1 ? 'personne a prié' : 'personnes ont prié'}
              </Text>
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
