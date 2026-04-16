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
    // Processar o resultado do redirecionamento do Google se existir
    const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          console.log("Login via redirect bem-sucedido:", result.user.email);
        }
      } catch (error: any) {
        console.error("Erro no retorno do redirect do Google:", error);
        if (error.code !== 'auth/web-context-cancelled') {
          Alert.alert("Erro de Login", "O Google recusou o acesso: " + error.message);
        }
      }
    };

    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Busca o coupleId do perfil do usuário no Firestore
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setCoupleId(userDoc.data().coupleId);
          } else {
            // Se for novo usuário, por padrão ele é o próprio "coupleId"
            const defaultCoupleId = currentUser.uid;
            await setDoc(userDocRef, {
              email: currentUser.email,
              coupleId: defaultCoupleId
            });
            setCoupleId(defaultCoupleId);
          }
        } catch (error: any) {
          console.error("Erro ao gerenciar perfil do usuário:", error);
          Alert.alert(
            "Erro de Sincronização", 
            "Logado, mas não foi possível carregar seu perfil: " + error.message
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
