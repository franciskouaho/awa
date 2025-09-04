import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TimeSelectionModalProps {
  isVisible: boolean;
  selectedTime: string;
  timeType: 'start' | 'end';
  onSelect: (time: string) => void;
  onClose: () => void;
  disableOverlayClose?: boolean;
}

export default function TimeSelectionModal({
  isVisible,
  selectedTime,
  timeType,
  onSelect,
  onClose,
  disableOverlayClose = false,
}: TimeSelectionModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Générer toutes les heures de la journée avec des intervalles de 30 minutes
  const generateTimes = () => {
    const times = [];

    // Générer toutes les heures de 00:00 à 23:30 avec des intervalles de 30 minutes
    for (let hours = 0; hours < 24; hours++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }

    return times;
  };

  if (!isVisible) return null;

  const times = generateTimes();

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: 400,
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
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      paddingVertical: 20,
    },
    timeItem: {
      paddingVertical: 12,
      paddingHorizontal: 20,
      alignItems: 'center',
      width: '100%',
      borderRadius: 8,
      marginVertical: 4,
    },
    timeItemSelected: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      borderWidth: 2,
      borderColor: 'rgba(0, 122, 255, 0.3)',
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
      fontSize: 18,
    },
  });

  const getTimeStyle = (time: string) => {
    if (time === selectedTime) return styles.timeTextSelected;
    return styles.timeTextUnselected;
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={disableOverlayClose ? undefined : onClose} 
          activeOpacity={1} 
        />
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {timeType === 'start' ? 'Heure de début' : 'Heure de fin'}
            </Text>
            <TouchableOpacity style={styles.doneButton} onPress={onClose}>
              <Text style={[styles.doneText, { color: colors.primary }]}>Terminé</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.content}>
            <ScrollView
              style={styles.timeContainer}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollContent}
            >
              {times.map(time => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeItem, time === selectedTime && styles.timeItemSelected]}
                  onPress={() => onSelect(time)}
                >
                  <Text style={[styles.timeText, getTimeStyle(time), { color: colors.text }]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}
