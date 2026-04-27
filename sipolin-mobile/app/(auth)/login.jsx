import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
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
      router.replace('/(app)'); // Ganti ke /index atau /(app) menyesuaikan struktur folder utama lo
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.headerContainer}>
          <View style={styles.logoBadge}>
            <Bike size={32} color="#ffffff" />
          </View>
          <Text style={styles.title}>Selamat Datang!</Text>
          <Text style={styles.subtitle}>Masuk untuk mulai pesan Polride atau Jastip di Sipolin.</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nim@student.polindra.ac.id"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Masukkan password"
              placeholderTextColor="#9CA3AF"
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
              <Text style={styles.loginButtonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/register')}
            style={styles.registerLink}
          >
            <Text style={styles.registerText}>Belum punya akun? <Text style={styles.registerTextBold}>Daftar dulu</Text></Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ==========================================
// STYLING ALA GOJEK (CLEAN & MODERN)
// ==========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Background putih bersih
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  headerContainer: {
    marginBottom: 40,
    alignItems: 'flex-start', // Rata kiri ala Gojek
  },
  logoBadge: {
    backgroundColor: '#00AA13', // Hijau Gojek (Atau ganti #2563EB buat Biru Sipolin)
    padding: 12,
    borderRadius: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1C', // Hitam pekat
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666666',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#1C1C1C',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F6F6', // Abu-abu sangat terang untuk input
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12, // Border membulat halus
    fontSize: 16,
    color: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  loginButton: {
    backgroundColor: '#00AA13', // Hijau Gojek (Bisa diganti #2563EB)
    paddingVertical: 16,
    borderRadius: 30, // Tombol sangat membulat (pill shape)
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#00AA13',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  loginButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    color: '#666666',
    fontSize: 14,
  },
  registerTextBold: {
    color: '#00AA13', // Hijau Gojek (Bisa diganti #2563EB)
    fontWeight: 'bold',
  },
});