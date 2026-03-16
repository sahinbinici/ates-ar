// components/ar/ARPermissions.tsx — Kamera izin ekranı
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

interface Props {
  onGranted: () => void;
}

export function ARPermissions({ onGranted }: Props) {
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (permission?.granted) {
      onGranted();
    }
  }, [permission, onGranted]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📸</Text>
      <Text style={styles.title}>Kamera İzni Gerekli</Text>
      <Text style={styles.description}>
        Ateş'i görebilmek için kamerana ihtiyacımız var! AR deneyimi kamera ile çalışır.
      </Text>
      <TouchableOpacity style={styles.button} onPress={requestPermission}>
        <Text style={styles.buttonText}>Kamerayı Aç</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 32,
  },
  loading: {
    color: '#fff',
    fontSize: 16,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    color: '#ccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
