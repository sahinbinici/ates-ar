// stores/authStore.ts — Ebeveyn/çocuk oturum yönetimi
import { create } from 'zustand';
import type { Parent, Child } from '../types';
import { supabase } from '../services/supabase';

interface AuthState {
  parent: Parent | null;
  children: Child[];
  activeChild: Child | null;
  loading: boolean;

  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  loadChildren: () => Promise<void>;
  setActiveChild: (child: Child) => void;
  addChild: (name: string, age: number, grade: 1 | 2 | 3 | 4) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  parent: null,
  children: [],
  activeChild: null,
  loading: false,

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        await supabase.from('parents').insert({
          id: data.user.id,
          email,
          full_name: fullName,
        });
      }
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await get().loadProfile();
      await get().loadChildren();
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ parent: null, children: [], activeChild: null });
  },

  loadProfile: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('parents')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      set({
        parent: {
          id: data.id,
          email: data.email,
          fullName: data.full_name,
          subPlan: data.sub_plan,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        },
      });
    }
  },

  loadChildren: async () => {
    const { data } = await supabase
      .from('children')
      .select('*')
      .order('created_at', { ascending: true });

    if (data) {
      const mapped: Child[] = data.map((c) => ({
        id: c.id,
        parentId: c.parent_id,
        name: c.name,
        age: c.age,
        grade: c.grade,
        totalStars: c.total_stars,
        avatarIdx: c.avatar_idx,
        selectedCharacterId: c.selected_character_id ?? 'ates',
        createdAt: c.created_at,
      }));
      set({ children: mapped });
      if (mapped.length > 0 && !get().activeChild) {
        set({ activeChild: mapped[0] });
      }
    }
  },

  setActiveChild: (child) => set({ activeChild: child }),

  addChild: async (name, age, grade) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Oturum bulunamadı');

    const { error } = await supabase.from('children').insert({
      parent_id: user.id,
      name,
      age,
      grade,
    });
    if (error) throw error;
    await get().loadChildren();
  },
}));
