import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  Download,
  Save,
  UserPlus,
  Calendar,
  FileText,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useAuthStore } from "../store/auth";
import { useDataStore } from "../store/data";
import { loadFromStorage, saveToStorage, removeFromStorage } from "../lib/storage";
import type { InvoiceFormData, InvoiceItemFormData } from "../types";
import InvoicePreview from "../components/invoice/InvoicePreview";
import InvoicePDF from "../components/invoice/InvoicePDF";

const DRAFT_KEY = "invoice_draft";

function createEmptyItem(): InvoiceItemFormData {
  return {
    id: crypto.randomUUID(),
    quantity: 1,
    designation: "",
    unit_price_ht: 0,
  };
}

export default function NewInvoice() {
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);

  const { profile } = useAuthStore();
  const {
    clients,
    fetchClients,
    createClient,
    createInvoice,
    updateInvoice,
    fetchInvoiceWithItems,
  } = useDataStore();
  const navigate = useNavigate();

  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(!isEditMode);
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientForm, setNewClientForm] = useState({
    name: "",
    address: "",
    postal_code: "",
    city: "",
  });

  const [form, setForm] = useState<InvoiceFormData>(() => {
    // En mode création, charger le brouillon s'il existe
    if (!isEditMode) {
      const draft = loadFromStorage<InvoiceFormData | null>(DRAFT_KEY, null);
      if (draft) return draft;
    }
    return {
      client_id: "",
      client_name: "",
      client_address: "",
      client_postal_code: "",
      client_city: "",
      invoice_number: profile.next_invoice_number,
      invoice_date: new Date().toISOString().split("T")[0],
      delivery_date: "",
      payment_due_date: "",
      discount_conditions: "",
      items: [createEmptyItem()],
    };
  });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Sauvegarder le brouillon automatiquement en mode création
  useEffect(() => {
    if (!isEditMode) {
      saveToStorage(DRAFT_KEY, form);
    }
  }, [form, isEditMode]);

  // Charger la facture existante en mode édition
  useEffect(() => {
    if (editId) {
      const invoice = fetchInvoiceWithItems(editId);
      if (invoice) {
        setForm({
          client_id: invoice.client_id,
          client_name: invoice.client?.name ?? "",
          client_address: invoice.client?.address ?? "",
          client_postal_code: invoice.client?.postal_code ?? "",
          client_city: invoice.client?.city ?? "",
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          delivery_date: invoice.delivery_date ?? "",
          payment_due_date: invoice.payment_due_date ?? "",
          discount_conditions: invoice.discount_conditions ?? "",
          items:
            invoice.items && invoice.items.length > 0
              ? invoice.items.map((item) => ({
                  id: item.id,
                  quantity: item.quantity,
                  designation: item.designation,
                  unit_price_ht: item.unit_price_ht,
                }))
              : [createEmptyItem()],
        });
      }
      setLoaded(true);
    }
  }, [editId, fetchInvoiceWithItems]);

  // Mettre à jour le numéro uniquement en mode création
  useEffect(() => {
    if (!isEditMode) {
      setForm((prev) => ({
        ...prev,
        invoice_number: profile.next_invoice_number,
      }));
    }
  }, [profile.next_invoice_number, isEditMode]);

  const handleClientSelect = useCallback(
    (clientId: string) => {
      const client = clients.find((c) => c.id === clientId);
      if (client) {
        setForm((prev) => ({
          ...prev,
          client_id: client.id,
          client_name: client.name,
          client_address: client.address,
          client_postal_code: client.postal_code,
          client_city: client.city,
        }));
      }
    },
    [clients]
  );

  const handleCreateQuickClient = () => {
    if (!newClientForm.name.trim()) return;
    const client = createClient({
      name: newClientForm.name,
      address: newClientForm.address,
      postal_code: newClientForm.postal_code,
      city: newClientForm.city,
      email: null,
      phone: null,
    });
    setForm((prev) => ({
      ...prev,
      client_id: client.id,
      client_name: client.name,
      client_address: client.address,
      client_postal_code: client.postal_code,
      client_city: client.city,
    }));
    setNewClientForm({ name: "", address: "", postal_code: "", city: "" });
    setShowNewClient(false);
  };

  const updateItem = (
    index: number,
    field: keyof InvoiceItemFormData,
    value: string | number
  ) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, createEmptyItem()],
    }));
  };

  const removeItem = (index: number) => {
    if (form.items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const totalHt = form.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_ht,
    0
  );

  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvoicePDF profile={profile} form={form} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${form.invoice_number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur génération PDF:", err);
      alert("Erreur lors de la génération du PDF");
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveAndDownload = async () => {
    if (!form.client_id) {
      alert("Veuillez sélectionner un client");
      return;
    }
    setSaving(true);
    try {
      if (isEditMode && editId) {
        updateInvoice(editId, form);
      } else {
        createInvoice(form);
        removeFromStorage(DRAFT_KEY);
      }
      await handleDownloadPDF();
      navigate("/");
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {isEditMode && (
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode
                ? `Modifier facture N°${form.invoice_number}`
                : "Nouvelle facture"}
            </h1>
            <p className="text-gray-500 mt-1">
              {isEditMode
                ? "Modifiez les champs puis sauvegardez"
                : "Remplissez les informations et téléchargez le PDF"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            disabled={generating}
            className="flex items-center gap-2 px-5 py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-all shadow-sm"
          >
            {generating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Aperçu PDF
          </button>
          <button
            onClick={handleSaveAndDownload}
            disabled={saving || !form.client_id}
            className="flex items-center gap-2 px-5 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary-500/25"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEditMode ? "Sauvegarder & PDF" : "Créer & PDF"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Client */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-primary-600" />
                </div>
                <h2 className="font-semibold text-gray-900">Client</h2>
              </div>
              <button
                onClick={() => setShowNewClient(!showNewClient)}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Nouveau
              </button>
            </div>

            {showNewClient ? (
              <div className="space-y-3 bg-primary-50/50 rounded-xl p-4 mb-4">
                <input
                  value={newClientForm.name}
                  onChange={(e) =>
                    setNewClientForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Nom / Raison sociale"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  value={newClientForm.address}
                  onChange={(e) =>
                    setNewClientForm((p) => ({ ...p, address: e.target.value }))
                  }
                  placeholder="Adresse"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={newClientForm.postal_code}
                    onChange={(e) =>
                      setNewClientForm((p) => ({
                        ...p,
                        postal_code: e.target.value,
                      }))
                    }
                    placeholder="Code postal"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    value={newClientForm.city}
                    onChange={(e) =>
                      setNewClientForm((p) => ({ ...p, city: e.target.value }))
                    }
                    placeholder="Ville"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowNewClient(false)}
                    className="flex-1 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateQuickClient}
                    disabled={!newClientForm.name.trim()}
                    className="flex-1 py-2 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-300"
                  >
                    Créer
                  </button>
                </div>
              </div>
            ) : null}

            <select
              value={form.client_id}
              onChange={(e) => handleClientSelect(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Sélectionner un client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.city}
                </option>
              ))}
            </select>

            {form.client_id && (
              <div className="mt-3 p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
                <p className="font-medium text-gray-900">{form.client_name}</p>
                <p>
                  {form.client_address}, {form.client_postal_code}{" "}
                  {form.client_city}
                </p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <Calendar className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Informations facture
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  N° Facture
                </label>
                <input
                  type="number"
                  value={form.invoice_number}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      invoice_number: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date de facture
                </label>
                <input
                  type="date"
                  value={form.invoice_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, invoice_date: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Date de livraison
                </label>
                <input
                  type="date"
                  value={form.delivery_date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, delivery_date: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Échéance de paiement
                </label>
                <input
                  type="date"
                  value={form.payment_due_date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      payment_due_date: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Condition d'escompte
              </label>
              <input
                type="text"
                value={form.discount_conditions}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    discount_conditions: e.target.value,
                  }))
                }
                placeholder="Ex: Pas d'escompte pour paiement anticipé"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-emerald-600" />
                </div>
                <h2 className="font-semibold text-gray-900">
                  Lignes de facture
                </h2>
              </div>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            <div className="space-y-3">
              {/* Column headers */}
              <div className="grid grid-cols-[60px_1fr_100px_100px_36px] gap-2 text-xs font-medium text-gray-500 px-1">
                <span>Qté</span>
                <span>Désignation</span>
                <span>Prix unit. HT</span>
                <span>Total HT</span>
                <span />
              </div>

              {form.items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[60px_1fr_100px_100px_36px] gap-2 items-center"
                >
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    value={item.designation}
                    onChange={(e) =>
                      updateItem(index, "designation", e.target.value)
                    }
                    placeholder="Description..."
                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={item.unit_price_ht || ""}
                    onChange={(e) =>
                      updateItem(
                        index,
                        "unit_price_ht",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    placeholder="0,00"
                    className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="px-2 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-right font-medium text-gray-700">
                    {new Intl.NumberFormat("fr-FR", {
                      minimumFractionDigits: 2,
                    }).format(item.quantity * item.unit_price_ht)}{" "}
                    €
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    disabled={form.items.length <= 1}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <div className="bg-primary-50 px-6 py-3 rounded-xl">
                <span className="text-sm text-primary-600 font-medium">
                  Total HT :{" "}
                </span>
                <span className="text-lg font-bold text-primary-700">
                  {new Intl.NumberFormat("fr-FR", {
                    minimumFractionDigits: 2,
                  }).format(totalHt)}{" "}
                  €
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="sticky top-8">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-gray-500">
                Aperçu en direct
              </span>
            </div>
            <div className="bg-gray-50 rounded-xl p-2 overflow-auto max-h-[calc(100vh-180px)]">
              <div className="transform scale-[0.85] origin-top">
                <InvoicePreview profile={profile} form={form} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
