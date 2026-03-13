import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useAuthStore } from "./auth";
import type { Client, Invoice, InvoiceFormData } from "../types";

interface DataState {
  clients: Client[];
  invoices: Invoice[];
  loading: boolean;
  fetchClients: () => Promise<void>;
  createClient: (
    client: Omit<Client, "id" | "user_id" | "created_at">
  ) => Promise<Client>;
  updateClient: (id: string, data: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: InvoiceFormData) => Promise<Invoice>;
  updateInvoice: (id: string, data: InvoiceFormData) => Promise<Invoice>;
  fetchInvoiceWithItems: (id: string) => Promise<Invoice | null>;
  updateInvoiceStatus: (
    id: string,
    status: "draft" | "sent" | "paid"
  ) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  invoices: [],
  loading: false,

  fetchClients: async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("name");

    if (error) throw error;
    set({ clients: data ?? [] });
  },

  createClient: async (clientData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    const { data, error } = await supabase
      .from("clients")
      .insert({ ...clientData, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    set({ clients: [...get().clients, data] });
    return data;
  },

  updateClient: async (id, updates) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    const { error } = await supabase
      .from("clients")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    set({
      clients: get().clients.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    });
  },

  deleteClient: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    set({ clients: get().clients.filter((c) => c.id !== id) });
  },

  fetchInvoices: async () => {
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, client:clients(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ invoices: data ?? [], loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  createInvoice: async (formData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    const totalHt = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_ht,
      0
    );

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        user_id: user.id,
        client_id: formData.client_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        delivery_date: formData.delivery_date || null,
        payment_due_date: formData.payment_due_date || null,
        discount_conditions: formData.discount_conditions || null,
        total_ht: totalHt,
        status: "draft",
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    const items = formData.items
      .filter((item) => item.designation.trim() !== "")
      .map((item, index) => ({
        invoice_id: invoice.id,
        quantity: item.quantity,
        designation: item.designation,
        unit_price_ht: item.unit_price_ht,
        total_price_ht: item.quantity * item.unit_price_ht,
        sort_order: index,
      }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;
    }

    // Incrémenter le numéro de facture
    const { profile, updateProfile } = useAuthStore.getState();
    await updateProfile({
      next_invoice_number: profile.next_invoice_number + 1,
    });

    await get().fetchInvoices();
    return invoice;
  },

  updateInvoice: async (id, formData) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    const totalHt = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_ht,
      0
    );

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .update({
        client_id: formData.client_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        delivery_date: formData.delivery_date || null,
        payment_due_date: formData.payment_due_date || null,
        discount_conditions: formData.discount_conditions || null,
        total_ht: totalHt,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // Supprimer les anciens items et insérer les nouveaux
    const { error: deleteError } = await supabase
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteError) throw deleteError;

    const items = formData.items
      .filter((item) => item.designation.trim() !== "")
      .map((item, index) => ({
        invoice_id: id,
        quantity: item.quantity,
        designation: item.designation,
        unit_price_ht: item.unit_price_ht,
        total_price_ht: item.quantity * item.unit_price_ht,
        sort_order: index,
      }));

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(items);

      if (itemsError) throw itemsError;
    }

    await get().fetchInvoices();
    return invoice;
  },

  fetchInvoiceWithItems: async (id) => {
    const { data, error } = await supabase
      .from("invoices")
      .select("*, client:clients(*), items:invoice_items(*)")
      .eq("id", id)
      .single();

    if (error) return null;

    if (data.items) {
      data.items.sort(
        (a: { sort_order: number }, b: { sort_order: number }) =>
          a.sort_order - b.sort_order
      );
    }

    return data;
  },

  updateInvoiceStatus: async (id, status) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    set({
      invoices: get().invoices.map((inv) =>
        inv.id === id ? { ...inv, status } : inv
      ),
    });
  },

  deleteInvoice: async (id) => {
    const user = useAuthStore.getState().user;
    if (!user) throw new Error("Non authentifié");

    // Items supprimés automatiquement via ON DELETE CASCADE
    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;
    set({ invoices: get().invoices.filter((inv) => inv.id !== id) });
  },
}));
