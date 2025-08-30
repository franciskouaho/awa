import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * Script pour corriger les IDs utilisateur et synchroniser les données
 * entre le cache local et Firebase
 */
export async function fixUserIds() {
  try {
    console.log('🔧 Début de la correction des IDs utilisateur...');

    // 1. Vérifier l'état actuel du cache
    const user = await AsyncStorage.getItem('user');
    const userEmail = await AsyncStorage.getItem('userEmail');
    const firebaseUid = await AsyncStorage.getItem('firebaseUid');
    const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');

    console.log('📱 État du cache local:');
    console.log('- user:', user ? 'présent' : 'absent');
    console.log('- userEmail:', userEmail || 'absent');
    console.log('- firebaseUid:', firebaseUid || 'absent');
    console.log('- onboardingCompleted:', onboardingCompleted || 'absent');

    // 2. Vérifier l'utilisateur Firebase actuel
    const currentFirebaseUser = auth.currentUser;
    console.log(
      '🔥 Utilisateur Firebase actuel:',
      currentFirebaseUser ? currentFirebaseUser.uid : 'aucun'
    );

    // 3. Si pas d'utilisateur Firebase, essayer de se connecter anonymement
    if (!currentFirebaseUser) {
      console.log('🔄 Tentative de connexion anonyme...');
      try {
        const { signInAnonymously } = await import('firebase/auth');
        await signInAnonymously(auth);
        console.log('✅ Connexion anonyme réussie');
      } catch (error) {
        console.error('❌ Erreur lors de la connexion anonyme:', error);
        return false;
      }
    }

    // 4. Récupérer l'ID Firebase actuel
    const currentUid = auth.currentUser?.uid;
    if (!currentUid) {
      console.error("❌ Impossible de récupérer l'ID Firebase");
      return false;
    }

    console.log('🆔 ID Firebase actuel:', currentUid);

    // 5. Vérifier la cohérence des données
    if (user) {
      const userProfile = JSON.parse(user);
      console.log('👤 Profil utilisateur en cache:', userProfile.uid);

      if (userProfile.uid !== currentUid) {
        console.log('⚠️  ID utilisateur incohérent détecté!');
        console.log('- Cache local:', userProfile.uid);
        console.log('- Firebase:', currentUid);

        // 6. Corriger l'ID utilisateur dans le cache
        userProfile.uid = currentUid;
        await AsyncStorage.setItem('user', JSON.stringify(userProfile));
        await AsyncStorage.setItem('firebaseUid', currentUid);
        console.log('✅ ID utilisateur corrigé dans le cache');
      } else {
        console.log('✅ ID utilisateur cohérent');
      }
    }

    // 7. Synchroniser avec Firebase si nécessaire
    if (userEmail) {
      console.log("📧 Synchronisation avec Firebase pour l'email:", userEmail);

      try {
        // Vérifier si l'utilisateur existe dans Firestore
        const userDoc = await getDoc(doc(db, 'users', currentUid));

        if (userDoc.exists()) {
          console.log('✅ Utilisateur trouvé dans Firestore');
          const firestoreData = userDoc.data();

          // Mettre à jour le cache local avec les données Firestore
          const updatedProfile = {
            uid: currentUid,
            email: userEmail,
            name: firestoreData.name || 'Utilisateur',
            onboardingCompleted: firestoreData.onboardingCompleted || false,
            createdAt: firestoreData.createdAt?.toDate() || new Date(),
            preferences: firestoreData.preferences || {},
          };

          await AsyncStorage.setItem('user', JSON.stringify(updatedProfile));
          await AsyncStorage.setItem(
            'onboardingCompleted',
            updatedProfile.onboardingCompleted.toString()
          );
          console.log('✅ Cache local synchronisé avec Firestore');
        } else {
          console.log('⚠️  Utilisateur non trouvé dans Firestore, création...');

          // Créer l'utilisateur dans Firestore
          const newProfile = {
            uid: currentUid,
            email: userEmail,
            name: 'Utilisateur',
            onboardingCompleted: onboardingCompleted === 'true',
            createdAt: new Date(),
            preferences: {},
          };

          await setDoc(doc(db, 'users', currentUid), newProfile);
          console.log('✅ Utilisateur créé dans Firestore');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la synchronisation avec Firestore:', error);
      }
    }

    // 8. Vérification finale
    const finalUser = await AsyncStorage.getItem('user');
    const finalFirebaseUid = await AsyncStorage.getItem('firebaseUid');

    console.log('🔍 Vérification finale:');
    console.log('- user:', finalUser ? 'présent' : 'absent');
    console.log('- firebaseUid:', finalFirebaseUid || 'absent');

    if (finalUser && finalFirebaseUid) {
      const finalProfile = JSON.parse(finalUser);
      if (finalProfile.uid === finalFirebaseUid) {
        console.log('✅ Correction terminée avec succès!');
        return true;
      } else {
        console.error('❌ Problème persistant avec les IDs');
        return false;
      }
    } else {
      console.error('❌ Données manquantes après correction');
      return false;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la correction des IDs:', error);
    return false;
  }
}

/**
 * Fonction pour nettoyer complètement le cache et redémarrer
 */
export async function clearCacheAndRestart() {
  try {
    console.log('🧹 Nettoyage complet du cache...');

    await AsyncStorage.multiRemove([
      'user',
      'userEmail',
      'firebaseUid',
      'onboardingCompleted',
      'userGeneralSettings',
      'notificationSettings',
      'notificationSettings_pending',
    ]);

    console.log('✅ Cache nettoyé');
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage du cache:', error);
    return false;
  }
}

// Exécuter le script si appelé directement
if (require.main === module) {
  fixUserIds()
    .then(success => {
      if (success) {
        console.log('🎉 Script de correction terminé avec succès!');
        process.exit(0);
      } else {
        console.error('💥 Script de correction échoué');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Erreur fatale:', error);
      process.exit(1);
    });
}
