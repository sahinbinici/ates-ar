// components/ar/ARScene.tsx — AR sahne: kamera + Three.js 3D overlay
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native';
import { CameraView } from 'expo-camera';
import { GLView } from 'expo-gl';
import { ARPermissions } from './ARPermissions';
import { useLessonStore } from '../../stores/lessonStore';
import { SceneManager } from '../../lib/ar/SceneManager';

interface Props {
  onObjectTouched?: (objectId: string) => void;
}

/**
 * Ana AR sahne bileşeni.
 * Kamera izni → Zemin tarama → Three.js 3D sahne overlay.
 * CameraView arka plan, GLView üzerinde şeffaf 3D render.
 */
export function ARScene({ onObjectTouched }: Props) {
  const [hasPermission, setHasPermission] = useState(false);
  const [planeDetected, setPlaneDetected] = useState(false);
  const [viewSize, setViewSize] = useState({ width: 1, height: 1 });
  const sceneRef = useRef<SceneManager | null>(null);

  const atesState = useLessonStore((s) => s.atesState);
  const currentQuestion = useLessonStore((s) => s.currentQuestion);

  const handlePermissionGranted = useCallback(() => {
    setHasPermission(true);
    // Zemin algılama simülasyonu (gerçek ARCore/ARKit ile değiştirilecek)
    setTimeout(() => setPlaneDetected(true), 2000);
  }, []);

  // Ateş durumu değiştiğinde Three.js sahnesini güncelle
  useEffect(() => {
    sceneRef.current?.setAtesState(atesState);
  }, [atesState]);

  // Soru değiştiğinde sahne nesnelerini güncelle
  useEffect(() => {
    if (currentQuestion) {
      sceneRef.current?.setSceneObjects(currentQuestion.sceneObjects);
    }
  }, [currentQuestion]);

  // GLView bağlam oluşturulduğunda Three.js başlat
  const handleContextCreate = useCallback(
    async (gl: WebGLRenderingContext) => {
      const manager = new SceneManager();
      sceneRef.current = manager;
      await manager.init(gl as any, gl.drawingBufferWidth, gl.drawingBufferHeight);

      // Mevcut durumu uygula
      manager.setAtesState(atesState);
      if (currentQuestion) {
        manager.setSceneObjects(currentQuestion.sceneObjects);
      }
    },
    [], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Dokunma ile nesne algılama
  const handleTouch = useCallback(
    (e: GestureResponderEvent) => {
      if (!sceneRef.current || !onObjectTouched) return;
      const { locationX, locationY } = e.nativeEvent;
      const objectId = sceneRef.current.handleTouch(
        locationX,
        locationY,
        viewSize.width,
        viewSize.height,
      );
      if (objectId) {
        onObjectTouched(objectId);
      }
    },
    [onObjectTouched, viewSize],
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setViewSize({ width, height });
  }, []);

  // Temizlik
  useEffect(() => {
    return () => {
      sceneRef.current?.dispose();
    };
  }, []);

  if (!hasPermission) {
    return <ARPermissions onGranted={handlePermissionGranted} />;
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {/* Kamera arka planı */}
      <CameraView style={styles.camera} facing="back" />

      {/* 3D overlay */}
      {planeDetected ? (
        <View
          style={styles.glContainer}
          onStartShouldSetResponder={() => true}
          onResponderRelease={handleTouch}
        >
          <GLView style={styles.glView} onContextCreate={handleContextCreate} />
        </View>
      ) : (
        <View style={styles.scanOverlay}>
          <Text style={styles.scanText}>📱 Telefonu düz bir yüzeye doğrult...</Text>
          <View style={styles.scanIndicator} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  glContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  glView: {
    flex: 1,
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
    marginBottom: 20,
  },
  scanIndicator: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 107, 53, 0.7)',
    borderRadius: 16,
    borderStyle: 'dashed',
  },
});
