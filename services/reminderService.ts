import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface ReminderData {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

const REMINDERS_COLLECTION = 'reminders';

export class ReminderService {
  static async getAllReminders(): Promise<{ success: boolean; data?: ReminderData[]; error?: string }> {
    try {
      const snapshot = await getDocs(collection(db, REMINDERS_COLLECTION));
      const reminders: ReminderData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<ReminderData, 'id'>),
      }));
      return { success: true, data: reminders };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
