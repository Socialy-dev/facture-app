import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  FileText,
  Pencil,
} from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { useDataStore } from "../store/data";
import { useAuthStore } from "../store/auth";
import type { Invoice, InvoiceFormData } from "../types";
import InvoicePreview from "../components/invoice/InvoicePreview";
import InvoicePDF from "../components/invoice/InvoicePDF";

export default function InvoiceView() {
  const { id } = useParams<{ id: string }>();
  const { fetchInvoiceWithItems, updateInvoiceStatus } = useDataStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (id) {
      const data = fetchInvoiceWithItems(id);
      setInvoice(data);
    }
  }, [id, fetchInvoiceWithItems]);

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <FileText className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 mt-3">Facture introuvable</p>
      </div>
    );
  }

  const formData: InvoiceFormData = {
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
    items: (invoice.items ?? []).map((item) => ({
      id: item.id,
      quantity: item.quantity,
      designation: item.designation,
      unit_price_ht: item.unit_price_ht,
    })),
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvoicePDF profile={profile} form={formData} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `facture-${invoice.invoice_number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  const handleMarkPaid = () => {
    updateInvoiceStatus(invoice.id, "paid");
    setInvoice({ ...invoice, status: "paid" });
  };

  const handleMarkSent = () => {
    updateInvoiceStatus(invoice.id, "sent");
    setInvoice({ ...invoice, status: "sent" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-white/80 rounded-xl transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Facture N°{invoice.invoice_number}
            </h1>
            <p className="text-gray-500 mt-1">
              {invoice.client?.name ?? "Client inconnu"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {invoice.status !== "sent" && (
            <button
              onClick={handleMarkSent}
              className="relative group flex items-center gap-2 px-5 py-3 bg-amber-500 text-white font-medium rounded-xl transition-all duration-300 hover:bg-amber-600 shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Clock className="w-4 h-4 relative z-10" />
              <span className="relative z-10 text-sm">Envoyée</span>
            </button>
          )}
          {invoice.status !== "paid" && (
            <button
              onClick={handleMarkPaid}
              className="relative group flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white font-medium rounded-xl transition-all duration-300 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <CheckCircle2 className="w-4 h-4 relative z-10" />
              <span className="relative z-10 text-sm">Payée</span>
            </button>
          )}
          <button
            onClick={() => navigate(`/modifier-facture/${invoice.id}`)}
            className="relative group flex items-center gap-2 px-5 py-3 bg-violet-500 text-white font-medium rounded-xl transition-all duration-300 hover:bg-violet-600 shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:-translate-y-0.5"
          >
            <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Pencil className="w-4 h-4 relative z-10" />
            <span className="relative z-10 text-sm">Modifier</span>
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="relative group flex items-center gap-2 px-5 py-3 bg-primary-600 text-white font-medium rounded-xl transition-all duration-300 hover:bg-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
          >
            <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            {generating ? (
              <Loader2 className="w-4 h-4 animate-spin relative z-10" />
            ) : (
              <Download className="w-4 h-4 relative z-10" />
            )}
            <span className="relative z-10 text-sm">Télécharger PDF</span>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-gray-50 rounded-2xl p-6">
          <InvoicePreview profile={profile} form={formData} />
        </div>
      </div>
    </div>
  );
}
