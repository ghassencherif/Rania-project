import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, UserRound } from "lucide-react";
import http from "../api/http";

const initialState = {
  country: "",
  preferredLanguage: "fr",
  travelerType: "",
  interests: "",
  averageBudget: "",
  preferredPace: "",
  dietaryRestrictions: "",
  mobility: "",
  preferredTransport: "",
};

export default function ProfilePage() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/participant/profile");
        setForm({ ...initialState, ...res.data, averageBudget: res.data.averageBudget ?? "" });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Impossible de charger le profil.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await http.put("/participant/profile", form);
      setMessage("Profil mis a jour avec succes.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de sauvegarder le profil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-24 pb-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-crimson/10 flex items-center justify-center">
              <UserRound size={18} className="text-crimson" />
            </div>
            <div>
              <p className="text-xs font-black tracking-[2px] uppercase text-crimson">Participant</p>
              <h1 className="font-serif text-3xl font-bold text-[#1A0505]">Mon profil</h1>
            </div>
          </div>
          <Link
            to="/dashboard/participant"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B3A3A] hover:text-crimson"
          >
            <ArrowLeft size={14} /> Retour au dashboard
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-cream-dark p-6 md:p-8 shadow-sm">
          {loading ? (
            <p className="text-sm text-[#6B3A3A]">Chargement du profil...</p>
          ) : (
            <form onSubmit={saveProfile} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Pays</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Langue preferee</label>
                <select
                  value={form.preferredLanguage}
                  onChange={(e) => setForm((p) => ({ ...p, preferredLanguage: e.target.value }))}
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                >
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                  <option value="ar">Arabe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Type de voyageur</label>
                <input
                  value={form.travelerType}
                  onChange={(e) => setForm((p) => ({ ...p, travelerType: e.target.value }))}
                  placeholder="Consultant, cadre, entrepreneur..."
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Budget moyen (TND)</label>
                <input
                  type="number"
                  value={form.averageBudget}
                  onChange={(e) => setForm((p) => ({ ...p, averageBudget: e.target.value }))}
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Rythme prefere</label>
                <select
                  value={form.preferredPace}
                  onChange={(e) => setForm((p) => ({ ...p, preferredPace: e.target.value }))}
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                >
                  <option value="">Choisir</option>
                  <option value="rapide">Rapide</option>
                  <option value="equilibre">Equilibre</option>
                  <option value="detendu">Detendu</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Transport prefere</label>
                <input
                  value={form.preferredTransport}
                  onChange={(e) => setForm((p) => ({ ...p, preferredTransport: e.target.value }))}
                  placeholder="Taxi, voiture, velo..."
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Centres d'interet</label>
                <textarea
                  rows={2}
                  value={form.interests}
                  onChange={(e) => setForm((p) => ({ ...p, interests: e.target.value }))}
                  placeholder="Culture, histoire, gastronomie..."
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Restrictions alimentaires</label>
                <input
                  value={form.dietaryRestrictions}
                  onChange={(e) => setForm((p) => ({ ...p, dietaryRestrictions: e.target.value }))}
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A0505] mb-1.5">Mobilite</label>
                <input
                  value={form.mobility}
                  onChange={(e) => setForm((p) => ({ ...p, mobility: e.target.value }))}
                  placeholder="A pied, PMR, sans voiture..."
                  className="w-full border border-cream-dark rounded-xl px-4 py-2.5 bg-cream text-sm"
                />
              </div>

              {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
              {message && <p className="md:col-span-2 text-sm text-green-700">{message}</p>}

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 bg-crimson text-white font-bold px-6 py-3 rounded-full hover:bg-crimson-700 transition-all"
                >
                  <Save size={14} />
                  {saving ? "Sauvegarde..." : "Sauvegarder le profil"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
