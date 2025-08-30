import { addDoc, collection, deleteDoc, getDocs } from 'firebase/firestore';

// Test de base pour vérifier les permissions Firebase
export async function testFirebasePermissions(db: any): Promise<{
  success: boolean;
  results: {
    read: boolean;
    write: boolean;
    collections: string[];
  };
  error?: string;
}> {
  console.log('🔍 Test des permissions Firebase...');

  const results = {
    read: false,
    write: false,
    collections: [] as string[],
  };

  try {
    // Test de lecture sur les collections
    const collectionsToTest = ['prayers', 'prayerFormulas', 'verses', 'hadiths'];

    for (const collectionName of collectionsToTest) {
      try {
        console.log(`📖 Test de lecture pour ${collectionName}...`);
        await getDocs(collection(db, collectionName));
        results.collections.push(collectionName);
        console.log(`✅ Lecture OK pour ${collectionName}`);
      } catch (error: any) {
        console.warn(`⚠️ Lecture échouée pour ${collectionName}:`, error.code);
      }
    }

    results.read = results.collections.length > 0;

    // Test d'écriture avec un document temporaire
    try {
      console.log("✍️ Test d'écriture...");
      const testCollection = 'prayerFormulas';

      // Créer un document de test
      const testDoc = await addDoc(collection(db, testCollection), {
        test: true,
        createdAt: new Date().toISOString(),
        message: 'Document de test - peut être supprimé',
      });

      console.log('✅ Écriture réussie');

      // Supprimer le document de test
      await deleteDoc(testDoc);
      console.log('✅ Suppression réussie');

      results.write = true;
    } catch (error: any) {
      console.warn('⚠️ Écriture échouée:', error.code);
      results.write = false;
    }

    console.log('🎉 Test des permissions terminé');
    console.log(`📊 Résultats: Lecture=${results.read}, Écriture=${results.write}`);
    console.log(`📋 Collections accessibles: ${results.collections.join(', ')}`);

    return {
      success: results.read || results.write,
      results,
    };
  } catch (error: any) {
    console.error('💥 Erreur globale lors du test:', error);
    return {
      success: false,
      results,
      error: error.message,
    };
  }
}

// Fonction pour afficher les instructions de configuration
export function showConfigurationInstructions() {
  console.log('\n🔧 INSTRUCTIONS DE CONFIGURATION:');
  console.log('1. Aller dans la Console Firebase: https://console.firebase.google.com');
  console.log('2. Sélectionner le projet: awaa-9c731');
  console.log('3. Aller dans Firestore Database → Rules');
  console.log('4. Copier les règles depuis FIRESTORE_RULES_DEV.txt');
  console.log('5. Cliquer sur "Publier"');
  console.log('6. Attendre 1-2 minutes puis relancer la migration\n');
}

// Exécuter le test si ce fichier est appelé directement
if (require.main === module) {
  testFirebasePermissions()
    .then(result => {
      if (!result.success) {
        showConfigurationInstructions();
        process.exit(1);
      } else {
        console.log('✅ Firebase est correctement configuré pour la migration');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('Test failed:', error);
      showConfigurationInstructions();
      process.exit(1);
    });
}
