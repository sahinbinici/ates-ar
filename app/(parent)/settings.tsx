// app/(parent)/settings.tsx — Ebeveyn ayarlar ekranı
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../services/supabase';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const router = useRouter();
  const { parent, signOut } = useAuthStore();
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(30);

  // Ayarları yükle
  useEffect(() => {
    if (!parent?.id) return;
    supabase
      .from('parents')
      .select('settings')
      .eq('id', parent.id)
      .single()
      .then(({ data }) => {
        if (data?.settings) {
          setNotificationsEnabled(data.settings.notificationsEnabled ?? true);
          setDailyLimit(data.settings.dailyLimit ?? 30);
        }
      });
  }, [parent?.id]);

  // Ayarları kaydet
  const persistSettings = async (notifications: boolean, limit: number) => {
    if (!parent?.id) return;
    await supabase
      .from('parents')
      .update({ settings: { notificationsEnabled: notifications, dailyLimit: limit } })
      .eq('id', parent.id);
  };

  const toggleNotifications = (val: boolean) => {
    setNotificationsEnabled(val);
    persistSettings(val, dailyLimit);
  };

  const changeDailyLimit = (min: number) => {
    setDailyLimit(min);
    persistSettings(notificationsEnabled, min);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('settings.deleteAccountTitle'),
      t('parent.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              // CASCADE ile tüm çocuk verisi de silinir
              await supabase.from('parents').delete().eq('id', parent?.id);
              await signOut();
              router.replace('/(auth)/login');
            } catch {
              Alert.alert(t('common.error'), t('parent.deleteError'));
            }
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    if (!parent?.id) return;
    const { data: children } = await supabase.from('children').select('*').eq('parent_id', parent.id);
    const { data: progress } = await supabase.from('progress').select('*').in('child_id', (children ?? []).map(c => c.id));
    const exportData = { parent: { email: parent.email, fullName: parent.fullName }, children, progress };
    Alert.alert(t('parent.yourData'), JSON.stringify(exportData, null, 2).substring(0, 500) + '...');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Hesap Bilgileri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.account')}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('auth.email')}</Text>
          <Text style={styles.value}>{parent?.email}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.plan')}</Text>
          <Text style={styles.valuePlan}>{parent?.subPlan?.toUpperCase() ?? 'FREE'}</Text>
        </View>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>🚀 {t('settings.upgradePlan')}</Text>
        </TouchableOpacity>
      </View>

      {/* Bildirimler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>{t('settings.dailyReminder')}</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={toggleNotifications}
            trackColor={{ true: '#FF6B35' }}
          />
        </View>
      </View>

      {/* Ekran Süresi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.screenTime')}</Text>
        <View style={styles.card}>
          <Text style={styles.label}>{t('settings.dailyLimit')}</Text>
          <View style={styles.limitButtons}>
            {[10, 20, 30, 60].map((min) => (
              <TouchableOpacity
                key={min}
                style={[styles.limitButton, dailyLimit === min && styles.limitButtonActive]}
                onPress={() => changeDailyLimit(min)}
              >
                <Text
                  style={[styles.limitText, dailyLimit === min && styles.limitTextActive]}
                >
                  {min} {t('settings.min')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Veri ve Gizlilik */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.privacy')}</Text>
        <TouchableOpacity style={styles.menuItem} onPress={handleExportData}>
          <Text style={styles.menuText}>📥 {t('settings.exportData')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItemDanger} onPress={handleDeleteAccount}>
          <Text style={styles.menuTextDanger}>🗑️ {t('settings.deleteAccount')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  valuePlan: {
    fontSize: 16,
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  upgradeButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  upgradeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  limitButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  limitButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  limitButtonActive: {
    backgroundColor: '#FF6B35',
  },
  limitText: {
    fontSize: 14,
    color: '#666',
  },
  limitTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuItemDanger: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E53935',
  },
  menuTextDanger: {
    fontSize: 16,
    color: '#E53935',
  },
});
