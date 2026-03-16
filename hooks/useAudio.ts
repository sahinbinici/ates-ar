// hooks/useAudio.ts — Mikrofon kaydı yönetimi
import { useCallback, useRef } from 'react';

function getAudio() {
  try {
    return require('expo-av').Audio as typeof import('expo-av').Audio;
  } catch {
    return null;
  }
}

export function useAudio() {
  const recordingRef = useRef<any>(null);

  const startRecording = useCallback(async (): Promise<any | null> => {
    try {
      const Audio = getAudio();
      if (!Audio) return null;

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      return recording;
    } catch {
      return null;
    }
  }, []);

  const stopRecording = useCallback(
    async (recording?: any): Promise<string | null> => {
      const rec = recording ?? recordingRef.current;
      if (!rec) return null;

      try {
        const Audio = getAudio();
        await rec.stopAndUnloadAsync();
        if (Audio) await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

        const uri = rec.getURI();
        recordingRef.current = null;
        return uri;
      } catch {
        return null;
      }
    },
    [],
  );

  return { startRecording, stopRecording };
}
