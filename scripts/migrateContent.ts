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

// Données des formules de prière à migrer - Prières pour les défunts
const prayerFormulas = [
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْفَعْ دَرَجَتَهُ فِي الْمَهْدِيِّينَ وَاخْلُفْهُ فِي عَقِبِهِ فِي الْغَابِرِينَ وَاغْفِرْ لَنَا وَلَهُ يَا رَبَّ الْعَالَمِينَ',
    transliteration: "Allaahummaghfir li [Name] warfa' darajatahu fil-mahdiyyina wa akhlufhu fi 'aqibihi fil-ghabirina wa ighfir lana wa lahu ya rabba al-'alamin",
    translation: 'Ô Allah, pardonne à [nom du défunt] et élève son statut parmi les vertueux, remplace-le par de bons descendants parmi ceux qui restent, et pardonne-nous ainsi qu\'à lui, ô Seigneur des mondes',
    order: 1,
  },
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ',
    transliteration: "Allahumma ighfir li [Name] warhamhu wa 'afihi wa'fu 'anhu wa akrim nuzulahu wa wassi' mudkhalahu",
    translation: 'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde, accorde-lui le salut, pardonne-lui, honore son arrivée et élargis son entrée',
    order: 2,
  },
  {
    arabic: 'اللَّهُمَّ اجْعَلْ قَبْرَ [Name] رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ وَلَا تَجْعَلْهُ حُفْرَةً مِنْ حُفَرِ النَّارِ',
    transliteration: "Allahumma ij'al qabra [Name] rawdatan min riyadi al-jannati wa la taj'alhu hufratan min hufari an-nar",
    translation: 'Ô Allah, fais du tombeau de [nom du défunt] un jardin parmi les jardins du Paradis, et ne le fais pas être une fosse parmi les fosses de l\'Enfer',
    order: 3,
  },
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَسَكِّنْهُ فِي الْجَنَّةِ وَاجْعَلْهُ مِنْ أَهْلِ الْجَنَّةِ',
    transliteration: "Allahumma ighfir li [Name] warhamhu wa sakkinhu fil-jannati wa ij'alhu min ahli al-jannati",
    translation: 'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde, installe-le dans le Paradis et fais qu\'il soit parmi les habitants du Paradis',
    order: 4,
  },
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَنْزِلْهُ مَنْزِلًا مُبَارَكًا وَأَنْزِلْهُ مَنْزِلًا صَالِحًا',
    transliteration: "Allahumma ighfir li [Name] warhamhu wa 'afihi wa'fu 'anhu wa anzilhu manzilan mubarakan wa anzilhu manzilan salihan",
    translation: 'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde, accorde-lui le salut, pardonne-lui et fais-le descendre dans une demeure bénie et une demeure vertueuse',
    order: 5,
  },
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لِـ [Name] وَارْحَمْهُ وَاجْعَلْهُ فِي الْجَنَّةِ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ وَالصَّالِحِينَ',
    transliteration: "Allahumma ighfir li [Name] warhamhu wa ij'alhu fil-jannati ma'a an-nabiyyina was-siddiqina wash-shuhada'i was-saliheen",
    translation: 'Ô Allah, pardonne à [nom du défunt], fais-lui miséricorde et place-le dans le Paradis avec les prophètes, les véridiques, les martyrs et les vertueux',
    order: 6,
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
