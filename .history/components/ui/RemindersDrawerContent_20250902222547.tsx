import CategorySelectionModal from '@/components/ui/CategorySelectionModal';
import TimeSelectionModal from '@/components/ui/TimeSelectionModal';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotificationPermissions } from '@/hooks/useNotificationPermissions';
import { NotificationSettings, useNotifications } from '@/services/notificationService';
import { userService } from '@/services/userService';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface RemindersDrawerContentProps {
  onClose: () => void;
}

export default function RemindersDrawerContent({ onClose }: RemindersDrawerContentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Services et hooks
  const {
    scheduleReminders,
    cancelAllReminders,
    sendTestNotification,
    sendTestDeceasedPrayerNotification,
  } = useNotifications();
  const { permissions, requestPermission, isLoading } = useNotificationPermissions();

  const [enableReminders, setEnableReminders] = useState(true);
  const [sound, setSound] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [enableDeceasedReminder, setEnableDeceasedReminder] = useState(false);
  const [dailyCount, setDailyCount] = useState(3);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  const [selectedFeed, setSelectedFeed] = useState('Feed actuel');
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]);
  const [isSaving, setIsSaving] = useState(false);

  // États pour les modales
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeModalType, setTimeModalType] = useState<'start' | 'end'>('start');

  const days = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Handler for test deceased prayer notification
  const handleTestDeceasedPrayerNotification = async () => {
    if (!permissions?.granted) {
      Alert.alert(
        'Permissions requises',
        'Veuillez autoriser les notifications pour tester cette fonctionnalité.'
      );
      return;
    }

    try {
      await sendTestDeceasedPrayerNotification();
      Alert.alert(
        'Test envoyé',
        'Une notification de prière pour le défunt va apparaître dans quelques secondes.'
      );
    } catch (error) {
      console.error('Erreur lors du test:', error);
      Alert.alert('Erreur', "Impossible d'envoyer la notification de test pour le défunt.");
    }
  };
  // Charger les paramètres de notifications depuis Firebase au montage
  useEffect(() => {
    (async () => {
      const saved = await userService.getNotificationSettings();
      if (saved) {
        setEnableReminders(saved.enableReminders ?? true);
        setSound(saved.sound ?? true);
        setMorningReminder(saved.morningReminder ?? true);
        setEveningReminder(saved.eveningReminder ?? true);
        setEnableDeceasedReminder(saved.enableDeceasedReminder ?? false);
        setDailyCount(saved.dailyCount ?? 3);
        setStartTime(saved.startTime ?? '09:00');
        setEndTime(saved.endTime ?? '22:00');
        setSelectedFeed(saved.selectedFeed ?? 'Feed actuel');
        setSelectedDays(saved.selectedDays ?? [true, true, true, true, true, true, true]);
      }
    })();
  }, []);

  // Vérifier les permissions au chargement
  useEffect(() => {
    if (enableReminders && !permissions?.granted) {
      checkAndRequestPermissions();
    }
  }, [enableReminders, permissions]);

  const checkAndRequestPermissions = async () => {
    if (!permissions?.granted && permissions?.canAskAgain) {
      Alert.alert(
        'Permissions requises',
        'Cette application a besoin de permissions pour envoyer des notifications de rappel.',
        [
          { text: 'Plus tard', style: 'cancel' },
          {
            text: 'Autoriser',
            onPress: async () => {
              const granted = await requestPermission();
              if (!granted) {
                Alert.alert(
                  'Permissions refusées',
                  'Vous pouvez activer les notifications dans les paramètres de votre appareil.'
                );
              }
            },
          },
        ]
      );
    }
  };

  const handleEnableRemindersChange = async (value: boolean) => {
    setEnableReminders(value);

    if (value && !permissions?.granted) {
      const granted = await requestPermission();
      if (!granted) {
        setEnableReminders(false);
        Alert.alert(
          'Permissions requises',
          'Les notifications sont nécessaires pour les rappels. Vous pouvez les activer dans les paramètres.'
        );
        return;
      }
    }

    if (!value) {
      // Annuler toutes les notifications si désactivé
      try {
        await cancelAllReminders();
      } catch (error) {
        console.error("Erreur lors de l'annulation des notifications:", error);
      }
    }
  };

  const toggleDay = (index: number) => {
    const newSelectedDays = [...selectedDays];
    newSelectedDays[index] = !newSelectedDays[index];
    setSelectedDays(newSelectedDays);
  };

  const adjustCounter = (increment: boolean) => {
    if (increment) {
      setDailyCount(Math.min(dailyCount + 1, 10));
    } else {
      setDailyCount(Math.max(dailyCount - 1, 1));
    }
  };

  const openTimeModal = (type: 'start' | 'end') => {
    setTimeModalType(type);
    setTimeModalVisible(true);
  };

  const handleTimeSelect = (time: string) => {
    if (timeModalType === 'start') {
      setStartTime(time);
    } else {
      setEndTime(time);
    }
    setTimeModalVisible(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedFeed(category);
    setCategoryModalVisible(false);
  };

  const handleSave = async () => {
    if (!permissions?.granted && enableReminders) {
      Alert.alert(
        'Permissions requises',
        'Veuillez autoriser les notifications pour sauvegarder vos paramètres de rappel.'
      );
      return;
    }

    setIsSaving(true);

    try {
      const settings: NotificationSettings = {
        enableReminders,
        sound,
        morningReminder,
        eveningReminder,
        enableDeceasedReminder,
        dailyCount,
        startTime,
        endTime,
        selectedFeed,
        selectedDays,
      };

      // Sauvegarder dans Firestore
      await userService.saveNotificationSettings(settings);

      if (enableReminders) {
        await scheduleReminders(settings);
        Alert.alert('Succès', 'Vos rappels ont été programmés avec succès !', [
          { text: 'OK', onPress: onClose },
        ]);
      } else {
        await cancelAllReminders();
        Alert.alert('Succès', 'Tous vos rappels ont été annulés.', [
          { text: 'OK', onPress: onClose },
        ]);
      }

      console.log('Reminders settings saved:', settings);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', "Une erreur s'est produite lors de la sauvegarde de vos paramètres.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!permissions?.granted) {
      Alert.alert(
        'Permissions requises',
        'Veuillez autoriser les notifications pour tester cette fonctionnalité.'
      );
      return;
    }

    try {
      await sendTestNotification();
      Alert.alert('Test envoyé', 'Une notification de test va apparaître dans quelques secondes.');
    } catch (error) {
      console.error('Erreur lors du test:', error);
      Alert.alert('Erreur', "Impossible d'envoyer la notification de test.");
    }
  };

  const getFeedDisplayName = (feedName: string) => {
    const feedTranslations: { [key: string]: string } = {
      'Current feed': 'Feed actuel',
      'Feed actuel': 'Feed actuel',
      'The basics': 'Les bases',
      'Les bases': 'Les bases',
      'Unfiltered Raw': 'Brut et sans filtre',
      'Brut et sans filtre': 'Brut et sans filtre',
      'Mental Peace': 'Paix mentale',
      'Paix mentale': 'Paix mentale',
      'Abundance & Wealth': 'Abondance et richesse',
      'Abondance et richesse': 'Abondance et richesse',
      'Confidence Boost': 'Boost de confiance',
      'Boost de confiance': 'Boost de confiance',
      'Morning Fire': 'Feu matinal',
      'Feu matinal': 'Feu matinal',
      'My favorites': 'Mes favoris',
      'Mes favoris': 'Mes favoris',
      'Anti-depression': 'Anti-dépression',
      'Anti-dépression': 'Anti-dépression',
      'Nurture your faith': 'Nourrir votre foi',
      'Nourrir votre foi': 'Nourrir votre foi',
    };
    return feedTranslations[feedName] || feedName;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: 8,
    },
    closeText: {
      fontSize: 24,
      color: colors.textSecondary,
      fontWeight: '300',
    },
    saveButton: {
      paddingHorizontal: 16,
    },
    saveText: {
      fontSize: 16,
      color: colors.primary,
      fontWeight: '500',
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text,
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    scrollContainer: {
      flex: 1,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      shadowColor: colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    label: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '400',
    },
    sectionTitle: {
      fontSize: 18,
      color: colors.text,
      fontWeight: '600',
      marginBottom: 8,
    },
    selectionButton: {
      backgroundColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    selectionText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginRight: 8,
    },
    arrow: {
      color: colors.textSecondary,
      fontSize: 16,
    },
    counterContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    counterButton: {
      backgroundColor: colors.border,
      width: 40,
      height: 40,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    counterButtonText: {
      fontSize: 18,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    counterValue: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginHorizontal: 20,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeButton: {
      backgroundColor: colors.border,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    timeText: {
      color: colors.textSecondary,
      fontSize: 14,
      marginRight: 8,
    },
    timeSeparator: {
      fontSize: 16,
      color: colors.textSecondary,
      marginHorizontal: 12,
    },
    daysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 12,
    },
    dayButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
    },
    dayButtonActive: {
      backgroundColor: colors.text,
    },
    dayButtonInactive: {
      backgroundColor: colors.border,
    },
    dayText: {
      fontSize: 16,
      fontWeight: '500',
    },
    dayTextActive: {
      color: colors.surface,
    },
    dayTextInactive: {
      color: colors.textSecondary,
    },
    switch: {
      transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
    },
    testButton: {
      backgroundColor: colors.primary,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 12,
    },
    testButtonText: {
      color: colors.surface,
      fontSize: 16,
      fontWeight: '600',
    },
    permissionStatus: {
      marginTop: 12,
    },
    permissionText: {
      fontSize: 16,
      color: colors.text,
      marginBottom: 12,
    },
    permissionButton: {
      backgroundColor: colors.info,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    permissionButtonText: {
      color: colors.surface,
      fontSize: 14,
      fontWeight: '500',
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={[styles.saveText, isSaving && { opacity: 0.5 }]}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View>
        <Text style={styles.title}>Rappels</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Main Settings Card */}
        <View style={styles.card}>
          {/* Switch pour les rappels de prière pour les défunts */}
          <View style={styles.row}>
            <Text style={styles.label}>Activer les rappels pour les défunts</Text>
            <Switch
              style={styles.switch}
              value={enableDeceasedReminder}
              onValueChange={setEnableDeceasedReminder}
              trackColor={{ false: colors.border, true: colors.info }}
              thumbColor={enableDeceasedReminder ? colors.surface : colors.textSecondary}
            />
          </View>

          {/* Hours */}
          <View style={[styles.row, styles.lastRow]}>
            <Text style={styles.label}>Heures</Text>
            <View style={styles.timeContainer}>
              <TouchableOpacity style={styles.timeButton} onPress={() => openTimeModal('start')}>
                <Text style={styles.timeText}>{startTime}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
              <Text style={styles.timeSeparator}>-</Text>
              <TouchableOpacity style={styles.timeButton} onPress={() => openTimeModal('end')}>
                <Text style={styles.timeText}>{endTime}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Days of the week */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Jours de la semaine</Text>
            <View style={styles.daysContainer}>
              {days.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    selectedDays[index] ? styles.dayButtonActive : styles.dayButtonInactive,
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      selectedDays[index] ? styles.dayTextActive : styles.dayTextInactive,
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Test Notification Button (DEV only) */}
        {__DEV__ && permissions?.granted && (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Test des notifications</Text>
              <TouchableOpacity style={styles.testButton} onPress={handleTestNotification}>
                <Text style={styles.testButtonText}>📱 Envoyer une notification de test</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Test notification prière pour le défunt</Text>
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestDeceasedPrayerNotification}
              >
                <Text style={styles.testButtonText}>
                  🕊️ Envoyer une notification de prière pour le défunt
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Daily Streak Reminders Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Rappels de série quotidienne</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Rappel matinal</Text>
            <Switch
              style={styles.switch}
              value={morningReminder}
              onValueChange={setMorningReminder}
              trackColor={{ false: colors.border, true: colors.info }}
              thumbColor={morningReminder ? colors.surface : colors.textSecondary}
            />
          </View>

          <View style={[styles.row, styles.lastRow]}>
            <Text style={styles.label}>Rappel du soir</Text>
            <Switch
              style={styles.switch}
              value={eveningReminder}
              onValueChange={setEveningReminder}
              trackColor={{ false: colors.border, true: colors.info }}
              thumbColor={eveningReminder ? colors.surface : colors.textSecondary}
            />
          </View>
        </View>
      </ScrollView>

      {/* Modales */}
      <CategorySelectionModal
        isVisible={categoryModalVisible}
        onClose={() => setCategoryModalVisible(false)}
        onSelect={handleCategorySelect}
        selectedCategory={selectedFeed}
      />
      <TimeSelectionModal
        isVisible={timeModalVisible}
        onClose={() => setTimeModalVisible(false)}
        onSelect={handleTimeSelect}
        selectedTime={timeModalType === 'start' ? startTime : endTime}
        timeType={timeModalType}
      />
    </View>
  );
}
