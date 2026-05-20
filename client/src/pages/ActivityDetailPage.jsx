import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Wallet, Route, Heart } from "lucide-react";
import http from "../api/http";

export default function ActivityDetailPage() {
  const { id } = useParams();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favoriteDone, setFavoriteDone] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await http.get(`/activities/${id}`);
        setActivity(res.data);
        await http.post("/participant/history", { activityId: Number(id), action: "viewed" });
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Impossible de charger cette activite.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const mapsUrl = useMemo(() => {
    if (!activity) return "#";
    if (activity.latitude !== null && activity.longitude !== null) {
      return `https://www.google.com/maps/dir/?api=1&destination=${activity.latitude},${activity.longitude}`;
    }
    const query = encodeURIComponent(`${activity.title} ${activity.city}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }, [activity]);

  const addFavorite = async () => {
    if (!activity) return;
    try {
      await http.post(`/participant/favorites/${activity.id}`);
      setFavoriteDone(true);
    } catch {
      // Silent on purpose.
    }
  };

  if (loading) {
    return <main className="min-h-screen bg-cream pt-28 px-4">Chargement...</main>;
  }

  if (error || !activity) {
    return (
      <main className="min-h-screen bg-cream pt-28 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-600 text-sm mb-4">{error || "Activite introuvable."}</p>
          <Link to="/dashboard/participant" className="text-crimson font-semibold hover:underline">
            Retour au dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard/participant" className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B3A3A] hover:text-crimson mb-5">
          <ArrowLeft size={14} /> Retour au dashboard
        </Link>

        <article className="bg-white rounded-3xl border border-cream-dark overflow-hidden shadow-sm">
          {activity.imageUrl && (
            <div className="h-72 overflow-hidden">
              <img src={activity.imageUrl} alt={activity.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="p-6 md:p-8">
            <p className="text-[10px] font-black tracking-[2px] uppercase text-gold mb-2">{activity.category}</p>
            <h1 className="font-serif text-3xl font-bold text-[#1A0505] mb-3">{activity.title}</h1>
            <p className="text-[#6B3A3A] leading-relaxed mb-6">{activity.summary}</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-sm">
              <div className="bg-cream rounded-xl border border-cream-dark px-3 py-2.5 inline-flex items-center gap-2">
                <MapPin size={14} className="text-crimson" />
                <span>{activity.city}</span>
              </div>
              <div className="bg-cream rounded-xl border border-cream-dark px-3 py-2.5 inline-flex items-center gap-2">
                <Clock size={14} className="text-crimson" />
                <span>{activity.durationMinutes} min</span>
              </div>
              {activity.budgetEstimate !== null && activity.budgetEstimate !== undefined && (
                <div className="bg-cream rounded-xl border border-cream-dark px-3 py-2.5 inline-flex items-center gap-2">
                  <Wallet size={14} className="text-crimson" />
                  <span>{Number(activity.budgetEstimate).toFixed(2)} TND</span>
                </div>
              )}
              {activity.transportOptions && (
                <div className="bg-cream rounded-xl border border-cream-dark px-3 py-2.5">
                  {activity.transportOptions}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-crimson text-white font-bold px-5 py-3 rounded-full hover:bg-crimson-700 transition-all"
              >
                <Route size={14} /> Demarrer l'itineraire
              </a>
              <button
                type="button"
                onClick={addFavorite}
                className="inline-flex items-center gap-2 border border-crimson text-crimson font-bold px-5 py-3 rounded-full hover:bg-crimson/5 transition-all"
              >
                <Heart size={14} /> {favoriteDone ? "Ajoute aux favoris" : "Ajouter aux favoris"}
              </button>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
