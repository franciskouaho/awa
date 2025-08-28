import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotifications } from '@/services/notificationService';
import * as Notifications from 'expo-notifications';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function NotificationDebugScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [scheduledNotifications, setScheduledNotifications] = useState<Notifications.NotificationRequest[]>([]);
  const [permissions, setPermissions] = useState<any>(null);
  const { getScheduledReminders, sendTestNotification, cancelAllReminders } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const scheduled = await getScheduledReminders();
      setScheduledNotifications(scheduled);
      
      const perms = await Notifications.getPermissionsAsync();
      setPermissions(perms);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test envoyé', 'Une notification de test va apparaître dans quelques secondes.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'envoyer la notification de test.');
    }
  };

  const handleCancelAll = async () => {
    try {
      await cancelAllReminders();
      await loadData();
      Alert.alert('Succès', 'Toutes les notifications ont été annulées.');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'annuler les notifications.');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
    },
    section: {
      backgroundColor: colors.surface,
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    text: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 8,
    },
    buttonText: {
      color: colors.surface,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: '#ff4444',
    },
    notificationItem: {
      backgroundColor: colors.border,
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    notificationTitle: {
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    notificationText: {
      fontSize: 12,
      color: colors.textSecondary,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Notifications</Text>
      
      {/* Permissions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Permissions</Text>
        <Text style={styles.text}>
          Status: {permissions?.status || 'Unknown'}
        </Text>
        <Text style={styles.text}>
          Granted: {permissions?.granted ? 'Oui' : 'Non'}
        </Text>
        <Text style={styles.text}>
          Can Ask Again: {permissions?.canAskAgain ? 'Oui' : 'Non'}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        <TouchableOpacity style={styles.button} onPress={handleTestNotification}>
          <Text style={styles.buttonText}>Envoyer une notification de test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={loadData}>
          <Text style={styles.buttonText}>Actualiser les données</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleCancelAll}>
          <Text style={styles.buttonText}>Annuler toutes les notifications</Text>
        </TouchableOpacity>
      </View>

      {/* Notifications programmées */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Notifications programmées ({scheduledNotifications.length})
        </Text>
        {scheduledNotifications.length === 0 ? (
          <Text style={styles.text}>Aucune notification programmée</Text>
        ) : (
          scheduledNotifications.map((notification, index) => (
            <View key={notification.identifier} style={styles.notificationItem}>
              <Text style={styles.notificationTitle}>
                {notification.content.title}
              </Text>
              <Text style={styles.notificationText}>
                ID: {notification.identifier}
              </Text>
              <Text style={styles.notificationText}>
                Type: {(notification.trigger as any)?.type || 'Unknown'}
              </Text>
              <Text style={styles.notificationText}>
                Data: {JSON.stringify(notification.content.data)}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}
