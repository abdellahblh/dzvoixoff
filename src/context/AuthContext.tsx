import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  generationsUsed: number;
  plan: 'free' | 'pro';
  createdAt?: any;
}

interface AuthContextType {
  user: User | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  incrementUsage: () => Promise<void>;
  upgradePlan: () => Promise<void>;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Clean up previous user doc observer if any
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = null;
      }

      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Listen to user document changes in real-time
        unsubscribeDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUser({
              id: data.uid,
              name: data.name,
              email: data.email,
              avatar: data.avatar || firebaseUser.photoURL || '',
              generationsUsed: data.generationsUsed || 0,
              plan: data.plan || 'free',
            });
          } else {
            // Set initial user state if the document does not exist yet
            // This prevents a stuck loader and getting kicked to the login screen
            setUser({
              id: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || '',
              generationsUsed: 0,
              plan: 'free',
            });
          }
        }, (error) => {
          try {
            handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          } catch (e) {
            console.error("onSnapshot error:", e);
          }
        });

        try {
          // Create the user document if it doesn't exist
          const docSnap = await getDoc(userDocRef);
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || '',
              generationsUsed: 0,
              plan: 'free',
              createdAt: new Date()
            });
          }
        } catch (error) {
          console.error("Failed to initialize or fetch user document from Firestore:", error);
          // Set standard fallback profile using auth info so the user can still proceed
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            avatar: firebaseUser.photoURL || '',
            generationsUsed: 0,
            plan: 'free',
          });
          try {
            handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
          } catch (e) {
            // Logged already by handleFirestoreError helper
          }
        } finally {
          setIsAuthReady(true);
        }
      } else {
        setUser(null);
        setIsAuthReady(true);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeDoc) {
        unsubscribeDoc();
      }
    };
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Email login error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Create user document immediately
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        name: name,
        email: email,
        avatar: '',
        generationsUsed: 0,
        plan: 'free',
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Email signup error:', error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const incrementUsage = async () => {
    if (user && auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          generationsUsed: user.generationsUsed + 1
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  const upgradePlan = async () => {
    if (user && auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      try {
        await updateDoc(userDocRef, {
          plan: 'pro',
          generationsUsed: 0
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${auth.currentUser.uid}`);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithEmail, signUpWithEmail, resetPassword, logout, incrementUsage, upgradePlan, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
