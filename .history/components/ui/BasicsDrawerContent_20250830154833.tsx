import { IconSymbol } from '@/components/ui/IconSymbol';
import { db } from '@/config/firebase';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import { useReminders } from '@/hooks/useReminders';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
  const { user } = useAuth();
  const userId = user?.uid;
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['prayers']);

  // Charger la sélection persistée au montage
  useEffect(() => {
    const loadSelectedCategories = async () => {
      try {
        // 1. Charger depuis AsyncStorage (fallback local)
        const saved = await AsyncStorage.getItem('selectedCategories');
        if (saved) {
          setSelectedCategories(JSON.parse(saved));
        }
        // 2. Charger depuis Firestore (si userId dispo)
        if (userId) {
          const ref = doc(db, 'users', userId, 'settings', 'categories');
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data && data.selectedCategories) {
              setSelectedCategories(data.selectedCategories);
              // Met à jour le local aussi
              AsyncStorage.setItem('selectedCategories', JSON.stringify(data.selectedCategories));
            }
          }
        }
      } catch (e) {
        console.log('Erreur chargement selectedCategories:', e);
      }
    };
    loadSelectedCategories();
  }, []);

  // Charger les rappels
  const { reminders, loading: remindersLoading, error: remindersError } = useReminders();

  // Charger les prières
  const { prayers, loading: prayersLoading, error: prayersError, loadPrayers } = usePrayers();

  // Charger les prières au montage
  useEffect(() => {
    if (selectedCategories.includes('prayers')) {
      loadPrayers();
    }
  }, [selectedCategories, loadPrayers]);

  // Debug : log les rappels et l'état
  console.log('[BasicsDrawerContent] reminders:', reminders);
  console.log('[BasicsDrawerContent] remindersLoading:', remindersLoading);
  console.log('[BasicsDrawerContent] remindersError:', remindersError);
  console.log('[BasicsDrawerContent] prayers:', prayers);
  console.log('[BasicsDrawerContent] prayersLoading:', prayersLoading);

  const navigateTo = (screen: string) => {
    onClose();
    router.push(`/(tabs)/${screen}` as any);
  };

  const categoryItems = [
    {
      id: 'prayers',
      title: 'Prières',
      icon: '🤲',
      color: '#4A90E2',
      isSelected: true,
      isUnlocked: true,
    },
    {
      id: 'reminders',
      title: 'Rappels',
      icon: '🔔',
      color: '#4CAF50',
      isSelected: true,
      isUnlocked: true,
    },
    {
      id: 'quran',
      title: 'Coran',
      icon: '📖',
      color: '#00C851',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'dhikr',
      title: 'Dhikr',
      icon: '📿',
      color: '#FF8800',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'qibla',
      title: 'Qibla',
      icon: '🧭',
      color: '#E94B4B',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'calendar',
      title: 'Calendrier',
      icon: '📅',
      color: '#9C27B0',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'names',
      title: '99 Noms',
      icon: '✨',
      color: '#F5A623',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'duas',
      title: 'Duas',
      icon: '🤲',
      color: '#7ED321',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'hijri',
      title: 'Hijri',
      icon: '🌙',
      color: '#607D8B',
      isSelected: false,
      isUnlocked: false,
    },
  ];

  const handleCategoryPress = async (item: any) => {
    if (!item.isUnlocked) return;
    setSelectedCategories(prev => {
      let updated;
      if (prev.includes(item.id)) {
        updated = prev.filter(id => id !== item.id);
      } else {
        updated = [...prev, item.id];
      }
      // Sauvegarder la sélection localement
      AsyncStorage.setItem('selectedCategories', JSON.stringify(updated));
      // Sauvegarder la sélection sur Firestore (SDK Web)
      if (userId) {
        const ref = doc(db, 'users', userId, 'settings', 'categories');
        setDoc(ref, { selectedCategories: updated });
      }
      return updated;
    });
    // Ne quitte plus le drawer !
  };

  // Fonction pour afficher le contenu des prières
  const renderPrayersContent = () => (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          marginBottom: 12,
          color: Colors[colorScheme ?? 'light'].text,
        }}
      >
        Prières
      </Text>
      {prayersLoading ? (
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, marginTop: 8 }}>
            Chargement des prières...
          </Text>
        </View>
      ) : prayersError ? (
        <Text style={{ color: 'red' }}>{prayersError}</Text>
      ) : prayers.length === 0 ? (
        <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
          Aucune prière disponible
        </Text>
      ) : (
        prayers.slice(0, 3).map(prayer => (
          <View
            key={prayer.id}
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              backgroundColor: Colors[colorScheme ?? 'light'].surface,
              borderLeftWidth: 4,
              borderLeftColor: '#4A90E2',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 16,
                color: Colors[colorScheme ?? 'light'].text,
                marginBottom: 4,
              }}
            >
              {prayer.name}
            </Text>
            <Text
              style={{
                color: Colors[colorScheme ?? 'light'].textSecondary,
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {prayer.age} ans • {prayer.location}
            </Text>
            <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, fontSize: 13 }}>
              🙏 {prayer.prayerCount} prières
            </Text>
          </View>
        ))
      )}
      {prayers.length > 3 && (
        <TouchableOpacity
          style={{
            padding: 12,
            alignItems: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].primary + '20',
            borderRadius: 8,
          }}
          onPress={() => navigateTo('prayers')}
        >
          <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontWeight: '500' }}>
            Voir toutes les prières ({prayers.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Fonction pour afficher le contenu des rappels
  const renderRemindersContent = () => (
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
        <View style={{ alignItems: 'center', padding: 20 }}>
          <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, marginTop: 8 }}>
            Chargement des rappels...
          </Text>
        </View>
      ) : remindersError ? (
        <Text style={{ color: 'red' }}>{remindersError}</Text>
      ) : reminders.length === 0 ? (
        <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary }}>
          Aucun rappel disponible
        </Text>
      ) : (
        reminders.slice(0, 3).map(reminder => (
          <View
            key={reminder.id}
            style={{
              marginBottom: 16,
              padding: 16,
              borderRadius: 12,
              backgroundColor: Colors[colorScheme ?? 'light'].surface,
              borderLeftWidth: 4,
              borderLeftColor: '#4CAF50',
            }}
          >
            <Text
              style={{
                fontWeight: '600',
                fontSize: 16,
                color: Colors[colorScheme ?? 'light'].text,
                marginBottom: 4,
              }}
            >
              {reminder.title}
            </Text>
            <Text
              style={{
                color: Colors[colorScheme ?? 'light'].textSecondary,
                fontSize: 14,
                marginBottom: 4,
              }}
            >
              {reminder.description}
            </Text>
            <Text style={{ color: Colors[colorScheme ?? 'light'].textSecondary, fontSize: 13 }}>
              ⏰ {reminder.time}
            </Text>
          </View>
        ))
      )}
      {reminders.length > 3 && (
        <TouchableOpacity
          style={{
            padding: 12,
            alignItems: 'center',
            backgroundColor: Colors[colorScheme ?? 'light'].primary + '20',
            borderRadius: 8,
          }}
          onPress={() => navigateTo('reminders')}
        >
          <Text style={{ color: Colors[colorScheme ?? 'light'].primary, fontWeight: '500' }}>
            Voir tous les rappels ({reminders.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

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
          <View style={styles.categoriesGrid}>
            {categoryItems.map(item => {
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

          {/* Affichage dynamique du contenu selon la sélection */}
          {selectedCategories.includes('prayers') && renderPrayersContent()}
          {selectedCategories.includes('reminders') && renderRemindersContent()}

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
