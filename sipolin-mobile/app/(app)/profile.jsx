/**
 * profile.jsx — SIPOLIN Premium Profile Screen
 * ─────────────────────────────────────────────
 * Features:
 * • Glassmorphism header with radial gradient background
 * • expo-image-picker  → gallery photo selection
 * • Optimistic UI via AuthContext.updateProfilePicture
 * • react-native-reanimated → smooth avatar fade-in
 * • expo-haptics → haptic success feedback
 * • Conditional Verification Badge (driver only)
 * • Inline edit form with real-time validation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  StatusBar,
} from 'react-native';
import { useRouter }                    from 'expo-router';
import { useAuth }                      from '../../context/AuthContext';
import { usersAPI }                     from '../../services/api';
import { SafeAreaView }                 from 'react-native-safe-area-context';
import { LinearGradient }               from 'expo-linear-gradient';
import { BlurView }                     from 'expo-blur';
import * as ImagePicker                 from 'expo-image-picker';
import * as Haptics                     from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  Easing,
}                                       from 'react-native-reanimated';
import { Image }                        from 'expo-image'; // expo-image for blurhash placeholder

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AVATAR_SIZE = 90;

// ─── SVG-free Icon set using Unicode & shapes ─────────────────────────────────
const ICONS = {
  user:     '◎',  edit: '✎',   camera: '⊕',  phone: '☏',
  mail:     '✉',  nim: '⊞',   bell:   '◉',  shield: '⊛',
  info:     '⊕',  logout: '←', check:  '✓',  close: '✕',
  chevron:  '›',  verified: '✦', pending: '◈', vehicle: '⊟',
  location: '⌖', // <--- IKON LOKASI BARU DITAMBAHKAN DI SINI
};

// ─── Reusable Icon Text ───────────────────────────────────────────────────────
const Icon = ({ name, size = 16, color = '#64748b', style }) => (
  <Text style={[{ fontSize: size, color, lineHeight: size * 1.2 }, style]}>
    {ICONS[name] || '•'}
  </Text>
);

// ─── Glassmorphism Card ───────────────────────────────────────────────────────
const GlassCard = ({ children, style }) => (
  <View style={[styles.glassCard, style]}>
    <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
    <View style={styles.glassInner}>{children}</View>
  </View>
);

// ─── Menu Row ────────────────────────────────────────────────────────────────
const MenuRow = ({ icon, label, value, onPress, noBorder, danger }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.menuRow, noBorder && { borderBottomWidth: 0 }]}
    activeOpacity={0.65}
  >
    <View style={styles.menuLeft}>
      <View style={[styles.menuIcon, danger && { backgroundColor: '#fef2f2' }]}>
        <Icon name={icon} size={15} color={danger ? '#ef4444' : '#2563eb'} />
      </View>
      <Text style={[styles.menuLabel, danger && { color: '#ef4444' }]}>{label}</Text>
    </View>
    <View style={styles.menuRight}>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {!danger && <Icon name="chevron" size={18} color="#cbd5e1" />}
    </View>
  </TouchableOpacity>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({ icon, label, value, onChangeText, keyboardType, placeholder }) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <Icon name={icon} size={15} color={focused ? '#2563eb' : '#94a3b8'} style={{ marginRight: 8 }} />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType || 'default'}
          placeholder={placeholder}
          placeholderTextColor="#cbd5e1"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="none"
        />
      </View>
    </View>
  );
};

// ═════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═════════════════════════════════════════════════════════════════════════════
export default function ProfileScreen() {
  const router                    = useRouter();
  const { user, signOut, updateUser, updateProfilePicture } = useAuth();

  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing]     = useState(false);
  const [formData, setFormData]   = useState({});
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // ── Reanimated shared values ──────────────────────────────────────────────
  const avatarOpacity   = useSharedValue(0);
  const avatarScale     = useSharedValue(0.85);
  const uploadRingScale = useSharedValue(1);
  const headerY         = useSharedValue(-20);

  const avatarStyle = useAnimatedStyle(() => ({
    opacity:   avatarOpacity.value,
    transform: [{ scale: avatarScale.value }],
  }));

  const uploadRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadRingScale.value }],
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
    opacity:   avatarOpacity.value,
  }));

  // ─── Mount animation ──────────────────────────────────────────────────────
  const runMountAnimation = useCallback(() => {
    avatarOpacity.value   = withTiming(1,   { duration: 600, easing: Easing.out(Easing.cubic) });
    avatarScale.value     = withSpring(1,   { damping: 14, stiffness: 120 });
    headerY.value         = withTiming(0,   { duration: 500, easing: Easing.out(Easing.quad) });
  }, []);

  // ─── Pulse ring after upload ──────────────────────────────────────────────
  const pulseRing = useCallback(() => {
    uploadRingScale.value = withSequence(
      withSpring(1.15, { damping: 8 }),
      withSpring(1,    { damping: 12 }),
    );
  }, []);

  // ─── Load profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await usersAPI.getProfile();
      setProfile(response.data);
      setFormData(response.data);
      runMountAnimation();
    } catch (err) {
      console.error('[Profile] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Photo pick & upload ──────────────────────────────────────────────────
  const handlePickPhoto = useCallback(async () => {
    // 1. Permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Izin Diperlukan',
        'Aplikasi membutuhkan akses galeri untuk mengganti foto profil.',
        [{ text: 'OK' }]
      );
      return;
    }

    // 2. Pick
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:          ImagePicker.MediaTypeOptions.Images,
      allowsEditing:       true,
      aspect:              [1, 1],
      quality:             0.7,         // Balance size vs quality
      base64:              true,        // We send base64 to backend
      exif:                false,
    });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    if (!asset.base64) {
      Alert.alert('Error', 'Gagal membaca gambar. Coba lagi.');
      return;
    }

    // 3. Build data URI
    const mimeType  = asset.mimeType || 'image/jpeg';
    const dataUri   = `data:${mimeType};base64,${asset.base64}`;

    // 4. Upload with optimistic update (from AuthContext)
    setUploading(true);
    setError('');

    const uploadResult = await updateProfilePicture(dataUri);

    setUploading(false);

    if (uploadResult.success) {
      // Update local profile state
      setProfile((prev) => ({ ...prev, profilePicture: uploadResult.profilePicture }));

      // Haptic + animation feedback
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      pulseRing();
      setSuccess('Foto profil diperbarui!');
      setTimeout(() => setSuccess(''), 3000);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(uploadResult.error || 'Upload gagal.');
    }
  }, [updateProfilePicture, pulseRing]);

  // ─── Save profile text fields ─────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updateData = {
        name:  formData.name,
        phone: formData.phone,
        nim:   formData.nim,
      };
      const response = await usersAPI.updateProfile(updateData);
      const updated  = response.data;

      setProfile(updated);
      updateUser(updated);             // Sync AuthContext
      setEditing(false);
      setSuccess('Profil berhasil disimpan!');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan profil.');
    } finally {
      setSaving(false);
    }
  };

  const handleInput = (key, value) => setFormData((f) => ({ ...f, [key]: value }));

  const handleLogout = () => {
    Alert.alert(
      'Keluar',
      'Yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text:    'Keluar',
          style:   'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // ─── Derived values ───────────────────────────────────────────────────────
  const isDriver     = profile?.role === 'driver';
  const displayPhoto = profile?.profilePicture || null;
  const initials     = profile?.name?.charAt(0)?.toUpperCase() || '?';

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loaderText}>Memuat profil…</Text>
      </View>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* ── Background Gradient ── */}
      <LinearGradient
        colors={['#0f172a', '#1e3a8a', '#1d4ed8']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 0.7 }}
        style={styles.bgGradient}
      />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ══════════════════════════════════════════ */}
          {/* GLASSMORPHISM HEADER SECTION              */}
          {/* ══════════════════════════════════════════ */}
          <Animated.View style={[styles.headerSection, headerStyle]}>
            <GlassCard style={styles.headerCard}>

              {/* Edit toggle */}
              <TouchableOpacity
                style={styles.editToggle}
                onPress={() => {
                  setEditing((v) => !v);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Icon name={editing ? 'close' : 'edit'} size={13} color="#2563eb" />
                <Text style={styles.editToggleText}>{editing ? 'Batal' : 'Edit Profil'}</Text>
              </TouchableOpacity>

              {/* ── Avatar ── */}
              <Animated.View style={[styles.avatarContainer, uploadRingStyle]}>
                {/* Glow ring */}
                <LinearGradient
                  colors={['#60a5fa', '#2563eb', '#1d4ed8']}
                  style={styles.avatarRing}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                >
                  <Animated.View style={[styles.avatarInner, avatarStyle]}>
                    {displayPhoto ? (
                      <Image
                        source={{ uri: displayPhoto }}
                        style={styles.avatarImage}
                        contentFit="cover"
                        placeholder="LGF5?xYk^6#M@-5c,1J5@[or[Q6."
                        transition={400}
                      />
                    ) : (
                      <LinearGradient
                        colors={['#3b82f6', '#1d4ed8']}
                        style={styles.avatarFallback}
                      >
                        <Text style={styles.avatarInitials}>{initials}</Text>
                      </LinearGradient>
                    )}
                  </Animated.View>
                </LinearGradient>

                {/* Camera button */}
                <TouchableOpacity
                  style={styles.cameraBtn}
                  onPress={handlePickPhoto}
                  disabled={uploading}
                  activeOpacity={0.8}
                >
                  {uploading ? (
                    <ActivityIndicator size={10} color="#fff" />
                  ) : (
                    <Icon name="camera" size={12} color="#fff" />
                  )}
                </TouchableOpacity>
              </Animated.View>

              {/* Name & email */}
              <Text style={styles.headerName}>{profile?.name || 'Pengguna'}</Text>
              <Text style={styles.headerEmail}>{profile?.email}</Text>

              {/* Badges row */}
              <View style={styles.badgesRow}>
                {/* Role badge */}
                <View style={styles.roleBadge}>
                  <View style={styles.roleDot} />
                  <Text style={styles.roleBadgeText}>
                    {isDriver ? 'Mitra Driver' : 'Mahasiswa'}
                  </Text>
                </View>

                {/* ── Verification badge: DRIVER ONLY ── */}
                {isDriver && (
                  <View style={[
                    styles.verifyBadge,
                    profile?.isVerified ? styles.verifyBadgeOk : styles.verifyBadgePending,
                  ]}>
                    <Icon
                      name={profile?.isVerified ? 'verified' : 'pending'}
                      size={11}
                      color={profile?.isVerified ? '#16a34a' : '#b45309'}
                    />
                    <Text style={[
                      styles.verifyText,
                      { color: profile?.isVerified ? '#16a34a' : '#b45309' },
                    ]}>
                      {profile?.isVerified ? 'Terverifikasi' : 'Belum Verifikasi'}
                    </Text>
                  </View>
                )}
              </View>

            </GlassCard>
          </Animated.View>

          {/* ── Feedback banners ── */}
          {(success || error) && (
            <Animated.View entering={FadeInDown.duration(300)} style={{ marginBottom: 12 }}>
              {success ? (
                <View style={styles.successBanner}>
                  <Icon name="check" size={13} color="#16a34a" />
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* ══════════════════════════════════════════ */}
          {/* EDIT FORM                                 */}
          {/* ══════════════════════════════════════════ */}
          {editing && (
            <Animated.View entering={FadeInDown.duration(350).springify()}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Edit Informasi</Text>

                <InputField
                  icon="user"
                  label="Nama Lengkap"
                  value={formData.name || ''}
                  onChangeText={(v) => handleInput('name', v)}
                  placeholder="Masukkan nama lengkap"
                />
                <InputField
                  icon="nim"
                  label="NIM"
                  value={formData.nim || ''}
                  onChangeText={(v) => handleInput('nim', v)}
                  keyboardType="numeric"
                  placeholder="Masukkan NIM"
                />
                <InputField
                  icon="phone"
                  label="Nomor HP"
                  value={formData.phone || ''}
                  onChangeText={(v) => handleInput('phone', v)}
                  keyboardType="phone-pad"
                  placeholder="Masukkan nomor HP"
                />

                <TouchableOpacity
                  onPress={handleSave}
                  disabled={saving}
                  style={styles.saveBtn}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#1d4ed8', '#2563eb', '#3b82f6']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={styles.saveBtnGradient}
                  >
                    {saving
                      ? <ActivityIndicator color="#fff" size="small" />
                      : <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
                    }
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}

          {/* ══════════════════════════════════════════ */}
          {/* PERSONAL INFO (view mode)                 */}
          {/* ══════════════════════════════════════════ */}
          {!editing && (
            <Animated.View entering={FadeInDown.duration(400).delay(100)}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Informasi Pribadi</Text>

                {[
                  { icon: 'user',  label: 'Nama Lengkap', value: profile?.name  || '—' },
                  { icon: 'mail',  label: 'Email',        value: profile?.email || '—' },
                  { icon: 'nim',   label: 'NIM',          value: profile?.nim   || '—' },
                  { icon: 'phone', label: 'Nomor HP',     value: profile?.phone || '—' },
                  ...(isDriver ? [
                    { icon: 'vehicle', label: 'Kendaraan',  value: profile?.vehicleDetail || '—' },
                    { icon: 'vehicle', label: 'Plat Nomor', value: profile?.plateNumber   || '—' },
                  ] : []),
                ].map(({ icon, label, value }, idx, arr) => (
                  <View
                    key={label}
                    style={[styles.infoRow, idx < arr.length - 1 && styles.infoRowBorder]}
                  >
                    <View style={styles.infoIconBox}>
                      <Icon name={icon} size={14} color="#2563eb" />
                    </View>
                    <View style={styles.infoTexts}>
                      <Text style={styles.infoLabel}>{label}</Text>
                      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </Animated.View>
          )}

          {/* ══════════════════════════════════════════ */}
          {/* SETTINGS MENU                              */}
          {/* ══════════════════════════════════════════ */}
          <Animated.View entering={FadeInDown.duration(400).delay(180)}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Pengaturan</Text>
              
              {/* ─── MENU LOKASI DITAMBAHKAN DI SINI ─── */}
              <MenuRow 
                icon="location" 
                label="Lokasi Saya (Live Track)" 
                // 👇 GANTI BAGIAN INI AJA BANG 👇
                onPress={() => router.push('/(app)/location')} 
              />

              <MenuRow icon="bell"   label="Notifikasi"           onPress={() => {}} />
              <MenuRow icon="shield" label="Privasi & Keamanan"   onPress={() => {}} />
              <MenuRow
                icon="info"
                label="Tentang SIPOLIN"
                value="v1.0.0"
                onPress={() => {}}
                noBorder
              />
            </View>
          </Animated.View>

          {/* ══════════════════════════════════════════ */}
          {/* LOGOUT                                    */}
          {/* ══════════════════════════════════════════ */}
          <Animated.View entering={FadeInDown.duration(400).delay(260)}>
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutBtn}
              activeOpacity={0.8}
            >
              <Icon name="logout" size={15} color="#ef4444" />
              <Text style={styles.logoutText}>Keluar dari Akun</Text>
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({

  // ── Root & Background ──────────────────────────────────────────────────────
  root: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  bgGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  blob1: {
    position:     'absolute',
    width:        240,
    height:       240,
    borderRadius: 120,
    backgroundColor: '#3b82f620',
    top:  -60,
    right: -60,
  },
  blob2: {
    position:     'absolute',
    width:        180,
    height:       180,
    borderRadius: 90,
    backgroundColor: '#1d4ed815',
    top:  120,
    left: -80,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop:        16,
    paddingBottom:     48,
  },

  // ── Loading ────────────────────────────────────────────────────────────────
  loader: {
    flex:            1,
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: '#0f172a',
    gap:             12,
  },
  loaderText: {
    color:     '#94a3b8',
    fontSize:  14,
    fontWeight:'500',
  },

  // ── Glass Card ─────────────────────────────────────────────────────────────
  glassCard: {
    borderRadius:    28,
    overflow:        'hidden',
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    // iOS shadow
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 12 },
    shadowOpacity:   0.35,
    shadowRadius:    20,
    // Android
    elevation:       16,
  },
  glassInner: {
    padding:    24,
    alignItems: 'center',
  },

  // ── Header Section ─────────────────────────────────────────────────────────
  headerSection: {
    marginBottom: 20,
  },
  headerCard: {},

  editToggle: {
    alignSelf:       'flex-end',
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom:    16,
    gap:             5,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
  },
  editToggleText: {
    color:      '#93c5fd',
    fontSize:   12,
    fontWeight: '600',
  },

  // ── Avatar ─────────────────────────────────────────────────────────────────
  avatarContainer: {
    position:    'relative',
    marginBottom: 14,
  },
  avatarRing: {
    width:        AVATAR_SIZE + 8,
    height:       AVATAR_SIZE + 8,
    borderRadius: (AVATAR_SIZE + 8) / 2,
    padding:      3,
    // Glow
    shadowColor:  '#3b82f6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation:    16,
  },
  avatarInner: {
    width:        AVATAR_SIZE,
    height:       AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow:     'hidden',
  },
  avatarImage: {
    width:  '100%',
    height: '100%',
  },
  avatarFallback: {
    width:           '100%',
    height:          '100%',
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarInitials: {
    fontSize:   34,
    fontWeight: '800',
    color:      '#fff',
    letterSpacing: -1,
  },

  // ── Camera Button ──────────────────────────────────────────────────────────
  cameraBtn: {
    position:        'absolute',
    bottom:          2,
    right:           2,
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: '#2563eb',
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2,
    borderColor:     '#fff',
    // Shadow
    shadowColor:     '#1d4ed8',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.5,
    shadowRadius:    6,
    elevation:       8,
  },

  // ── Header Text ────────────────────────────────────────────────────────────
  headerName: {
    fontSize:      22,
    fontWeight:    '800',
    color:         '#fff',
    letterSpacing: -0.8,
    marginBottom:  4,
    textAlign:     'center',
  },
  headerEmail: {
    fontSize:   13,
    color:      '#93c5fd',
    marginBottom: 14,
    textAlign:  'center',
  },

  // ── Badges ─────────────────────────────────────────────────────────────────
  badgesRow: {
    flexDirection: 'row',
    gap:           8,
    alignItems:    'center',
    flexWrap:      'wrap',
    justifyContent: 'center',
  },
  roleBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius:    20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    gap:             6,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.2)',
  },
  roleDot: {
    width:        7,
    height:       7,
    borderRadius: 4,
    backgroundColor: '#4ade80',
  },
  roleBadgeText: {
    color:      '#e0f2fe',
    fontSize:   12,
    fontWeight: '600',
  },
  verifyBadge: {
    flexDirection:   'row',
    alignItems:      'center',
    borderRadius:    20,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap:             5,
    borderWidth:     1,
  },
  verifyBadgeOk: {
    backgroundColor: '#f0fdf4',
    borderColor:     '#86efac',
  },
  verifyBadgePending: {
    backgroundColor: '#fffbeb',
    borderColor:     '#fcd34d',
  },
  verifyText: {
    fontSize:   11,
    fontWeight: '700',
  },

  // ── White Cards (body) ─────────────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius:    24,
    padding:         20,
    marginBottom:    16,
    shadowColor:     '#0f172a',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.1,
    shadowRadius:    16,
    elevation:       6,
  },
  cardTitle: {
    fontSize:      14,
    fontWeight:    '700',
    color:         '#1e293b',
    marginBottom:  16,
    letterSpacing: -0.3,
  },

  // ── Info Rows ──────────────────────────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingVertical: 11,
    gap:           12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoIconBox: {
    width:           34,
    height:          34,
    borderRadius:    11,
    backgroundColor: '#eff6ff',
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  infoTexts: { flex: 1 },
  infoLabel: {
    fontSize:    10,
    color:       '#94a3b8',
    fontWeight:  '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize:   14,
    color:      '#1e293b',
    fontWeight: '600',
  },

  // ── Edit Form ──────────────────────────────────────────────────────────────
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize:   11,
    color:      '#64748b',
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection:   'row',
    alignItems:      'center',
    borderWidth:     1.5,
    borderColor:     '#e2e8f0',
    borderRadius:    14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  inputFocused: {
    borderColor:     '#2563eb',
    backgroundColor: '#eff6ff',
  },
  textInput: {
    flex:       1,
    fontSize:   14,
    color:      '#1e293b',
    fontWeight: '500',
    paddingVertical: 0,
  },
  saveBtn: {
    borderRadius: 16,
    overflow:     'hidden',
    marginTop:    6,
    // Shadow
    shadowColor:  '#1d4ed8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation:    8,
  },
  saveBtnGradient: {
    paddingVertical: 15,
    alignItems:      'center',
    justifyContent:  'center',
  },
  saveBtnText: {
    color:      '#fff',
    fontSize:   15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Menu Rows ──────────────────────────────────────────────────────────────
  menuRow: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingVertical:   13,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           12,
  },
  menuIcon: {
    width:           34,
    height:          34,
    borderRadius:    11,
    backgroundColor: '#eff6ff',
    alignItems:      'center',
    justifyContent:  'center',
  },
  menuLabel: {
    fontSize:   14,
    color:      '#334155',
    fontWeight: '600',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  menuValue: {
    fontSize:   12,
    color:      '#94a3b8',
    fontWeight: '500',
  },

  // ── Logout ─────────────────────────────────────────────────────────────────
  logoutBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: '#fff',
    borderRadius:    20,
    paddingVertical: 16,
    gap:             8,
    borderWidth:     1.5,
    borderColor:     '#fee2e2',
    shadowColor:     '#ef4444',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.1,
    shadowRadius:    8,
    elevation:       4,
    marginBottom:    8,
  },
  logoutText: {
    color:      '#ef4444',
    fontSize:   15,
    fontWeight: '700',
  },

  // ── Feedback Banners ───────────────────────────────────────────────────────
  successBanner: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: '#f0fdf4',
    borderWidth:     1,
    borderColor:     '#86efac',
    borderRadius:    14,
    padding:         12,
    gap:             7,
  },
  successText: {
    color:      '#16a34a',
    fontSize:   13,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth:     1,
    borderColor:     '#fca5a5',
    borderRadius:    14,
    padding:         12,
  },
  errorText: {
    color:      '#dc2626',
    fontSize:   13,
    fontWeight: '500',
  },
  
});