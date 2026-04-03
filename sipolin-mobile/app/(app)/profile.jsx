import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('[Profile] Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        department: formData.department,
      };

      await usersAPI.updateProfile(updateData);
      setProfile(formData);
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          {/* Header */}
          <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>

          {/* Avatar/Info Section */}
          <View className="bg-white rounded-lg p-6 mb-6 items-center">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
              <Text className="text-4xl font-bold text-blue-600">
                {profile?.name?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900">{profile?.name}</Text>
            <Text className="text-gray-600 text-sm">{profile?.email}</Text>
          </View>

          {/* Success Message */}
          {success && (
            <View className="bg-green-100 border border-green-400 rounded-lg p-3 mb-4">
              <Text className="text-green-700 font-semibold text-sm">{success}</Text>
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View className="bg-red-100 border border-red-400 rounded-lg p-3 mb-4">
              <Text className="text-red-700 text-sm">{error}</Text>
            </View>
          )}

          {/* Profile Info */}
          <View className="bg-white rounded-lg p-6 mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-900">Personal Information</Text>
              <TouchableOpacity onPress={() => setEditing(!editing)}>
                <Text className="text-blue-600 font-semibold text-sm">
                  {editing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Name */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Full Name</Text>
              {editing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              ) : (
                <Text className="text-gray-900 py-3">{profile?.name}</Text>
              )}
            </View>

            {/* Email (Read-only) */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Email</Text>
              <Text className="text-gray-600 py-3">{profile?.email}</Text>
            </View>

            {/* Phone */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Phone</Text>
              {editing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.phone || ''}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text className="text-gray-900 py-3">{profile?.phone || '-'}</Text>
              )}
            </View>

            {/* Department */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Department</Text>
              {editing ? (
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  value={formData.department || ''}
                  onChangeText={(value) => handleInputChange('department', value)}
                  placeholder="Enter department"
                />
              ) : (
                <Text className="text-gray-900 py-3">{profile?.department || '-'}</Text>
              )}
            </View>

            {/* Role */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Role</Text>
              <Text className="text-gray-900 py-3 capitalize">{profile?.role || 'User'}</Text>
            </View>

            {/* Account Status */}
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Status</Text>
              <View className="flex-row items-center">
                <View className={`w-3 h-3 rounded-full mr-2 ${profile?.isActive ? 'bg-green-600' : 'bg-red-600'}`} />
                <Text className="text-gray-900">{profile?.isActive ? 'Active' : 'Inactive'}</Text>
              </View>
            </View>

            {/* Save Button */}
            {editing && (
              <TouchableOpacity
                onPress={handleSaveProfile}
                disabled={saving}
                className="bg-blue-600 rounded-lg py-3 flex-row justify-center items-center mt-4"
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold">Save Changes</Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Settings Section */}
          <View className="bg-white rounded-lg p-6 mb-6">
            <Text className="text-lg font-semibold text-gray-900 mb-4">Settings</Text>

            <TouchableOpacity className="border-b border-gray-200 py-3 flex-row justify-between items-center">
              <Text className="text-gray-900 font-semibold">Notifications</Text>
              <Text className="text-gray-400">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="border-b border-gray-200 py-3 flex-row justify-between items-center">
              <Text className="text-gray-900 font-semibold">Privacy & Security</Text>
              <Text className="text-gray-400">{'>'}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="py-3 flex-row justify-between items-center">
              <Text className="text-gray-900 font-semibold">About</Text>
              <Text className="text-gray-400">{'>'}</Text>
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-600 rounded-lg py-3 mb-8"
          >
            <Text className="text-white font-semibold text-center">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
