import { initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';

// Initialisation locale de Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyAkCtfughN1kT8f_9HJzxqGS_Ih__tMie4',
  authDomain: 'awaa-9c731.firebaseapp.com',
  projectId: 'awaa-9c731',
  storageBucket: 'awaa-9c731.firebasestorage.app',
  messagingSenderId: '882661233700',
  appId: '1:882661233700:web:22fa79320fedcdf0dd74b1',
  measurementId: 'G-R6Y8SNC82R',
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Données des formules de prière à migrer
const prayerFormulas = [
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
    transliteration: "Allahumma ighfir li [Name] warhamhu wa 'afihi wa'fu 'anhu",
    translation:
      'Ô Allah, pardonne à [nom de la personne], fais-lui miséricorde, accorde-lui le salut et pardonne-lui',
    order: 1,
  },
];

// Fonction pour vérifier si une collection existe et contient des données
async function collectionExists(collectionName: string): Promise<boolean> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return !querySnapshot.empty;
  } catch (error) {
    console.error(`Erreur lors de la vérification de la collection ${collectionName}:`, error);
    return false;
  }
}

// Fonction pour migrer les formules de prière
async function migratePrayerFormulas() {
  console.log('📖 Migration des formules de prière...');

  const hasData = await collectionExists('prayerFormulas');
  if (hasData) {
    console.log('✅ Les formules de prière existent déjà dans Firebase');
    return { success: true, message: 'Déjà migré' };
  }

  try {
    const batch = [];
    for (const formula of prayerFormulas) {
      batch.push({
        ...formula,
        createdAt: new Date().toISOString(),
        migrationVersion: '1.0.0',
      });
    }

    // Migration par batch pour éviter les timeouts
    const batchSize = 3;
    for (let i = 0; i < batch.length; i += batchSize) {
      const batchChunk = batch.slice(i, i + batchSize);
      const promises = batchChunk.map(item => addDoc(collection(db, 'prayerFormulas'), item));
      await Promise.all(promises);
      console.log(
        `📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(batch.length / batchSize)} migré`
      );
    }

    console.log('✅ Formules de prière migrées avec succès');
    return { success: true, message: 'Migration réussie' };
  } catch (error) {
    console.error('❌ Erreur lors de la migration des formules:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Fonction principale de migration avec test de permissions
export async function migrateAllContent() {
  console.log('🚀 Début de la migration des formules de prière vers Firebase...');

  const results = {
    prayerFormulas: { success: false, message: '', error: null as string | null },
    totalSuccess: false,
  };

  try {
    // Migration des formules de prière
    const prayerResult = await migratePrayerFormulas();
    results.prayerFormulas = {
      success: prayerResult.success,
      message: prayerResult.message || '',
      error: prayerResult.error || null,
    };

    // Vérifier si toutes les migrations ont réussi
    results.totalSuccess = results.prayerFormulas.success;

    if (results.totalSuccess) {
      console.log('🎉 Migration des formules de prière terminée avec succès !');
    } else {
      console.error('💥 Certaines migrations ont échoué:', results);
    }

    return results;
  } catch (error) {
    console.error('💥 Erreur lors de la migration des formules de prière:', error);
    results.prayerFormulas.error = error instanceof Error ? error.message : String(error);
    return results;
  }
}

// Exécuter la migration si ce fichier est appelé directement (compatible ES module)
if (process.argv[1] && process.argv[1].endsWith('migrateContent.ts')) {
  migrateAllContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
