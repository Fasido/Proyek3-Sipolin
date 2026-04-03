import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bike } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) return alert('Isi email dan password dulu, Bang!');
    setLoading(true);
    const result = await signIn(email, password);
    if (result.success) {
      router.replace('/(app)/dashboard');
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.iconWrapper}>
           <Bike size={50} color="white" />
        </View>
        <Text style={styles.title}>SIPOLIN</Text>
        <Text style={styles.subtitle}>Tebengan & Jastip Khusus Mahasiswa Polindra</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="nim@student.polindra.ac.id"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Masukkan password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          style={styles.loginButton}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Masuk Ke Kampus</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/register')}
          style={styles.registerLink}
        >
          <Text style={styles.registerText}>Belum punya akun? <Text style={styles.registerTextBold}>Daftar Sekarang</Text></Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// STYLING MANUAL BIAR RAPI DI WEB & HP
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconWrapper: {
    backgroundColor: '#2563EB', // blue-600
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    shadowColor: '#BFDBFE', // blue-200
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 5,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -1,
    marginBottom: 8,
  },
  subtitle: {
    color: '#6B7280', // gray-500
    fontWeight: '500',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400, // Biar nggak terlalu lebar di Chrome laptop
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#4B5563', // gray-600
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F9FAFB', // gray-50
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6', // gray-100
    color: '#111827', // gray-900
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2563EB',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#93C5FD', // blue-300
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#6B7280',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
});