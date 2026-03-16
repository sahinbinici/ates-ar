// __tests__/lib/SceneManager.test.ts — SceneManager birim testleri
import { SceneManager } from '../../lib/ar/SceneManager';

// Three.js ve expo-three mocking gerekli (native modüller)
// Bu testler temel API interface'ini doğrular
describe('SceneManager', () => {
  it('sınıf oluşturulabilmeli', () => {
    const manager = new SceneManager();
    expect(manager).toBeDefined();
  });

  it('setAtesState ve setSceneObjects metodları mevcut olmalı', () => {
    const manager = new SceneManager();
    expect(typeof manager.setAtesState).toBe('function');
    expect(typeof manager.setSceneObjects).toBe('function');
    expect(typeof manager.handleTouch).toBe('function');
    expect(typeof manager.dispose).toBe('function');
    expect(typeof manager.init).toBe('function');
  });
});
