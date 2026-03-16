// __tests__/services/whisper.test.ts — Whisper servis testleri
import { speechToText } from '../../services/whisper';

const mockFetch = jest.fn();
global.fetch = mockFetch;

jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
  SUPABASE_URL: 'https://test.supabase.co',
}));

describe('speechToText', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('başarılı yanıt dönmeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'üç' }),
    });

    const result = await speechToText('file:///test/audio.m4a');

    expect(result).toBe('üç');
  });

  it('doğru URL e istek göndermeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ text: 'beş' }),
    });

    await speechToText('file:///test/audio.m4a');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/ai-proxy/whisper',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('sunucu hatası durumunda hata fırlatmalı', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(speechToText('file:///test/audio.m4a')).rejects.toThrow(
      'Whisper proxy hatası',
    );
  });
});
