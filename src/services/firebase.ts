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

// CONFIGURAÇÃO EXTRAÍDA DO SEU GOOGLE-SERVICES.JSON
const firebaseConfig = {
  apiKey: "AIzaSyDC1IGukbe8eEtpplEsrAxkURH0RMYBnJ4",
  authDomain: "gg-filmes-15a23.firebaseapp.com",
  projectId: "gg-filmes-15a23",
  storageBucket: "gg-filmes-15a23.firebasestorage.app",
  messagingSenderId: "316635272922",
  appId: "1:316635272922:web:8bf1ea77dfe837eed437e3" // ID Web adicionado! Agora funciona no iPhone e Android.
};

// Inicializa o App
const app = initializeApp(firebaseConfig);

// Inicializa Auth de forma inteligente (Web vs Native)
let auth;
if (Platform.OS === 'web') {
  auth = getAuth(app);
} else {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
}

// Inicializa Firestore
const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
