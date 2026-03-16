// __tests__/hooks/useCharacter.test.ts — useCharacter hook testleri
import { CHARACTERS, getCharacterById, getExpertsForSubject, DEFAULT_CHARACTER_ID } from '../../constants/characters';

// Supabase mock
jest.mock('../../services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [{ character_id: 'ates' }, { character_id: 'bulut' }],
        }),
      }),
    }),
  },
}));

describe('Characters constants', () => {
  it('5 karakter tanımlı olmalı', () => {
    expect(CHARACTERS).toHaveLength(5);
  });

  it('her karakterin gerekli alanları olmalı', () => {
    for (const ch of CHARACTERS) {
      expect(ch.id).toBeTruthy();
      expect(ch.name).toBeTruthy();
      expect(ch.animal).toBeTruthy();
      expect(ch.personality).toBeTruthy();
      expect(typeof ch.starsRequired).toBe('number');
      expect(typeof ch.isPremium).toBe('boolean');
      expect(ch.color).toMatch(/^#/);
      expect(typeof ch.systemPrompt).toBe('function');
    }
  });

  it('systemPrompt fonksiyonu doğru string dönmeli', () => {
    const ates = getCharacterById('ates')!;
    const prompt = ates.systemPrompt('Ali', 2, 'math');
    expect(prompt).toContain('Ali');
    expect(prompt).toContain('2. sınıf');
    expect(prompt).toContain('JSON');
  });

  it('her karakter farklı systemPrompt üretmeli', () => {
    const prompts = CHARACTERS.map((c) => c.systemPrompt('Test', 1, 'math'));
    const unique = new Set(prompts);
    expect(unique.size).toBe(5);
  });

  it('default karakter ates olmalı', () => {
    expect(DEFAULT_CHARACTER_ID).toBe('ates');
    const ch = getCharacterById(DEFAULT_CHARACTER_ID);
    expect(ch).toBeDefined();
    expect(ch!.name).toBe('Ateş');
  });

  it('ates ve bulut ücretsiz, 0 yıldız gerekli', () => {
    const ates = getCharacterById('ates')!;
    const bulut = getCharacterById('bulut')!;
    expect(ates.isPremium).toBe(false);
    expect(ates.starsRequired).toBe(0);
    expect(bulut.isPremium).toBe(false);
    expect(bulut.starsRequired).toBe(0);
  });

  it('premium karakterler isPremium=true olmalı', () => {
    const deniz = getCharacterById('deniz')!;
    const gunes = getCharacterById('gunes')!;
    expect(deniz.isPremium).toBe(true);
    expect(gunes.isPremium).toBe(true);
  });

  it('yıldız gereksinimleri artan sırada olmalı', () => {
    const requirements = CHARACTERS.map((c) => c.starsRequired);
    for (let i = 1; i < requirements.length; i++) {
      expect(requirements[i]).toBeGreaterThanOrEqual(requirements[i - 1]);
    }
  });

  it('her karakterin defaultSubject ve subjectExpertise alanı olmalı', () => {
    for (const ch of CHARACTERS) {
      expect(ch.defaultSubject).toBeTruthy();
      expect(ch.subjectExpertise.length).toBeGreaterThanOrEqual(1);
      expect(ch.subjectExpertise).toContain(ch.defaultSubject);
    }
  });

  it('farklı ders ile farklı systemPrompt üretmeli', () => {
    const ates = getCharacterById('ates')!;
    const mathPrompt = ates.systemPrompt('Ali', 1, 'math');
    const turkishPrompt = ates.systemPrompt('Ali', 1, 'turkish');
    expect(mathPrompt).not.toBe(turkishPrompt);
  });

  it('olmayan karakter undefined dönmeli', () => {
    expect(getCharacterById('nonexistent')).toBeUndefined();
  });
});

describe('getExpertsForSubject', () => {
  it('math uzmanları ates ve gunes olmalı', () => {
    const experts = getExpertsForSubject('math');
    const ids = experts.map((c) => c.id);
    expect(ids).toContain('ates');
    expect(ids).toContain('gunes');
  });

  it('defaultSubject eşleşen karakter ilk sırada olmalı', () => {
    const experts = getExpertsForSubject('science');
    expect(experts[0].defaultSubject).toBe('science');
  });

  it('tüm dersler için en az 1 uzman olmalı', () => {
    const subjects = ['math', 'turkish', 'science', 'social'] as const;
    for (const s of subjects) {
      expect(getExpertsForSubject(s).length).toBeGreaterThanOrEqual(1);
    }
  });
});

describe('isUnlocked logic', () => {
  function isUnlocked(character: { starsRequired: number; isPremium: boolean }, totalStars: number, isPremiumUser: boolean): boolean {
    if (character.isPremium && !isPremiumUser) return false;
    return totalStars >= character.starsRequired;
  }

  it('ücretsiz karakter yeterli yıldızla açılmalı', () => {
    const yildiz = getCharacterById('yildiz')!;
    expect(isUnlocked(yildiz, 50, false)).toBe(true);
    expect(isUnlocked(yildiz, 49, false)).toBe(false);
  });

  it('premium karakter premium olmayan kullanıcıya kilitli', () => {
    const deniz = getCharacterById('deniz')!;
    expect(isUnlocked(deniz, 999, false)).toBe(false);
  });

  it('premium karakter premium kullanıcıya yıldızla açılmalı', () => {
    const deniz = getCharacterById('deniz')!;
    expect(isUnlocked(deniz, 100, true)).toBe(true);
    expect(isUnlocked(deniz, 99, true)).toBe(false);
  });
});
