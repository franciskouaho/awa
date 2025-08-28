import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import CategorySelectionModal from '@/components/ui/CategorySelectionModal';
import TimeSelectionModal from '@/components/ui/TimeSelectionModal';

interface RemindersDrawerContentProps {
  onClose: () => void;
}

export default function RemindersDrawerContent({ onClose }: RemindersDrawerContentProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [enableReminders, setEnableReminders] = useState(true);
  const [sound, setSound] = useState(true);
  const [morningReminder, setMorningReminder] = useState(true);
  const [eveningReminder, setEveningReminder] = useState(true);
  const [dailyCount, setDailyCount] = useState(3);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('22:00');
  const [selectedFeed, setSelectedFeed] = useState('Current feed');
  const [selectedDays, setSelectedDays] = useState([true, true, true, true, true, true, true]);

  // États pour les modales
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [timeModalVisible, setTimeModalVisible] = useState(false);
  const [timeModalType, setTimeModalType] = useState<'start' | 'end'>('start');

  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  const handleSave = () => {
    // Logique de sauvegarde ici
    const settings = {
      enableReminders,
      sound,
      morningReminder,
      eveningReminder,
      dailyCount,
      startTime,
      endTime,
      selectedFeed,
      selectedDays,
    };

    console.log('Reminders settings saved:', settings);
    onClose();
  };

  const getFeedDisplayName = (feedName: string) => {
    const feedTranslations: { [key: string]: string } = {
      'Current feed': 'Feed actuel',
      'The basics': 'The basics',
      'Unfiltered Raw': 'Unfiltered Raw',
      'Mental Peace': 'Mental Peace',
      'Abundance & Wealth': 'Abundance & Wealth',
      'Confidence Boost': 'Confidence Boost',
      'Morning Fire': 'Morning Fire',
      'My favorites': 'My favorites',
      'Anti-depression': 'Anti-depression',
      'Nurture your faith': 'Nurture your faith',
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
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Title */}
      <View>
        <Text style={styles.title}>Reminders</Text>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Main Settings Card */}
        <View style={styles.card}>
          {/* Enable Reminders */}
          <View style={styles.row}>
            <Text style={styles.label}>Enable reminders</Text>
            <Switch
              style={styles.switch}
              value={enableReminders}
              onValueChange={setEnableReminders}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={enableReminders ? colors.surface : colors.textSecondary}
            />
          </View>

          {/* Selection */}
          <View style={styles.row}>
            <Text style={styles.label}>Selection</Text>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={() => setCategoryModalVisible(true)}
            >
              <Text style={styles.selectionText}>{getFeedDisplayName(selectedFeed)}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* How many per day */}
          <View style={styles.row}>
            <Text style={styles.label}>How many per day</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity style={styles.counterButton} onPress={() => adjustCounter(false)}>
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{dailyCount}x</Text>
              <TouchableOpacity style={styles.counterButton} onPress={() => adjustCounter(true)}>
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Hours */}
          <View style={styles.row}>
            <Text style={styles.label}>Hours</Text>
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

          {/* Sound */}
          <View style={[styles.row, styles.lastRow]}>
            <Text style={styles.label}>Sound</Text>
            <Switch
              style={styles.switch}
              value={sound}
              onValueChange={setSound}
              trackColor={{ false: colors.border, true: colors.info }}
              thumbColor={sound ? colors.surface : colors.textSecondary}
            />
          </View>

          {/* Days of the week */}
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionTitle}>Days of the week</Text>
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

        {/* Daily Streak Reminders Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daily streak reminders</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Morning reminder</Text>
            <Switch
              style={styles.switch}
              value={morningReminder}
              onValueChange={setMorningReminder}
              trackColor={{ false: colors.border, true: colors.info }}
              thumbColor={morningReminder ? colors.surface : colors.textSecondary}
            />
          </View>

          <View style={[styles.row, styles.lastRow]}>
            <Text style={styles.label}>Evening reminder</Text>
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
