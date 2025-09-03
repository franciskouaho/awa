import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimeSelectionModalProps {
  isVisible: boolean;
  selectedTime: string;
  timeType: 'start' | 'end';
  onSelect: (time: string) => void;
  onClose: () => void;
}

export default function TimeSelectionModal({
  isVisible,
  selectedTime,
  timeType,
  onSelect,
  onClose,
}: TimeSelectionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Générer les heures autour de l'heure sélectionnée
  const generateTimes = () => {
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const times = [];

    // Générer 3 heures avant et 3 heures après
    for (let i = -3; i <= 3; i++) {
      let newHours = hours + i;
      if (newHours < 0) newHours += 24;
      if (newHours >= 24) newHours -= 24;

      const timeString = `${newHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      times.push(timeString);
    }

    return times;
  };

  if (!isVisible) return null;

  const times = generateTimes();
  const centerIndex = Math.floor(times.length / 2);

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: 300,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 0.5,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
    },
    doneButton: {
      paddingHorizontal: 4,
      paddingVertical: 4,
    },
    doneText: {
      fontSize: 17,
      fontWeight: '600',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 20,
    },
    timeContainer: {
      alignItems: 'center',
    },
    timeItem: {
      paddingVertical: 12,
      alignItems: 'center',
      width: '100%',
    },
    timeText: {
      fontSize: 24,
      fontWeight: '400',
    },
    timeTextSelected: {
      fontWeight: '600',
      fontSize: 28,
    },
    timeTextUnselected: {
      fontSize: 20,
    },
    timeTextFaded: {
      fontSize: 18,
    },
  });

  const getTimeStyle = (index: number) => {
    const distance = Math.abs(index - centerIndex);
    if (distance === 0) return styles.timeTextSelected;
    if (distance === 1) return styles.timeTextUnselected;
    return styles.timeTextFaded;
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Jusqu'à</Text>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>Terminé</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <View style={styles.timeContainer}>
              {times.map((time, index) => (
                <TouchableOpacity key={time} style={styles.timeItem} onPress={() => onSelect(time)}>
                  <Text style={[styles.timeText, getTimeStyle(index)]}>{time}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
