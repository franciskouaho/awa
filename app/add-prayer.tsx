import { IconSymbol } from '@/components/ui/IconSymbol';
import SimpleDateDrawer from '@/components/ui/SimpleDateDrawer';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Interface pour les données du formulaire
interface FormData {
  name: string;
  age: string;
  deathDate: Date | null;
  location: string;
  personalMessage: string;
}

// Interface pour les erreurs de validation
interface FormErrors {
  name?: string;
  age?: string;
  deathDate?: string;
  location?: string;
  personalMessage?: string;
}

export default function AddPrayerPage() {
  const colorScheme = useColorScheme();
  const { addPrayer } = usePrayers();
  const { user, firebaseUser } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    deathDate: null,
    location: '',
    personalMessage: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (selectedDate: Date) => {
    setFormData(prev => ({ ...prev, deathDate: selectedDate }));
    setShowDatePicker(false);
  };

  const handleClearDate = () => {
    setFormData(prev => ({ ...prev, deathDate: null }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Veuillez entrer un âge valide';
    }

    // Validation de la date de décès (optionnelle)
    if (formData.deathDate && formData.deathDate > new Date()) {
      newErrors.deathDate = 'La date de décès ne peut pas être dans le futur';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Le lieu est requis';
    }

    if (!formData.personalMessage.trim()) {
      newErrors.personalMessage = 'Le message personnel est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Vérifier que l'utilisateur est connecté
      const currentUserId = user?.uid || firebaseUser?.uid;
      if (!currentUserId) {
        Alert.alert('Erreur', 'Vous devez être connecté pour créer une prière');
        return;
      }

      setIsLoading(true);
      try {
        // Préparer les données pour Firebase
        const prayerData = {
          name: formData.name.trim(),
          age: parseInt(formData.age),
          deathDate: formData.deathDate || new Date(), // Utiliser la date actuelle si pas de date spécifiée
          location: formData.location.trim(),
          personalMessage: formData.personalMessage.trim(),
          prayerCount: 0, // Commence à 0
          creatorId: currentUserId, // Ajouter l'ID de l'utilisateur connecté
        };

        // Sauvegarder dans Firebase
        const result = await addPrayer(prayerData);

        if (result.success) {
          Alert.alert('Succès', `${formData.name} a été ajouté(e) à vos prières.`, [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setFormData({
                  name: '',
                  age: '',
                  deathDate: null,
                  location: '',
                  personalMessage: '',
                });
                setErrors({});
                router.back();
              },
            },
          ]);
        } else {
          Alert.alert('Erreur', `Impossible de sauvegarder: ${result.error}`);
        }
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        Alert.alert('Erreur', "Une erreur inattendue s'est produite lors de la sauvegarde.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        { backgroundColor: Colors[colorScheme ?? 'light'].drawer.backgroundColor },
      ]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header avec bouton Back et titre */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].drawer.backgroundColor,
            borderBottomColor: Colors[colorScheme ?? 'light'].border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol
            name="chevron.left"
            size={20}
            color={Colors[colorScheme ?? 'light'].textSecondary}
          />
          <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Retour
          </Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Ajouter une prière
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Nom complet */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Nom complet *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: errors.name
                    ? Colors[colorScheme ?? 'light'].error
                    : Colors[colorScheme ?? 'light'].border,
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Prénom et nom de famille"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
            {errors.name && (
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                {errors.name}
              </Text>
            )}
          </View>

          {/* Âge */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Âge au décès *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: errors.age
                    ? Colors[colorScheme ?? 'light'].error
                    : Colors[colorScheme ?? 'light'].border,
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              value={formData.age}
              onChangeText={text => setFormData(prev => ({ ...prev, age: text }))}
              placeholder="Ex: 65"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              keyboardType="numeric"
            />
            {errors.age && (
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                {errors.age}
              </Text>
            )}
          </View>

          {/* Date de décès */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Date de décès
            </Text>
            <TouchableOpacity
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: errors.deathDate
                    ? Colors[colorScheme ?? 'light'].error
                    : Colors[colorScheme ?? 'light'].border,
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexDirection: 'row',
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[
                { color: Colors[colorScheme ?? 'light'].text }, 
                styles.dateText,
                !formData.deathDate && { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                {formData.deathDate 
                  ? formData.deathDate.toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Sélectionner une date (optionnel)'
                }
              </Text>
              <View style={styles.dateActions}>
                {formData.deathDate && (
                  <TouchableOpacity
                    onPress={handleClearDate}
                    style={styles.clearDateButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <IconSymbol
                      name="xmark.circle.fill"
                      size={18}
                      color={Colors[colorScheme ?? 'light'].textSecondary}
                    />
                  </TouchableOpacity>
                )}
                <IconSymbol
                  name="calendar"
                  size={20}
                  color={Colors[colorScheme ?? 'light'].textSecondary}
                />
              </View>
            </TouchableOpacity>
            {errors.deathDate && (
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                {errors.deathDate}
              </Text>
            )}
          </View>

          {/* Lieu */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Lieu (ville, pays) *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: errors.location
                    ? Colors[colorScheme ?? 'light'].error
                    : Colors[colorScheme ?? 'light'].border,
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              value={formData.location}
              onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
              placeholder="Ex: Casablanca, Maroc"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
            {errors.location && (
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                {errors.location}
              </Text>
            )}
          </View>

          {/* Message personnel */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Message personnel *
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  borderColor: errors.personalMessage
                    ? Colors[colorScheme ?? 'light'].error
                    : Colors[colorScheme ?? 'light'].border,
                  color: Colors[colorScheme ?? 'light'].text,
                },
              ]}
              value={formData.personalMessage}
              onChangeText={text => setFormData(prev => ({ ...prev, personalMessage: text }))}
              placeholder="Partagez un souvenir ou un message personnel..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            {errors.personalMessage && (
              <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].error }]}>
                {errors.personalMessage}
              </Text>
            )}
          </View>

          {/* Bouton de soumission */}
          <View style={styles.submitButtonContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: isLoading
                    ? Colors[colorScheme ?? 'light'].textSecondary
                    : Colors[colorScheme ?? 'light'].primary,
                },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <Text
                style={[
                  styles.submitButtonText,
                  { color: Colors[colorScheme ?? 'light'].textOnPrimary },
                ]}
              >
                {isLoading ? 'Sauvegarde en cours...' : 'Ajouter cette personne'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Drawer de sélection de date */}
      <SimpleDateDrawer
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateChange}
        selectedDate={formData.deathDate}
        maximumDate={new Date()}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    flexDirection: 'column',
    borderBottomWidth: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 36,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 18,
    fontSize: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 130,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 16,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  submitButtonContainer: {
    marginTop: 24,
    paddingHorizontal: 4,
  },
  submitButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  dateText: {
    fontSize: 16,
  },
  dateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clearDateButton: {
    padding: 4,
  },
});
