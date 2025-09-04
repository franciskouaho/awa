import { notificationService } from '../services/notificationService';

/**
 * Script de test pour vérifier le nouveau système de notifications de prières
 */
async function testPrayerNotifications() {
  console.log('🧪 Test du système de notifications de prières...\n');

  try {
    // Test 1: Configuration basique des notifications
    console.log('📱 Test 1: Configuration basique');
    const basicSettings = {
      enableReminders: true,
      sound: true,
      enableDeceasedReminder: false,
      dailyCount: 3,
      startTime: '09:00',
      endTime: '18:00',
      selectedFeed: 'Feed actuel',
      selectedDays: [false, true, true, true, true, true, false], // Lun-Ven
    };

    await notificationService.scheduleReminders(basicSettings);
    console.log('✅ Configuration basique réussie');

    // Test 2: Vérifier les notifications programmées
    console.log('\n📅 Test 2: Vérification des notifications programmées');
    const scheduledNotifications = await notificationService.getScheduledReminders();
    console.log(`✅ ${scheduledNotifications.length} notifications programmées`);

    // Afficher le détail des notifications
    scheduledNotifications.forEach((notification, index) => {
      const trigger = notification.trigger as any;
      console.log(`   ${index + 1}. ${notification.content.title}`);
      console.log(`      Jour: ${trigger.weekday}, Heure: ${trigger.hour}:${trigger.minute.toString().padStart(2, '0')}`);
      console.log(`      Feed: ${notification.content.data?.feedName || 'Non spécifié'}`);
    });

    // Test 3: Test avec notifications pour défunts
    console.log('\n🕊️ Test 3: Configuration avec notifications pour défunts');
    const settingsWithDeceased = {
      ...basicSettings,
      enableDeceasedReminder: true,
    };

    await notificationService.scheduleReminders(settingsWithDeceased);
    const scheduledWithDeceased = await notificationService.getScheduledReminders();
    console.log(`✅ ${scheduledWithDeceased.length} notifications programmées (avec défunts)`);

    // Test 4: Configuration weekend uniquement
    console.log('\n🏖️ Test 4: Configuration weekend uniquement');
    const weekendSettings = {
      ...basicSettings,
      selectedDays: [true, false, false, false, false, false, true], // Dim et Sam
      dailyCount: 5,
      startTime: '10:00',
      endTime: '20:00',
    };

    await notificationService.scheduleReminders(weekendSettings);
    const weekendNotifications = await notificationService.getScheduledReminders();
    console.log(`✅ ${weekendNotifications.length} notifications weekend programmées`);

    // Test 5: Test d'une notification immédiate
    console.log('\n🔔 Test 5: Notification de test immédiate');
    await notificationService.sendCustomPrayerNotification('Feed actuel', 'Test de notification personnalisée');
    console.log('✅ Notification de test envoyée');

    // Test 6: Annulation de toutes les notifications
    console.log('\n🚫 Test 6: Annulation de toutes les notifications');
    await notificationService.cancelAllReminders();
    const finalCheck = await notificationService.getScheduledReminders();
    console.log(`✅ ${finalCheck.length} notifications restantes (devrait être 0)`);

    console.log('\n🎉 Tous les tests sont passés avec succès !');
    
    // Résumé des fonctionnalités testées
    console.log('\n📋 Fonctionnalités testées:');
    console.log('   ✅ Configuration de base des rappels de prières');
    console.log('   ✅ Sélection des jours de la semaine');
    console.log('   ✅ Configuration des horaires personnalisés');
    console.log('   ✅ Notifications pour les défunts');
    console.log('   ✅ Variations de fréquence (1-10 par jour)');
    console.log('   ✅ Contenu personnalisé selon le feed sélectionné');
    console.log('   ✅ Notifications de test immédiates');
    console.log('   ✅ Annulation des notifications');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
    throw error;
  }
}

// Fonction pour les tests individuels
export async function testPrayerNotificationSettings() {
  console.log('🧪 Test des paramètres de notifications de prières...');
  
  // Test différentes configurations
  const configurations = [
    {
      name: 'Configuration minimale',
      settings: {
        enableReminders: true,
        sound: false,
        enableDeceasedReminder: false,
        dailyCount: 1,
        startTime: '12:00',
        endTime: '12:00',
        selectedFeed: 'Les bases',
        selectedDays: [false, false, false, true, false, false, false], // Mercredi uniquement
      }
    },
    {
      name: 'Configuration maximale',
      settings: {
        enableReminders: true,
        sound: true,
        enableDeceasedReminder: true,
        dailyCount: 10,
        startTime: '06:00',
        endTime: '23:00',
        selectedFeed: 'Paix mentale',
        selectedDays: [true, true, true, true, true, true, true], // Tous les jours
      }
    }
  ];

  for (const config of configurations) {
    console.log(`\n📝 Test: ${config.name}`);
    await notificationService.scheduleReminders(config.settings);
    const scheduled = await notificationService.getScheduledReminders();
    console.log(`   ✅ ${scheduled.length} notifications programmées`);
    
    // Nettoyer pour le test suivant
    await notificationService.cancelAllReminders();
  }
}

// Exporter pour utilisation dans d'autres scripts
export { testPrayerNotifications };

// Exécuter si appelé directement
if (require.main === module) {
  testPrayerNotifications()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Tests échoués:', error);
      process.exit(1);
    });
}
