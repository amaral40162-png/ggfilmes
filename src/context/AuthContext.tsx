import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  coupleId: string | null;
  inviteCode: string | null;
  loading: boolean;
  setCoupleId: (id: string) => void;
  linkByInviteCode: (code: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [coupleId, setCoupleId] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para gerar código aleatório de 6 dígitos
  const generateShortCode = () => Math.floor(100000 + Math.random() * 900000).toString();

  useEffect(() => {
    let isMounted = true;

    async function syncProfile(currentUser: User | null) {
      if (!isMounted) return;
      
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCoupleId(data.coupleId);
            setInviteCode(data.inviteCode);
            
            // Caso o usuário antigo não tenha código ainda, geramos um agora
            if (!data.inviteCode) {
                const newCode = generateShortCode();
                await setDoc(userDocRef, { inviteCode: newCode }, { merge: true });
                setInviteCode(newCode);
            }
          } else {
            const defaultId = currentUser.uid;
            const newInviteCode = generateShortCode();
            await setDoc(userDocRef, {
              email: currentUser.email,
              coupleId: defaultId,
              inviteCode: newInviteCode,
              createdAt: new Date().toISOString()
            });
            setCoupleId(defaultId);
            setInviteCode(newInviteCode);
          }
        } catch (e) {
          console.error("Erro ao sincronizar perfil:", e);
        }
      } else {
        setCoupleId(null);
        setInviteCode(null);
      }
      setLoading(false);
    }

    async function init() {
      try {
        await getRedirectResult(auth);
      } catch (e) {
        console.error("Erro no redirect auth:", e);
      }

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

  const linkByInviteCode = async (shortCode: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
        // 1. Busca quem é o dono desse código de 6 dígitos
        const q = query(collection(db, "users"), where("inviteCode", "==", shortCode), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return false; // Código não encontrado
        }

        const partnerDoc = querySnapshot.docs[0];
        const partnerData = partnerDoc.data();
        const targetCoupleId = partnerData.coupleId;

        // 2. Atualiza o coupleId do usuário atual para o do parceiro encontrado
        await setDoc(doc(db, 'users', user.uid), { coupleId: targetCoupleId }, { merge: true });
        setCoupleId(targetCoupleId);
        
        return true;
    } catch (e) {
        console.error("Erro ao vincular por código:", e);
        return false;
    }
  };

  const updateCoupleId = async (newId: string) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { coupleId: newId }, { merge: true });
        setCoupleId(newId);
      } catch (e) {
        console.error("Erro ao atualizar coupleId:", e);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        coupleId, 
        inviteCode,
        loading, 
        setCoupleId: updateCoupleId,
        linkByInviteCode
    }}>
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
