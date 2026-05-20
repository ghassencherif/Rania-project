import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, History, MapPin, Clock, CircleCheck } from "lucide-react";
import http from "../api/http";

const ACTION_LABELS = {
  viewed: "Consultee",
  saved: "Ajoutee aux favoris",
  completed: "Realisee",
};

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await http.get("/participant/history");
        setHistory(res.data.history || []);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Impossible de charger l'historique.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-cream pt-24 pb-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-crimson/10 flex items-center justify-center">
              <History size={18} className="text-crimson" />
            </div>
            <div>
              <p className="text-xs font-black tracking-[2px] uppercase text-crimson">Participant</p>
              <h1 className="font-serif text-3xl font-bold text-[#1A0505]">Historique des activites</h1>
            </div>
          </div>
          <Link
            to="/dashboard/participant"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#6B3A3A] hover:text-crimson"
          >
            <ArrowLeft size={14} /> Retour au dashboard
          </Link>
        </div>

        {loading && <p className="text-sm text-[#6B3A3A]">Chargement de l'historique...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <div className="bg-white rounded-3xl border border-cream-dark p-10 text-center">
            <p className="text-4xl mb-2">🗂️</p>
            <p className="font-serif text-xl text-[#1A0505] mb-1">Historique vide</p>
            <p className="text-sm text-[#9A6A6A]">Vos interactions d'activites apparaitront ici.</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-4">
            {history.map((item) => (
              <article key={item.id} className="bg-white rounded-3xl border border-cream-dark p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-black tracking-[2px] uppercase text-gold mb-1">{item.category}</p>
                    <h3 className="font-serif text-xl font-bold text-[#1A0505]">{item.title}</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-crimson/10 text-crimson">
                    <CircleCheck size={11} /> {ACTION_LABELS[item.action] || item.action}
                  </span>
                </div>
                <p className="text-sm text-[#6B3A3A] mb-3">{item.summary}</p>
                <div className="text-xs text-[#8A5A5A] flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1"><MapPin size={11} className="text-crimson" />{item.city}</span>
                  <span className="inline-flex items-center gap-1"><Clock size={11} className="text-crimson" />{item.durationMinutes} min</span>
                  <span>{new Date(item.createdAt).toLocaleString("fr-FR")}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
