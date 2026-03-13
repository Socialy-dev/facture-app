import { Link } from "react-router-dom";
import { Settings, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "../store/auth";

interface CheckItem {
  key: string;
  label: string;
  done: boolean;
}

export default function OnboardingBanner() {
  const { profile } = useAuthStore();

  const checks: CheckItem[] = [
    {
      key: "business_name",
      label: "Nom de l'entreprise",
      done: Boolean(profile.business_name),
    },
    {
      key: "owner_name",
      label: "Nom du dirigeant",
      done: Boolean(profile.owner_name),
    },
    {
      key: "address",
      label: "Adresse",
      done: Boolean(profile.address && profile.postal_code && profile.city),
    },
    {
      key: "phone",
      label: "Téléphone",
      done: Boolean(profile.phone),
    },
    {
      key: "rcs",
      label: "RCS / SIRET",
      done: Boolean(profile.rcs || profile.siret),
    },
    {
      key: "iban",
      label: "IBAN",
      done: Boolean(profile.iban),
    },
  ];

  const completed = checks.filter((c) => c.done).length;
  const total = checks.length;
  const allDone = completed === total;
  const progress = Math.round((completed / total) * 100);

  if (allDone) return null;

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-[1px] border border-white/[0.08]">
      <div className="relative rounded-[15px] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/[0.07] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex items-center gap-6">
          {/* Left: Icon + Message */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-amber-300" />
              <h3 className="text-white font-bold text-lg">
                Complétez votre profil
              </h3>
            </div>
            <p className="text-white/70 text-sm mb-4">
              Renseignez vos informations pour qu'elles apparaissent
              automatiquement sur vos factures.
            </p>

            {/* Progress checklist */}
            <div className="flex flex-wrap gap-3 mb-4">
              {checks.map((check) => (
                <div
                  key={check.key}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
                    check.done
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-white/10 text-white/60"
                  }`}
                >
                  {check.done ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/30" />
                  )}
                  {check.label}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/15 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-white/80 text-xs font-bold">
                {completed}/{total}
              </span>
            </div>
          </div>

          {/* Right: CTA Button */}
          <Link
            to="/parametres"
            className="relative group flex items-center gap-2 px-6 py-3.5 bg-white text-primary-700 font-bold rounded-xl transition-all duration-300 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/15 hover:-translate-y-0.5 shrink-0"
          >
            <span className="absolute inset-0 rounded-xl bg-primary-50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Settings className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Configurer</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
