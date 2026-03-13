import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FilePlus,
  FileText,
  Euro,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  Pencil,
  Loader2,
} from "lucide-react";
import { useDataStore } from "../store/data";
import OnboardingBanner from "../components/OnboardingBanner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const statusConfig = {
  draft: {
    label: "Brouillon",
    color: "bg-gray-100 text-gray-600",
  },
  sent: {
    label: "Envoyée",
    color: "bg-amber-100 text-amber-700",
  },
  paid: {
    label: "Payée",
    color: "bg-emerald-100 text-emerald-700",
  },
};

export default function Dashboard() {
  const { invoices, fetchInvoices, deleteInvoice, loading } = useDataStore();
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices().catch(() => {});
  }, [fetchInvoices]);

  const totalHt = invoices.reduce((sum, inv) => sum + inv.total_ht, 0);
  const unpaid = invoices.filter((inv) => inv.status !== "paid");
  const paid = invoices.filter((inv) => inv.status === "paid");

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await deleteInvoice(id);
    } finally {
      setDeleting(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);

  return (
    <div>
      {/* Onboarding */}
      <OnboardingBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Vue d'ensemble de vos factures
          </p>
        </div>
        <Link
          to="/nouvelle-facture"
          className="relative group flex items-center justify-center gap-2 px-5 sm:px-6 py-3 bg-primary-600 text-white font-medium rounded-xl transition-all duration-300 hover:bg-primary-700 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5"
        >
          <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <FilePlus className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Nouvelle facture</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">Total factures</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{invoices.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <Euro className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">CA HT</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
            {formatCurrency(totalHt)}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">En attente</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{unpaid.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm text-gray-500">Payées</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{paid.length}</p>
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Factures récentes</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune facture pour le moment</p>
            <Link
              to="/nouvelle-facture"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <FilePlus className="w-4 h-4" />
              Créer votre première facture
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                    <th className="px-6 py-3 font-medium">N°</th>
                    <th className="px-6 py-3 font-medium">Client</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Montant HT</th>
                    <th className="px-6 py-3 font-medium">Statut</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {invoice.client?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {format(new Date(invoice.invoice_date), "dd MMM yyyy", {
                          locale: fr,
                        })}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {formatCurrency(invoice.total_ht)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${statusConfig[invoice.status].color}`}
                        >
                          {statusConfig[invoice.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/facture/${invoice.id}`}
                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                            title="Voir"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/modifier-facture/${invoice.id}`}
                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-all"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deleting === invoice.id}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deleting === invoice.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-bold text-gray-900 shrink-0">
                        N°{invoice.invoice_number}
                      </span>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${statusConfig[invoice.status].color}`}
                      >
                        {statusConfig[invoice.status].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/facture/${invoice.id}`}
                        className="p-2 text-gray-400 hover:text-primary-600 rounded-lg"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/modifier-facture/${invoice.id}`}
                        className="p-2 text-gray-400 hover:text-violet-600 rounded-lg"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleting === invoice.id}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg disabled:opacity-50"
                      >
                        {deleting === invoice.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 truncate">
                      {invoice.client?.name ?? "—"}
                    </span>
                    <span className="font-medium text-gray-900 shrink-0 ml-2">
                      {formatCurrency(invoice.total_ht)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {format(new Date(invoice.invoice_date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
