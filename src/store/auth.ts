import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Profile } from "../types";
import type { User } from "@supabase/supabase-js";
import { DEFAULT_LEGAL_MENTIONS } from "../types";

const EMPTY_PROFILE: Profile = {
  id: "",
  business_name: "",
  owner_name: "",
  address: "",
  postal_code: "",
  city: "",
  phone: "",
  email: "",
  rcs: "",
  siret: "",
  iban: "",
  logo_base64: null,
  signature_base64: null,
  legal_mentions: DEFAULT_LEGAL_MENTIONS,
  next_invoice_number: 1,
  created_at: "",
  updated_at: "",
};

interface AuthState {
  user: User | null;
  profile: Profile;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: EMPTY_PROFILE,
  loading: true,
  initialized: false,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      set({ user: session.user });
      await get().fetchProfile();
    }

    set({ loading: false, initialized: true });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        set({ user: session.user });
        await get().fetchProfile();
      } else {
        set({ user: null, profile: EMPTY_PROFILE });
      }
    });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  },

  register: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  logout: async () => {
    try {
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // Ignore network errors — clear local state regardless
    }
    set({ user: null, profile: EMPTY_PROFILE });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Erreur chargement profil:", error);
      return;
    }

    if (data) {
      set({ profile: { ...EMPTY_PROFILE, ...data } });
    }
  },

  updateProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", user.id)
      .select()
      .single();

    if (error) throw error;
    set({ profile: { ...EMPTY_PROFILE, ...data } });
  },
}));
