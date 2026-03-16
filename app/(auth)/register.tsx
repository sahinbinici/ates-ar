// app/(auth)/register.tsx — Ebeveyn kayıt ekranı
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signUp, loading } = useAuthStore();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [kvkkAccepted, setKvkkAccepted] = useState(false);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }
    if (!kvkkAccepted) {
      Alert.alert('Hata', 'Devam etmek için KVKK onayını kabul etmelisiniz.');
      return;
    }

    try {
      await signUp(email.trim(), password, fullName.trim());
      Alert.alert('Başarılı', 'Kayıt tamamlandı! Lütfen e-postanızı doğrulayın.', [
        { text: 'Tamam', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Kayıt başarısız.';
      Alert.alert('Kayıt Hatası', message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.logo}>🦊</Text>
        <Text style={styles.title}>Hesap Oluştur</Text>
        <Text style={styles.subtitle}>Çocuğunuz için bir hesap açın</Text>

        <TextInput
          style={styles.input}
          placeholder={t('auth.fullName')}
          placeholderTextColor="#888"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          placeholderTextColor="#888"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          placeholderTextColor="#888"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.confirmPassword')}
          placeholderTextColor="#888"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        {/* KVKK Onayı */}
        <TouchableOpacity
          style={styles.kvkkRow}
          onPress={() => setKvkkAccepted(!kvkkAccepted)}
        >
          <View style={[styles.checkbox, kvkkAccepted && styles.checkboxChecked]}>
            {kvkkAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.kvkkText}>
            {t('auth.kvkkConsent')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('auth.register')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>{t('auth.hasAccount')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  logo: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#2a2a4e',
    color: '#fff',
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3a3a5e',
  },
  kvkkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  kvkkText: {
    flex: 1,
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#FF6B35',
    fontSize: 15,
    textAlign: 'center',
  },
});
