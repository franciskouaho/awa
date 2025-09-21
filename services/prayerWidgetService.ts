import { NativeModules, Platform } from 'react-native';

// Interface pour les données de prière du widget
export interface PrayerWidgetData {
  prayerId: string;
  name: string;
  age: number;
  deathDate: number; // timestamp en millisecondes
  location: string;
  personalMessage: string;
  creatorId: string;
}

// Interface pour l'état de la Live Activity
export interface PrayerActivityState {
  prayerCount: number;
  lastPrayerTime: number; // timestamp en millisecondes
  isActive: boolean;
}

// Interface pour une activité active
export interface ActivePrayerActivity {
  id: string;
  prayerId: string;
  name: string;
  prayerCount: number;
  lastPrayerTime: number;
  isActive: boolean;
}

class PrayerWidgetService {
  private static instance: PrayerWidgetService;
  private module: any;

  private constructor() {
    if (Platform.OS === 'ios') {
      this.module = NativeModules.PrayerWidgetModule;
    }
  }

  public static getInstance(): PrayerWidgetService {
    if (!PrayerWidgetService.instance) {
      PrayerWidgetService.instance = new PrayerWidgetService();
    }
    return PrayerWidgetService.instance;
  }

  // Vérifier si les Live Activities sont disponibles
  async areActivitiesEnabled(): Promise<boolean> {
    if (Platform.OS !== 'ios' || !this.module) {
      return false;
    }

    try {
      return await this.module.areActivitiesEnabled();
    } catch (error) {
      console.error('Erreur lors de la vérification des Live Activities:', error);
      return false;
    }
  }

  // Démarrer une Live Activity pour une prière
  async startPrayerActivity(prayerData: PrayerWidgetData): Promise<string | null> {
    if (Platform.OS !== 'ios' || !this.module) {
      console.warn('PrayerWidgetService: Live Activities non disponibles sur cette plateforme');
      return null;
    }

    try {
      const activityId = await this.module.startPrayerActivity(
        prayerData.prayerId,
        prayerData.name,
        prayerData.age,
        prayerData.deathDate,
        prayerData.location,
        prayerData.personalMessage,
        prayerData.creatorId
      );
      
      console.log('Live Activity démarrée avec succès:', activityId);
      return activityId;
    } catch (error) {
      console.error('Erreur lors du démarrage de la Live Activity:', error);
      return null;
    }
  }

  // Mettre à jour une Live Activity
  async updatePrayerActivity(
    activityId: string, 
    state: PrayerActivityState
  ): Promise<boolean> {
    if (Platform.OS !== 'ios' || !this.module) {
      return false;
    }

    try {
      await this.module.updatePrayerActivity(
        activityId,
        state.prayerCount,
        state.lastPrayerTime,
        state.isActive
      );
      
      console.log('Live Activity mise à jour avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la Live Activity:', error);
      return false;
    }
  }

  // Terminer une Live Activity
  async endPrayerActivity(activityId: string): Promise<boolean> {
    if (Platform.OS !== 'ios' || !this.module) {
      return false;
    }

    try {
      await this.module.endPrayerActivity(activityId);
      console.log('Live Activity terminée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la fin de la Live Activity:', error);
      return false;
    }
  }

  // Obtenir toutes les activités actives
  async getActiveActivities(): Promise<ActivePrayerActivity[]> {
    if (Platform.OS !== 'ios' || !this.module) {
      return [];
    }

    try {
      const activities = await this.module.getActiveActivities();
      return activities || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des activités actives:', error);
      return [];
    }
  }

  // Convertir les données de prière pour le widget
  static convertPrayerDataForWidget(prayerData: any): PrayerWidgetData {
    return {
      prayerId: prayerData.id || '',
      name: prayerData.name || '',
      age: prayerData.age || 0,
      deathDate: prayerData.deathDate instanceof Date 
        ? prayerData.deathDate.getTime() 
        : new Date(prayerData.deathDate).getTime(),
      location: prayerData.location || '',
      personalMessage: prayerData.personalMessage || '',
      creatorId: prayerData.creatorId || ''
    };
  }
}

export default PrayerWidgetService;
