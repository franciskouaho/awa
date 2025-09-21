import { db } from '@/config/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface SuggestionData {
  content: string;
  email: string;
  userId?: string;
  createdAt: any;
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
}

export class SuggestionService {
  private static collectionName = 'suggestions';

  static async submitSuggestion(data: {
    content: string;
    email: string;
    userId?: string;
  }): Promise<string> {
    try {
      const suggestionData: Omit<SuggestionData, 'id'> = {
        content: data.content.trim(),
        email: data.email.trim(),
        userId: data.userId,
        createdAt: serverTimestamp(),
        status: 'pending',
      };

      const docRef = await addDoc(collection(db, 'suggestions'), suggestionData);

      console.log('✅ Suggestion soumise avec succès:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erreur lors de la soumission de la suggestion:', error);
      throw new Error('Impossible de soumettre votre suggestion. Veuillez réessayer.');
    }
  }

  static validateSuggestion(data: { content: string; email: string }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.content || data.content.trim().length < 10) {
      errors.push('Veuillez décrire votre suggestion (minimum 10 caractères)');
    }

    if (!data.email || data.email.trim().length === 0) {
      errors.push('Veuillez indiquer votre adresse email');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email.trim())) {
        errors.push('Veuillez indiquer une adresse email valide');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const suggestionService = {
  submitSuggestion: SuggestionService.submitSuggestion,
  validateSuggestion: SuggestionService.validateSuggestion,
};
