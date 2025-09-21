import { useAuth } from '@/contexts/AuthContext';
import { suggestionService } from '@/services/suggestionService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface SuggestionModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SuggestionModal({ visible, onClose }: SuggestionModalProps) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // Récupérer l'email automatiquement depuis le profil utilisateur
  const userEmail = user?.email || '';

  const handleSubmit = async () => {
    console.log("🔄 Tentative d'envoi de suggestion...");
    console.log('📧 Email utilisateur:', userEmail);
    console.log('👤 Utilisateur connecté:', !!user);
    console.log('📝 Contenu:', content);

    // Validation
    const validation = suggestionService.validateSuggestion({ content, email: userEmail });
    if (!validation.isValid) {
      console.log('❌ Validation échouée:', validation.errors);
      Alert.alert('Erreur de validation', validation.errors.join('\n'));
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📤 Envoi de la suggestion...');
      await suggestionService.submitSuggestion({
        content,
        email: userEmail,
        userId: user?.uid,
      });

      Alert.alert(
        'Merci !',
        "Votre suggestion a été envoyée avec succès. Nous l'examinerons et vous tiendrons informé.",
        [
          {
            text: 'Parfait',
            onPress: () => {
              setContent('');
              onClose();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erreur', error.message || "Impossible d'envoyer votre suggestion.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setContent('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <LinearGradient colors={['#2D5A4A', '#4A7C69', '#6BAF8A']} style={styles.gradient}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                disabled={isSubmitting}
              >
                <Ionicons name="chevron-back" size={24} color="#2D5A4A" />
              </TouchableOpacity>
              <Text style={styles.title}>Suggestion d&apos;amélioration</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.subtitle}>
                Aidez-nous à améliorer Awa en partageant vos idées et suggestions
              </Text>

              {/* User Info */}
              <View style={styles.userInfoContainer}>
                <View style={styles.userInfoItem}>
                  <Ionicons
                    name="person-circle-outline"
                    size={20}
                    color="rgba(255, 255, 255, 0.8)"
                  />
                  <Text style={styles.userInfoText}>Connecté en tant que : {userEmail}</Text>
                </View>
              </View>

              {/* Content Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Votre suggestion</Text>
                <View style={styles.glassInputBackground}>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Décrivez votre idée d'amélioration en détail..."
                    placeholderTextColor="rgba(255, 255, 255, 0.7)"
                    value={content}
                    onChangeText={setContent}
                    multiline
                    numberOfLines={6}
                    textAlignVertical="top"
                    editable={!isSubmitting}
                  />
                </View>
                <Text style={styles.characterCount}>{content.length}/500 caractères</Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                onPress={() => {
                  console.log('🖱️ Bouton cliqué !');
                  console.log('📝 Longueur du contenu:', content.length);
                  console.log("⏳ En cours d'envoi:", isSubmitting);
                  handleSubmit();
                }}
                disabled={isSubmitting || content.length < 10}
              >
                <View style={styles.glassBackground}>
                  <View style={styles.glassInner}>
                    <View style={styles.glassHighlight} />
                    {isSubmitting ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator size="small" color="#FFFFFF" />
                        <Text style={styles.submitButtonText}>Envoi en cours...</Text>
                      </View>
                    ) : (
                      <Text style={styles.submitButtonText}>Envoyer la suggestion</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>

              {/* Info Text */}
              <Text style={styles.infoText}>
                Nous lisons toutes les suggestions et les prenons en compte pour améliorer
                l'application.
              </Text>
            </View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(45, 90, 74, 0.3)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userInfoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  glassInputBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 16,
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 0,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  glassBackground: {
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  glassInner: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    position: 'relative',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
