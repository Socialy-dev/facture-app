import type { Profile, InvoiceFormData } from "../../types";

interface InvoicePreviewProps {
  profile: Profile;
  form: InvoiceFormData;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + " €";
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const MIN_TABLE_ROWS = 10;

export default function InvoicePreview({ profile, form }: InvoicePreviewProps) {
  const totalHt = form.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price_ht,
    0
  );

  const filledItems = form.items.filter((item) => item.designation.trim());
  const emptyRowsCount = Math.max(0, MIN_TABLE_ROWS - filledItems.length);

  return (
    <div className="invoice-paper rounded-lg p-8 text-[11px] leading-[1.4] text-gray-900 font-sans w-full max-w-[595px] mx-auto">
      {/* Logo */}
      {profile.logo_base64 && (
        <div className="flex justify-center mb-4">
          <img
            src={profile.logo_base64}
            alt="Logo"
            className="max-h-14 object-contain"
          />
        </div>
      )}

      {/* Header - Invoice number */}
      <div className="bg-gray-200 text-center py-2.5 mb-5 border border-gray-400">
        <h1 className="text-xl font-bold tracking-[0.3em] text-gray-900 uppercase">
          F A C T U R E N°{form.invoice_number}
        </h1>
      </div>

      {/* Emitter + Client */}
      <div className="flex gap-4 mb-5">
        <div className="flex-1 border border-gray-300 p-3 text-[10.5px]">
          <p className="font-bold text-xs">{profile.owner_name || "—"}</p>
          <p className="mt-1.5">{profile.address}</p>
          <p>
            {profile.postal_code} {profile.city}
          </p>
          {profile.phone && (
            <p className="mt-1">
              <span className="font-medium">&#9742;</span> {profile.phone}
            </p>
          )}
          {profile.rcs && <p>{profile.rcs}</p>}
          {profile.siret && <p>SIRET: {profile.siret}</p>}
        </div>
        <div className="flex-1 flex items-center justify-center text-center p-3">
          <div>
            <p className="font-bold text-sm">{form.client_name || "—"}</p>
            <p>{form.client_address}</p>
            <p>
              {form.client_postal_code} {form.client_city}
            </p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="border border-gray-300 p-3 mb-5 text-[10.5px]">
        <p>
          <span className="font-bold">Date de facture :</span>{" "}
          {formatDate(form.invoice_date)}
        </p>
        <p>
          <span className="font-bold">Date de livraison :</span>{" "}
          {formatDate(form.delivery_date)}
        </p>
        <p>
          <span className="font-bold">Échéance de paiement :</span>{" "}
          {formatDate(form.payment_due_date)}
        </p>
        <p>
          <span className="font-bold">Condition d'escompte :</span>{" "}
          {form.discount_conditions}
        </p>
      </div>

      {/* Items table */}
      <table className="w-full border-collapse mb-5 text-[10.5px]">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-2 py-1.5 text-left font-bold w-[60px]">
              Quantité
            </th>
            <th className="border border-gray-400 px-2 py-1.5 text-center font-bold">
              Désignation
            </th>
            <th className="border border-gray-400 px-2 py-1.5 text-right font-bold w-[100px]">
              Prix unitaire HT
            </th>
            <th className="border border-gray-400 px-2 py-1.5 text-right font-bold w-[100px]">
              Prix total HT
            </th>
          </tr>
        </thead>
        <tbody>
          {filledItems.map((item, i) => (
            <tr key={i}>
              <td className="border border-gray-300 px-2 py-1 text-center">
                {item.quantity}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-center uppercase">
                {item.designation}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {formatCurrency(item.unit_price_ht)}
              </td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {formatCurrency(item.quantity * item.unit_price_ht)}
              </td>
            </tr>
          ))}
          {Array.from({ length: emptyRowsCount }).map((_, i) => (
            <tr key={`empty-${i}`}>
              <td className="border border-gray-300 px-2 py-1">&nbsp;</td>
              <td className="border border-gray-300 px-2 py-1">&nbsp;</td>
              <td className="border border-gray-300 px-2 py-1">&nbsp;</td>
              <td className="border border-gray-300 px-2 py-1 text-right">
                {i === 0 && filledItems.length > 0
                  ? formatCurrency(0)
                  : "\u00A0"}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="font-bold">
            <td className="border border-gray-400 px-2 py-1.5" colSpan={2} />
            <td className="border border-gray-400 px-2 py-1.5 text-right">
              Total HT
            </td>
            <td className="border border-gray-400 px-2 py-1.5 text-right">
              {formatCurrency(totalHt)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* IBAN */}
      {profile.iban && (
        <p className="text-center font-bold text-xs mb-5">
          IBAN /{profile.iban}
        </p>
      )}

      {/* Signature */}
      {profile.signature_base64 && (
        <div className="flex justify-end mb-4">
          <img
            src={profile.signature_base64}
            alt="Signature"
            className="max-h-16 object-contain"
          />
        </div>
      )}

      {/* Legal mentions */}
      {profile.legal_mentions && (
        <div className="text-[9px] text-gray-600 leading-[1.4] whitespace-pre-line">
          {profile.legal_mentions}
        </div>
      )}
    </div>
  );
}
