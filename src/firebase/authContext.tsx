import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { AppUser, AuthDomainConfigInfo } from '../types';

const SCHOLAR_STORAGE_KEY = 'topbencher_scholar_session';

interface AuthContextType {
  user: (User | AppUser) | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithScholarProfile: (email?: string, displayName?: string) => void;
  signOutUser: () => Promise<void>;
  error: string | null;
  domainConfigInfo: AuthDomainConfigInfo | null;
  clearError: () => void;
  clearDomainConfigInfo: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithScholarProfile: () => {},
  signOutUser: async () => {},
  error: null,
  domainConfigInfo: null,
  clearError: () => {},
  clearDomainConfigInfo: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User | AppUser) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [domainConfigInfo, setDomainConfigInfo] = useState<AuthDomainConfigInfo | null>(null);

  // Restore simulated session or sync with Firebase Auth
  useEffect(() => {
    // 1. Check local scholar session first as immediate optimistic restore
    try {
      const stored = localStorage.getItem(SCHOLAR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppUser;
        if (parsed && parsed.uid) {
          setUser(parsed);
        }
      }
    } catch {
      // Ignore localStorage parse errors
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Clear local scholar override if real Firebase login is active
        try {
          localStorage.removeItem(SCHOLAR_STORAGE_KEY);
        } catch {
          // Ignore
        }

        // Sync user profile to Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          await setDoc(
            userDocRef,
            {
              uid: currentUser.uid,
              email: currentUser.email || 'anonymous@topbencher.ai',
              displayName: (currentUser.displayName || 'Top Bencher Scholar').slice(0, 250),
              photoURL: (currentUser.photoURL || '').slice(0, 950),
              createdAt: new Date().toISOString(),
              lastLoginAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          try {
            handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}`);
          } catch (loggedErr) {
            console.warn('User profile sync notification:', loggedErr);
          }
        }
      } else {
        // If no Firebase user, check if we still have a scholar session
        try {
          const stored = localStorage.getItem(SCHOLAR_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored) as AppUser;
            if (parsed && parsed.uid) {
              setUser(parsed);
              setLoading(false);
              return;
            }
          }
        } catch {
          // Ignore
        }
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInWithGoogle = async () => {
    setError(null);
    setDomainConfigInfo(null);

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      const errorCode = err?.code || '';

      // Gracefully catch and resolve auth/unauthorized-domain without crashing or scary errors
      if (errorCode === 'auth/unauthorized-domain') {
        const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'unknown-host';
        console.warn(
          `[Top Bencher AI] Firebase Auth: Current host "${currentHost}" is not added to Authorized Domains in Firebase project "upbeat-torch-tv4kj". Opening domain configuration assistant.`
        );

        setDomainConfigInfo({
          isUnauthorizedDomain: true,
          currentDomain: currentHost,
          projectId: 'upbeat-torch-tv4kj',
          consoleUrl: 'https://console.firebase.google.com/project/upbeat-torch-tv4kj/authentication/settings',
          userEmail: 'k.salunkhe0001@gmail.com',
        });
        return;
      }

      // If user closed the popup deliberately, don't show an error
      if (errorCode === 'auth/popup-closed-by-user') {
        return;
      }

      console.error('Google Sign In Error:', err);
      setError(err?.message || 'Authentication failed. Please try again.');
    }
  };

  const handleSignInWithScholarProfile = (email?: string, displayName?: string) => {
    setError(null);
    setDomainConfigInfo(null);

    const userEmail = email || 'k.salunkhe0001@gmail.com';
    const userName = displayName || (userEmail.includes('@') ? userEmail.split('@')[0] : 'Top Bencher Scholar');
    const safeHash = Math.abs(
      userEmail.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(36);

    const scholarUser: AppUser = {
      uid: `scholar_${safeHash}`,
      email: userEmail,
      displayName: userName.charAt(0).toUpperCase() + userName.slice(1),
      photoURL: null,
      emailVerified: true,
      isScholarSandbox: true,
    };

    setUser(scholarUser);
    try {
      localStorage.setItem(SCHOLAR_STORAGE_KEY, JSON.stringify(scholarUser));
    } catch {
      // Ignore
    }
  };

  const handleSignOut = async () => {
    setError(null);
    setDomainConfigInfo(null);
    try {
      localStorage.removeItem(SCHOLAR_STORAGE_KEY);
    } catch {
      // Ignore
    }

    try {
      await signOut(auth);
    } catch (err: any) {
      console.warn('Sign Out Warning:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle: handleSignInWithGoogle,
        signInWithScholarProfile: handleSignInWithScholarProfile,
        signOutUser: handleSignOut,
        error,
        domainConfigInfo,
        clearError: () => setError(null),
        clearDomainConfigInfo: () => setDomainConfigInfo(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
