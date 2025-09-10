import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  maximumDate?: Date;
  minimumDate?: Date;
}

export default function DatePickerModal({
  visible,
  onClose,
  onDateSelect,
  selectedDate,
  maximumDate = new Date(),
  minimumDate,
}: DatePickerModalProps) {
  const colorScheme = useColorScheme();
  // Utiliser la date sélectionnée ou la date actuelle comme fallback
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

  const navigateYear = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setFullYear(newDate.getFullYear() - 1);
    } else {
      newDate.setFullYear(newDate.getFullYear() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleDateSelect = (day: number) => {
    if (isDateDisabled(day)) return;

    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    onDateSelect(newDate);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
    }
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
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
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

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} activeOpacity={1} onPress={onClose} />
        <View style={[styles.modal, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Handle indicator */}
          <View style={styles.handleContainer}>
            <View
              style={[
                styles.handle,
                { backgroundColor: Colors[colorScheme ?? 'light'].textSecondary },
              ]}
            />
          </View>

          {/* Header */}
          <View
            style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
          >
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Sélectionner une date
            </Text>
            <View style={styles.placeholder} />
          </View>

          {/* Navigation */}
          <View
            style={[
              styles.navigation,
              { borderBottomColor: Colors[colorScheme ?? 'light'].border },
            ]}
          >
            <TouchableOpacity onPress={() => navigateYear('prev')} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
              <Ionicons
                name="chevron-back"
                size={20}
                color={Colors[colorScheme ?? 'light'].text}
                style={{ marginLeft: -8 }}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.navButton}>
              <Ionicons name="chevron-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>

            <View style={styles.dateInfo}>
              <Text style={[styles.monthYear, { color: Colors[colorScheme ?? 'light'].text }]}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </Text>
            </View>

            <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.navButton}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme ?? 'light'].text}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigateYear('next')} style={styles.navButton}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme ?? 'light'].text}
              />
              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors[colorScheme ?? 'light'].text}
                style={{ marginLeft: -8 }}
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

          {/* Boutons d'action */}
          <View style={[styles.actions, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.button,
                styles.cancelButton,
                { borderColor: Colors[colorScheme ?? 'light'].border },
              ]}
            >
              <Text style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Annuler
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConfirm}
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: Colors[colorScheme ?? 'light'].primary },
              ]}
            >
              <Text
                style={[styles.buttonText, { color: Colors[colorScheme ?? 'light'].textOnPrimary }]}
              >
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
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
  modal: {
    width: '100%',
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#2D5A4A', // Couleur primaire AWA pour l'ombre
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 32,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(45, 90, 74, 0.05)',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  monthYear: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  weekDays: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  calendar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingVertical: 8,
    minHeight: 280, // Hauteur minimale pour le calendrier
  },
  dayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayText: {
    fontSize: 17,
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: '#2D5A4A', // Couleur primaire AWA
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  todayDay: {
    backgroundColor: 'rgba(45, 90, 74, 0.1)', // Couleur primaire AWA avec transparence
    borderRadius: 20,
  },
  todayDayText: {
    color: '#2D5A4A', // Couleur primaire AWA
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
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#2D5A4A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButton: {
    borderWidth: 2,
    borderColor: '#2D5A4A',
  },
  confirmButton: {
    // backgroundColor sera défini dynamiquement
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
