import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  googleProvider,
  LoragiUser,
} from '../lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';

interface AuthContextType {
  user: LoragiUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<LoragiUser>;
  loginWithEmail: (email: string, pass: string) => Promise<LoragiUser>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<LoragiUser>;
  loginAsGuest: (nickname?: string) => Promise<LoragiUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'loragi_auth_guest_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<LoragiUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to map FirebaseUser to LoragiUser
  const mapUser = (fbUser: FirebaseUser): LoragiUser => ({
    uid: fbUser.uid,
    displayName: fbUser.displayName || (fbUser.isAnonymous ? 'Guest Creator' : fbUser.email?.split('@')[0] || 'Lorapok User'),
    email: fbUser.email,
    photoURL: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${fbUser.uid}`,
    isAnonymous: fbUser.isAnonymous,
  });

  useEffect(() => {
    // 1. Check local guest cache first
    try {
      const storedGuest = localStorage.getItem(LOCAL_USER_KEY);
      if (storedGuest) {
        setUser(JSON.parse(storedGuest));
      }
    } catch {}

    // 2. Listen to real Firebase Auth changes
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const mapped = mapUser(fbUser);
        setUser(mapped);
        localStorage.removeItem(LOCAL_USER_KEY);
      } else {
        const storedGuest = localStorage.getItem(LOCAL_USER_KEY);
        if (storedGuest) {
          setUser(JSON.parse(storedGuest));
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<LoragiUser> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      const mapped = mapUser(res.user);
      setUser(mapped);
      localStorage.removeItem(LOCAL_USER_KEY);
      return mapped;
    } catch (err: unknown) {
      console.warn('Google sign-in popup fallback to guest:', err);
      // Fallback guest login so user is never blocked
      return await loginAsGuest('Google Creator');
    }
  };

  const loginWithEmail = async (email: string, pass: string): Promise<LoragiUser> => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const mapped = mapUser(res.user);
      setUser(mapped);
      localStorage.removeItem(LOCAL_USER_KEY);
      return mapped;
    } catch (err: unknown) {
      console.warn('Email sign-in fallback:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string): Promise<LoragiUser> => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(res.user, { displayName: name });
      }
      const mapped = mapUser({ ...res.user, displayName: name });
      setUser(mapped);
      localStorage.removeItem(LOCAL_USER_KEY);
      return mapped;
    } catch (err: unknown) {
      console.warn('Email sign-up fallback:', err);
      throw err;
    }
  };

  const loginAsGuest = async (nickname?: string): Promise<LoragiUser> => {
    const guestId = `guest-${Date.now().toString(36)}`;
    const guestName = nickname?.trim() || 'Lorapok Guest Creator';
    const guestUser: LoragiUser = {
      uid: guestId,
      displayName: guestName,
      email: null,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${guestId}`,
      isAnonymous: true,
    };

    try {
      // Also try Firebase anonymous auth
      await signInAnonymously(auth);
    } catch {}

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    return guestUser;
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem(LOCAL_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
