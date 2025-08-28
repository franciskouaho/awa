import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

// Hook pour gérer l'authentification
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };
}

// Hook pour gérer Firestore
export function useFirestore() {
  // Ajouter un document
  const addDocument = async (collectionName: string, data: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Récupérer un document par ID
  const getDocument = async (collectionName: string, docId: string) => {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
      } else {
        return { success: false, error: 'Document not found' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Mettre à jour un document
  const updateDocument = async (collectionName: string, docId: string, data: any) => {
    try {
      const docRef = doc(db, collectionName, docId);
      await setDoc(
        docRef,
        {
          ...data,
          updatedAt: new Date(),
        },
        { merge: true }
      );
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Récupérer une collection
  const getCollection = async (collectionName: string, orderByField?: string) => {
    try {
      const colRef = collection(db, collectionName);
      const q = orderByField ? query(colRef, orderBy(orderByField, 'desc')) : colRef;

      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: documents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Récupérer des documents avec une condition
  const getDocumentsWhere = async (
    collectionName: string,
    field: string,
    operator: any,
    value: any
  ) => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return { success: true, data: documents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    addDocument,
    getDocument,
    updateDocument,
    getCollection,
    getDocumentsWhere,
  };
}
