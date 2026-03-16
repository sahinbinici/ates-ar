// __tests__/services/claude.test.ts — Claude servis testleri
import { askAtes, askCharacter } from '../../services/claude';
import { getCharacterById } from '../../constants/characters';

// Supabase mock
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

describe('askAtes', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('başarılı yanıt dönmeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ correct: true, response: 'Aferin!' }),
    });

    const result = await askAtes([], 'Ali', 1);

    expect(result.correct).toBe(true);
    expect(result.response).toBe('Aferin!');
  });

  it('doğru URL e istek göndermeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ correct: false, response: 'Tekrar dene' }),
    });

    await askAtes(
      [{ role: 'user', content: '4' }],
      'Elif',
      2,
    );

    expect(mockFetch).toHaveBeenCalledWith(
      'https://test.supabase.co/functions/v1/ai-proxy/claude',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });

  it('body doğru parametreleri içermeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ correct: true, response: 'ok' }),
    });

    await askAtes(
      [{ role: 'user', content: '3' }],
      'Mehmet',
      3,
    );

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.childName).toBe('Mehmet');
    expect(callBody.grade).toBe(3);
    expect(callBody.messages).toHaveLength(1);
  });

  it('sunucu hatası durumunda demo moda geçmeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error'),
    });

    const result = await askAtes([], 'Ali', 1);
    expect(result.response).toBeTruthy();
  });
});

describe('askCharacter', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('karakter systemPrompt gönderilmeli', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ correct: true, response: 'Merhaba!' }),
    });

    const bulut = getCharacterById('bulut')!;
    await askCharacter(bulut, [], 'Zeynep', 2, 'science');

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.systemPrompt).toContain('Bulut');
    expect(callBody.systemPrompt).toContain('Zeynep');
    expect(callBody.systemPrompt).toContain('2. sınıf');
    expect(callBody.childName).toBe('Zeynep');
  });

  it('farklı karakter farklı systemPrompt üretmeli', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ correct: true, response: 'ok' }),
    });

    const ates = getCharacterById('ates')!;
    const gunes = getCharacterById('gunes')!;

    await askCharacter(ates, [], 'Ali', 1, 'math');
    await askCharacter(gunes, [], 'Ali', 1, 'math');

    const body1 = JSON.parse(mockFetch.mock.calls[0][1].body);
    const body2 = JSON.parse(mockFetch.mock.calls[1][1].body);
    expect(body1.systemPrompt).not.toBe(body2.systemPrompt);
    expect(body1.systemPrompt).toContain('Ateş');
    expect(body2.systemPrompt).toContain('Güneş');
  });
});
