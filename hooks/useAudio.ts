// hooks/useAudio.ts — Mikrofon kaydı yönetimi
import { useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

export function useAudio() {
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async (): Promise<Audio.Recording | null> => {
    try {
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
    async (recording?: Audio.Recording): Promise<string | null> => {
      const rec = recording ?? recordingRef.current;
      if (!rec) return null;

      try {
        await rec.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

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
