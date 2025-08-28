import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

interface PremiumScreenProps {
  onBack: () => void;
  initialValue: string;
  onSave: (value: string) => void;
}

export default function PremiumScreen({ onBack, initialValue, onSave }: PremiumScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isPremium, setIsPremium] = useState(initialValue === 'Oui');

  const handleTogglePremium = () => {
    const newValue = !isPremium;
    setIsPremium(newValue);
    onSave(newValue ? 'Oui' : 'Non');
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
    backIcon: {
      fontSize: 20,
      marginRight: 8,
      color: colors.textSecondary,
    },
    backText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 32,
    },
    content: {
      paddingHorizontal: 16,
      flex: 1,
    },
    premiumCard: {
      backgroundColor: '#FFD700',
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      alignItems: 'center',
    },
    premiumIcon: {
      fontSize: 48,
      marginBottom: 16,
    },
    premiumTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#000',
      marginBottom: 8,
    },
    premiumDescription: {
      fontSize: 16,
      color: '#333',
      textAlign: 'center',
      marginBottom: 24,
    },
    featuresContainer: {
      marginBottom: 32,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
    },
    featureIcon: {
      marginRight: 12,
    },
    featureText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    upgradeButton: {
      backgroundColor: isPremium ? '#4CAF50' : '#FFD700',
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    upgradeButtonText: {
      color: '#000',
      fontSize: 18,
      fontWeight: '600',
    },
    statusText: {
      textAlign: 'center',
      fontSize: 16,
      color: colors.textSecondary,
    },
  });

  const features = [
    { icon: '🚫', text: 'Suppression des publicités' },
    { icon: '📱', text: 'Accès à toutes les fonctionnalités' },
    { icon: '🔔', text: 'Rappels personnalisés illimités' },
    { icon: '🎨', text: 'Thèmes exclusifs' },
    { icon: '☁️', text: 'Sauvegarde cloud' },
    { icon: '📊', text: 'Statistiques avancées' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>Général</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Premium</Text>
        <Text style={styles.subtitle}>Débloquez toutes les fonctionnalités</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Premium Card */}
        <View style={styles.premiumCard}>
          <Text style={styles.premiumIcon}>⭐</Text>
          <Text style={styles.premiumTitle}>AWA Premium</Text>
          <Text style={styles.premiumDescription}>
            Profitez d'une expérience sans publicité et accédez à toutes les fonctionnalités
            exclusives
          </Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Upgrade Button */}
        <TouchableOpacity
          style={styles.upgradeButton}
          onPress={handleTogglePremium}
          activeOpacity={0.8}
        >
          <Text style={styles.upgradeButtonText}>
            {isPremium ? 'Premium activé ✓' : 'Passer à Premium - 4,99€/mois'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.statusText}>Statut actuel: {isPremium ? 'Premium' : 'Gratuit'}</Text>
      </ScrollView>
    </View>
  );
}
