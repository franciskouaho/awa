/**
 * Script de test pour vérifier l'intégration Firebase des paramètres utilisateur
 * 
 * Ce script peut être utilisé pour tester les fonctionnalités suivantes :
 * - Sauvegarde des paramètres généraux dans Firebase
 * - Récupération des paramètres depuis Firebase
 * - Synchronisation entre le cache local et Firebase
 * - Gestion des erreurs
 */

import { authService } from '@/services/auth';
import { userService } from '@/services/userService';

export class UserSettingsTest {
  
  // Test de sauvegarde d'un paramètre spécifique
  static async testSaveIndividualSetting() {
    console.log('🧪 Test: Sauvegarde d\'un paramètre individuel');
    
    try {
      await userService.saveGeneralSetting('firstName', 'TestUser');
      console.log('✅ Prénom sauvegardé avec succès');
      
      await userService.saveGeneralSetting('gender', 'Homme');
      console.log('✅ Genre sauvegardé avec succès');
      
      await userService.saveGeneralSetting('language', 'English');
      console.log('✅ Langue sauvegardée avec succès');
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  }

  // Test de récupération des paramètres
  static async testGetSettings() {
    console.log('🧪 Test: Récupération des paramètres');
    
    try {
      const settings = await userService.getUserGeneralSettings();
      console.log('✅ Paramètres récupérés:', settings);
      return settings;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération:', error);
      return null;
    }
  }

  // Test de sauvegarde de tous les paramètres
  static async testSaveAllSettings() {
    console.log('🧪 Test: Sauvegarde de tous les paramètres');
    
    const testSettings = {
      firstName: 'François',
      gender: 'Homme' as const,
      language: 'Français' as const
    };

    try {
      await userService.saveUserGeneralSettings(testSettings);
      console.log('✅ Tous les paramètres sauvegardés avec succès');
      
      // Vérifier que les paramètres ont bien été sauvegardés
      const savedSettings = await userService.getUserGeneralSettings();
      console.log('✅ Paramètres vérifiés:', savedSettings);
      
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde complète:', error);
    }
  }

  // Test de synchronisation avec Firebase
  static async testSyncWithFirebase() {
    console.log('🧪 Test: Synchronisation avec Firebase');
    
    try {
      const syncedSettings = await userService.syncWithFirebase();
      console.log('✅ Synchronisation réussie:', syncedSettings);
      return syncedSettings;
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return null;
    }
  }

  // Test de nettoyage du cache
  static async testClearCache() {
    console.log('🧪 Test: Nettoyage du cache');
    
    try {
      await userService.clearCache();
      console.log('✅ Cache nettoyé avec succès');
      
      // Vérifier que les données sont toujours disponibles depuis Firebase
      const settingsAfterClear = await userService.getUserGeneralSettings();
      console.log('✅ Données récupérées depuis Firebase après nettoyage du cache:', settingsAfterClear);
      
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage du cache:', error);
    }
  }

  // Test d'initialisation avec des valeurs par défaut
  static async testInitializeWithDefaults() {
    console.log('🧪 Test: Initialisation avec valeurs par défaut');
    
    try {
      await userService.initializeGeneralSettings('NouvelUtilisateur');
      console.log('✅ Paramètres initialisés avec succès');
      
      const initializedSettings = await userService.getUserGeneralSettings();
      console.log('✅ Paramètres après initialisation:', initializedSettings);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation:', error);
    }
  }

  // Test complet de toutes les fonctionnalités
  static async runAllTests() {
    console.log('🚀 Démarrage des tests complets des paramètres utilisateur\n');
    
    // Vérifier que l'utilisateur est connecté
    const currentUser = await authService.getCurrentUserProfile();
    if (!currentUser) {
      console.error('❌ Aucun utilisateur connecté. Veuillez vous connecter avant de lancer les tests.');
      return;
    }
    
    console.log('👤 Utilisateur connecté:', currentUser.email);
    console.log('─'.repeat(50));
    
    await this.testInitializeWithDefaults();
    console.log('─'.repeat(50));
    
    await this.testGetSettings();
    console.log('─'.repeat(50));
    
    await this.testSaveIndividualSetting();
    console.log('─'.repeat(50));
    
    await this.testSaveAllSettings();
    console.log('─'.repeat(50));
    
    await this.testSyncWithFirebase();
    console.log('─'.repeat(50));
    
    await this.testClearCache();
    console.log('─'.repeat(50));
    
    console.log('🎉 Tous les tests terminés !');
  }
}

// Fonction d'assistance pour lancer les tests depuis un composant
export const testUserSettings = () => {
  UserSettingsTest.runAllTests();
};

// Export pour utilisation individuelle des tests
export const {
  testSaveIndividualSetting,
  testGetSettings,
  testSaveAllSettings,
  testSyncWithFirebase,
  testClearCache,
  testInitializeWithDefaults,
  runAllTests
} = UserSettingsTest;
