import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  // State untuk form
  const [name, setName] = useState('');
  const [nim, setNim] = useState(''); // State baru untuk NIM
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    // Validasi input wajib (NIM sekarang wajib karena diminta backend)
    if (!email || !password || !name || !nim) {
      setError('Nama, NIM, Email, dan Password wajib diisi');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    setError('');

    // Kirim data ke signUp (Pastikan AuthContext kamu sudah menerima argumen nim ini)
    const result = await signUp(email, password, name, phone, department, nim);
    
    setLoading(false);

    if (result.success) {
      router.replace('/(app)/dashboard');
    } else {
      setError(result.error || 'Terjadi kesalahan saat mendaftar');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6">
        <View className="py-8">
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} className="mb-6">
            <Text className="text-blue-600 font-semibold">← Back</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
          <Text className="text-gray-600 mb-6">Join Sipolin today</Text>

          {/* Form */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          {/* INPUT NIM BARU */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">NIM (Student ID)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="Enter your NIM"
              value={nim}
              onChangeText={setNim}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Phone (Optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Department (Optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="e.g. Teknik Informatika"
              value={department}
              onChangeText={setDepartment}
              editable={!loading}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2">Confirm Password</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3 text-base focus:border-blue-500"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-6">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          ) : null}

          {/* Register Button */}
          <TouchableOpacity
            className={`rounded-lg py-4 mb-4 flex-row justify-center items-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center pb-10">
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text className="text-blue-600 font-bold">Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}