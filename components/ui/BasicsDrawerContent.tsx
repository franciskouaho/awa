import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';

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
      id: 'basics',
      title: 'The basics',
      icon: '🎯',
      color: '#4A90E2',
      isSelected: true,
      isUnlocked: true,
    },
    {
      id: 'unfiltered',
      title: 'Unfiltered Raw',
      icon: '🔫',
      color: '#E94B4B',
      isSelected: false,
      isUnlocked: true,
    },
    {
      id: 'mental-peace',
      title: 'Mental Peace',
      icon: '🔒',
      color: '#B8B8B8',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'abundance',
      title: 'Abundance & Wealth',
      icon: '🔒',
      color: '#B8B8B8',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'confidence',
      title: 'Confidence Boost',
      icon: '🔒',
      color: '#B8B8B8',
      isSelected: false,
      isUnlocked: false,
    },
    {
      id: 'morning-fire',
      title: 'Morning Fire',
      icon: '☀️',
      color: '#F5A623',
      isSelected: false,
      isUnlocked: true,
    },
    {
      id: 'favorites',
      title: 'My favorites',
      icon: '🧺',
      color: '#7ED321',
      isSelected: false,
      isUnlocked: true,
    },
    {
      id: 'anti-depression',
      title: 'Anti-depression',
      icon: '🔒',
      color: '#B8B8B8',
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

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          The Basics
        </Text>
      </View>

      {/* Main Content avec background coloré */}
      <View style={styles.mainContent}>
        <Text style={[styles.mainTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          What are you looking for?
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                color: Colors[colorScheme ?? 'light'].text,
              },
            ]}
            placeholder="Search"
            placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Make my own mix button */}
        <TouchableOpacity
          style={[
            styles.makeOwnMixButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].accent },
          ]}
          onPress={onClose}
        >
          <Text
            style={[styles.makeOwnMixText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}
          >
            Make my own mix
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
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  makeOwnMixButton: {
    borderRadius: 25,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  makeOwnMixText: {
    fontSize: 18,
    fontWeight: '600',
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
