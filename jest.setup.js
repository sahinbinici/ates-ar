// jest.setup.js — Jest test setup / native modül mock'ları

// expo-gl mock
jest.mock('expo-gl', () => ({
  GLView: 'GLView',
}));

// expo-three mock
jest.mock('expo-three', () => ({
  Renderer: jest.fn(),
  TextureLoader: jest.fn(),
}));

// three mock (temel)
jest.mock('three', () => {
  const actual = jest.requireActual('three');
  return {
    ...actual,
    WebGLRenderer: jest.fn().mockImplementation(() => ({
      setSize: jest.fn(),
      setClearColor: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
      domElement: { getContext: jest.fn() },
    })),
  };
});

// expo-camera mock
jest.mock('expo-camera', () => ({
  CameraView: 'CameraView',
  useCameraPermissions: jest.fn(() => [{ granted: false }, jest.fn()]),
}));

// expo-av mock
jest.mock('expo-av', () => ({
  Audio: {
    Recording: {
      createAsync: jest.fn().mockResolvedValue({
        recording: {
          stopAndUnloadAsync: jest.fn(),
          getURI: jest.fn(() => 'file:///test.m4a'),
        },
      }),
    },
    Sound: {
      createAsync: jest.fn().mockResolvedValue({
        sound: {
          playAsync: jest.fn(),
          setOnPlaybackStatusUpdate: jest.fn(),
          unloadAsync: jest.fn(),
        },
      }),
    },
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    setAudioModeAsync: jest.fn(),
    RecordingOptionsPresets: { HIGH_QUALITY: {} },
  },
}));

// expo-file-system mock (SDK 55 new API)
jest.mock('expo-file-system', () => ({
  Paths: {
    cache: { uri: 'file:///cache/' },
    document: { uri: 'file:///document/' },
  },
  File: jest.fn().mockImplementation((...args) => ({
    uri: `file:///cache/mock_file_${Date.now()}.mp3`,
    write: jest.fn(),
    text: jest.fn().mockResolvedValue(''),
    base64: jest.fn().mockResolvedValue(''),
  })),
  Directory: jest.fn(),
}));

// expo-constants mock
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {
        EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
        EXPO_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
      },
    },
  },
}));

// expo-router mock
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  useSegments: jest.fn(() => []),
  useLocalSearchParams: jest.fn(() => ({})),
  Slot: 'Slot',
  Redirect: 'Redirect',
}));

// expo-notifications mock
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));
