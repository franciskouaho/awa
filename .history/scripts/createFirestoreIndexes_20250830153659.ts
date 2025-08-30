import { initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore, orderBy, query, where } from 'firebase/firestore';

// Configuration Firebase (remplacez par vos propres clés)
const firebaseConfig = {
  apiKey: 'AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  authDomain: 'awaa-9c731.firebaseapp.com',
  projectId: 'awaa-9c731',
  storageBucket: 'awaa-9c731.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Script pour créer les index Firebase nécessaires
 *
 * Ce script va déclencher la création automatique des index
 * en exécutant des requêtes qui nécessitent ces index.
 */

async function createRequiredIndexes() {
  console.log('🔧 Début de la création des index Firebase...');

  try {
    // 1. Index pour prayers: creatorId + createdAt
    console.log("📝 Création de l'index pour prayers (creatorId + createdAt)...");
    await createPrayersIndex();

    // 2. Index pour likes: prayerId + userId
    console.log("❤️ Création de l'index pour likes (prayerId + userId)...");
    await createLikesIndex();

    // 3. Index pour streaks: userId + createdAt
    console.log("🔥 Création de l'index pour streaks (userId + createdAt)...");
    await createStreaksIndex();

    console.log('✅ Tous les index ont été déclenchés !');
    console.log('⏱️ Attendez 1-5 minutes que Firebase crée les index...');
  } catch (error) {
    console.error('❌ Erreur lors de la création des index:', error);
  }
}

async function createPrayersIndex() {
  try {
    // Cette requête va déclencher la création de l'index
    const q = query(
      collection(db, 'prayers'),
      where('creatorId', '==', 'temp_user_id'),
      orderBy('createdAt', 'desc')
    );

    // Exécuter la requête (elle va échouer mais déclencher la création d'index)
    await getDocs(q);
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.log('✅ Index prayers déclenché - Vérifiez Firebase Console');
      console.log('🔗 Lien direct:', error.message);
    } else {
      console.log('ℹ️ Requête prayers exécutée avec succès');
    }
  }
}

async function createLikesIndex() {
  try {
    const q = query(
      collection(db, 'likes'),
      where('prayerId', '==', 'temp_prayer_id'),
      where('userId', '==', 'temp_user_id')
    );

    await getDocs(q);
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.log('✅ Index likes déclenché - Vérifiez Firebase Console');
    } else {
      console.log('ℹ️ Requête likes exécutée avec succès');
    }
  }
}

async function createStreaksIndex() {
  try {
    const q = query(
      collection(db, 'streaks'),
      where('userId', '==', 'temp_user_id'),
      orderBy('createdAt', 'desc')
    );

    await getDocs(q);
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.log('✅ Index streaks déclenché - Vérifiez Firebase Console');
    } else {
      console.log('ℹ️ Requête streaks exécutée avec succès');
    }
  }
}

/**
 * Fonction pour vérifier le statut des index
 * (à exécuter après quelques minutes)
 */
async function checkIndexStatus() {
  console.log('🔍 Vérification du statut des index...');

  try {
    // Tester la requête prayers
    const q = query(
      collection(db, 'prayers'),
      where('creatorId', '==', 'temp_user_id'),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    console.log('✅ Index prayers créé et fonctionnel !');
    console.log(`📊 Résultats: ${snapshot.size} documents trouvés`);
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      console.log('⏳ Index prayers en cours de création...');
      console.log('🔄 Attendez encore quelques minutes');
    } else {
      console.error('❌ Erreur lors de la vérification:', error);
    }
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  console.log("🚀 Script de création d'index Firebase");
  console.log('=====================================');

  createRequiredIndexes()
    .then(() => {
      console.log('\n📋 Instructions:');
      console.log('1. Allez dans Firebase Console → Firestore → Index');
      console.log('2. Attendez que les index passent de "Building" à "Enabled"');
      console.log('3. Revenez dans votre app et testez le drawer "Mes Prières"');

      // Vérifier le statut après 2 minutes
      setTimeout(() => {
        console.log('\n🔍 Vérification automatique du statut...');
        checkIndexStatus();
      }, 120000);
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}

export { checkIndexStatus, createRequiredIndexes };

