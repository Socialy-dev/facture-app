import { create } from "zustand";
import { loadFromStorage, saveToStorage } from "../lib/storage";
import { useAuthStore } from "./auth";
import type { Client, Invoice, InvoiceItem, InvoiceFormData } from "../types";

interface DataState {
  clients: Client[];
  invoices: Invoice[];
  loading: boolean;
  fetchClients: () => void;
  createClient: (
    client: Omit<Client, "id" | "user_id" | "created_at">
  ) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  fetchInvoices: () => void;
  createInvoice: (data: InvoiceFormData) => Invoice;
  fetchInvoiceWithItems: (id: string) => Invoice | null;
  updateInvoice: (id: string, data: InvoiceFormData) => Invoice;
  updateInvoiceStatus: (
    id: string,
    status: "draft" | "sent" | "paid"
  ) => void;
  deleteInvoice: (id: string) => void;
}

function generateId(): string {
  return crypto.randomUUID();
}

export const useDataStore = create<DataState>((set, get) => ({
  clients: [],
  invoices: [],
  loading: false,

  fetchClients: () => {
    const clients = loadFromStorage<Client[]>("clients", []);
    set({ clients });
  },

  createClient: (clientData) => {
    const client: Client = {
      ...clientData,
      id: generateId(),
      user_id: "local",
      created_at: new Date().toISOString(),
    };
    const updated = [...get().clients, client];
    saveToStorage("clients", updated);
    set({ clients: updated });
    return client;
  },

  updateClient: (id, updates) => {
    const updated = get().clients.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    saveToStorage("clients", updated);
    set({ clients: updated });
  },

  deleteClient: (id) => {
    const updated = get().clients.filter((c) => c.id !== id);
    saveToStorage("clients", updated);
    set({ clients: updated });
  },

  fetchInvoices: () => {
    const invoices = loadFromStorage<Invoice[]>("invoices", []);
    const clients = loadFromStorage<Client[]>("clients", []);
    const enriched = invoices.map((inv) => ({
      ...inv,
      client: clients.find((c) => c.id === inv.client_id),
    }));
    set({ invoices: enriched, loading: false });
  },

  createInvoice: (formData) => {
    const totalHt = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_ht,
      0
    );

    const invoiceId = generateId();

    const items: InvoiceItem[] = formData.items
      .filter((item) => item.designation.trim() !== "")
      .map((item, index) => ({
        id: generateId(),
        invoice_id: invoiceId,
        quantity: item.quantity,
        designation: item.designation,
        unit_price_ht: item.unit_price_ht,
        total_price_ht: item.quantity * item.unit_price_ht,
        sort_order: index,
      }));

    const invoice: Invoice = {
      id: invoiceId,
      user_id: "local",
      client_id: formData.client_id,
      invoice_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
      delivery_date: formData.delivery_date || null,
      payment_due_date: formData.payment_due_date || null,
      discount_conditions: formData.discount_conditions || null,
      total_ht: totalHt,
      status: "draft",
      created_at: new Date().toISOString(),
      items,
    };

    const existing = loadFromStorage<Invoice[]>("invoices", []);
    saveToStorage("invoices", [...existing, invoice]);

    // Incrémenter le numéro de facture
    const { profile, updateProfile } = useAuthStore.getState();
    updateProfile({
      next_invoice_number: profile.next_invoice_number + 1,
    });

    get().fetchInvoices();
    return invoice;
  },

  fetchInvoiceWithItems: (id) => {
    const invoices = loadFromStorage<Invoice[]>("invoices", []);
    const clients = loadFromStorage<Client[]>("clients", []);
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return null;
    return {
      ...invoice,
      client: clients.find((c) => c.id === invoice.client_id),
    };
  },

  updateInvoice: (id, formData) => {
    const all = loadFromStorage<Invoice[]>("invoices", []);
    const existing = all.find((inv) => inv.id === id);
    if (!existing) throw new Error("Facture introuvable");

    const totalHt = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price_ht,
      0
    );

    const items: InvoiceItem[] = formData.items
      .filter((item) => item.designation.trim() !== "")
      .map((item, index) => ({
        id: generateId(),
        invoice_id: id,
        quantity: item.quantity,
        designation: item.designation,
        unit_price_ht: item.unit_price_ht,
        total_price_ht: item.quantity * item.unit_price_ht,
        sort_order: index,
      }));

    const updated: Invoice = {
      ...existing,
      client_id: formData.client_id,
      invoice_number: formData.invoice_number,
      invoice_date: formData.invoice_date,
      delivery_date: formData.delivery_date || null,
      payment_due_date: formData.payment_due_date || null,
      discount_conditions: formData.discount_conditions || null,
      total_ht: totalHt,
      items,
    };

    const updatedAll = all.map((inv) => (inv.id === id ? updated : inv));
    saveToStorage("invoices", updatedAll);
    get().fetchInvoices();
    return updated;
  },

  updateInvoiceStatus: (id, status) => {
    const all = loadFromStorage<Invoice[]>("invoices", []);
    const updated = all.map((inv) =>
      inv.id === id ? { ...inv, status } : inv
    );
    saveToStorage("invoices", updated);
    set({
      invoices: get().invoices.map((inv) =>
        inv.id === id ? { ...inv, status } : inv
      ),
    });
  },

  deleteInvoice: (id) => {
    const all = loadFromStorage<Invoice[]>("invoices", []);
    const updated = all.filter((inv) => inv.id !== id);
    saveToStorage("invoices", updated);
    set({ invoices: get().invoices.filter((inv) => inv.id !== id) });
  },
}));
