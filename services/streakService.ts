import { db } from '@/config/firebase';
import { addDoc, collection, doc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore';

const STREAK_COLLECTION = 'streaks';
const USER_PRAYER_SESSIONS_COLLECTION = 'userPrayerSessions';

export interface StreakData {
  id?: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastPrayerDate: string; // ISO date string
  streakHistory: { date: string; completed: boolean }[]; // Historique des 7 derniers jours
  createdAt: string;
  updatedAt: string;
}

export interface PrayerSessionData {
  id?: string;
  userId: string;
  date: string; // ISO date string (format YYYY-MM-DD)
  prayerCount: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service pour gérer le streak de l'utilisateur
export class StreakService {
  
  // Obtenir le streak actuel de l'utilisateur
  static async getUserStreak(userId: string): Promise<{ success: boolean; data?: StreakData; error?: string }> {
    try {
      const q = query(
        collection(db, STREAK_COLLECTION),
        where('userId', '==', userId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Créer un nouveau streak pour cet utilisateur
  const newStreak = await this.createUserStreak(userId);
        return newStreak;
      }
      
      const streakDoc = querySnapshot.docs[0];
      if (!streakDoc) {
        return { success: false, error: 'Aucun streak trouvé.' };
      }
      const streakData = { id: streakDoc.id, ...streakDoc.data() } as StreakData;
      return { success: true, data: streakData };
    } catch (error: any) {
      console.error('Erreur lors de la récupération du streak:', error);
      return { success: false, error: error.message };
    }
  }

  // Créer un nouveau streak pour un utilisateur
  private static async createUserStreak(userId: string): Promise<{ success: boolean; data?: StreakData; error?: string }> {
    try {
      const now = new Date().toISOString();
      const today = new Date().toISOString().split('T')[0];
      
      // Créer l'historique des 7 derniers jours (tous non complétés)
      const streakHistory = [];
      for (let i = 6; i >= 0; i--) {
        const dateObj = new Date();
        dateObj.setDate(dateObj.getDate() - i);
        const dateStr = dateObj.toISOString().split('T')[0] ?? '';
        streakHistory.push({
          date: dateStr,
          completed: false
        });
      }
      
      const streakData: Omit<StreakData, 'id'> = {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastPrayerDate: '',
        streakHistory,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(collection(db, STREAK_COLLECTION), streakData);
      
      const newStreakData = { id: docRef.id, ...streakData };
      return { success: true, data: newStreakData };
    } catch (error: any) {
      console.error('Erreur lors de la création du streak:', error);
      return { success: false, error: error.message };
    }
  }

  // Enregistrer une session de prière
  static async recordPrayerSession(userId: string): Promise<{ success: boolean; data?: { streak: StreakData; session: PrayerSessionData }; error?: string }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      
      // Vérifier si une session existe déjà aujourd'hui
      const sessionQuery = query(
        collection(db, USER_PRAYER_SESSIONS_COLLECTION),
        where('userId', '==', userId),
        where('date', '==', today)
      );
      
      const sessionSnapshot = await getDocs(sessionQuery);
      
      let sessionData: PrayerSessionData;
      
      if (sessionSnapshot.empty) {
        // Créer une nouvelle session
        const newSessionData: Omit<PrayerSessionData, 'id'> = {
          userId,
          date: today ?? '',
          prayerCount: 1,
          completed: true,
          createdAt: now,
          updatedAt: now,
        };
        const sessionDocRef = await addDoc(collection(db, USER_PRAYER_SESSIONS_COLLECTION), newSessionData);
        sessionData = { id: sessionDocRef.id, ...newSessionData };
      } else {
        // Mettre à jour la session existante
        const sessionDoc = sessionSnapshot.docs[0];
        if (!sessionDoc) {
          return { success: false, error: 'Aucune session trouvée.' };
        }
        const existingSession = sessionDoc.data() as PrayerSessionData;
        sessionData = {
          ...existingSession,
          id: sessionDoc.id,
          prayerCount: existingSession.prayerCount + 1,
          completed: true,
          updatedAt: now,
        };
        await updateDoc(doc(db, USER_PRAYER_SESSIONS_COLLECTION, sessionDoc.id), {
          prayerCount: sessionData.prayerCount,
          completed: true,
          updatedAt: now,
        });
      }
      
      // Mettre à jour le streak
  const streakResult = await this.updateStreak(userId);
      
      if (!streakResult.success) {
        return { success: false, error: streakResult.error };
      }
      
      return { 
        success: true, 
        data: { 
          streak: streakResult.data!,
          session: sessionData
        }
      };
    } catch (error: any) {
      console.error('Erreur lors de l\'enregistrement de la session:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le streak de l'utilisateur
  private static async updateStreak(userId: string): Promise<{ success: boolean; data?: StreakData; error?: string }> {
    try {
      // Récupérer le streak actuel
      const streakResult = await this.getUserStreak(userId);
      if (!streakResult.success || !streakResult.data) {
        return { success: false, error: 'Impossible de récupérer le streak' };
      }
      const streak = streakResult.data;
      const todayDate = new Date();
  const today: string = (todayDate.toISOString().split('T')[0]) ?? '';
      const yesterday = new Date(todayDate);
      yesterday.setDate(todayDate.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      // Calculer le nouveau streak
      let newCurrentStreak = streak.currentStreak;
      if (streak.lastPrayerDate === yesterdayStr) {
        newCurrentStreak += 1;
      } else if (streak.lastPrayerDate !== today) {
        newCurrentStreak = 1;
      }
      // Mettre à jour l'historique des 7 derniers jours
      const newStreakHistory = [...streak.streakHistory];
      const todayIndex = newStreakHistory.findIndex(entry => entry.date === today);
      if (todayIndex !== -1 && newStreakHistory[todayIndex]) {
        newStreakHistory[todayIndex].completed = true;
      } else {
        newStreakHistory.push({ date: today, completed: true });
        if (newStreakHistory.length > 7) {
          newStreakHistory.shift();
        }
      }
      // Calculer le plus long streak
      const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);
      const updatedStreakData: StreakData = {
        ...streak,
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastPrayerDate: today,
        streakHistory: newStreakHistory,
        updatedAt: new Date().toISOString(),
      };
      // Sauvegarder en base
      await updateDoc(doc(db, STREAK_COLLECTION, streak.id!), {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastPrayerDate: today,
        streakHistory: newStreakHistory,
        updatedAt: updatedStreakData.updatedAt,
      });
      return { success: true, data: updatedStreakData };
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du streak:', error);
      return { success: false, error: error.message };
    }
  }

  // Obtenir les statistiques détaillées
  static async getStreakStats(userId: string): Promise<{ success: boolean; data?: { streak: StreakData; totalPrayers: number; sessionsThisMonth: number }; error?: string }> {
    try {
      const streakResult = await this.getUserStreak(userId);
      if (!streakResult.success || !streakResult.data) {
        return { success: false, error: streakResult.error };
      }

      // Calculer le total des prières ce mois
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

      const sessionsQuery = query(
        collection(db, USER_PRAYER_SESSIONS_COLLECTION),
        where('userId', '==', userId),
        where('date', '>=', startOfMonthStr)
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);

      let totalPrayers = 0;
      let sessionsThisMonth = 0;

      sessionsSnapshot.forEach(doc => {
        const session = doc.data() as PrayerSessionData;
        totalPrayers += session.prayerCount;
        if (session.completed) {
          sessionsThisMonth++;
        }
      });

      return {
        success: true,
        data: {
          streak: streakResult.data,
          totalPrayers,
          sessionsThisMonth
        }
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      return { success: false, error: error.message };
    }
  }
}
