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
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

// ─── Theme Colors - Biru, Kuning, Putih ──────────────────────────────────────
const PRIMARY_BLUE = '#1E3A8A';      // Biru Tua
const PRIMARY_BLUE_LIGHT = '#3B82F6'; // Biru Cerah
const PRIMARY_BLUE_SOFT = '#DBEAFE';  // Biru Soft
const YELLOW = '#FBBF24';             // Kuning Emas
const YELLOW_SOFT = '#FEF3C7';        // Kuning Soft
const WHITE = '#FFFFFF';
const WHITE_SOFT = '#F9FAFB';
const DARK = '#1F2937';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#E5E7EB';

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
    outputRange: [LIGHT_GRAY, YELLOW],
  });

  const labelColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [GRAY, PRIMARY_BLUE],
  });

  const iconColor = isFocused ? YELLOW : GRAY;

  return (
    <View style={{ marginBottom: 16 }}>
      <Animated.Text style={{ color: labelColor, fontSize: 12, fontWeight: '600', marginBottom: 6, letterSpacing: 0.4 }}>
        {label}
      </Animated.Text>
      <Animated.View
        style={{
          borderWidth: 1.5,
          borderColor,
          borderRadius: 14,
          backgroundColor: editable ? WHITE : WHITE_SOFT,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          paddingVertical: Platform.OS === 'ios' ? 14 : 2,
          shadowColor: isFocused ? YELLOW : 'transparent',
          shadowOpacity: 0.12,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: isFocused ? 2 : 0,
        }}
      >
        <Icon size={18} color={iconColor} style={{ marginRight: 10 }} />
        <TextInput
          style={{ flex: 1, fontSize: 15, paddingVertical: 0, color: DARK }}
          placeholder={placeholder}
          placeholderTextColor={LIGHT_GRAY}
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
            ? <EyeOff size={18} color={GRAY} />
            : <Eye size={18} color={GRAY} />}
        </TouchableOpacity>
      }
    />
  );
};

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

  const cardColor = role === 'user' ? PRIMARY_BLUE : '#0891b2';
  const selectedColor = isSelected ? (role === 'user' ? YELLOW : YELLOW) : cardColor;

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ flex: 1 }}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          borderWidth: 2,
          borderColor: isSelected ? YELLOW : LIGHT_GRAY,
          borderRadius: 16,
          padding: 16,
          backgroundColor: isSelected ? YELLOW_SOFT : WHITE,
          alignItems: 'center',
          shadowColor: isSelected ? YELLOW : '#000',
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
            backgroundColor: isSelected ? YELLOW : '#f3f4f6',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
          }}
        >
          <Icon size={24} color={isSelected ? PRIMARY_BLUE : GRAY} />
        </View>
        <Text style={{ fontSize: 13, fontWeight: '700', color: isSelected ? PRIMARY_BLUE : DARK, marginBottom: 2 }}>
          {title}
        </Text>
        <Text style={{ fontSize: 11, color: isSelected ? PRIMARY_BLUE : GRAY, textAlign: 'center', opacity: 0.85 }}>
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
              backgroundColor: YELLOW,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: PRIMARY_BLUE, fontSize: 11, fontWeight: '800' }}>✓</Text>
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

  const [name, setName] = useState('');
  const [nim, setNim] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [platNomor, setPlatNomor] = useState('');
  const [jenisMotor, setJenisMotor] = useState('');
  const [showDeptPicker, setShowDeptPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

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

  const handleRegister = async () => {
    setGlobalError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      let platInfo = null;
      let motorInfo = null;
      
      if (role === 'driver') {
        platInfo = platNomor;
        motorInfo = jenisMotor;
      }

      const result = await signUp(email, password, name, nim, phone, role, platInfo, motorInfo);

      if (!result.success) {
        setGlobalError(result.error || 'Pendaftaran gagal. Coba lagi.');
      } else {
        router.replace('/');
      }
    } catch (error) {
      setGlobalError('Terjadi kesalahan jaringan.');
    } finally {
      setIsLoading(false);
    }
  };

  const driverMaxHeight = driverSectionHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: WHITE }} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={WHITE} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header with Blue Background */}
          <View style={{ backgroundColor: PRIMARY_BLUE, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ArrowLeft size={20} color={WHITE} />
              <Text style={{ color: WHITE, marginLeft: 6, fontSize: 14, fontWeight: '600' }}>
                Kembali
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <View
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 15,
                  backgroundColor: YELLOW,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 12,
                  shadowColor: YELLOW,
                  shadowOpacity: 0.5,
                  shadowRadius: 12,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 8,
                }}
              >
                <Sparkles size={28} color={PRIMARY_BLUE} />
              </View>
              <Text style={{ fontSize: 26, fontWeight: '900', color: WHITE, letterSpacing: -0.5 }}>
                SIPOLIN
              </Text>
            </View>

            <Text style={{ fontSize: 28, fontWeight: '800', color: WHITE, letterSpacing: -0.8, marginBottom: 8 }}>
              Buat Akun Baru
            </Text>
            <Text style={{ fontSize: 14, color: YELLOW_SOFT, lineHeight: 20 }}>
              Daftarkan diri kamu untuk mulai menggunakan layanan Sipolin
            </Text>
          </View>

          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>

            {/* Role Selector */}
            <Text style={{ fontSize: 12, fontWeight: '700', color: PRIMARY_BLUE, marginBottom: 12, letterSpacing: 0.6 }}>
              DAFTAR SEBAGAI
            </Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
              <RoleCard
                role="user"
                selectedRole={role}
                onSelect={setRole}
                icon={GraduationCap}
                title="Mahasiswa"
                subtitle="Pesan layanan antar"
                color={PRIMARY_BLUE}
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

            {/* Data Diri Section */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
              <View style={{ flex: 1, height: 1.5, backgroundColor: YELLOW_SOFT }} />
              <Text style={{ marginHorizontal: 12, fontSize: 11, fontWeight: '700', color: PRIMARY_BLUE, letterSpacing: 0.5 }}>
                DATA DIRI
              </Text>
              <View style={{ flex: 1, height: 1.5, backgroundColor: YELLOW_SOFT }} />
            </View>

            <InputField
              label="Nama Lengkap"
              icon={User}
              value={name}
              onChangeText={(t) => { setName(t); setErrors(e => ({ ...e, name: '' })); }}
              placeholder="Budi Santoso"
              autoCapitalize="words"
            />
            {errors.name && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.name}</Text>}

            <InputField
              label="NIM"
              icon={Hash}
              value={nim}
              onChangeText={(t) => { setNim(t); setErrors(e => ({ ...e, nim: '' })); }}
              placeholder="2021310001"
              keyboardType="number-pad"
            />
            {errors.nim && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.nim}</Text>}

            <InputField
              label="Email Kampus"
              icon={Mail}
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors(e => ({ ...e, email: '' })); }}
              placeholder="nim@mahasiswa.univ.ac.id"
              keyboardType="email-address"
            />
            {errors.email && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.email}</Text>}

            <InputField
              label="Nomor HP"
              icon={Phone}
              value={phone}
              onChangeText={(t) => { setPhone(t); setErrors(e => ({ ...e, phone: '' })); }}
              placeholder="08xxxxxxxxxx"
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.phone}</Text>}

            {/* Department picker */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: GRAY, marginBottom: 6, letterSpacing: 0.4 }}>
                Program Studi
              </Text>
              <TouchableOpacity
                onPress={() => setShowDeptPicker(!showDeptPicker)}
                style={{
                  borderWidth: 1.5,
                  borderColor: showDeptPicker ? YELLOW : LIGHT_GRAY,
                  borderRadius: 14,
                  backgroundColor: WHITE,
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 14,
                }}
              >
                <BookOpen size={18} color={showDeptPicker ? YELLOW : GRAY} style={{ marginRight: 10 }} />
                <Text style={{
                  flex: 1,
                  fontSize: 15,
                  color: department ? DARK : LIGHT_GRAY,
                }}>
                  {department || 'Pilih program studi'}
                </Text>
                <ChevronRight
                  size={16}
                  color={GRAY}
                />
              </TouchableOpacity>

              {showDeptPicker && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: YELLOW_SOFT,
                    borderRadius: 14,
                    backgroundColor: WHITE,
                    marginTop: 8,
                    overflow: 'hidden',
                    shadowColor: PRIMARY_BLUE,
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
                        backgroundColor: department === dept ? YELLOW_SOFT : WHITE,
                      }}
                    >
                      <Text style={{
                        fontSize: 14,
                        color: department === dept ? PRIMARY_BLUE : DARK,
                        fontWeight: department === dept ? '700' : '400',
                      }}>
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {errors.department && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -8, marginBottom: 8 }}>{errors.department}</Text>}

            {/* Keamanan Akun */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 8 }}>
              <View style={{ flex: 1, height: 1.5, backgroundColor: YELLOW_SOFT }} />
              <Text style={{ marginHorizontal: 12, fontSize: 11, fontWeight: '700', color: PRIMARY_BLUE, letterSpacing: 0.5 }}>
                KEAMANAN AKUN
              </Text>
              <View style={{ flex: 1, height: 1.5, backgroundColor: YELLOW_SOFT }} />
            </View>

            <PasswordField
              label="Password"
              icon={Lock}
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors(e => ({ ...e, password: '' })); }}
              placeholder="Minimal 6 karakter"
            />
            {errors.password && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.password}</Text>}

            <PasswordField
              label="Konfirmasi Password"
              icon={ShieldCheck}
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setErrors(e => ({ ...e, confirmPassword: '' })); }}
              placeholder="Ulangi password"
            />
            {errors.confirmPassword && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.confirmPassword}</Text>}

            {/* Driver-only fields */}
            <Animated.View
              style={{
                maxHeight: driverMaxHeight,
                opacity: driverSectionOpacity,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  borderRadius: 16,
                  backgroundColor: YELLOW_SOFT,
                  borderWidth: 1.5,
                  borderColor: YELLOW,
                  padding: 14,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Bike size={20} color={YELLOW} style={{ marginRight: 10 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: PRIMARY_BLUE }}>
                    Info Kendaraan
                  </Text>
                  <Text style={{ fontSize: 11, color: PRIMARY_BLUE_LIGHT, marginTop: 1 }}>
                    Wajib diisi untuk verifikasi mitra driver
                  </Text>
                </View>
              </View>

              <InputField
                label="Plat Nomor"
                icon={Car}
                value={platNomor}
                onChangeText={(t) => { setPlatNomor(t.toUpperCase()); setErrors(e => ({ ...e, platNomor: '' })); }}
                placeholder="B 1234 ABC"
                autoCapitalize="characters"
              />
              {errors.platNomor && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.platNomor}</Text>}

              <InputField
                label="Jenis & Warna Motor"
                icon={Bike}
                value={jenisMotor}
                onChangeText={(t) => { setJenisMotor(t); setErrors(e => ({ ...e, jenisMotor: '' })); }}
                placeholder="Honda Beat, Merah"
                autoCapitalize="words"
              />
              {errors.jenisMotor && <Text style={{ color: '#ef4444', fontSize: 12, marginTop: -12, marginBottom: 8 }}>{errors.jenisMotor}</Text>}
            </Animated.View>

            {/* Global Error */}
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
                <Text style={{ color: '#b91c1c', fontSize: 13, flex: 1 }}>
                  ⚠️ {globalError}
                </Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.88}
              style={{
                backgroundColor: isLoading ? LIGHT_GRAY : YELLOW,
                borderRadius: 16,
                paddingVertical: 17,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 8,
                shadowColor: YELLOW,
                shadowOpacity: isLoading ? 0 : 0.4,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
                elevation: isLoading ? 0 : 6,
              }}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color={PRIMARY_BLUE} />
              ) : (
                <>
                  <Text style={{ color: PRIMARY_BLUE, fontSize: 16, fontWeight: '800', letterSpacing: 0.2, marginRight: 8 }}>
                    DAFTAR SEKARANG
                  </Text>
                  <ChevronRight size={20} color={PRIMARY_BLUE} />
                </>
              )}
            </TouchableOpacity>

            {/* Footer */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 16 }}>
              <Text style={{ color: GRAY, fontSize: 14 }}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => router.push('/login')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ color: PRIMARY_BLUE, fontSize: 14, fontWeight: '700' }}>Masuk</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}7