import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  coupleId: string | null;
  loading: boolean;
  setCoupleId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listener ultra-simples para evitar travas
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setCoupleId(userDoc.data().coupleId);
          } else {
            const defaultId = currentUser.uid;
            await setDoc(userDocRef, {
              email: currentUser.email,
              coupleId: defaultId,
              createdAt: new Date().toISOString()
            });
            setCoupleId(defaultId);
          }
        } catch (e) {
          console.error("Erro silencioso de perfil:", e);
        }
      } else {
        setCoupleId(null);
      }
      
      // Libera o carregamento o mais rápido possível
      setLoading(false);
    });

    // Segurança: se o Firebase não responder em 8 segundos, libera o app mesmo assim
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const updateCoupleId = async (newId: string) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { coupleId: newId }, { merge: true });
        setCoupleId(newId);
      } catch (e) {
        console.error("Erro ao vincular:", e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, coupleId, loading, setCoupleId: updateCoupleId }}>
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
