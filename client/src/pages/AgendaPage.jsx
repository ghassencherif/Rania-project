import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Clock,
  Zap,
  LogOut,
  MapPin,
  ArrowRight,
  Settings,
} from "lucide-react";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";

/* ─── helpers ─── */
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function offsetDate(base, days) {
  const d = new Date(base + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDate(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function toMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function durationLabel(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

/* ─── Timeline constants ─── */
const WORK_START_DEFAULT = "08:00";
const WORK_END_DEFAULT   = "20:00";
const PX_PER_MIN = 1.2; // pixels per minute in the visual timeline

function minutesToPx(minutes) {
  return minutes * PX_PER_MIN;
}

const HOUR_LABELS = Array.from({ length: 13 }, (_, i) => i + 8); // 8..20

/* ─── Color map for event index ─── */
const EVENT_COLORS = [
  "bg-slate-200 border-slate-300 text-slate-700",
  "bg-blue-100 border-blue-200 text-blue-700",
  "bg-violet-100 border-violet-200 text-violet-700",
  "bg-pink-100 border-pink-200 text-pink-700",
  "bg-amber-100 border-amber-200 text-amber-700",
];

export default function AgendaPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState(todayISO);
  const [workStart, setWorkStart] = useState(WORK_START_DEFAULT);
  const [workEnd, setWorkEnd]     = useState(WORK_END_DEFAULT);
  const [showSettings, setShowSettings] = useState(false);

  const [events, setEvents]       = useState([]);
  const [freeSlots, setFreeSlots] = useState([]);
  const [loading, setLoading]     = useState(false);

  /* add-event form */
  const [form, setForm]   = useState({ title: "", startTime: "09:00", endTime: "10:00" });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState("");

  /* ── fetch data for the selected date ── */
  const fetchDay = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, slotRes] = await Promise.all([
        http.get("/agenda", { params: { date } }),
        http.get("/agenda/free-slots", {
          params: { date, workStart, workEnd, minSlotMinutes: 30 },
        }),
      ]);
      setEvents(evRes.data.events || []);
      setFreeSlots(slotRes.data.freeSlots || []);
    } catch {
      setEvents([]);
      setFreeSlots([]);
    } finally {
      setLoading(false);
    }
  }, [date, workStart, workEnd]);

  useEffect(() => { fetchDay(); }, [fetchDay]);

  /* ── add event ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) { setFormError("Le titre est requis."); return; }
    if (toMinutes(form.startTime) >= toMinutes(form.endTime)) {
      setFormError("L'heure de fin doit être après l'heure de début.");
      return;
    }
    setAdding(true);
    try {
      await http.post("/agenda", {
        title: form.title.trim(),
        eventDate: date,
        startTime: form.startTime,
        endTime: form.endTime,
      });
      setForm({ title: "", startTime: "09:00", endTime: "10:00" });
      fetchDay();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setAdding(false);
    }
  };

  /* ── delete event ── */
  const handleDelete = async (id) => {
    try {
      await http.delete(`/agenda/${id}`);
      fetchDay();
    } catch {
      /* silent */
    }
  };

  /* ── use a free slot → go to recommendations ── */
  const useSlot = (slot) => {
    navigate(
      `/dashboard/participant?availableMinutes=${slot.durationMinutes}&slotStart=${slot.startTime}&slotEnd=${slot.endTime}`
    );
  };

  /* ── timeline rendering ── */
  const wsMin = toMinutes(workStart);
  const weMin = toMinutes(workEnd);
  const totalMin = weMin - wsMin;
  const timelineHeight = minutesToPx(totalMin);

  return (
    <div className="min-h-screen bg-slate-100 pt-[72px] flex">
      {/* ── Sidebar ── */}
      <aside className="w-64 shrink-0 bg-[#0F172A] min-h-[calc(100vh-72px)] sticky top-[72px] self-start flex flex-col">
        {/* User */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-indigo-300 text-sm font-bold">
                {(user?.fullName || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">{user?.fullName?.split(" ")[0]}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Agenda connecté</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <Link
            to="/dashboard/participant"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <MapPin size={15} />
            Recommandations
          </Link>
          <Link
            to="/dashboard/agenda"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium"
          >
            <CalendarDays size={15} />
            Mon agenda
          </Link>
          <Link
            to="/dashboard/favorites"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <Zap size={15} />
            Favoris
          </Link>
          <Link
            to="/dashboard/history"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <Clock size={15} />
            Historique
          </Link>
          <Link
            to="/dashboard/profile"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors"
          >
            <Settings size={15} />
            Profil
          </Link>
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs font-medium px-2.5 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <LogOut size={12} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0">
        {/* Header bar */}
        <div className="bg-white border-b border-slate-200 px-7 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-none">Mon agenda</h1>
            <p className="text-slate-400 text-xs mt-1">
              Ajoutez vos réunions — les créneaux libres sont détectés automatiquement
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 transition-colors"
          >
            <Settings size={13} />
            Horaires de travail
          </button>
        </div>

        {/* Work hours settings (collapsible) */}
        {showSettings && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-7 py-4 flex items-center gap-6">
            <p className="text-sm font-semibold text-indigo-700">Plage horaire :</p>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              Début
              <input
                type="time"
                value={workStart}
                onChange={(e) => setWorkStart(e.target.value)}
                className="border border-indigo-200 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              Fin
              <input
                type="time"
                value={workEnd}
                onChange={(e) => setWorkEnd(e.target.value)}
                className="border border-indigo-200 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
              />
            </label>
            <p className="text-xs text-indigo-500">Créneaux &lt; 30 min ignorés</p>
          </div>
        )}

        <div className="px-7 py-6 grid xl:grid-cols-[1fr_360px] gap-6 items-start">

          {/* ── Left: Timeline + events ── */}
          <div className="space-y-5">

            {/* Date nav */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setDate((d) => offsetDate(d, -1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft size={16} className="text-slate-500" />
              </button>

              <div className="text-center">
                <p className="font-semibold text-slate-900 capitalize">{formatDate(date)}</p>
                {date === todayISO() && (
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Aujourd'hui</span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setDate((d) => offsetDate(d, 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
              >
                <ChevronRight size={16} className="text-slate-500" />
              </button>
            </div>

            {/* Visual Timeline */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Chronologie</p>
                <span className="text-xs text-slate-400">{workStart} → {workEnd}</span>
              </div>

              {loading ? (
                <div className="p-10 text-center">
                  <span className="inline-block w-6 h-6 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              ) : (
                <div className="p-5">
                  <div
                    className="relative ml-12"
                    style={{ height: `${timelineHeight}px` }}
                  >
                    {/* Hour grid lines + labels */}
                    {HOUR_LABELS.map((h) => {
                      if (h < Number(workStart.split(":")[0]) || h > Number(workEnd.split(":")[0])) return null;
                      const top = minutesToPx((h * 60) - wsMin);
                      return (
                        <div
                          key={h}
                          className="absolute left-0 right-0 flex items-center"
                          style={{ top: `${top}px` }}
                        >
                          <span className="absolute -left-12 text-[10px] text-slate-400 font-medium w-10 text-right pr-2 leading-none">
                            {String(h).padStart(2, "0")}:00
                          </span>
                          <div className="w-full h-px bg-slate-100" />
                        </div>
                      );
                    })}

                    {/* Busy event blocks */}
                    {events.map((ev, i) => {
                      const evStart = Math.max(toMinutes(ev.startTime), wsMin);
                      const evEnd   = Math.min(toMinutes(ev.endTime), weMin);
                      if (evEnd <= evStart) return null;
                      const top    = minutesToPx(evStart - wsMin);
                      const height = minutesToPx(evEnd - evStart);
                      const color  = EVENT_COLORS[i % EVENT_COLORS.length];
                      return (
                        <div
                          key={ev.id}
                          className={`absolute left-0 right-0 rounded-md border px-2 py-1 overflow-hidden ${color}`}
                          style={{ top: `${top}px`, height: `${Math.max(height, 20)}px` }}
                        >
                          <p className="text-[11px] font-semibold truncate leading-snug">{ev.title}</p>
                          <p className="text-[10px] opacity-70">{ev.startTime} – {ev.endTime}</p>
                        </div>
                      );
                    })}

                    {/* Free slot blocks */}
                    {freeSlots.map((slot) => {
                      const slotStart = Math.max(toMinutes(slot.startTime), wsMin);
                      const slotEnd   = Math.min(toMinutes(slot.endTime), weMin);
                      if (slotEnd <= slotStart) return null;
                      const top    = minutesToPx(slotStart - wsMin);
                      const height = minutesToPx(slotEnd - slotStart);
                      return (
                        <button
                          key={slot.startTime}
                          type="button"
                          onClick={() => useSlot(slot)}
                          className="absolute left-0 right-0 rounded-md border-2 border-dashed border-indigo-300 bg-indigo-50/70 hover:bg-indigo-100 transition-colors flex flex-col items-center justify-center gap-0.5 group"
                          style={{ top: `${top}px`, height: `${Math.max(height, 24)}px` }}
                          title="Cliquer pour explorer ce créneau"
                        >
                          <span className="text-[10px] font-bold text-indigo-500 flex items-center gap-1">
                            <Zap size={9} />
                            {durationLabel(slot.durationMinutes)} libre
                          </span>
                          {height >= 40 && (
                            <span className="text-[9px] text-indigo-400 group-hover:text-indigo-600 flex items-center gap-0.5">
                              Explorer <ArrowRight size={8} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Events list (for delete) */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">
                  Réunions &amp; rendez-vous
                </p>
                <span className="text-xs bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">
                  {events.length}
                </span>
              </div>

              {!loading && events.length === 0 && (
                <p className="px-5 py-6 text-sm text-slate-400 text-center">
                  Aucun événement ce jour — tout votre temps est libre 🎉
                </p>
              )}

              <ul className="divide-y divide-slate-50">
                {events.map((ev, i) => {
                  const dur = toMinutes(ev.endTime) - toMinutes(ev.startTime);
                  return (
                    <li key={ev.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        EVENT_COLORS[i % EVENT_COLORS.length].split(" ")[0].replace("bg-", "bg-").replace("-100", "-400")
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{ev.title}</p>
                        <p className="text-xs text-slate-400">{ev.startTime} – {ev.endTime} · {durationLabel(dur)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(ev.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                        title="Supprimer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* ── Right: Add event + Free slots ── */}
          <div className="space-y-5">

            {/* Add event form */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Plus size={14} className="text-indigo-500" />
                  Ajouter un rendez-vous
                </p>
              </div>
              <form onSubmit={handleAdd} className="px-5 py-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: Réunion client, Déjeuner d'équipe…"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Début
                    </label>
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) => setForm((p) => ({ ...p, startTime: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">
                      Fin
                    </label>
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm((p) => ({ ...p, endTime: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={adding}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} />
                  {adding ? "Ajout…" : "Ajouter au planning"}
                </button>
              </form>
            </div>

            {/* Free slots */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Zap size={14} className="text-indigo-500" />
                  Créneaux libres détectés
                </p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  freeSlots.length > 0
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {freeSlots.length}
                </span>
              </div>

              {loading && (
                <div className="p-6 text-center">
                  <span className="inline-block w-5 h-5 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
                </div>
              )}

              {!loading && freeSlots.length === 0 && (
                <p className="px-5 py-6 text-sm text-slate-400 text-center">
                  Aucun créneau libre trouvé.<br />
                  <span className="text-xs">Ajoutez des rendez-vous pour voir vos créneaux.</span>
                </p>
              )}

              {!loading && freeSlots.length > 0 && (
                <ul className="divide-y divide-slate-50">
                  {freeSlots.map((slot) => (
                    <li key={slot.startTime} className="px-5 py-4">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {slot.startTime} – {slot.endTime}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            {durationLabel(slot.durationMinutes)} disponibles
                          </p>
                        </div>
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                          {durationLabel(slot.durationMinutes)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => useSlot(slot)}
                        className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                      >
                        <MapPin size={12} />
                        Explorer ce créneau
                        <ArrowRight size={12} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Legend */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 px-5 py-4 text-xs text-slate-500 space-y-1.5">
              <p className="font-semibold text-slate-600 mb-2">Légende</p>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
                <span>Rendez-vous / réunion occupé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-indigo-50 border-2 border-dashed border-indigo-300" />
                <span>Créneau libre (≥ 30 min)</span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1">
                Cliquez sur un créneau libre dans la chronologie ou le panneau pour explorer les activités disponibles.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
