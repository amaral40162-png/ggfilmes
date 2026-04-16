import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  initializeAuth, 
  getReactNativePersistence, 
  GoogleAuthProvider 
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// CONFIGURAÇÃO WEB (Funciona em todas as plataformas)
const firebaseConfig = {
  apiKey: "AIzaSyDC1IGukbe8eEtpplEsrAxkURH0RMYBnJ4",
  authDomain: "gg-filmes-15a23.firebaseapp.com",
  projectId: "gg-filmes-15a23",
  storageBucket: "gg-filmes-15a23.firebasestorage.app",
  messagingSenderId: "316635272922",
  appId: "1:316635272922:web:8bf1ea77dfe837eed437e3"
};

const app = initializeApp(firebaseConfig);

// Inicialização limpa da Autenticação
const auth = Platform.OS === 'web' 
  ? getAuth(app) 
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });

const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Configurações recomendadas para o Google Auth
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export { auth, db, googleProvider };
