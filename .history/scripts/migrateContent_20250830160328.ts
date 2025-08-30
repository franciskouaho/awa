import { initializeApp } from 'firebase/app';
import { addDoc, collection, getDocs, getFirestore } from 'firebase/firestore';
import { showConfigurationInstructions, testFirebasePermissions } from './testFirebasePermissions';

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

const reminders = [
  {
    title: 'Prière du matin',
    description: "N'oublie pas de faire ta prière du matin.",
    arabic: 'الله أكبر',
    transliteration: 'Allahu Akbar',
    translation: 'Allah est le plus grand',
    time: '06:00',
    order: 1,
  },
  {
    title: 'Prière du soir',
    description: "N'oublie pas de faire ta prière du soir.",
    arabic: 'سبحان الله',
    transliteration: 'Subhan Allah',
    translation: 'Gloire à Allah',
    time: '20:00',
    order: 2,
  },
  {
    title: 'Lecture du Coran',
    description: "Lis quelques versets du Coran aujourd'hui.",
    arabic: 'بسم الله',
    transliteration: 'Bismillah',
    translation: "Au nom d'Allah",
    time: '08:00',
    order: 3,
  },
  {
    title: 'Dhikr',
    description: 'Prends un moment pour faire du dhikr.',
    arabic: 'لا إله إلا الله',
    transliteration: 'La ilaha illa Allah',
    translation: "Il n'y a de divinité qu'Allah",
    time: '12:00',
    order: 4,
  },
  {
    title: 'Invocation',
    description: 'Fais une invocation spéciale pour tes proches.',
    arabic: 'ربنا آتنا في الدنيا حسنة',
    transliteration: 'Rabbana atina fid-dunya hasanatan',
    translation: 'Seigneur, accorde-nous le bien en ce monde',
    time: '14:00',
    order: 5,
  },
  {
    title: 'Prière surérogatoire',
    description: 'Essaie de faire une prière surérogatoire.',
    arabic: 'اللهم صل على محمد',
    transliteration: 'Allahumma salli ala Muhammad',
    translation: 'Ô Allah, prie sur Muhammad',
    time: '16:00',
    order: 6,
  },
  {
    title: 'Charité',
    description: "Fais une bonne action ou une aumône aujourd'hui.",
    arabic: 'إن الله مع الصابرين',
    transliteration: "Inna Allah ma'a as-sabirin",
    translation: 'Certes, Allah est avec les patients',
    time: '10:00',
    order: 7,
  },
  {
    title: 'Réflexion',
    description: 'Prends un moment pour réfléchir à tes bénédictions.',
    arabic: 'الحمد لله',
    transliteration: 'Alhamdulillah',
    translation: 'Louange à Allah',
    time: '18:00',
    order: 8,
  },
  {
    title: 'Demande pardon',
    description: 'Demande pardon à Allah pour tes erreurs.',
    arabic: 'أستغفر الله',
    transliteration: 'Astaghfirullah',
    translation: 'Je demande pardon à Allah',
    time: '22:00',
    order: 9,
  },
  {
    title: 'Gratitude',
    description: 'Exprime ta gratitude pour la journée écoulée.',
    arabic: 'شكرا لله',
    transliteration: 'Shukran lillah',
    translation: 'Merci à Allah',
    time: '23:00',
    order: 10,
  },
];

