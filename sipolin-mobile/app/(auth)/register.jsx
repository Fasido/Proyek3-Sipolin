import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Hash,
  Mail,
  Phone,
  BookOpen,
  Lock,
  ShieldCheck,
  Truck,
  GraduationCap,
  Car,
  Bike,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

// ─── Constants ────────────────────────────────────────────────────────────────
const ROYAL_BLUE = '#2563eb';
const ROYAL_BLUE_DARK = '#1d4ed8';
const ROYAL_BLUE_LIGHT = '#eff6ff';
const ROYAL_BLUE_BORDER = '#bfdbfe';

const DEPARTMENTS = [
  'Teknik Informatika',
  'Sistem Informasi',
  'Teknik Elektro',
  'Manajemen',
  'Akuntansi',
  'Hukum',
  'Kedokteran',
  'Lainnya',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Floating-label input with icon */
const InputField = ({
  label,
  icon: Icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  rightElement,
  editable = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', ROYAL_BLUE],
  });

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#6b7280', ROYAL_BLUE],
  });

  const iconColor = isFocused ? ROYAL_BLUE : '#9ca3af';

  return (
    <View className="mb-4">
      <Animated.Text style={{ color: labelColor, fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.4 }}>
        {label}
      </Animated.Text>
      <Animated.View
        style={{
          borderWidth: 1.5,
          borderColor,
          borderRadius: 14,
          backgroundColor: editable ? '#fff' : '#f9fafb',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 2,
          shadowColor: isFocused ? ROYAL_BLUE : 'transparent',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: isFocused ? 2 : 0,
        }}
      >
        <Icon size={18} color={iconColor} style={{ marginRight: 10 }} />
        <TextInput
          className="flex-1 text-gray-800"
          style={{ fontSize: 15, paddingVertical: 0 }}
          placeholder={placeholder}
          placeholderTextColor="#d1d5db"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
        />
        {rightElement}
      </Animated.View>
    </View>
  );
};

