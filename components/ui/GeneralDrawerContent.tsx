import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserSettings } from '@/hooks/useUserSettings';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface GeneralDrawerContentProps {
  onClose: () => void;
  onNavigateToScreen: (screenName: string) => void;
  currentValues?: {
    firstName: string;
    gender: string;
    language: string;
  };
}

export default function GeneralDrawerContent({
  onClose,
  onNavigateToScreen,
  currentValues,
}: GeneralDrawerContentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { settings, loading } = useUserSettings();
  const { user, firebaseUser } = useAuth();



  // Utiliser les données de Firebase en priorité, puis les valeurs passées en props ou des valeurs par défaut
  const firstName = settings?.firstName || currentValues?.firstName || 'Utilisateur';
  const gender = settings?.gender || currentValues?.gender || 'Autre';
  const language = settings?.language || currentValues?.language || 'Français';

  const handleItemPress = (itemId: string) => {
    console.log(`Pressed ${itemId}`);
    onNavigateToScreen(itemId);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      paddingVertical: 20,
      alignItems: 'flex-start',
      flexDirection: 'column',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
    },

    backText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: 1,
      color: colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 8,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '600',
      letterSpacing: 1,
      marginBottom: 12,
      marginTop: 16,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
    },
    separator: {
      height: 0.5,
      marginLeft: 56,
      backgroundColor: colors.border,
    },
    iconContainer: {
      width: 24,
      height: 24,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuItemText: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    menuItemValue: {
      fontSize: 16,
      color: colors.textSecondary,
      marginRight: 8,
    },
    chevron: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    loadingContainer: {
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 16,
      textAlign: 'center',
    },
  });



  return (
    <View style={styles.container}>
      {/* Header avec bouton Back et titre */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={20} color={colors.textSecondary} />
          <Text style={[styles.backText, { color: colors.text }]}>Retour</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Général</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Chargement des paramètres...
            </Text>
          </View>
        ) : (
          <>
            {/* PERSONAL INFORMATION Section */}
            <Text style={styles.sectionTitle}>INFORMATIONS PERSONNELLES</Text>
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleItemPress('firstName')}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconSymbol name="person.fill" size={20} color={colors.text} />
                </View>
                <Text style={styles.menuItemText}>Prénom</Text>
                <Text style={styles.menuItemValue}>{firstName}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleItemPress('gender')}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconSymbol name="person.2.fill" size={20} color={colors.text} />
                </View>
                <Text style={styles.menuItemText}>Genre</Text>
                <Text style={styles.menuItemValue}>{gender}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

              <View style={styles.separator} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleItemPress('language')}
                activeOpacity={0.7}
              >
                <View style={styles.iconContainer}>
                  <IconSymbol name="textformat" size={20} color={colors.text} />
                </View>
                <Text style={styles.menuItemText}>Langue</Text>
                <Text style={styles.menuItemValue}>{language}</Text>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            </View>

          </>
        )}
      </ScrollView>
    </View>
  );
}
