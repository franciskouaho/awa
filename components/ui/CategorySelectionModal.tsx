import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

interface CategorySelectionModalProps {
  isVisible: boolean;
  selectedCategory: string;
  onSelect: (category: string) => void;
  onClose: () => void;
}

export default function CategorySelectionModal({
  isVisible,
  selectedCategory,
  onSelect,
  onClose,
}: CategorySelectionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const categories = [
    { id: 'current-feed', name: 'Current feed', unlocked: true },
    { id: 'the-basics', name: 'The basics', unlocked: true },
    { id: 'unfiltered-raw', name: 'Unfiltered Raw', unlocked: true },
    { id: 'mental-peace', name: 'Mental Peace', unlocked: false },
    { id: 'abundance-wealth', name: 'Abundance & Wealth', unlocked: false },
    { id: 'confidence-boost', name: 'Confidence Boost', unlocked: false },
    { id: 'morning-fire', name: 'Morning Fire', unlocked: true },
    { id: 'my-favorites', name: 'My favorites', unlocked: true },
    { id: 'anti-depression', name: 'Anti-depression', unlocked: false },
    { id: 'nurture-faith', name: 'Nurture your faith', unlocked: false },
  ];

  if (!isVisible) return null;

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 0.5,
      borderBottomColor: '#E5E5E5',
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: '#000000',
    },
    doneButton: {
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    doneText: {
      fontSize: 17,
      color: '#007AFF',
      fontWeight: '600',
    },
    content: {
      maxHeight: 400,
    },
    categoryItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 0.5,
      borderBottomColor: '#E5E5E5',
    },
    lastCategoryItem: {
      borderBottomWidth: 0,
    },
    categoryText: {
      fontSize: 17,
      fontWeight: '400',
      flex: 1,
    },
    categoryTextUnlocked: {
      color: '#000000',
    },
    categoryTextSelected: {
      color: '#007AFF',
      fontWeight: '600',
    },
    categoryTextLocked: {
      color: '#C7C7CC',
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    checkmark: {
      fontSize: 18,
      color: '#007AFF',
      fontWeight: 'bold',
      marginLeft: 8,
    },
    lockIcon: {
      fontSize: 16,
      color: '#C7C7CC',
      marginLeft: 8,
    },
  });

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Select a category</Text>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {categories.map((category, index) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  index === categories.length - 1 && styles.lastCategoryItem,
                ]}
                onPress={() => category.unlocked && onSelect(category.name)}
                disabled={!category.unlocked}
                activeOpacity={category.unlocked ? 0.6 : 1}
              >
                <Text
                  style={[
                    styles.categoryText,
                    !category.unlocked
                      ? styles.categoryTextLocked
                      : selectedCategory === category.name
                        ? styles.categoryTextSelected
                        : styles.categoryTextUnlocked,
                  ]}
                >
                  {category.name}
                </Text>
                <View style={styles.rightContainer}>
                  {category.unlocked ? (
                    selectedCategory === category.name && <Text style={styles.checkmark}>✓</Text>
                  ) : (
                    <Text style={styles.lockIcon}>🔒</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
