import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SimpleDateDrawerProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function SimpleDateDrawer({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  maximumDate = new Date(),
  minimumDate,
}: SimpleDateDrawerProps) {
  const colorScheme = useColorScheme();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date());

  // Mettre à jour currentDate quand selectedDate change
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate);
    }
  }, [selectedDate]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateDisabled = (day: number) => {
    const testDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (maximumDate && testDate > maximumDate) return true;
    if (minimumDate && testDate < minimumDate) return true;
    return false;
  };

  const isDateSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === currentDate.getMonth() &&
      selectedDate.getFullYear() === currentDate.getFullYear()
    );
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(newDate);
    onClose();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Jours du mois précédent
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <View key={`prev-${day}`} style={styles.dayContainer}>
          <Text style={[styles.dayText, styles.otherMonthDay]}>{day}</Text>
        </View>
      );
    }

    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const disabled = isDateDisabled(day);
      const selected = isDateSelected(day);
      const today = isToday(day);

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayContainer,
            selected && styles.selectedDay,
            today && !selected && styles.todayDay,
            disabled && styles.disabledDay,
          ]}
          onPress={() => handleDateSelect(day)}
          disabled={disabled}
        >
          <Text
            style={[
              styles.dayText,
              selected && styles.selectedDayText,
              today && !selected && styles.todayDayText,
              disabled && styles.disabledDayText,
            ]}
          >
            {day}
          </Text>
        </TouchableOpacity>
      );
    }

    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push(
        <View key={`next-${day}`} style={styles.dayContainer}>
          <Text style={[styles.dayText, styles.otherMonthDay]}>{day}</Text>
        </View>
      );
    }

    return days;
  };

  const monthNames = [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ];

  const dayNames = ['D', 'L', 'M', 'Me', 'J', 'V', 'S'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.drawer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: Colors[colorScheme ?? 'light'].textSecondary },
              ]}
            />
          </View>

          {/* Header simple */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Choisir une date
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
          </View>

          {/* Navigation simple */}
          <View style={styles.navigation}>
            <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
              <Ionicons name="chevron-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>

            <Text style={[styles.monthYear, { color: Colors[colorScheme ?? 'light'].text }]}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </Text>

            <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Colors[colorScheme ?? 'light'].text}
              />
            </TouchableOpacity>
          </View>

          {/* Jours de la semaine */}
          <View style={styles.weekDays}>
            {dayNames.map(day => (
              <Text
                key={day}
                style={[
                  styles.weekDayText,
                  { color: Colors[colorScheme ?? 'light'].textSecondary },
                ]}
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendrier */}
          <View style={styles.calendar}>{renderCalendar()}</View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  overlayTouchable: {
    flex: 1,
  },
  drawer: {
    width: '100%',
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedDay: {
    backgroundColor: '#2D5A4A',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDay: {
    backgroundColor: 'rgba(45, 90, 74, 0.1)',
    borderRadius: 20,
  },
  todayDayText: {
    color: '#2D5A4A',
    fontWeight: '600',
  },
  disabledDay: {
    opacity: 0.3,
  },
  disabledDayText: {
    color: '#999999',
  },
  otherMonthDay: {
    color: '#CCCCCC',
  },
});
