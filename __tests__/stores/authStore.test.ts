// __tests__/stores/authStore.test.ts — Auth store birim testleri
import { useAuthStore } from '../../stores/authStore';

// Supabase mock
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
      signInWithPassword: jest.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
        error: null,
      }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
      }),
    },
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'test-user-id',
              email: 'test@test.com',
              full_name: 'Test User',
              sub_plan: 'free',
              created_at: '2026-01-01',
              updated_at: '2026-01-01',
            },
          }),
        }),
        order: jest.fn().mockReturnValue({
          ascending: true,
        }),
      }),
    }),
  },
}));

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      parent: null,
      children: [],
      activeChild: null,
      loading: false,
    });
  });

  it('başlangıç durumu doğru olmalı', () => {
    const state = useAuthStore.getState();
    expect(state.parent).toBeNull();
    expect(state.children).toEqual([]);
    expect(state.activeChild).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('setActiveChild aktif çocuğu ayarlamalı', () => {
    const child = {
      id: 'child-1',
      parentId: 'test-user-id',
      name: 'Ali',
      age: 7,
      grade: 1 as const,
      totalStars: 5,
      avatarIdx: 0,
      selectedCharacterId: 'ates',
      createdAt: '2026-01-01',
    };

    useAuthStore.getState().setActiveChild(child);
    expect(useAuthStore.getState().activeChild).toEqual(child);
  });

  it('signOut durumu temizlemeli', async () => {
    useAuthStore.setState({
      parent: {
        id: 'test-user-id',
        email: 'test@test.com',
        fullName: 'Test',
        subPlan: 'free',
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      children: [
        {
          id: 'child-1',
          parentId: 'test-user-id',
          name: 'Ali',
          age: 7,
          grade: 1,
          totalStars: 5,
          avatarIdx: 0,
          selectedCharacterId: 'ates',
          createdAt: '2026-01-01',
        },
      ],
    });

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().parent).toBeNull();
    expect(useAuthStore.getState().children).toEqual([]);
    expect(useAuthStore.getState().activeChild).toBeNull();
  });
});
