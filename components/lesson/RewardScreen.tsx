// components/lesson/RewardScreen.tsx — Bölüm bitiş ödül ekranı
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

interface Props {
  moduleName: string;
  score: number;
  totalQuestions: number;
  onContinue: () => void;
}

export function RewardScreen({ moduleName, score, totalQuestions, onContinue }: Props) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(starsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, starsAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.celebrationEmoji}>🎉🦊🎉</Text>
        <Text style={styles.title}>Tebrikler!</Text>
        <Text style={styles.moduleName}>{moduleName}</Text>
        <Text style={styles.subtitle}>bölümünü tamamladın!</Text>

        <Animated.View style={[styles.starsContainer, { opacity: starsAnim }]}>
          {Array.from({ length: score }).map((_, i) => (
            <Text key={i} style={styles.star}>
              ⭐
            </Text>
          ))}
        </Animated.View>

        <Text style={styles.scoreText}>
          {score}/{totalQuestions} Doğru
        </Text>

        <TouchableOpacity style={styles.button} onPress={onContinue}>
          <Text style={styles.buttonText}>Devam Et →</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  content: {
    alignItems: 'center',
  },
  celebrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  moduleName: {
    fontSize: 22,
    color: '#fff',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 18,
    color: '#ccc',
    marginBottom: 24,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  star: {
    fontSize: 40,
  },
  scoreText: {
    fontSize: 20,
    color: '#aaa',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
