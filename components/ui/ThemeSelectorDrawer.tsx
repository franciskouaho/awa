import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ThemeSelectorDrawerProps {
  selectedTheme: string;
  onThemeSelect: (theme: string) => void;
  onClose: () => void;
}

export default function ThemeSelectorDrawer({ selectedTheme, onThemeSelect, onClose }: ThemeSelectorDrawerProps) {
  const themes = [
    { id: 'auto', name: 'Automatique', icon: '🔄' },
    { id: 'light', name: 'Clair', icon: '☀️' },
    { id: 'dark', name: 'Sombre', icon: '🌙' },
    { id: 'green', name: 'Vert Nature', icon: '🌿' },
    { id: 'blue', name: 'Bleu Océan', icon: '🌊' },
    { id: 'purple', name: 'Violet Mystique', icon: '🔮' },
    { id: 'orange', name: 'Orange Soleil', icon: '🌅' },
    { id: 'red', name: 'Rouge Passion', icon: '❤️' },
    { id: 'pink', name: 'Rose Tendresse', icon: '🌸' },
    { id: 'teal', name: 'Sarcelle Paix', icon: '🕊️' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Choisir un thème</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.doneButton}>Terminé</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {themes.map(theme => (
          <TouchableOpacity
            key={theme.id}
            style={[
              styles.item,
              selectedTheme === theme.id && styles.selectedItem,
            ]}
            onPress={() => onThemeSelect(theme.id)}
          >
            <Text style={styles.itemIcon}>{theme.icon}</Text>
            <Text
              style={[
                styles.itemText,
                selectedTheme === theme.id && styles.selectedItemText,
              ]}
            >
              {theme.name}
            </Text>
            {selectedTheme === theme.id && (
              <IconSymbol name="checkmark.circle.fill" size={20} color="#007AFF" />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeButton: {
    padding: 8,
  },
  doneButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedItem: {
    backgroundColor: '#F0F8FF',
  },
  itemIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
  },
  selectedItemText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});