// Fonction pour migrer les rappels
async function migrateReminders() {
  console.log('⏰ Migration des rappels...');

  const hasData = await collectionExists('reminders');
  if (hasData) {
    console.log('✅ Les rappels existent déjà dans Firebase');
    return;
  }

  try {
    for (const reminder of reminders) {
      await addDoc(collection(db, 'reminders'), {
        ...reminder,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Rappels migrés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des rappels:', error);
  }
}

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

// Données des versets du Coran à migrer
const verses = [
  {
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismillahi ar-Rahmani ar-Raheem',
    translation: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux",
    surah: 'Al-Fatiha',
    ayah: 1,
    order: 1,
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Alhamdu lillahi rabbi al-'alameen",
    translation: "Louange à Allah, Seigneur de l'univers",
    surah: 'Al-Fatiha',
    ayah: 2,
    order: 2,
  },
  {
    arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Ar-Rahmani ar-Raheem',
    translation: 'Le Tout Miséricordieux, le Très Miséricordieux',
    surah: 'Al-Fatiha',
    ayah: 3,
    order: 3,
  },
  {
    arabic: 'مَالِكِ يَوْمِ الدِّينِ',
    transliteration: 'Maliki yawmi ad-deen',
    translation: 'Maître du Jour de la rétribution',
    surah: 'Al-Fatiha',
    ayah: 4,
    order: 4,
  },
  {
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    transliteration: "Iyyaka na'budu wa iyyaka nasta'een",
    translation:
      "C'est Toi [Seul] que nous adorons, et c'est Toi [Seul] dont nous implorons secours",
    surah: 'Al-Fatiha',
    ayah: 5,
    order: 5,
  },
  {
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    transliteration: 'Ihdina as-sirata al-mustaqeem',
    translation: 'Guide-nous dans le droit chemin',
    surah: 'Al-Fatiha',
    ayah: 6,
    order: 6,
  },
  {
    arabic:
      'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration:
      "Sirata alladheena an'amta 'alayhim ghayri al-maghdoobi 'alayhim wa la ad-daalleen",
    translation:
      'Le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés',
    surah: 'Al-Fatiha',
    ayah: 7,
    order: 7,
  },
  {
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    transliteration: 'Qul huwa Allahu ahad',
    translation: 'Dis : "Il est Allah, [Dieu] Unique',
    surah: 'Al-Ikhlas',
    ayah: 1,
    order: 8,
  },
  {
    arabic: 'اللَّهُ الصَّمَدُ',
    transliteration: 'Allahu as-samad',
    translation: 'Allah, Le Seul à être imploré pour ce que nous désirons',
    surah: 'Al-Ikhlas',
    ayah: 2,
    order: 9,
  },
  {
    arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
    transliteration: 'Lam yalid wa lam yoolad',
    translation: "Il n'a jamais engendré, n'a pas été engendré non plus",
    surah: 'Al-Ikhlas',
    ayah: 3,
    order: 10,
  },
  {
    arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
    transliteration: 'Wa lam yakun lahu kufuwan ahad',
    translation: 'Et nul n\'est égal à Lui"',
    surah: 'Al-Ikhlas',
    ayah: 4,
    order: 11,
  },
];

// Données des catégories à migrer (synchronisées avec BasicsDrawerContent)
const categories = [
  {
    id: 'prayers',
    title: 'Prières',
    icon: '🤲',
    color: '#4A90E2',
    isUnlocked: true,
    order: 1,
  },
  {
    id: 'reminders',
    title: 'Rappels',
    icon: '🔔',
    color: '#4CAF50',
    isUnlocked: true,
    order: 2,
  },
  {
    id: 'quran',
    title: 'Coran',
    icon: '📖',
    color: '#00C851',
    isUnlocked: false,
    order: 3,
  },
  {
    id: 'dhikr',
    title: 'Dhikr',
    icon: '📿',
    color: '#FF8800',
    isUnlocked: false,
    order: 4,
  },
  {
    id: 'qibla',
    title: 'Qibla',
    icon: '🧭',
    color: '#E94B4B',
    isUnlocked: false,
    order: 5,
  },
  {
    id: 'calendar',
    title: 'Calendrier',
    icon: '📅',
    color: '#9C27B0',
    isUnlocked: false,
    order: 6,
  },
  {
    id: 'names',
    title: '99 Noms',
    icon: '✨',
    color: '#F5A623',
    isUnlocked: false,
    order: 7,
  },
  {
    id: 'duas',
    title: 'Duas',
    icon: '🤲',
    color: '#7ED321',
    isUnlocked: false,
    order: 8,
  },
  {
    id: 'hijri',
    title: 'Hijri',
    icon: '🌙',
    color: '#607D8B',
    isUnlocked: false,
    order: 9,
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

// Données de dhikr à migrer
const dhikrItems = [
  {
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    translation: 'Gloire à Allah',
    order: 1,
  },
  {
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    translation: 'Louange à Allah',
    order: 2,
  },
  {
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    translation: 'Allah est le plus Grand',
    order: 3,
  },
];

// Données de duas à migrer
const duasItems = [
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً',
    transliteration: 'Rabbana atina fid-dunya hasanatan',
    translation: 'Seigneur, accorde-nous une belle part ici-bas',
    order: 1,
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ',
    transliteration: 'Allahumma inni as’aluka al-‘afwa wal-‘afiyah',
    translation: 'Ô Allah, je Te demande le pardon et la santé',
    order: 2,
  },
];

// Données de quran à migrer (déjà versets)
// Données de qibla à migrer (exemple)
const qiblaItems = [
  {
    info: 'La direction de la Qibla est vers la Kaaba à La Mecque.',
    city: 'Paris',
    angle: 119.5,
    order: 1,
  },
];

// Données de calendar à migrer (exemple)
const calendarItems = [
  {
    event: 'Aïd al-Fitr',
    date: '2025-04-01',
    description: 'Fin du Ramadan',
    order: 1,
  },
  {
    event: 'Aïd al-Adha',
    date: '2025-06-07',
    description: 'Fête du sacrifice',
    order: 2,
  },
];

// Données de names à migrer (exemple)
const namesItems = [
  {
    arabic: 'الرَّحْمَنُ',
    transliteration: 'Ar-Rahman',
    translation: 'Le Tout Miséricordieux',
    order: 1,
  },
  {
    arabic: 'الرَّحِيمُ',
    transliteration: 'Ar-Rahim',
    translation: 'Le Très Miséricordieux',
    order: 2,
  },
];

// Données de hijri à migrer (exemple)
const hijriItems = [
  {
    month: 'Muharram',
    number: 1,
    description: 'Premier mois du calendrier islamique',
    order: 1,
  },
  {
    month: 'Ramadan',
    number: 9,
    description: 'Mois du jeûne',
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

// Fonction pour migrer les dhikr
async function migrateDhikr() {
  console.log('🟢 Migration des dhikr...');
  const hasData = await collectionExists('dhikr');
  if (hasData) {
    console.log('✅ Les dhikr existent déjà dans Firebase');
    return;
  }
  try {
    for (const item of dhikrItems) {
      await addDoc(collection(db, 'dhikr'), {
        ...item,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Dhikr migrés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des dhikr:', error);
  }
}

// Fonction pour migrer les duas
async function migrateDuas() {
  console.log('🟢 Migration des duas...');
  const hasData = await collectionExists('duas');
  if (hasData) {
    console.log('✅ Les duas existent déjà dans Firebase');
    return;
  }
  try {
    for (const item of duasItems) {
      await addDoc(collection(db, 'duas'), {
        ...item,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Duas migrées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des duas:', error);
  }
}

// Fonction pour migrer les qibla
async function migrateQibla() {
  console.log('🟢 Migration des qibla...');
  const hasData = await collectionExists('qibla');
  if (hasData) {
    console.log('✅ Les qibla existent déjà dans Firebase');
    return;
  }
  try {
    for (const item of qiblaItems) {
      await addDoc(collection(db, 'qibla'), {
        ...item,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Qibla migrée avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des qibla:', error);
  }
}

// Fonction pour migrer le calendrier
async function migrateCalendar() {
  console.log('🟢 Migration du calendrier...');
  const hasData = await collectionExists('calendar');
  if (hasData) {
    console.log('✅ Le calendrier existe déjà dans Firebase');
    return;
  }
  try {
    for (const item of calendarItems) {
      await addDoc(collection(db, 'calendar'), {
        ...item,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Calendrier migré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration du calendrier:', error);
  }
}

// Fonction pour migrer les 99 noms
async function migrateNames() {
  console.log('🟢 Migration des 99 noms...');
  const hasData = await collectionExists('names');
  if (hasData) {
    console.log('✅ Les 99 noms existent déjà dans Firebase');
    return;
  }
  try {
    for (const item of namesItems) {
      await addDoc(collection(db, 'names'), {
        ...item,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ 99 noms migrés avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des 99 noms:', error);
  }
}

// Fonction pour migrer le calendrier hijri
async function migrateHijri() {
  console.log('🟢 Migration du calendrier hijri...');
  const hasData = await collectionExists('hijri');
  if (hasData) {
    console.log('✅ Le calendrier hijri existe déjà dans Firebase');
    return;
  }
  try {
    for (const item of hijriItems) {
      await addDoc(collection(db, 'hijri'), {
        ...item,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Calendrier hijri migré avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration du calendrier hijri:', error);
  }
}

// Fonction pour migrer les catégories
async function migrateCategories() {
  console.log('🟢 Migration des catégories...');
  const hasData = await collectionExists('categories');
  if (hasData) {
    console.log('✅ Les catégories existent déjà dans Firebase');
    return;
  }
  try {
    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date().toISOString(),
      });
    }
    console.log('✅ Catégories migrées avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de la migration des catégories:', error);
  }
}

// Fonction principale de migration avec test de permissions
export async function migrateAllContent() {
  console.log('🚀 Début de la migration du contenu vers Firebase...');

  // Test des permissions avant la migration
  console.log('\n🔐 Vérification des permissions Firebase...');
  const permissionTest = await testFirebasePermissions(db);

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
    await Promise.all([
      migratePrayerFormulas(),
      migrateVerses(),
      migrateHadiths(),
      migrateReminders(),
      migrateDhikr(),
      migrateDuas(),
      migrateQibla(),
      migrateCalendar(),
      migrateNames(),
      migrateHijri(),
      migrateCategories(),
    ]);

    console.log('🎉 Migration terminée avec succès !');
  } catch (error) {
    console.error('💥 Erreur globale lors de la migration:', error);
    throw error;
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
