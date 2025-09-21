import { NativeModules, Platform } from 'react-native';

const { PrayerWidgetModule } = NativeModules;

export interface PrayerData {
  name: string;
  age: number;
  location: string;
  personalMessage: string;
  deathDate: number;
  prayerId: string;
}

export interface LiveActivityStatus {
  isEnabled: boolean;
  canStart: boolean;
  error?: string;
}

class PrayerWidgetService {
  private static instance: PrayerWidgetService;
  private activeActivities: Map<string, string> = new Map(); // prayerId -> activityId

  static getInstance(): PrayerWidgetService {
    if (!PrayerWidgetService.instance) {
      PrayerWidgetService.instance = new PrayerWidgetService();
    }
    return PrayerWidgetService.instance;
  }

  /**
   * Vérifie si les Live Activities sont disponibles et activées
   */
  async checkLiveActivityStatus(): Promise<LiveActivityStatus> {
    if (Platform.OS !== 'ios') {
      return {
        isEnabled: false,
        canStart: false,
        error: 'Live Activities are only available on iOS',
      };
    }

    try {
      const isEnabled = await PrayerWidgetModule.areActivitiesEnabled();
      return {
        isEnabled,
        canStart: isEnabled,
        error: isEnabled ? undefined : 'Live Activities are disabled in system settings',
      };
    } catch (error) {
      console.error('Error checking Live Activity status:', error);
      return {
        isEnabled: false,
        canStart: false,
        error: `Error checking status: ${error}`,
      };
    }
  }

  /**
   * Démarre une Live Activity pour une prière
   */
  async startLiveActivity(prayerData: PrayerData): Promise<string> {
    try {
      // Vérifier si une activité est déjà active pour cette prière
      if (this.activeActivities.has(prayerData.prayerId)) {
        const existingActivityId = this.activeActivities.get(prayerData.prayerId);
        console.log(
          `Live Activity already active for prayer ${prayerData.prayerId}: ${existingActivityId}`
        );
        return existingActivityId!;
      }

      const activityId = await PrayerWidgetModule.startActivity(
        prayerData.name,
        prayerData.age,
        prayerData.location,
        prayerData.personalMessage,
        prayerData.deathDate,
        prayerData.prayerId
      );

      // Stocker l'ID de l'activité
      this.activeActivities.set(prayerData.prayerId, activityId);

      console.log(`Started Live Activity for prayer ${prayerData.prayerId}: ${activityId}`);
      return activityId;
    } catch (error) {
      console.error('Error starting live activity:', error);
      throw error;
    }
  }

  /**
   * Met à jour le compteur de prières dans une Live Activity
   */
  async updateLiveActivity(prayerId: string, prayerCount: number): Promise<boolean> {
    try {
      const activityId = this.activeActivities.get(prayerId);
      if (!activityId) {
        throw new Error(`No active Live Activity found for prayer ${prayerId}`);
      }

      const success = await PrayerWidgetModule.updateActivity(activityId, prayerCount);
      if (success) {
        console.log(`Updated Live Activity for prayer ${prayerId} with count ${prayerCount}`);
      }
      return success;
    } catch (error) {
      console.error('Error updating live activity:', error);
      throw error;
    }
  }

  /**
   * Termine une Live Activity
   */
  async endLiveActivity(prayerId: string): Promise<boolean> {
    try {
      const activityId = this.activeActivities.get(prayerId);
      if (!activityId) {
        console.log(`No active Live Activity found for prayer ${prayerId}`);
        return true; // Considéré comme terminé
      }

      const success = await PrayerWidgetModule.endActivity(activityId);
      if (success) {
        this.activeActivities.delete(prayerId);
        console.log(`Ended Live Activity for prayer ${prayerId}`);
      }
      return success;
    } catch (error) {
      console.error('Error ending live activity:', error);
      throw error;
    }
  }

  /**
   * Termine toutes les Live Activities actives
   */
  async endAllLiveActivities(): Promise<void> {
    const promises = Array.from(this.activeActivities.keys()).map(prayerId =>
      this.endLiveActivity(prayerId).catch(error =>
        console.error(`Error ending Live Activity for prayer ${prayerId}:`, error)
      )
    );

    await Promise.all(promises);
    this.activeActivities.clear();
  }

  /**
   * Obtient la liste des Live Activities actives
   */
  getActiveActivities(): string[] {
    return Array.from(this.activeActivities.keys());
  }

  /**
   * Vérifie si une prière a une Live Activity active
   */
  hasActiveActivity(prayerId: string): boolean {
    return this.activeActivities.has(prayerId);
  }
}

export default PrayerWidgetService.getInstance();
