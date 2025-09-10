import { initializeApp } from 'firebase/app';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

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

interface DeploymentStrategy {
  phase: 'preparation' | 'gradual' | 'full' | 'rollback';
  description: string;
  featureFlags: {
    useFirebaseContent: boolean;
    enablePrayerFormulas: boolean;
    enableVerses: boolean;
    enableHadiths: boolean;
    migrationVersion: string;
  };
}

const DEPLOYMENT_PHASES: Record<string, DeploymentStrategy> = {
  preparation: {
    phase: 'preparation',
    description: 'Phase de préparation - Migration des données sans activation',
    featureFlags: {
      useFirebaseContent: false,
      enablePrayerFormulas: false,
      enableVerses: false,
      enableHadiths: false,
      migrationVersion: '1.0.0',
    },
  },
  gradual: {
    phase: 'gradual',
    description: 'Phase graduelle - Activation pour 10% des utilisateurs',
    featureFlags: {
      useFirebaseContent: true,
      enablePrayerFormulas: true,
      enableVerses: false,
      enableHadiths: false,
      migrationVersion: '1.0.0',
    },
  },
  full: {
    phase: 'full',
    description: 'Phase complète - Activation pour tous les utilisateurs',
    featureFlags: {
      useFirebaseContent: true,
      enablePrayerFormulas: true,
      enableVerses: true,
      enableHadiths: true,
      migrationVersion: '1.0.0',
    },
  },
  rollback: {
    phase: 'rollback',
    description: 'Rollback - Retour aux données locales',
    featureFlags: {
      useFirebaseContent: false,
      enablePrayerFormulas: false,
      enableVerses: false,
      enableHadiths: false,
      migrationVersion: '1.0.0',
    },
  },
};

async function deployFeatureFlags(phase: string): Promise<void> {
  const strategy = DEPLOYMENT_PHASES[phase];
  if (!strategy) {
    throw new Error(`Phase de déploiement inconnue: ${phase}`);
  }

  console.log(`🚀 Déploiement de la phase: ${strategy.description}`);

  try {
    await setDoc(doc(db, 'config', 'featureFlags'), {
      ...strategy.featureFlags,
      deployedAt: new Date().toISOString(),
      phase: strategy.phase,
    });

    console.log('✅ Feature flags déployés avec succès');
    console.log('📊 Configuration:', strategy.featureFlags);
  } catch (error) {
    console.error('❌ Erreur lors du déploiement des feature flags:', error);
    throw error;
  }
}

async function checkMigrationStatus(): Promise<void> {
  console.log('🔍 Vérification du statut de migration...');

  try {
    const { migrateAllContent } = await import('./migrateContent');
    const results = await migrateAllContent();

    if (results.totalSuccess) {
      console.log('✅ Migration des données terminée avec succès');
    } else {
      console.log('⚠️ Migration partiellement échouée:', results);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de migration:', error);
  }
}

async function main() {
  const phase = process.argv[2] || 'preparation';

  console.log('🎯 Déploiement de migration en production');
  console.log('📋 Phase sélectionnée:', phase);

  try {
    // 1. Vérifier le statut de migration
    await checkMigrationStatus();

    // 2. Déployer les feature flags
    await deployFeatureFlags(phase);

    console.log('🎉 Déploiement terminé avec succès !');
    console.log(
      "📱 Les utilisateurs recevront la nouvelle configuration lors de leur prochaine ouverture de l'app"
    );
  } catch (error) {
    console.error('💥 Erreur lors du déploiement:', error);
    process.exit(1);
  }
}

// Exécuter le script
if (process.argv[1] && process.argv[1].endsWith('deployMigration.ts')) {
  main();
}

export { deployFeatureFlags, DEPLOYMENT_PHASES };
