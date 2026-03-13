import { useEffect, useState, useRef } from "react";
import {
  Building2,
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  FileText,
  Save,
  Loader2,
  Upload,
  X,
  Image,
  PenLine,
} from "lucide-react";
import { useAuthStore } from "../store/auth";
import { DEFAULT_LEGAL_MENTIONS } from "../types";

interface InputFieldProps {
  label: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  placeholder: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function InputField({
  label,
  name,
  icon: Icon,
  placeholder,
  type = "text",
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
        />
      </div>
    </div>
  );
}

interface ImageUploadProps {
  label: string;
  value: string | null;
  onUpload: (base64: string) => void;
  onRemove: () => void;
  icon: React.ComponentType<{ className?: string }>;
}

function ImageUploadField({
  label,
  value,
  onUpload,
  onRemove,
  icon: Icon,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 500_000) {
      alert("L'image ne doit pas dépasser 500 Ko.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {value ? (
        <div className="relative group">
          <div className="w-full h-32 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
            <img
              src={value}
              alt={label}
              className="max-h-full max-w-full object-contain p-2"
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-300 hover:text-primary-500 transition-all"
        >
          <Icon className="w-6 h-6" />
          <span className="text-xs font-medium">
            <Upload className="w-3 h-3 inline mr-1" />
            Importer
          </span>
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const { profile, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
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
    legal_mentions: DEFAULT_LEGAL_MENTIONS,
    logo_base64: null as string | null,
    signature_base64: null as string | null,
    next_invoice_number: 1,
  });

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name ?? "",
        owner_name: profile.owner_name ?? "",
        address: profile.address ?? "",
        postal_code: profile.postal_code ?? "",
        city: profile.city ?? "",
        phone: profile.phone ?? "",
        email: profile.email ?? "",
        rcs: profile.rcs ?? "",
        siret: profile.siret ?? "",
        iban: profile.iban ?? "",
        legal_mentions: profile.legal_mentions || DEFAULT_LEGAL_MENTIONS,
        logo_base64: profile.logo_base64 ?? null,
        signature_base64: profile.signature_base64 ?? null,
        next_invoice_number: profile.next_invoice_number ?? 1,
      });
    }
  }, [profile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-gray-500 mt-1 text-sm sm:text-base">
            Configurez vos informations professionnelles
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`relative group flex items-center justify-center gap-2 px-5 sm:px-6 py-3 font-medium rounded-xl transition-all duration-300 shadow-lg hover:-translate-y-0.5 ${
            saved
              ? "bg-emerald-500 text-white shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40"
              : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40"
          } disabled:opacity-70 disabled:hover:translate-y-0`}
        >
          <span className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin relative z-10" />
          ) : saved ? (
            <>
              <Save className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Sauvegardé !</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Sauvegarder</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Business info */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center">
              <Building2 className="w-4.5 h-4.5 text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900">
              Informations entreprise
            </h2>
          </div>
          <div className="space-y-4">
            <InputField
              label="Nom de l'entreprise"
              name="business_name"
              icon={Building2}
              placeholder="Mon Entreprise SARL"
              value={form.business_name}
              onChange={handleChange}
            />
            <InputField
              label="Nom du dirigeant"
              name="owner_name"
              icon={User}
              placeholder="Jean Dupont"
              value={form.owner_name}
              onChange={handleChange}
            />
            <InputField
              label="Adresse"
              name="address"
              icon={MapPin}
              placeholder="15 rue de la Paix"
              value={form.address}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <InputField
                label="Code postal"
                name="postal_code"
                icon={MapPin}
                placeholder="75001"
                value={form.postal_code}
                onChange={handleChange}
              />
              <InputField
                label="Ville"
                name="city"
                icon={MapPin}
                placeholder="Paris"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <InputField
              label="Téléphone"
              name="phone"
              icon={Phone}
              placeholder="06 12 34 56 78"
              value={form.phone}
              onChange={handleChange}
            />
            <InputField
              label="Email"
              name="email"
              icon={Mail}
              placeholder="contact@entreprise.fr"
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Legal info */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Informations légales
              </h2>
            </div>
            <div className="space-y-4">
              <InputField
                label="RCS"
                name="rcs"
                icon={FileText}
                placeholder="RCS PARIS 123 456 789"
                value={form.rcs}
                onChange={handleChange}
              />
              <InputField
                label="SIRET"
                name="siret"
                icon={FileText}
                placeholder="123 456 789 00012"
                value={form.siret}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <h2 className="font-semibold text-gray-900">
                Coordonnées bancaires
              </h2>
            </div>
            <InputField
              label="IBAN"
              name="iban"
              icon={CreditCard}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              value={form.iban}
              onChange={handleChange}
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <FileText className="w-4.5 h-4.5 text-orange-600" />
              </div>
              <h2 className="font-semibold text-gray-900">Numérotation</h2>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Prochain numéro de facture
              </label>
              <input
                type="number"
                name="next_invoice_number"
                min={1}
                value={form.next_invoice_number}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Legal mentions */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-rose-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Mentions légales</h2>
          </div>
          <textarea
            name="legal_mentions"
            value={form.legal_mentions}
            onChange={handleChange}
            rows={6}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-sm resize-none"
            placeholder="Mentions légales à afficher en bas de la facture..."
          />
        </div>

        {/* Logo & Signature */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center">
              <Image className="w-4.5 h-4.5 text-sky-600" />
            </div>
            <h2 className="font-semibold text-gray-900">Logo & Signature</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUploadField
              label="Logo (optionnel)"
              value={form.logo_base64}
              onUpload={(b64) =>
                setForm((prev) => ({ ...prev, logo_base64: b64 }))
              }
              onRemove={() =>
                setForm((prev) => ({ ...prev, logo_base64: null }))
              }
              icon={Image}
            />
            <ImageUploadField
              label="Signature (optionnel)"
              value={form.signature_base64}
              onUpload={(b64) =>
                setForm((prev) => ({ ...prev, signature_base64: b64 }))
              }
              onRemove={() =>
                setForm((prev) => ({ ...prev, signature_base64: null }))
              }
              icon={PenLine}
            />
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Formats acceptés : PNG, JPG. Taille max : 500 Ko.
          </p>
        </div>
      </div>
    </div>
  );
}
