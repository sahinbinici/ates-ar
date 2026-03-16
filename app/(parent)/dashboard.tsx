// app/(parent)/dashboard.tsx — Ebeveyn ana paneli
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { StarBadge } from '../../components/ui/StarBadge';
import type { Child } from '../../types';

export default function DashboardScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { parent, children, loadChildren, signOut } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChildren();
    setRefreshing(false);
  };

  const handleChildPress = (child: Child) => {
    router.push(`/(parent)/child/${child.id}`);
  };

  const [showAddChild, setShowAddChild] = useState(false);
  const [newChildName, setNewChildName] = useState('');

  const handleAddChild = () => {
    setNewChildName('');
    setShowAddChild(true);
  };

  const confirmAddChild = () => {
    if (newChildName.trim()) {
      useAuthStore.getState().addChild(newChildName.trim(), 7, 1);
      setShowAddChild(false);
      setNewChildName('');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hoş geldin */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>
          {t('parent.welcome')}, {parent?.fullName ?? 'Ebeveyn'} 👋
        </Text>
        <Text style={styles.planBadge}>{parent?.subPlan?.toUpperCase() ?? 'FREE'}</Text>
      </View>

      {/* Çocuk profilleri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('parent.childProfiles')}</Text>

        {children.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🦊</Text>
            <Text style={styles.emptyText}>{t('parent.childProfiles')}</Text>
            <TouchableOpacity style={styles.addButton} onPress={handleAddChild}>
              <Text style={styles.addButtonText}>+ {t('parent.addChild')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={styles.childCard}
              onPress={() => handleChildPress(child)}
            >
              <View style={styles.childInfo}>
                <Text style={styles.childAvatar}>🧒</Text>
                <View>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childGrade}>{child.grade}. Sınıf • {child.age} yaş</Text>
                </View>
              </View>
              <StarBadge count={child.totalStars} size="small" />
            </TouchableOpacity>
          ))
        )}

        {children.length > 0 && (
          <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddChild}>
            <Text style={styles.addButtonSmallText}>+ {t('parent.addChild')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Alt menü */}
      <View style={styles.menuSection}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(parent)/settings')}
        >
          <Text style={styles.menuItemText}>⚙️ {t('parent.settings')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Text style={[styles.menuItemText, { color: '#E53935' }]}>🚪 {t('parent.signOut')}</Text>
        </TouchableOpacity>
      </View>

      {/* Çocuk Ekleme Modalı */}
      <Modal visible={showAddChild} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Çocuk Ekle</Text>
            <Text style={styles.modalSubtitle}>Çocuğunuzun adını girin:</Text>
            <TextInput
              style={styles.modalInput}
              value={newChildName}
              onChangeText={setNewChildName}
              placeholder="Ad"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={confirmAddChild}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowAddChild(false)}
              >
                <Text style={styles.modalCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={confirmAddChild}>
                <Text style={styles.modalConfirmText}>Ekle</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  welcomeCard: {
    backgroundColor: '#1a1a2e',
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
  },
  planBadge: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  childAvatar: {
    fontSize: 36,
  },
  childName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  childGrade: {
    fontSize: 14,
    color: '#888',
  },
  addButtonSmall: {
    alignSelf: 'center',
    paddingVertical: 12,
  },
  addButtonSmallText: {
    color: '#FF6B35',
    fontSize: 16,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 8,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#888',
    fontSize: 16,
  },
  modalConfirm: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalConfirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
