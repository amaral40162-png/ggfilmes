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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Busca o coupleId do perfil do usuário no Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setCoupleId(userDoc.data().coupleId);
        } else {
          // Se for novo usuário, por padrão ele é o próprio "coupleId"
          // Até que ele vincule com outra pessoa
          const defaultCoupleId = user.uid;
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            coupleId: defaultCoupleId
          });
          setCoupleId(defaultCoupleId);
        }
      } else {
        setCoupleId(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateCoupleId = async (newId: string) => {
    if (user) {
      await setDoc(doc(db, 'users', user.uid), { coupleId: newId }, { merge: true });
      setCoupleId(newId);
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
