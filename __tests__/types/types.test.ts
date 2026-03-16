// __tests__/types/types.test.ts — Tip sabitleri testleri
import { PLAN_LIMITS } from '../../types';

describe('PLAN_LIMITS', () => {
  it('free planı sınırlı olmalı', () => {
    expect(PLAN_LIMITS.free.modules).toBe(3);
    expect(PLAN_LIMITS.free.children).toBe(1);
    expect(PLAN_LIMITS.free.dailyMinutes).toBe(10);
  });

  it('family planı sınırsız modül ve süre sağlamalı', () => {
    expect(PLAN_LIMITS.family.modules).toBe(Infinity);
    expect(PLAN_LIMITS.family.children).toBe(2);
    expect(PLAN_LIMITS.family.dailyMinutes).toBe(Infinity);
  });

  it('plus planı en yüksek limit sağlamalı', () => {
    expect(PLAN_LIMITS.plus.modules).toBe(Infinity);
    expect(PLAN_LIMITS.plus.children).toBe(5);
    expect(PLAN_LIMITS.plus.dailyMinutes).toBe(Infinity);
  });

  it('tüm plan türleri tanımlı olmalı', () => {
    expect(PLAN_LIMITS).toHaveProperty('free');
    expect(PLAN_LIMITS).toHaveProperty('family');
    expect(PLAN_LIMITS).toHaveProperty('plus');
  });
});
