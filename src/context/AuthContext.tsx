import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
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
    let isMounted = true;

    async function syncProfile(currentUser: User | null) {
      if (!isMounted) return;
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setCoupleId(userDoc.data().coupleId);
          } else {
            // Cria perfil inicial se não existir
            const defaultId = currentUser.uid;
            await setDoc(userDocRef, {
              email: currentUser.email,
              coupleId: defaultId,
              createdAt: new Date().toISOString()
            });
            setCoupleId(defaultId);
          }
        } catch (e) {
          console.error("Erro ao sincronizar perfil:", e);
        }
      } else {
        setCoupleId(null);
      }
      
      // Finaliza o loading apenas aqui, depois que o perfil foi tentado
      setLoading(false);
    }

    async function init() {
      // 1. Tenta pegar resultado de um possível redirecionamento anterior
      try {
        await getRedirectResult(auth);
      } catch (e) {
        console.error("Erro ao processar redirect:", e);
      }

      // 2. Inicia o listener de estado
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        syncProfile(currentUser);
      });

      return unsubscribe;
    }

    const authPromise = init();

    return () => {
      isMounted = false;
      authPromise.then(unsub => unsub && unsub());
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
