import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { auth, googleProvider } from '../src/services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithRedirect, signInWithPopup } from 'firebase/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      console.error(error);
      let message = 'Ocorreu um erro na autenticação.';
      if (error.code === 'auth/email-already-in-use') message = 'Este e-mail já está em uso.';
      if (error.code === 'auth/invalid-email') message = 'E-mail inválido.';
      if (error.code === 'auth/weak-password') message = 'A senha deve ter pelo menos 6 caracteres.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos.';
      }
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    try {
      // Se estiver local, o popup costuma ser mais amigável. Na Web/Netlify o Redirect é melhor.
      if (Platform.OS === 'web' && window.location.hostname === 'localhost') {
        await signInWithPopup(auth, googleProvider);
      } else {
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (error: any) {
      console.error(error);
      let message = 'Ocorreu um erro ao entrar com o Google.';
      if (error.code === 'auth/unauthorized-domain') {
        message = 'Este domínio não está autorizado no Firebase. Adicione ' + window.location.hostname + ' na lista de domínios autorizados.';
      }
      Alert.alert('Erro de Login', message + '\n\n' + error.message);
    } finally {
      // No caso do redirect, o loading continuará até a página recarregar.
      // Se houver erro ou popup, desligamos o loading aqui.
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#000', '#1a1a1a']} style={styles.background} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#ff4081', '#7c4dff']}
              style={styles.logoGradient}
            >
              <Ionicons name="film" size={40} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>Movie Couple</Text>
          <Text style={styles.subtitle}>
            {isRegistering ? 'Crie sua conta para começar' : 'Bem-vindo de volta!'}
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleAuth}
            disabled={loading}
          >
            <LinearGradient
              colors={['#ff4081', '#ef476f']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>
                  {isRegistering ? 'Cadastrar' : 'Entrar'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={handleGoogleAuth}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={20} color="#fff" />
            <Text style={styles.googleButtonText}>Entrar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.switchButton}
            onPress={() => setIsRegistering(!isRegistering)}
          >
            <Text style={styles.switchText}>
              {isRegistering 
                ? 'Já tem uma conta? Faça login' 
                : 'Novo por aqui? Crie uma conta'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoContainer: {
    width: 80,
    height: 80,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#ff4081',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  logoGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 8,
    fontWeight: '500',
  },
  form: {
    gap: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    height: 60,
    borderRadius: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  icon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    height: 60,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#ff4081',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
  },
  dividerText: {
    color: '#666',
    marginHorizontal: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  googleButton: {
    height: 60,
    borderRadius: 16,
    backgroundColor: '#333',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#444',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  switchText: {
    color: '#ff4081',
    fontSize: 14,
    fontWeight: '600',
  },
});
