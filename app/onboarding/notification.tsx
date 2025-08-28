import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
export default function NotificationScreen() {
  const [frequency, setFrequency] = useState(3);
  const [fromTime, setFromTime] = useState('09:00');
  const [toTime, setToTime] = useState('22:00');
  const router = useRouter();
  const colorScheme = useColorScheme();

  const adjustFrequency = (delta: number) => {
    setFrequency(Math.max(1, Math.min(10, frequency + delta)));
  };

  const adjustTime = (type: 'from' | 'to', delta: number) => {
    const currentTime = type === 'from' ? fromTime : toTime;
    const [hours, minutes] = currentTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + (delta * 60);
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    const newTime = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    
    if (type === 'from') {
      setFromTime(newTime);
    } else {
      setToTime(newTime);
    }
  };

  const handleEnableNotifications = async () => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify({
        enabled: true,
        frequency,
        fromTime,
        toTime,
      }));
      router.push('./calculating');
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  const handleNotNow = async () => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify({
        enabled: false,
        frequency,
        fromTime,
        toTime,
      }));
      router.push('./calculating');
    } catch (error) {
      console.error('Error saving notification settings:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].onboarding.backgroundColor }]}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          Recevez des rappels spirituels tout au long de la journée
        </Text>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteHeader}>
            <View style={styles.appIcon}>
              <Text style={styles.appIconText}>AWA{'\n'}Prières</Text>
            </View>
            <View style={styles.quoteContent}>
              <Text style={styles.quoteArrow}>↙</Text>
              <Text style={styles.quoteText}>Rappel de prier pour nos défunts.</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsContainer}>
          {/* Frequency */}
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Combien par jour ?</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => adjustFrequency(-1)}
              >
                <Text style={styles.counterButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.counterValue}>{frequency}x</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => adjustFrequency(1)}
              >
                <Text style={styles.counterButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Time Range */}
          <View style={styles.timeContainer}>
            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>De</Text>
              <View style={styles.timeSelector}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => adjustTime('from', -1)}
                >
                  <Text style={styles.timeButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>{fromTime}</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => adjustTime('from', 1)}
                >
                  <Text style={styles.timeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.timeRow}>
              <Text style={styles.timeLabel}>À</Text>
              <View style={styles.timeSelector}>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => adjustTime('to', -1)}
                >
                  <Text style={styles.timeButtonText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.timeValue}>{toTime}</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => adjustTime('to', 1)}
                >
                  <Text style={styles.timeButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={handleEnableNotifications}
          >
            <Text style={styles.enableButtonText}>Activer les notifications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.notNowButton}
            onPress={handleNotNow}
          >
            <Text style={styles.notNowButtonText}>Pas maintenant</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3748',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 36,
  },
  quoteCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#4299E1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  quoteContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quoteArrow: {
    fontSize: 16,
    marginRight: 8,
    color: '#718096',
  },
  quoteText: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
  },
  quoteTime: {
    fontSize: 14,
    color: '#718096',
  },
  settingsContainer: {
    marginBottom: 120,
  },
  settingRow: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 18,
    color: '#2D3748',
    fontWeight: '500',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#4A5568',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginHorizontal: 20,
  },
  timeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeLabel: {
    fontSize: 18,
    color: '#2D3748',
    fontWeight: '500',
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeButtonText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '600',
  },
  timeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginHorizontal: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 32,
    right: 32,
  },
  enableButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#48BB78',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  enableButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  notNowButton: {
    width: '100%',
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notNowButtonText: {
    color: '#718096',
    fontSize: 18,
    fontWeight: '600',
  },
});
