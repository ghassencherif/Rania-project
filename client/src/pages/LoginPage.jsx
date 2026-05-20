import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await http.post("/auth/login", form);
      login(response.data.token, response.data.user);
      if (response.data.user.role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/participant");
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Identifiants incorrects");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-[460px]">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-cream-dark overflow-hidden">
          {/* Header */}
          <div
            className="px-8 pt-8 pb-7 text-center relative overflow-hidden"
            style={{ background: "linear-gradient(145deg, #B8213B 0%, #8B0D1A 60%, #5E0D15 100%)" }}
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7 text-gold fill-current">
                  <path d="M12 2L13.9 8.3H20.5L15.3 12.1L17.2 18.4L12 14.6L6.8 18.4L8.7 12.1L3.5 8.3H10.1L12 2Z" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white mb-1">Bon retour</h2>
              <p className="text-white/65 text-sm">Connectez-vous à votre espace voyageur</p>
            </div>
          </div>
          <div className="px-8 py-7">

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-[#3A1010] mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="vous@exemple.com"
                  className="w-full bg-cream border border-cream-darker rounded-xl px-4 py-3 text-[#1A0505] placeholder-[#B08080] focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-[#3A1010] mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full bg-cream border border-cream-darker rounded-xl px-4 py-3 pr-11 text-[#1A0505] placeholder-[#B08080] focus:outline-none focus:ring-2 focus:ring-crimson/30 focus:border-crimson transition-all text-sm"
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
              </div>

              {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                  <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-crimson to-[#8B0D1A] text-white font-bold py-3.5 rounded-xl hover:from-[#8B0D1A] hover:to-[#5E0D15] transition-all hover:shadow-lg hover:shadow-crimson/25 disabled:opacity-60 disabled:cursor-not-allowed mt-2 text-[15px]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Connexion en cours…
                  </span>
                ) : (
                  "Se connecter →"
                )}
              </button>
            </form>

            <p className="text-center text-sm text-[#9A6A6A] mt-5">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-crimson font-bold hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-[#9A8080] mt-5">
          🔒 Connexion sécurisée · Données chiffrées
        </p>
      </div>
    </main>
  );
}

export default LoginPage;

