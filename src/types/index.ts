export interface Profile {
  id: string;
  business_name: string;
  owner_name: string;
  address: string;
  postal_code: string;
  city: string;
  phone: string;
  email: string;
  rcs: string;
  siret: string;
  iban: string;
  logo_base64: string | null;
  signature_base64: string | null;
  legal_mentions: string;
  next_invoice_number: number;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  address: string;
  postal_code: string;
  city: string;
  email: string | null;
  phone: string | null;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: number;
  invoice_date: string;
  delivery_date: string | null;
  payment_due_date: string | null;
  discount_conditions: string | null;
  total_ht: number;
  status: "draft" | "sent" | "paid";
  created_at: string;
  client?: Client;
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  quantity: number;
  designation: string;
  unit_price_ht: number;
  total_price_ht: number;
  sort_order: number;
}

export interface InvoiceFormData {
  client_id: string;
  client_name: string;
  client_address: string;
  client_postal_code: string;
  client_city: string;
  invoice_number: number;
  invoice_date: string;
  delivery_date: string;
  payment_due_date: string;
  discount_conditions: string;
  items: InvoiceItemFormData[];
}

export interface InvoiceItemFormData {
  id: string;
  quantity: number;
  designation: string;
  unit_price_ht: number;
}

export const DEFAULT_LEGAL_MENTIONS =
  "En cas de retard de paiement, les pénalités seront calculées sur la base de 3 fois le taux d'intérêt légal en vigueur France.\n\nPour les clients professionnels, conformément aux articles 441-6c Com. et D.441-5c. com. Tout retard de paiement entraîne de plein droit une obligation pour le débiteur de payer une indemnité forfaitaire de 40 euros pour frais de recouvrement.";
