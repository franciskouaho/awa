import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useCategories as useCategorySelections } from '@/contexts/CategoryContext';
import { useCategories } from '@/hooks/useCategories';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReminders } from '@/hooks/useReminders';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface BasicsDrawerContentProps {
  onClose: () => void;
}

export default function BasicsDrawerContent({ onClose }: BasicsDrawerContentProps) {
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState('');

  // Utiliser le hook pour récupérer les catégories depuis Firestore
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  // Utiliser le contexte des catégories pour les sélections utilisateur
  const { selectedCategories, toggleCategory } = useCategorySelections();

  // Charger les rappels
  const { reminders, loading: remindersLoading, error: remindersError } = useReminders();

  // Debug : log les rappels et l'état
  console.log('[BasicsDrawerContent] reminders:', reminders);
  console.log('[BasicsDrawerContent] remindersLoading:', remindersLoading);
  console.log('[BasicsDrawerContent] remindersError:', remindersError);
  console.log('[BasicsDrawerContent] selectedCategories:', selectedCategories);
  console.log('[BasicsDrawerContent] categories:', categories);
  console.log('[BasicsDrawerContent] categoriesLoading:', categoriesLoading);

  const navigateTo = (screen: string) => {
    onClose();
    router.push(`/(tabs)/${screen}` as any);
  };

  const handleCategoryPress = async (item: any) => {
    if (!item.isUnlocked) return;
    await toggleCategory(item.id);
  };

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

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>Bases</Text>
      </View>

      {/* Main Content avec background coloré */}
      <View style={styles.mainContent}>
        <Text style={[styles.mainTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Que cherchez-vous ?
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher"
            placeholderTextColor="#999999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Categories Grid */}
        <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
          {categoriesLoading ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, marginTop: 16 }}>
                Chargement des catégories...
              </Text>
            </View>
          ) : categoriesError ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <Text style={{ color: 'red', textAlign: 'center' }}>Erreur: {categoriesError}</Text>
            </View>
          ) : (
            <View style={styles.categoriesGrid}>
              {categories.map(item => {
                const isSelected = selectedCategories.includes(item.id);
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: item.isUnlocked
                          ? Colors[colorScheme ?? 'light'].surface
                          : Colors[colorScheme ?? 'light'].textSecondary + '20',
                        borderColor: isSelected ? item.color : 'transparent',
                        borderWidth: isSelected ? 3 : 0,
                      },
                    ]}
                    onPress={() => handleCategoryPress(item)}
                    disabled={!item.isUnlocked}
                  >
                    <View style={styles.categoryIconContainer}>
                      <Text style={styles.categoryIcon}>{item.icon}</Text>
                    </View>
                    <Text
                      style={[
                        styles.categoryTitle,
                        {
                          color: item.isUnlocked
                            ? Colors[colorScheme ?? 'light'].text
                            : Colors[colorScheme ?? 'light'].textSecondary,
                        },
                      ]}
                    >
                      {item.title}
                    </Text>
                    {isSelected && (
                      <View style={[styles.selectionIndicator, { backgroundColor: item.color }]} />
                    )}
                    {!item.isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <IconSymbol
                          name="lock.fill"
                          size={24}
                          color={Colors[colorScheme ?? 'light'].textSecondary}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Affichage dynamique du contenu selon la sélection */}
          {selectedCategories.includes('reminders') && (
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  marginBottom: 12,
                  color: Colors[colorScheme ?? 'light'].text,
                }}
              >
                Rappels
              </Text>
              {remindersLoading ? (
                <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
                  Chargement...
                </Text>
              ) : remindersError ? (
                <Text style={{ color: 'red' }}>{remindersError}</Text>
              ) : reminders.length === 0 ? (
                <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
                  Aucun rappel disponible
                </Text>
              ) : (
                reminders.map(reminder => (
                  <View
                    key={reminder.id}
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      borderRadius: 10,
                      backgroundColor: Colors[colorScheme ?? 'light'].surface,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: '600',
                        fontSize: 16,
                        color: Colors[colorScheme ?? 'light'].text,
                      }}
                    >
                      {reminder.title}
                    </Text>
                    <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
                      {reminder.description}
                    </Text>
                    <Text
                      style={{
                        color: Colors[colorScheme ?? 'light'].textSecondary,
                        fontSize: 13,
                        marginTop: 4,
                      }}
                    >
                      ⏰ {reminder.time}
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Message quand aucune catégorie n'est sélectionnée */}
          {selectedCategories.length === 0 && (
            <View style={{ marginTop: 24, alignItems: 'center', padding: 20 }}>
              <Text
                style={{
                  color: Colors[colorScheme ?? 'light'].textSecondary,
                  fontSize: 16,
                  textAlign: 'center',
                }}
              >
                Sélectionnez une ou plusieurs catégories pour voir leur contenu
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingTop: 20,
    paddingBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'left',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#000000',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  makeOwnMixButton: {
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#4CAF50',
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  makeOwnMixText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  categoriesContainer: {
    flex: 1,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  categoryCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectionIndicator: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  lockOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});
