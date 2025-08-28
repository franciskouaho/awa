import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { showConfigurationInstructions, testFirebasePermissions } from './testFirebasePermissions';

// Données des formules de prière à migrer
const prayerFormulas = [
  {
    arabic: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ',
    transliteration: "Allahumma ighfir lahu warhamhu wa 'afihi wa'fu 'anhu",
    translation:
      'Ô Allah, pardonne-lui, fais-lui miséricorde, accorde-lui le salut et pardonne-lui',
    order: 1,
  },
  {
    arabic:
      'اللَّهُمَّ أَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ',
    transliteration:
      "Allahumma akrim nuzulahu wa wassi' mudkhalahu waghsilhu bil-ma'i wath-thalji wal-barad",
    translation:
      "Ô Allah, honore sa demeure, élargis son entrée et lave-le avec l'eau, la neige et la grêle",
    order: 2,
  },
  {
    arabic: 'اللَّهُمَّ أَدْخِلْهُ الْجَنَّةَ وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ وَعَذَابِ النَّارِ',
    transliteration: "Allahumma adkhilhul-jannata wa a'idhhu min 'adhabil-qabri wa 'adhabin-nar",
    translation:
      'Ô Allah, fais-le entrer au Paradis et protège-le du châtiment de la tombe et du châtiment du Feu',
    order: 3,
  },
];

// Données des versets à migrer
const verses = [
  {
    arabic:
      'وَبَشِّرِ الصَّابِرِينَ الَّذِينَ إِذَا أَصَابَتْهُم مُّصِيبَةٌ قَالُوا إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
    transliteration:
      "Wa bashshiri as-sabirin. Alladhina idha asabat-hum musibatun qalu inna lillahi wa inna ilayhi raji'un",
    translation:
      'Et annonce la bonne nouvelle aux endurants, qui disent, quand un malheur les atteint : "Certes nous sommes à Allah, et c\'est à Lui que nous retournerons."',
    reference: 'Sourate Al-Baqarah (2:155-156)',
    order: 1,
  },
  {
    arabic:
      'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ وَإِنَّمَا تُوَفَّوْنَ أُجُورَكُمْ يَوْمَ الْقِيَامَةِ',
    transliteration: "Kullu nafsin dha'iqatul-mawt. Wa innama tuwaffawna ujurakum yawmal-qiyamah",
    translation:
      "Toute âme goûtera la mort. Et c'est seulement au Jour de la Résurrection que vous recevrez votre entière rétribution.",
    reference: "Sourate Ali 'Imran (3:185)",
    order: 2,
  },
];

// Données des hadiths à migrer
const hadiths = [
  {
    text: 'Le Prophète (ﷺ) a dit : "Quand l\'homme meurt, ses œuvres s\'arrêtent sauf trois : une aumône continue, une science dont les gens tirent profit, et un enfant pieux qui invoque Allah pour lui."',
    source: 'Rapporté par Muslim',
    arabic:
      'إِذَا مَاتَ الإِنْسَانُ انْقَطَعَ عَمَلُهُ إِلاَّ مِنْ ثَلاَثَةٍ إِلاَّ مِنْ صَدَقَةٍ جَارِيَةٍ أَوْ عِلْمٍ يُنْتَفَعُ بِهِ أَوْ وَلَدٍ صَالِحٍ يَدْعُو لَهُ',
    order: 1,
  },
  {
    text: 'Le Prophète (ﷺ) a dit : "Invoquez Allah en faveur de vos morts, car vos invocations les atteignent."',
    source: 'Rapporté par At-Tabarani',
    arabic: 'ادْعُوا لِمَوْتَاكُمْ فَإِنَّ دُعَاءَكُمْ يَبْلُغُهُمْ',
    order: 2,
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
    return;
  }

  try {
    for (const formula of prayerFormulas) {
      await addDoc(collection(db, 'prayerFormulas'), {
        ...formula,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Formules de prière migrées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des formules:', error);
  }
}

// Fonction pour migrer les versets
async function migrateVerses() {
  console.log('📜 Migration des versets...');

  const hasData = await collectionExists('verses');
  if (hasData) {
    console.log('✅ Les versets existent déjà dans Firebase');
    return;
  }

  try {
    for (const verse of verses) {
      await addDoc(collection(db, 'verses'), {
        ...verse,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Versets migrés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des versets:', error);
  }
}

// Fonction pour migrer les hadiths
async function migrateHadiths() {
  console.log('📚 Migration des hadiths...');

  const hasData = await collectionExists('hadiths');
  if (hasData) {
    console.log('✅ Les hadiths existent déjà dans Firebase');
    return;
  }

  try {
    for (const hadith of hadiths) {
      await addDoc(collection(db, 'hadiths'), {
        ...hadith,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Hadiths migrés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des hadiths:', error);
  }
}

// Fonction principale de migration avec test de permissions
export async function migrateAllContent() {
  console.log('🚀 Début de la migration du contenu vers Firebase...');

  // Test des permissions avant la migration
  console.log('\n🔐 Vérification des permissions Firebase...');
  const permissionTest = await testFirebasePermissions();

  if (!permissionTest.success || !permissionTest.results.write) {
    console.error('\n❌ ERREUR: Permissions insuffisantes pour la migration');
    console.error('📋 Statut des permissions:');
    console.error(`   - Lecture: ${permissionTest.results.read ? '✅' : '❌'}`);
    console.error(`   - Écriture: ${permissionTest.results.write ? '✅' : '❌'}`);
    console.error(
      `   - Collections accessibles: ${permissionTest.results.collections.join(', ') || 'Aucune'}`
    );

    showConfigurationInstructions();
    throw new Error('Permissions Firebase insuffisantes pour la migration');
  }

  console.log('✅ Permissions Firebase vérifiées\n');

  try {
    await Promise.all([migratePrayerFormulas(), migrateVerses(), migrateHadiths()]);

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('💥 Erreur globale lors de la migration:', error);
    throw error;
  }
}

// Exécuter la migration si ce fichier est appelé directement
if (require.main === module) {
  migrateAllContent()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
