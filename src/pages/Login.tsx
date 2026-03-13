import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/auth";

type Mode = "login" | "register";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { login, register } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/");
      } else {
        await register(email, password);
        setSuccess(
          "Compte créé ! Vérifiez votre email pour confirmer votre inscription."
        );
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-indigo-500/[0.07] rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-white/[0.02] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-400/[0.04] rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-4 shadow-2xl">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Facture App</h1>
          <p className="text-indigo-200 text-sm">
            Créez vos factures en quelques clics
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.12] rounded-2xl p-8 shadow-2xl">
          {/* Mode toggle */}
          <div className="flex bg-white/[0.06] rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === "login"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-indigo-300 hover:text-white"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === "register"
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-indigo-300 hover:text-white"
              }`}
            >
              Inscription
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.07] border border-white/[0.1] rounded-xl text-white placeholder:text-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-transparent transition-all"
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-indigo-200 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.07] border border-white/[0.1] rounded-xl text-white placeholder:text-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/15 text-red-300 text-sm px-4 py-3 rounded-xl border border-red-500/20">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/15 text-emerald-300 text-sm px-4 py-3 rounded-xl border border-emerald-500/20">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-white/15 hover:bg-white/20 disabled:bg-white/5 disabled:text-indigo-400 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/[0.12] shadow-lg shadow-black/20"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Se connecter" : "Créer un compte"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
