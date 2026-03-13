import { create } from "zustand";
import { loadFromStorage, saveToStorage } from "../lib/storage";
import type { Profile } from "../types";
import { DEFAULT_LEGAL_MENTIONS } from "../types";

const DEFAULT_PROFILE: Profile = {
  id: "local",
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
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

interface AuthState {
  profile: Profile;
  loading: boolean;
  initialize: () => void;
  updateProfile: (data: Partial<Profile>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: DEFAULT_PROFILE,
  loading: false,

  initialize: () => {
    const saved = loadFromStorage<Profile>("profile", DEFAULT_PROFILE);
    set({ profile: saved, loading: false });
  },

  updateProfile: (updates: Partial<Profile>) => {
    set((state) => {
      const updated = {
        ...state.profile,
        ...updates,
        updated_at: new Date().toISOString(),
      };
      saveToStorage("profile", updated);
      return { profile: updated };
    });
  },
}));
