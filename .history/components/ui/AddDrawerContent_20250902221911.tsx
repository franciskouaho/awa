import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { usePrayers } from '@/hooks/usePrayers';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddDrawerContentProps {
  onClose: () => void;
}

// Interface pour les données du formulaire
interface FormData {
  name: string;
  age: string;
  deathDate: Date;
  location: string;
  personalMessage: string;
}

// Interface pour les erreurs de validation
interface FormErrors {
  name?: string;
  age?: string;
  location?: string;
  personalMessage?: string;
}

export default function AddDrawerContent({ onClose }: AddDrawerContentProps) {
  const colorScheme = useColorScheme();
  const { addPrayer } = usePrayers();
  const { user, firebaseUser } = useAuth();
  const [currentView, setCurrentView] = useState<'menu' | 'prayer-form'>('prayer-form');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    deathDate: new Date(),
    location: '',
    personalMessage: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddOption = (optionId: string) => {
    console.log(`Add option pressed: ${optionId}`);
    if (optionId === 'prayer') {
      setCurrentView('prayer-form');
    } else if (optionId === 'prayer-page') {
      onClose();
      // TODO: Rediriger vers la page de formulaire complet quand elle sera créée
      console.log('Redirection vers formulaire complet - à implémenter');
    }
    // Ici vous pouvez ajouter d'autres options d'ajout
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFormData(prev => ({ ...prev, deathDate: selectedDate }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!formData.age || isNaN(parseInt(formData.age)) || parseInt(formData.age) <= 0) {
      newErrors.age = 'Veuillez entrer un âge valide';
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
          deathDate: formData.deathDate,
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
                  deathDate: new Date(),
                  location: '',
                  personalMessage: '',
                });
                setErrors({});
                setCurrentView('menu');
                onClose();
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

  const addOptions = [
    {
      id: 'prayer',
      title: 'Nouvelle prière',
      subtitle: 'Ajouter une prière pour un défunt',
      icon: 'plus.circle.fill',
    },
  ];

  if (currentView === 'prayer-form') {
    return (
      <View style={styles.container}>
        {/* Header avec bouton Back et titre */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setCurrentView('menu')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.backIcon, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
            >
              ←
            </Text>
            <Text style={[styles.backText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Retour
            </Text>
          </TouchableOpacity>

          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            NOUVELLE PRIÈRE
          </Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
                    borderColor: Colors[colorScheme ?? 'light'].border,
                    justifyContent: 'center',
                  },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={[{ color: Colors[colorScheme ?? 'light'].text }, styles.dateText]}>
                  {formData.deathDate.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.deathDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
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
        </ScrollView>
      </View>
    );
  }

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

        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>AJOUTER</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text
            style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
          >
            Choisissez ce que vous souhaitez ajouter à votre application de prières
          </Text>
        </View>

        {/* Options d'ajout */}
        <Text
          style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
        >
          OPTIONS D&apos;AJOUT
        </Text>
        <View
          style={[styles.menuSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
        >
          {addOptions.map((option, index) => (
            <React.Fragment key={option.id}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAddOption(option.id)}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name={option.icon as any}
                  size={24}
                  color={Colors[colorScheme ?? 'light'].primary}
                />
                <View style={styles.textContainer}>
                  <Text
                    style={[styles.menuItemTitle, { color: Colors[colorScheme ?? 'light'].text }]}
                  >
                    {option.title}
                  </Text>
                  <Text
                    style={[
                      styles.menuItemSubtitle,
                      { color: Colors[colorScheme ?? 'light'].textSecondary },
                    ]}
                  >
                    {option.subtitle}
                  </Text>
                </View>
                <Text
                  style={[styles.chevron, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
                >
                  ›
                </Text>
              </TouchableOpacity>
              {index < addOptions.length - 1 && (
                <View
                  style={[
                    styles.separator,
                    { backgroundColor: Colors[colorScheme ?? 'light'].border },
                  ]}
                />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 4,
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  descriptionSection: {
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 16,
  },
  menuSection: {
    borderRadius: 16,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  textContainer: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  separator: {
    height: 0.5,
    marginLeft: 60,
  },
  chevron: {
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    overflow: 'hidden',
  },
  textArea: {
    minHeight: 120,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 16,
  },
});
