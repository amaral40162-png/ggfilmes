import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, Platform, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, googleProvider } from '../src/services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, signInWithPopup } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Diferencia ambiente para melhor experiência
      // Localhost/Desktop -> Popup | Mobile Web -> Redirect
      const isLocalhost = Platform.OS === 'web' && window.location.hostname === 'localhost';
      
      if (isLocalhost) {
        await signInWithPopup(auth, googleProvider);
      } else {
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (error: any) {
      console.error(error);
      let msg = "Erro ao conectar com Google.";
      if (error.code === 'auth/unauthorized-domain') {
        msg = "Domínio não autorizado no Firebase Console.";
      }
      Alert.alert('Erro de Login', msg + "\n" + error.message);
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#000']} style={styles.background} />
      
      <View style={styles.content}>
        <View style={styles.iconContainer}>
            <LinearGradient colors={['#ff4081', '#7c4dff']} style={styles.iconCircle}>
                <Ionicons name="heart" size={40} color="#fff" />
            </LinearGradient>
          <Text style={styles.appName}>Movie Couple</Text>
          <Text style={styles.tagline}>Sua história, nossos filmes.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.tabTitle}>{isLogin ? 'Entrar' : 'Criar Conta'}</Text>
          
          <View style={styles.inputGroup}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.mainButton} onPress={handleAuth} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{isLogin ? 'Entrar' : 'Cadastrar'}</Text>}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleAuth} disabled={loading}>
            <Ionicons name="logo-google" size={20} color="#fff" style={{marginRight: 10}} />
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchButton} onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.switchText}>
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: "#ff4081",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appName: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
  },
  formCard: {
    backgroundColor: '#161616',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#222',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  tabTitle: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222',
    height: 55,
    borderRadius: 14,
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  mainButton: {
    backgroundColor: '#ff4081',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 15,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#333',
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  switchText: {
    color: '#888',
    fontSize: 14,
  },
});
