import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView, Platform, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAuth } from '@/src/context/AuthContext';
import { MovieContext } from '@/src/context/MovieContext';
import { auth } from '@/src/services/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, coupleId, setCoupleId } = useAuth();
  const { watched, watchlist } = useContext(MovieContext);
  const [newCoupleId, setNewCoupleId] = useState('');

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair.');
    }
  };

  const handleLinkCouple = () => {
    if (!newCoupleId.trim()) return;
    
    Alert.alert(
      'Vincular Casal',
      'Tem certeza que deseja vincular ao código do seu parceiro(a)? Isso sincronizará as listas de vocês.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Vincular', 
          onPress: () => {
            setCoupleId(newCoupleId.trim());
            setNewCoupleId('');
            Alert.alert('Sucesso', 'Contas vinculadas com sucesso!');
          }
        }
      ]
    );
  };

  const copyToClipboard = async () => {
    if (user?.uid) {
      await Clipboard.setStringAsync(user.uid);
      Alert.alert('Copiado', 'Seu código foi copiado para a área de transferência.');
    }
  };

  // Pega a inicial do e-mail para o Avatar
  const getInitial = () => {
    if (!user?.email) return '?';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#000']} style={styles.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho Premium */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={['#ff4081', '#7c4dff']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>{getInitial()}</Text>
            </LinearGradient>
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.userName}>{user?.email?.split('@')[0]}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <LinearGradient colors={['#222', '#161616']} style={styles.statCard}>
            <Ionicons name="film" size={24} color="#ff4081" />
            <Text style={styles.statNumber}>{watched?.length || 0}</Text>
            <Text style={styles.statLabel}>Assistidos</Text>
          </LinearGradient>
          
          <LinearGradient colors={['#222', '#161616']} style={styles.statCard}>
            <Ionicons name="bookmark" size={24} color="#7c4dff" />
            <Text style={styles.statNumber}>{watchlist?.length || 0}</Text>
            <Text style={styles.statLabel}>Na Lista</Text>
          </LinearGradient>
        </View>

        {/* Seção de Conexão */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conexão do Casal</Text>
          
          {/* Card: Meu Código */}
          <View style={styles.glassCard}>
            <Text style={styles.cardLabel}>Seu seu Código de Convite:</Text>
            <TouchableOpacity onPress={copyToClipboard} style={styles.codeRow}>
              <Text style={styles.codeDisplay}>{user?.uid}</Text>
              <Ionicons name="copy-outline" size={20} color="#ff4081" />
            </TouchableOpacity>
            <Text style={styles.helperText}>Mande esse código para o seu parceiro(a) colar no app dele(a).</Text>
          </View>

          {/* Card: Vincular */}
          <View style={[styles.glassCard, { marginTop: 15 }]}>
            <Text style={styles.cardLabel}>Vincular ao código dele(a):</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Cole o código aqui..."
                placeholderTextColor="#666"
                value={newCoupleId}
                onChangeText={setNewCoupleId}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={[styles.linkButton, !newCoupleId && styles.buttonDisabled]} 
                onPress={handleLinkCouple}
                disabled={!newCoupleId}
              >
                <LinearGradient
                  colors={['#ff4081', '#ef476f']}
                  style={styles.linkButtonGradient}
                >
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card: Status Ativo */}
          <View style={[styles.glassCard, { marginTop: 15, borderColor: '#333', backgroundColor: 'rgba(255, 64, 129, 0.05)' }]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusDot} />
              <Text style={styles.cardLabel}>ID do Casal Ativo</Text>
            </View>
            <Text style={styles.activeIdText}>{coupleId}</Text>
          </View>
        </View>

        {/* Menu de Opções */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={[styles.menuIcon, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]}>
              <Ionicons name="log-out-outline" size={22} color="#ff4444" />
            </View>
            <Text style={styles.menuText}>Sair da Conta</Text>
            <Ionicons name="chevron-forward" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        <Text style={styles.versionText}>Movie Couple App v1.0.0</Text>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    padding: 3,
    backgroundColor: '#333',
    marginBottom: 15,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 47,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    height: 120,
    borderRadius: 24,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 25,
    marginBottom: 25,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 15,
    marginLeft: 5,
  },
  glassCard: {
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  cardLabel: {
    color: '#666',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
  },
  codeDisplay: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  helperText: {
    color: '#555',
    fontSize: 12,
    marginTop: 12,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 16,
    paddingHorizontal: 16,
    color: '#fff',
    height: 56,
    borderWidth: 1,
    borderColor: '#222',
  },
  linkButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff4081',
    marginTop: -10,
  },
  activeIdText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 12,
    marginTop: 20,
    fontWeight: 'bold',
  }
});
