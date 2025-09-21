import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface PrayerTutorialModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PrayerTutorialModal({ visible, onClose }: PrayerTutorialModalProps) {
  const tutorialSteps = [
    {
      icon: 'heart-outline',
      title: 'Créez vos prières',
      description:
        'Ajoutez des prières personnalisées pour vos proches défunts avec leur nom, âge et un message personnel.',
    },
    {
      icon: 'notifications-outline',
      title: 'Recevez des rappels',
      description:
        'Configurez des notifications pour vous rappeler de prier régulièrement pour vos proches.',
    },
    {
      icon: 'people-outline',
      title: 'Partagez avec d&apos;autres',
      description:
        'Partagez vos prières avec la communauté pour que d&apos;autres puissent prier avec vous.',
    },
    {
      icon: 'flame-outline',
      title: 'Suivez vos prières',
      description:
        'Voyez combien de fois chaque prière a été dite et gardez une trace de votre engagement spirituel.',
    },
  ];

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={20} style={styles.blurContainer}>
          <LinearGradient colors={['#2D5A4A', '#4A7C69', '#6BAF8A']} style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Bienvenue dans Awa</Text>
              <Text style={styles.subtitle}>Comment utiliser l&apos;application</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {tutorialSteps.map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <View style={styles.stepIconContainer}>
                    <Ionicons name={step.icon as any} size={32} color="#FFFFFF" />
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
              ))}

              <View style={styles.tipContainer}>
                <View style={styles.tipIconContainer}>
                  <Ionicons name="bulb-outline" size={24} color="#FFD700" />
                </View>
                <Text style={styles.tipText}>
                  💡 Conseil : Faites glisser les cartes vers le haut ou vers le bas pour naviguer
                  entre les prières, comme sur TikTok !
                </Text>
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <View style={styles.closeButtonGlass}>
                  <View style={styles.closeButtonInner}>
                    <View style={styles.closeButtonHighlight} />
                    <Ionicons name="checkmark" size={20} color="#2D5A4A" />
                    <Text style={styles.closeButtonText}>Compris !</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalContainer: {
    padding: 0,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    maxHeight: height * 0.5,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  stepIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 8,
  },
  tipIconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  footer: {
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  closeButton: {
    alignSelf: 'center',
  },
  closeButtonGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    overflow: 'hidden',
  },
  closeButtonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButtonText: {
    color: '#2D5A4A',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
