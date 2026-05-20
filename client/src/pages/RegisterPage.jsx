import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";

function PasswordStrength({ password }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Faible", "Moyen", "Bon", "Fort"];
  const colors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"];

  if (!password) return null;

  return (
    <div className="mt-1.5">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= score ? colors[score] : "bg-cream-darker"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs ${score < 2 ? "text-red-500" : score < 4 ? "text-orange-500" : "text-green-600"}`}>
        {labels[score]}
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (form.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    try {
      const res = await http.post("/auth/register", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      });
      // Auto-login after registration
      login(res.data.token, res.data.user);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard/participant"), 1200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Erreur lors de la création du compte. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { id: "fullName", label: "Nom complet", type: "text", placeholder: "Prénom Nom", autoComplete: "name" },
    { id: "email", label: "Adresse e-mail", type: "email", placeholder: "vous@entreprise.com", autoComplete: "email" },
  ];

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-[460px]">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-cream-dark overflow-hidden">
          {/* Header */}
          <div
            className="px-8 pt-8 pb-7 text-center relative overflow-hidden"
            style={{
              background: "linear-gradient(145deg, #B8213B 0%, #8B0D1A 60%, #5E0D15 100%)",
            }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-gold fill-current">
                  <path d="M12 2L13.9 8.3H20.5L15.3 12.1L17.2 18.4L12 14.6L6.8 18.4L8.7 12.1L3.5 8.3H10.1L12 2Z" />
                </svg>
              </div>
              <h1 className="font-serif text-2xl font-bold text-white mb-1">Créer un compte</h1>
              <p className="text-white/65 text-sm">Rejoignez 12 000+ voyageurs d&apos;affaires</p>
            </div>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {success && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 mb-5">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                <p className="text-green-700 text-sm font-medium">Compte créé ! Redirection en cours…</p>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-5">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {fields.map(({ id, label, type, placeholder, autoComplete }) => (
                <div key={id}>
                  <label htmlFor={id} className="block text-sm font-semibold text-[#3A1010] mb-1.5">
                    {label}
                  </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    autoComplete={autoComplete}
                    placeholder={placeholder}
                    value={form[id]}
                    onChange={handleChange}
                    required
                    className="w-full bg-cream border border-cream-darker rounded-xl px-4 py-3 text-sm text-[#1A0505] placeholder-[#B08080] focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all"
                  />
                </div>
              ))}

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#3A1010] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 8 caractères"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="w-full bg-cream border border-cream-darker rounded-xl px-4 py-3 pr-11 text-sm text-[#1A0505] placeholder-[#B08080] focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B08080] hover:text-crimson transition-colors"
                    aria-label="Afficher/masquer le mot de passe"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-[#3A1010] mb-1.5">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Retapez votre mot de passe"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full bg-cream border rounded-xl px-4 py-3 pr-11 text-sm text-[#1A0505] placeholder-[#B08080] focus:outline-none focus:ring-2 focus:ring-crimson/30 transition-all ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? "border-red-300 focus:border-red-400"
                        : "border-cream-darker focus:border-crimson"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#B08080] hover:text-crimson transition-colors"
                    aria-label="Afficher/masquer la confirmation"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-crimson to-[#8B0D1A] text-white font-bold py-3.5 rounded-xl hover:from-[#8B0D1A] hover:to-[#5E0D15] transition-all hover:shadow-lg hover:shadow-crimson/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-[15px]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Création en cours…
                  </span>
                ) : (
                  "Créer mon compte →"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#9A6A6A] mt-5">
              Déjà inscrit ?{" "}
              <Link to="/login" className="text-crimson font-bold hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-center text-xs text-[#9A8080] mt-5 px-4">
          🔒 Vos données sont protégées et ne sont jamais partagées avec des tiers.
        </p>
      </div>
    </div>
  );
}
