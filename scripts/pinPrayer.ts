import { initializeApp } from 'firebase/app';
import { collection, doc, getDocs, getFirestore, updateDoc } from 'firebase/firestore';

// Configuration Firebase
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

async function pinPrayer() {
  try {
    console.log('🔍 Recherche de la prière à épingler...');

    // Récupérer toutes les prières
    const prayersRef = collection(db, 'prayers');
    const querySnapshot = await getDocs(prayersRef);

    console.log(`📊 ${querySnapshot.size} prières trouvées`);

    // Chercher la prière avec le nom "Awa Seck NDIAYE" ou similaire
    let targetPrayer = null;

    querySnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📝 Prière trouvée: ${data.name} (ID: ${doc.id})`);

      // Chercher une prière qui correspond au nom affiché dans l'image
      if (data.name && data.name.toLowerCase().includes('awa')) {
        targetPrayer = { id: doc.id, ...data };
        console.log(`✅ Prière cible trouvée: ${data.name}`);
      }
    });

    if (!targetPrayer) {
      console.log('❌ Aucune prière correspondante trouvée');
      console.log('💡 Vous pouvez modifier ce script pour chercher par un autre critère');
      return;
    }

    // Épingler la prière
    console.log(`📌 Épinglage de la prière: ${targetPrayer.name}`);
    const prayerRef = doc(db, 'prayers', targetPrayer.id);

    await updateDoc(prayerRef, {
      isPinned: true,
      updatedAt: new Date().toISOString(),
    });

    console.log('✅ Prière épinglée avec succès !');
    console.log("🔄 La prière apparaîtra maintenant en première position dans l'application");
  } catch (error) {
    console.error("❌ Erreur lors de l'épinglage:", error);
  }
}

// Exécuter le script
pinPrayer()
  .then(() => {
    console.log('🏁 Script terminé');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