/** Password input with show/hide toggle */
const PasswordField = ({ label, icon, value, onChangeText, placeholder }) => {
  const [show, setShow] = useState(false);
  return (
    <InputField
      label={label}
      icon={icon}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={!show}
      rightElement={
        <TouchableOpacity onPress={() => setShow(!show)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          {show
            ? <EyeOff size={18} color="#9ca3af" />
            : <Eye size={18} color="#9ca3af" />}
        </TouchableOpacity>
      }
    />
  );
};

/** Role selector card */
const RoleCard = ({ role, selectedRole, onSelect, icon: Icon, title, subtitle, color }) => {
  const isSelected = selectedRole === role;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
    onSelect(role);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} className="flex-1">
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          borderWidth: 2,
          borderColor: isSelected ? color : '#e5e7eb',
          borderRadius: 16,
          padding: 16,
          backgroundColor: isSelected ? `${color}0D` : '#fff',
          alignItems: 'center',
          shadowColor: isSelected ? color : '#000',
          shadowOpacity: isSelected ? 0.18 : 0.04,
          shadowRadius: isSelected ? 12 : 4,
          shadowOffset: { width: 0, height: 4 },
          elevation: isSelected ? 4 : 1,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            backgroundColor: isSelected ? color : '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Icon size={24} color={isSelected ? '#fff' : '#9ca3af'} />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? color : '#374151', marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 11, color: isSelected ? color : '#9ca3af', textAlign: 'center', opacity: 0.85 }}>
          {subtitle}
        </Text>
        {isSelected && (
          <View
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 18,
              height: 18,
              borderRadius: 9,
              backgroundColor: color,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>✓</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const { signUp } = useAuth();
  const router = useRouter();

  // ── Form state
  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'driver'
  const [platNomor, setPlatNomor] = useState('');
  const [jenisMotor, setJenisMotor] = useState('');
  const [showDeptPicker, setShowDeptPicker] = useState(false);

  // ── UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  // ── Animated height for driver section
  const driverSectionHeight = useRef(new Animated.Value(0)).current;
  const driverSectionOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const isDriver = role === 'driver';
    Animated.parallel([
      Animated.timing(driverSectionHeight, {
        toValue: isDriver ? 1 : 0,
        duration: 320,
        useNativeDriver: false,
      }),
      Animated.timing(driverSectionOpacity, {
        toValue: isDriver ? 1 : 0,
        duration: 280,
        useNativeDriver: false,
      }),
    ]).start();
  }, [role]);

  // ── Validation
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
    if (!nim.trim()) newErrors.nim = 'NIM wajib diisi';
    if (!email.trim()) newErrors.email = 'Email wajib diisi';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Format email tidak valid';
    if (!phone.trim()) newErrors.phone = 'Nomor HP wajib diisi';
    if (!department.trim()) newErrors.department = 'Program studi wajib dipilih';
    if (!password) newErrors.password = 'Password wajib diisi';
    else if (password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    if (!confirmPassword) newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';
    if (role === 'driver') {
      if (!platNomor.trim()) newErrors.platNomor = 'Plat nomor wajib diisi';
      if (!jenisMotor.trim()) newErrors.jenisMotor = 'Jenis/warna motor wajib diisi';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit
  const handleRegister = async () => {
    setGlobalError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      // 1. Siapkan data kendaraan (kalau driver)
      // Karena api.js minta 8 parameter kepisah, kita pecah vehiclenya
      let platInfo = null;
      let motorInfo = null;
      
      if (role === 'driver') {
        platInfo = platNomor;
        motorInfo = jenisMotor;
      }

      // 2. Tembak ke AuthContext (perhatikan parameternya sekarang 8)
      // signUp(email, password, name, nim, phone, role, plateNumber, vehicleDetail)
      const result = await signUp(email, password, name, nim, phone, role, platInfo, motorInfo);

      if (!result.success) {
        setGlobalError(result.error || 'Pendaftaran gagal. Coba lagi.');
      } else {
        // 3. JIKA SUKSES, OTOMATIS LOGIN & MASUK KE HOME
        // Karena sistem AuthContext biasanya pakai token JWT
        // Memanggil signUp sudah cukup (jika backend mereturn token dan login otomatis)
        // ATAU kita paksa pindah ke root '/'
        router.replace('/'); 
      }
    } catch (error) {
       setGlobalError('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Department picker helper
  const driverMaxHeight = driverSectionHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header */}
          <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center mb-6"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={20} color={ROYAL_BLUE} />
              <Text style={{ color: ROYAL_BLUE, marginLeft: 6, fontSize: 14, fontWeight: '600' }}>
                Kembali
              </Text>
            </TouchableOpacity>

            {/* Logo / Brand mark */}
            <View className="flex-row items-center mb-2">
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  backgroundColor: ROYAL_BLUE,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                  shadowColor: ROYAL_BLUE,
                  shadowOpacity: 0.35,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 6,
                }}
              >
                <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>S</Text>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '900', color: '#111827', letterSpacing: -0.5 }}>
                SIPOLIN
              </Text>
            </View>

            <Text style={{ fontSize: 28, fontWeight: '800', color: '#111827', letterSpacing: -0.8, marginBottom: 4 }}>
              Buat Akun Baru
            </Text>
            <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 20 }}>
              Daftarkan diri kamu untuk mulai menggunakan layanan Sipolin.
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>

            {/* ── Role Selector */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 10, letterSpacing: 0.6, textTransform: 'uppercase' }}>
              Daftar sebagai
            </Text>
            <View className="flex-row gap-3 mb-6" style={{ gap: 12 }}>
              <RoleCard
                role="user"
                selectedRole={role}
                onSelect={setRole}
                icon={GraduationCap}
                title="Mahasiswa"
                subtitle="Pesan layanan antar & tebengan"
                color={ROYAL_BLUE}
              />
              <RoleCard
                role="driver"
                selectedRole={role}
                onSelect={setRole}
                icon={Truck}
                title="Mitra Driver"
                subtitle="Terima & antar pesanan"
                color="#0891b2"
              />
            </View>

            {/* ── Divider with section label */}
            <View className="flex-row items-center mb-5">
              <View className="flex-1 h-px bg-gray-100" />
              <Text style={{ marginHorizontal: 12, fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Data Diri
              </Text>
              <View className="flex-1 h-px bg-gray-100" />
            </View>

            {/* ── Common Fields */}
            <InputField
              label="Nama Lengkap"
              icon={User}
              value={name}
              onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, name: '' })); }}
              placeholder="Contoh: Budi Santoso"
              autoCapitalize="words"
            />
            {errors.name ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.name}</Text> : null}

            <InputField
              label="NIM (Nomor Induk Mahasiswa)"
              icon={Hash}
              value={nim}
              onChangeText={(t) => { setNim(t); setErrors(e => ({ ...e, nim: '' })); }}
              placeholder="Contoh: 2021310001"
              keyboardType="number-pad"
            />
            {errors.nim ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.nim}</Text> : null}

            <InputField
              label="Email Kampus"
              icon={Mail}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
              placeholder="nim@mahasiswa.univ.ac.id"
              keyboardType="email-address"
            />
            {errors.email ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.email}</Text> : null}

            <InputField
              label="Nomor HP (WhatsApp)"
              icon={Phone}
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrors(e => ({ ...e, phone: '' })); }}
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.phone}</Text> : null}

            {/* Department picker */}
            <View className="mb-4">
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 6, letterSpacing: 0.4 }}>
                Program Studi / Jurusan
              </Text>
              <TouchableOpacity
                onPress={() => setShowDeptPicker(!showDeptPicker)}
                style={{
                  borderWidth: 1.5,
                  borderColor: showDeptPicker ? ROYAL_BLUE : '#e5e7eb',
                  borderRadius: 14,
                  backgroundColor: '#fff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                }}
              >
                <BookOpen size={18} color={showDeptPicker ? ROYAL_BLUE : '#9ca3af'} style={{ marginRight: 10 }} />
                <Text style={{
                  flex: 1,
                  fontSize: 15,
                  color: department ? '#1f2937' : '#d1d5db',
                }}>
                  {department || 'Pilih program studi'}
                </Text>
                <ChevronRight
                  size={16}
                  color="#9ca3af"
                  style={{ transform: [{ rotate: showDeptPicker ? '90deg' : '0deg' }] }}
                />
              </TouchableOpacity>

              {showDeptPicker && (
                <View
                  style={{
                    borderWidth: 1.5,
                    borderColor: ROYAL_BLUE_BORDER,
                    borderRadius: 14,
                    backgroundColor: '#fff',
                    marginTop: 6,
                    overflow: 'hidden',
                    shadowColor: ROYAL_BLUE,
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 4,
                  }}
                >
                  {DEPARTMENTS.map((dept, idx) => (
                    <TouchableOpacity
                      key={dept}
                      onPress={() => {
                        setDepartment(dept);
                        setShowDeptPicker(false);
                        setErrors(e => ({ ...e, department: '' }));
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                        borderBottomWidth: idx < DEPARTMENTS.length - 1 ? 1 : 0,
                        borderBottomColor: '#f3f4f6',
                        backgroundColor: department === dept ? ROYAL_BLUE_LIGHT : '#fff',
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: department === dept ? ROYAL_BLUE : '#374151',
                        fontWeight: department === dept ? '700' : '400',
                      }}>
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {errors.department ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 8 }}>{errors.department}</Text> : null}

            {/* ── Password Fields */}
            <View className="flex-row items-center mb-5 mt-1">
              <View className="flex-1 h-px bg-gray-100" />
              <Text style={{ marginHorizontal: 12, fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Keamanan Akun
              </Text>
              <View className="flex-1 h-px bg-gray-100" />
            </View>

            <PasswordField
              label="Password"
              icon={Lock}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
              placeholder="Minimal 6 karakter"
            />
            {errors.password ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.password}</Text> : null}

            <PasswordField
              label="Konfirmasi Password"
              icon={ShieldCheck}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: '' })); }}
              placeholder="Ulangi password kamu"
            />
            {errors.confirmPassword ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.confirmPassword}</Text> : null}

            {/* ── Driver-only fields (Animated) */}
            <Animated.View
              style={{
                maxHeight: driverMaxHeight,
                opacity: driverSectionOpacity,
                overflow: 'hidden',
              }}
            >
              {/* Driver section header */}
              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: '#ecfeff',
                  borderWidth: 1.5,
                  borderColor: '#a5f3fc',
                  padding: 14,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Bike size={20} color="#0891b2" style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#0e7490' }}>
                    Info Kendaraan
                  </Text>
                  <Text style={{ fontSize: 11, color: '#06b6d4', marginTop: 1 }}>
                    Wajib diisi untuk verifikasi mitra driver
                  </Text>
                </View>
              </View>

              <InputField
                label="Plat Nomor Kendaraan"
                icon={Car}
                value={platNomor}
                onChangeText={(t) => { setPlatNomor(t.toUpperCase()); setErrors(e => ({ ...e, platNomor: '' })); }}
                placeholder="Contoh: B 1234 ABC"
                autoCapitalize="characters"
              />
              {errors.platNomor ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.platNomor}</Text> : null}

              <InputField
                label="Jenis & Warna Motor"
                icon={Bike}
                value={jenisMotor}
                onChangeText={(t) => { setJenisMotor(t); setErrors(e => ({ ...e, jenisMotor: '' })); }}
                placeholder="Contoh: Honda Beat, Merah"
                autoCapitalize="words"
              />
              {errors.jenisMotor ? <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.jenisMotor}</Text> : null}
            </Animated.View>

            {/* ── Global Error */}
            {globalError ? (
              <View
                style={{
                  backgroundColor: '#fef2f2',
                  borderWidth: 1,
                  borderColor: '#fecaca',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#b91c1c', fontSize: 13, flex: 1, lineHeight: 18 }}>
                  ⚠️  {globalError}
                </Text>
              </View>
            ) : null}

            {/* ── Submit Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.88}
              style={{
                backgroundColor: isLoading ? '#93c5fd' : ROYAL_BLUE,
                borderRadius: 16,
                paddingVertical: 17,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                shadowColor: ROYAL_BLUE,
                shadowOpacity: isLoading ? 0 : 0.4,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
                elevation: isLoading ? 0 : 6,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.2, marginRight: 8 }}>
                    Daftar Sekarang
                  </Text>
                  <ChevronRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            {/* ── Footer link */}
            <View className="flex-row justify-center items-center mt-5 mb-2">
              <Text style={{ color: '#9ca3af', fontSize: 14 }}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: ROYAL_BLUE, fontSize: 14, fontWeight: '700' }}>Masuk</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}