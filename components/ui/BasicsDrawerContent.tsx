import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface BasicsDrawerContentProps {
  onClose: () => void;
}

export default function BasicsDrawerContent({ onClose }: BasicsDrawerContentProps) {
  const colorScheme = useColorScheme();
  const [searchText, setSearchText] = useState('');

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

  const handleCategoryPress = (item: any) => {
    if (!item.isUnlocked) return;

    if (item.id === 'basics') {
      navigateTo('prayers');
    } else {
      navigateTo('prayers');
    }
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
            Back
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

        {/* Make my own mix button */}
        <TouchableOpacity
          style={styles.makeOwnMixButton}
          onPress={onClose}
        >
          <Text style={styles.makeOwnMixText}>
            Créer ma sélection
          </Text>
        </TouchableOpacity>

        {/* Categories Grid */}
        <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.categoriesGrid}>
            {categoryItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryCard,
                  {
                    backgroundColor: item.isUnlocked
                      ? Colors[colorScheme ?? 'light'].surface
                      : Colors[colorScheme ?? 'light'].textSecondary + '20',
                    borderColor: item.isSelected ? item.color : 'transparent',
                    borderWidth: item.isSelected ? 3 : 0,
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
                {item.isSelected && (
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
            ))}
          </View>
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
