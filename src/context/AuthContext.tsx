import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Alert } from 'react-native';
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
      setLoading(true);
      setUser(user);
      
      if (user) {
        try {
          // Busca o coupleId do perfil do usuário no Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setCoupleId(userDoc.data().coupleId);
          } else {
            // Se for novo usuário, por padrão ele é o próprio "coupleId"
            const defaultCoupleId = user.uid;
            await setDoc(userDocRef, {
              email: user.email,
              coupleId: defaultCoupleId
            });
            setCoupleId(defaultCoupleId);
          }
        } catch (error: any) {
          console.error("Erro ao gerenciar perfil do usuário:", error);
          // Se falhar aqui, provavelmente são as regras do Firestore
          Alert.alert(
            "Erro de Sincronização", 
            "Não foi possível carregar seu perfil. Verifique se as regras do Firestore permitem acesso.\n\n" + error.message
          );
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
      try {
        await setDoc(doc(db, 'users', user.uid), { coupleId: newId }, { merge: true });
        setCoupleId(newId);
      } catch (error: any) {
        Alert.alert("Erro ao Vincular", error.message);
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
