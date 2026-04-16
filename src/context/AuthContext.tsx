import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
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
    let isMounted = true;

    const initializeAuth = async () => {
      setLoading(true);
      try {
        // 1. Primeiro processa o redirecionamento (essencial na Netlify)
        const result = await getRedirectResult(auth);
        if (result?.user && isMounted) {
          console.log("Usuário detectado após redirecionamento:", result.user.email);
          // O onAuthStateChanged será disparado em seguida, então não precisamos setar o user aqui
          // mas garantimos que o processo terminou.
        }
      } catch (error: any) {
        console.error("Erro no processamento do redirecionamento:", error);
        if (error.code !== 'auth/web-context-cancelled' && isMounted) {
          Alert.alert("Erro de Login", "O Google não pôde completar o login: " + error.message);
        }
      }

      // 2. Escuta mudanças no estado de autenticação
      const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (!isMounted) return;

        setUser(currentUser);
        
        if (currentUser) {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setCoupleId(userDoc.data().coupleId);
            } else {
              const defaultCoupleId = currentUser.uid;
              await setDoc(userDocRef, {
                email: currentUser.email,
                coupleId: defaultCoupleId
              });
              setCoupleId(defaultCoupleId);
            }
          } catch (error: any) {
            console.error("Erro ao gerenciar perfil:", error);
          }
        } else {
          setCoupleId(null);
        }
        
        // Só liberamos o carregamento depois que tudo estiver resolvido
        setLoading(false);
      });

      return unsubscribe;
    };

    const authCleanUp = initializeAuth();

    return () => {
      isMounted = false;
      authCleanUp.then(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
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
