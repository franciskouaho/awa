import { StreakService } from '../services/streakService';

// Script de test pour la fonctionnalité de streak
async function testStreakFunctionality() {
  console.log('🧪 Test de la fonctionnalité Streak');
  console.log('=====================================');

  const testUserId = 'test_user_' + Date.now();
  const testDeviceId = 'test_device_' + Date.now();

  try {
    // Test 1: Créer et récupérer un streak initial
    console.log('\n📝 Test 1: Récupération du streak initial');
    const initialStreak = await StreakService.getUserStreak(testUserId, testDeviceId);
    console.log('Résultat:', initialStreak);
    
    if (initialStreak.success && initialStreak.data) {
      console.log('✅ Streak initial créé avec succès');
      console.log(`   - Streak actuel: ${initialStreak.data.currentStreak}`);
      console.log(`   - Plus long streak: ${initialStreak.data.longestStreak}`);
      console.log(`   - Historique: ${initialStreak.data.streakHistory.length} jours`);
    } else {
      console.log('❌ Échec de la création du streak initial');
      return;
    }

    // Test 2: Enregistrer une première prière
    console.log('\n📝 Test 2: Enregistrement d\'une première prière');
    const firstPrayer = await StreakService.recordPrayerSession(testUserId, testDeviceId);
    console.log('Résultat:', firstPrayer);
    
    if (firstPrayer.success && firstPrayer.data) {
      console.log('✅ Première prière enregistrée avec succès');
      console.log(`   - Nouveau streak: ${firstPrayer.data.streak.currentStreak}`);
      console.log(`   - Prières aujourd'hui: ${firstPrayer.data.session.prayerCount}`);
    } else {
      console.log('❌ Échec de l\'enregistrement de la première prière');
      return;
    }

    // Test 3: Enregistrer une deuxième prière le même jour
    console.log('\n📝 Test 3: Enregistrement d\'une deuxième prière (même jour)');
    const secondPrayer = await StreakService.recordPrayerSession(testUserId, testDeviceId);
    console.log('Résultat:', secondPrayer);
    
    if (secondPrayer.success && secondPrayer.data) {
      console.log('✅ Deuxième prière enregistrée avec succès');
      console.log(`   - Streak maintenu: ${secondPrayer.data.streak.currentStreak}`);
      console.log(`   - Prières aujourd'hui: ${secondPrayer.data.session.prayerCount}`);
    } else {
      console.log('❌ Échec de l\'enregistrement de la deuxième prière');
      return;
    }

    // Test 4: Récupérer les statistiques
    console.log('\n📝 Test 4: Récupération des statistiques');
    const stats = await StreakService.getStreakStats(testUserId, testDeviceId);
    console.log('Résultat:', stats);
    
    if (stats.success && stats.data) {
      console.log('✅ Statistiques récupérées avec succès');
      console.log(`   - Streak actuel: ${stats.data.streak.currentStreak}`);
      console.log(`   - Plus long streak: ${stats.data.streak.longestStreak}`);
      console.log(`   - Total prières: ${stats.data.totalPrayers}`);
      console.log(`   - Sessions ce mois: ${stats.data.sessionsThisMonth}`);
    } else {
      console.log('❌ Échec de la récupération des statistiques');
      return;
    }

    console.log('\n🎉 Tous les tests ont réussi !');
    console.log('La fonctionnalité Streak est opérationnelle.');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  }
}

// Exporter la fonction de test pour l'utiliser ailleurs
export { testStreakFunctionality };

// Exécuter le test si ce fichier est lancé directement
if (require.main === module) {
  testStreakFunctionality();
}
