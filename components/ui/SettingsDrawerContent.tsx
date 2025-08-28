import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import BottomDrawer from '@/components/ui/BottomDrawer';
import RemindersDrawerContent from '@/components/ui/RemindersDrawerContent';
import GeneralDrawerContent from '@/components/ui/GeneralDrawerContent';
import FirstNameScreen from '@/components/ui/FirstNameScreen';
import GenderScreen from '@/components/ui/GenderScreen';
import LanguageScreen from '@/components/ui/LanguageScreen';
import PremiumScreen from '@/components/ui/PremiumScreen';

interface SettingsDrawerContentProps {
  onClose: () => void;
}

export default function SettingsDrawerContent({ onClose }: SettingsDrawerContentProps) {
  const colorScheme = useColorScheme();
  const [remindersDrawerVisible, setRemindersDrawerVisible] = useState(false);
  const [generalDrawerVisible, setGeneralDrawerVisible] = useState(false);
  const [currentSubScreen, setCurrentSubScreen] = useState<string | null>(null);

  // États pour les données utilisateur
  const [firstName, setFirstName] = useState('Vfhbd');
  const [gender, setGender] = useState('Autre');
  const [language, setLanguage] = useState('Français');
  const [premium, setPremium] = useState('Non');

  const handleItemPress = (itemId: string) => {
    console.log(`Pressed ${itemId}`);
    // Ici vous pouvez ajouter la logique pour chaque paramètre
    if (itemId === 'general') {
      setGeneralDrawerVisible(true); // Ouvrir le drawer des paramètres généraux
      return; // Ne pas fermer le drawer principal
    } else if (itemId === 'reminders') {
      setRemindersDrawerVisible(true); // Ouvrir le drawer des rappels
      return; // Ne pas fermer le drawer principal
    }
    onClose();
  };

  const handleNavigateToSubScreen = (screenName: string) => {
    setCurrentSubScreen(screenName);
  };

  const handleBackFromSubScreen = () => {
    setCurrentSubScreen(null);
  };

  const handleSaveValue = (key: string, value: string) => {
    switch (key) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'gender':
        setGender(value);
        break;
      case 'language':
        setLanguage(value);
        break;
      case 'premium':
        setPremium(value);
        break;
    }
  };

  // Fonction pour obtenir les valeurs actuelles
  const getCurrentValues = () => ({
    firstName,
    gender,
    language,
    premium,
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
            Back
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
            <Text style={[styles.streakNumber, { color: Colors[colorScheme ?? 'light'].text }]}>
              0
            </Text>
            <Text style={[styles.streakLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Streak
            </Text>
          </View>
          <View style={styles.streakDays}>
            {['Fr', 'Sa', 'Su', 'Mo', 'Tu', 'We', 'Th'].map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text
                  style={[styles.dayText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
                >
                  {day}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    { backgroundColor: Colors[colorScheme ?? 'light'].border },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>

        {/* SETTINGS Section */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          SETTINGS
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
              General
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
              Reminders
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
          JUST FOR YOU
        </Text>
        <View
          style={[styles.menuSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          <View
            style={[styles.separator, { backgroundColor: Colors[colorScheme ?? 'light'].border }]}
          />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => handleItemPress('history')}
            activeOpacity={0.7}
          >
            <IconSymbol name="clock" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              History
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
            onPress={() => handleItemPress('favorite')}
            activeOpacity={0.7}
          >
            <IconSymbol name="heart" size={20} color={Colors[colorScheme ?? 'light'].text} />
            <Text style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Favorite punchlines
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
          FEEDBACK
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
              Contact Us
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

      {/* Drawer General */}
      <BottomDrawer isVisible={generalDrawerVisible} onClose={() => setGeneralDrawerVisible(false)}>
        {currentSubScreen ? (
          // Affichage conditionnel des sous-écrans
          <>
            {currentSubScreen === 'firstName' && (
              <FirstNameScreen
                onBack={handleBackFromSubScreen}
                initialValue={firstName}
                onSave={value => handleSaveValue('firstName', value)}
              />
            )}
            {currentSubScreen === 'gender' && (
              <GenderScreen
                onBack={handleBackFromSubScreen}
                initialValue={gender}
                onSave={value => handleSaveValue('gender', value)}
              />
            )}
            {currentSubScreen === 'language' && (
              <LanguageScreen
                onBack={handleBackFromSubScreen}
                initialValue={language}
                onSave={value => handleSaveValue('language', value)}
              />
            )}
            {currentSubScreen === 'premium' && (
              <PremiumScreen
                onBack={handleBackFromSubScreen}
                initialValue={premium}
                onSave={value => handleSaveValue('premium', value)}
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
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
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
});
