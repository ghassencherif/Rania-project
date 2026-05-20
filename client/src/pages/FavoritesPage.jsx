import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, MapPin, Clock, Trash2 } from "lucide-react";
import http from "../api/http";

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await http.get("/participant/favorites");
      setFavorites(res.data.favorites || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les favoris.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = async (activityId) => {
    try {
      await http.delete(`/participant/favorites/${activityId}`);
      setFavorites((prev) => prev.filter((item) => item.activityId !== activityId));
    } catch {
      setError("Impossible de retirer ce favori.");
    }
  };

  return (
    <main className="min-h-screen bg-cream pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-crimson/10 flex items-center justify-center">
              <Heart size={18} className="text-crimson" />
            </div>
            <div>
              <p className="text-xs font-black tracking-[2px] uppercase text-crimson">Participant</p>
              <h1 className="font-serif text-3xl font-bold text-[#1A0505]">Mes favoris</h1>
            </div>
          </div>
          <Link
            to="/dashboard/participant"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B3A3A] hover:text-crimson"
          >
            <ArrowLeft size={14} /> Retour au dashboard
          </Link>
        </div>

        {loading && <p className="text-sm text-[#6B3A3A]">Chargement des favoris...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && favorites.length === 0 && !error && (
          <div className="bg-white rounded-3xl border border-cream-dark p-10 text-center">
            <p className="text-4xl mb-2">🤍</p>
            <p className="font-serif text-xl text-[#1A0505] mb-1">Aucun favori pour le moment</p>
            <p className="text-sm text-[#9A6A6A]">Ajoutez des activites depuis le dashboard participant.</p>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favorites.map((item) => (
              <article key={item.id} className="bg-white rounded-3xl border border-cream-dark shadow-sm overflow-hidden">
                {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />}
                <div className="p-5">
                  <p className="text-[10px] font-black tracking-[2px] uppercase text-gold mb-1">{item.category}</p>
                  <h3 className="font-serif text-lg font-bold text-[#1A0505] mb-2">{item.title}</h3>
                  <p className="text-sm text-[#6B3A3A] mb-4 line-clamp-3">{item.summary}</p>
                  <div className="text-xs text-[#8A5A5A] flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-crimson" />{item.city}</span>
                    <span className="inline-flex items-center gap-1"><Clock size={11} className="text-crimson" />{item.durationMinutes} min</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFavorite(item.activityId)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    <Trash2 size={13} /> Retirer
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
