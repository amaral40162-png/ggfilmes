import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, SafeAreaView, Clipboard, Platform } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { auth } from '@/src/services/firebase';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { user, coupleId, setCoupleId } = useAuth();
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
      'Tem certeza que deseja vincular ao código da sua namorada? Isso sincronizará as listas de vocês.',
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

  const copyToClipboard = () => {
    if (user?.uid) {
      Clipboard.setString(user.uid);
      Alert.alert('Copiado', 'Seu código foi copiado para a área de transferência.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1a1a1a', '#000']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie sua conexão de casal</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Seu Perfil</Text>
        <View style={styles.card}>
          <Ionicons name="mail" size={20} color="#ff4081" />
          <Text style={styles.emailText}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conexão do Casal</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Seu Código de Convite:</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.codeContainer}>
            <Text style={styles.codeText}>{user?.uid}</Text>
            <Ionicons name="copy-outline" size={18} color="#aaa" />
          </TouchableOpacity>
          <Text style={styles.helperText}>Mande esse código para ela colar no app dela.</Text>
        </View>

        <View style={[styles.card, { marginTop: 15 }]}>
          <Text style={styles.cardLabel}>Vincular ao código dela:</Text>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Cole o código dela aqui..."
              placeholderTextColor="#555"
              value={newCoupleId}
              onChangeText={setNewCoupleId}
            />
            <TouchableOpacity 
              style={[styles.linkBtn, !newCoupleId && styles.linkBtnDisabled]} 
              onPress={handleLinkCouple}
              disabled={!newCoupleId}
            >
              <Text style={styles.linkBtnText}>Vincular</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={[styles.card, { marginTop: 15, backgroundColor: 'rgba(255, 64, 129, 0.1)' }]}>
          <Text style={styles.cardLabel}>ID do Casal Ativo:</Text>
          <Text style={styles.activeCodeText}>{coupleId}</Text>
          <Text style={styles.helperText}>Vocês estão compartilhando filmes sob este ID.</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ff4444" />
        <Text style={styles.logoutText}>Sair da Conta</Text>
      </TouchableOpacity>
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
  header: {
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 25,
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#666',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 5,
  },
  card: {
    backgroundColor: '#161616',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222',
  },
  emailText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    marginTop: -2,
  },
  cardLabel: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 12,
  },
  codeText: {
    color: '#ff4081',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 14,
    fontWeight: 'bold',
  },
  helperText: {
    color: '#555',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 12,
    paddingHorizontal: 15,
    color: '#fff',
    height: 50,
  },
  linkBtn: {
    backgroundColor: '#ff4081',
    borderRadius: 12,
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  linkBtnDisabled: {
    opacity: 0.5,
  },
  linkBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  activeCodeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 120,
    gap: 10,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
