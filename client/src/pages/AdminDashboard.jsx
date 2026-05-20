import { useEffect, useState } from "react";
import {
  Users,
  LayoutGrid,
  LogOut,
  Trash2,
  PlusCircle,
  ShieldCheck,
  Activity,
  UserPlus,
  ListChecks,
  Car,
  Train,
  Bus,
  Bike,
  CheckCircle,
  AlertCircle,
  Pencil,
  X,
  MapPin,
  Clock,
} from "lucide-react";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";

const CITY_TRANSPORT = {
  Tunis: ["Taxi", "Metro leger", "Bus", "Train (TGM)", "Velo"],
  Sousse: ["Taxi", "Bus", "Louer une voiture", "Velo"],
  Sfax: ["Taxi", "Bus", "Louer une voiture"],
  Djerba: ["Taxi", "Louer une voiture", "Navette hotel", "Velo"],
  Hammamet: ["Taxi", "Bus", "Louer une voiture", "Velo"],
  Monastir: ["Taxi", "Bus", "Train", "Louer une voiture"],
  Tozeur: ["Taxi", "Bus", "4x4 local", "Louer une voiture"],
};

const cityOptions = Object.keys(CITY_TRANSPORT);

const initialForm = {
  title: "",
  city: "Tunis",
  address: "",
  latitude: "",
  longitude: "",
  durationMinutes: 60,
  category: "Culture",
  summary: "",
  budgetEstimate: "",
  transportOptions: CITY_TRANSPORT.Tunis.join(", "),
  imageUrl: "",
};

const initialUserForm = {
  fullName: "",
  email: "",
  password: "",
  role: "participant",
};

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [overview, setOverview] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [participantFilter, setParticipantFilter] = useState("");
  const [tab, setTab] = useState("activities");
  const [form, setForm] = useState(initialForm);
  const [editingActivityId, setEditingActivityId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [userForm, setUserForm] = useState(initialUserForm);
  const [savingUser, setSavingUser] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const loadDashboard = async () => {
    const [overviewRes, activitiesRes, usersRes] = await Promise.all([
      http.get("/admin/overview"),
      http.get("/activities"),
      http.get("/admin/users"),
    ]);
    setOverview(overviewRes.data);
    setActivities(activitiesRes.data);
    setUsers(usersRes.data.users || []);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const saveActivity = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (editingActivityId) {
        await http.put(`/admin/activities/${editingActivityId}`, form);
      } else {
        await http.post("/admin/activities", form);
      }
      setForm(initialForm);
      setEditingActivityId(null);
      setModalOpen(false);
      await loadDashboard();
      setSuccess(editingActivityId ? "Activite modifiee avec succes." : "Activite ajoutee avec succes.");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          (editingActivityId
            ? "Impossible de modifier cette activite."
            : "Impossible de creer cette activite.")
      );
    } finally {
      setSaving(false);
    }
  };

  const startEditActivity = (activity) => {
    setError("");
    setSuccess("");
    setTab("activities");
    setEditingActivityId(activity.id);
    setModalOpen(true);
    setForm({
      title: activity.title || "",
      city: activity.city || "Tunis",
      address: activity.address || "",
      latitude: activity.latitude ?? "",
      longitude: activity.longitude ?? "",
      durationMinutes: Number(activity.durationMinutes || 60),
      category: activity.category || "Culture",
      summary: activity.summary || "",
      budgetEstimate: activity.budgetEstimate ?? "",
      transportOptions: activity.transportOptions || (CITY_TRANSPORT[activity.city] || ["Taxi", "Bus"]).join(", "),
      imageUrl: activity.imageUrl || "",
    });
  };

  const cancelEditActivity = () => {
    setEditingActivityId(null);
    setForm(initialForm);
    setModalOpen(false);
  };

  const createUser = async (event) => {
    event.preventDefault();
    setSavingUser(true);
    setError("");
    setSuccess("");
    try {
      await http.post("/admin/users", userForm);
      setUserForm(initialUserForm);
      await loadDashboard();
      setSuccess("Utilisateur cree avec succes.");
      setTab("users");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de creer cet utilisateur.");
    } finally {
      setSavingUser(false);
    }
  };

  const deleteActivity = async (id, title) => {
    if (!window.confirm(`Supprimer l'activité « ${title} » ? Cette action est irréversible.`)) return;
    await http.delete(`/admin/activities/${id}`);
    loadDashboard();
  };

  const onCityChange = (city) => {
    setForm((prev) => ({
      ...prev,
      city,
      transportOptions: (CITY_TRANSPORT[city] || ["Taxi", "Bus"]).join(", "),
    }));
  };

  const filteredParticipants = users.filter((entry) => {
    if (entry.role !== "participant") return false;
    const needle = participantFilter.trim().toLowerCase();
    if (!needle) return true;
    return (
      entry.fullName.toLowerCase().includes(needle) ||
      entry.email.toLowerCase().includes(needle)
    );
  });

  const admins = users.filter((entry) => entry.role === "admin");

  const stats = [
    {
      label: "Utilisateurs totaux",
      value: overview?.totalUsers ?? "—",
      Icon: Users,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
      border: "border-t-indigo-500",
    },
    {
      label: "Participants",
      value: overview?.totalParticipants ?? "—",
      Icon: Activity,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      border: "border-t-emerald-500",
    },
    {
      label: "Activités",
      value: overview?.totalActivities ?? "—",
      Icon: LayoutGrid,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      border: "border-t-violet-500",
    },
    {
      label: "Administrateurs",
      value: overview ? overview.totalUsers - overview.totalParticipants : "—",
      Icon: ShieldCheck,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      border: "border-t-amber-500",
    },
  ];

  const tabs = [
    { id: "activities", label: "Activités", Icon: ListChecks },
    { id: "users", label: "Participants", Icon: Users },
    { id: "createUser", label: "Nouvel utilisateur", Icon: UserPlus },
  ];

  const fieldClass =
    "w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-colors";
  const labelClass = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

  const initials = (name = "") =>
    name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const avatarColors = [
    "bg-indigo-100 text-indigo-600",
    "bg-violet-100 text-violet-600",
    "bg-emerald-100 text-emerald-600",
    "bg-rose-100 text-rose-600",
    "bg-amber-100 text-amber-600",
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-[72px] flex">
      {/* ── Sidebar ─────────────────────────────────── */}
      <aside className="w-60 shrink-0 bg-[#0F172A] min-h-[calc(100vh-72px)] sticky top-[72px] flex flex-col self-start">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow">
              <ShieldCheck size={15} className="text-white" />
            </div>
            <div>
              <p className="text-white text-sm font-bold leading-none">Admin Panel</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Free Time Optimizer</p>
            </div>
          </div>
        </div>

        {/* Overview counters */}
        <div className="px-4 py-4 grid grid-cols-2 gap-2 border-b border-white/10">
          <div className="bg-white/5 rounded-lg p-2.5 text-center">
            <p className="text-white font-bold text-lg leading-none">{overview?.totalActivities ?? "—"}</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Activités</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2.5 text-center">
            <p className="text-white font-bold text-lg leading-none">{overview?.totalParticipants ?? "—"}</p>
            <p className="text-slate-400 text-[10px] mt-0.5">Participants</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                tab === id
                  ? "bg-indigo-500 text-white shadow-md shadow-indigo-900/30"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-indigo-300 text-xs font-bold">{initials(user?.fullName)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold leading-none truncate">{user?.fullName}</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Administrateur</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-2 text-slate-400 hover:text-red-400 text-xs font-medium px-2.5 py-2 rounded-lg hover:bg-white/5 transition-all"
          >
            <LogOut size={13} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────── */}
      <main className="flex-1 min-w-0">
        {/* Page header bar */}
        <div className="bg-white border-b border-slate-200 px-7 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-none">
              {tab === "activities" && "Gestion des activités"}
              {tab === "users" && "Gestion des participants"}
              {tab === "createUser" && "Créer un utilisateur"}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          {tab === "activities" && (
            <button
              type="button"
              onClick={() => { setEditingActivityId(null); setForm(initialForm); setError(""); setSuccess(""); setModalOpen(true); }}
              className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <PlusCircle size={15} />
              Nouvelle activité
            </button>
          )}
          {tab === "createUser" && (
            <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-3 py-1 rounded-full border border-indigo-200">
              Admin &amp; Participant
            </span>
          )}
        </div>

        <div className="px-7 py-6 space-y-5">
          {/* ── Stat cards ── */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, Icon, iconBg, iconColor, border }) => (
              <div
                key={label}
                className={`bg-white rounded-xl border border-slate-200 border-t-2 ${border} p-5 shadow-sm`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
                    <p className="text-slate-900 text-2xl font-bold mt-1">{value}</p>
                  </div>
                  <div className={`${iconBg} ${iconColor} w-9 h-9 rounded-lg flex items-center justify-center`}>
                    <Icon size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Alerts ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm text-red-700">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-sm text-emerald-700">
              <CheckCircle size={15} className="shrink-0" />
              {success}
            </div>
          )}

          {/* ══════════════════ ACTIVITY MODAL ══════════════════ */}
          {modalOpen && (
            <div
              className="fixed inset-0 z-50 flex"
              role="dialog"
              aria-modal="true"
            >
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                onClick={cancelEditActivity}
              />

              {/* Slide-over panel */}
              <div className="relative ml-auto h-full w-full max-w-xl bg-white shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white shrink-0">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      {editingActivityId
                        ? <Pencil size={14} className="text-indigo-500" />
                        : <PlusCircle size={14} className="text-indigo-500" />}
                    </div>
                    <div>
                      <h2 className="font-semibold text-slate-900 text-sm leading-none">
                        {editingActivityId ? "Modifier l'activité" : "Nouvelle activité"}
                      </h2>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        {editingActivityId ? "Mettez à jour les informations" : "Remplissez le formulaire ci-dessous"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={cancelEditActivity}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Scrollable body */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-2 text-sm text-red-700">
                      <AlertCircle size={14} className="shrink-0" />{error}
                    </div>
                  )}

                  <form id="activity-form" onSubmit={saveActivity} className="grid grid-cols-2 gap-4">
                    {/* Titre */}
                    <div className="col-span-2">
                      <label className={labelClass}>Titre de l'activité <span className="text-red-400">*</span></label>
                      <input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required placeholder="Ex: Visite de la Médina" className={fieldClass} />
                    </div>

                    {/* Ville / Catégorie */}
                    <div>
                      <label className={labelClass}>Ville <span className="text-red-400">*</span></label>
                      <select value={form.city} onChange={(e) => onCityChange(e.target.value)} className={fieldClass}>
                        {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Catégorie <span className="text-red-400">*</span></label>
                      <input type="text" value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} required placeholder="Culture, Détente…" className={fieldClass} />
                    </div>

                    {/* Adresse */}
                    <div className="col-span-2">
                      <label className={labelClass}>Adresse</label>
                      <input type="text" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} placeholder="Ex: Médina de Tunis" className={fieldClass} />
                    </div>

                    {/* Lat / Lng */}
                    <div>
                      <label className={labelClass}>Latitude</label>
                      <input type="number" step="0.0000001" value={form.latitude} onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))} placeholder="36.8529" className={fieldClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Longitude</label>
                      <input type="number" step="0.0000001" value={form.longitude} onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))} placeholder="10.3231" className={fieldClass} />
                    </div>

                    {/* Duration / Budget */}
                    <div>
                      <label className={labelClass}>Durée (min) <span className="text-red-400">*</span></label>
                      <input type="number" min="15" value={form.durationMinutes} onChange={(e) => setForm((p) => ({ ...p, durationMinutes: Number(e.target.value) }))} required className={fieldClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Budget estimé (TND)</label>
                      <input type="number" min="0" step="0.01" value={form.budgetEstimate} onChange={(e) => setForm((p) => ({ ...p, budgetEstimate: e.target.value }))} placeholder="35.00" className={fieldClass} />
                    </div>

                    {/* Transport */}
                    <div className="col-span-2">
                      <label className={labelClass}>
                        Transports recommandés
                        <span className="ml-1.5 normal-case font-normal text-slate-400 tracking-normal">(auto-rempli par ville)</span>
                      </label>
                      <div className="relative">
                        <textarea rows={2} value={form.transportOptions} onChange={(e) => setForm((p) => ({ ...p, transportOptions: e.target.value }))} placeholder="Taxi, Bus, Métro léger" className={`${fieldClass} resize-none pr-16`} />
                        <span className="absolute right-3 top-2.5 flex items-center gap-1 text-slate-300">
                          <Car size={11} /><Train size={11} /><Bus size={11} /><Bike size={11} />
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-2">
                      <label className={labelClass}>Description <span className="text-red-400">*</span></label>
                      <textarea value={form.summary} onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))} required rows={4} placeholder="Décrivez l'activité en quelques phrases…" className={`${fieldClass} resize-none`} />
                    </div>

                    {/* Image URL */}
                    <div className="col-span-2">
                      <label className={labelClass}>URL de l'image</label>
                      <input type="url" value={form.imageUrl} onChange={(e) => setForm((p) => ({ ...p, imageUrl: e.target.value }))} placeholder="https://images.unsplash.com/…" className={fieldClass} />
                      {form.imageUrl && (
                        <img src={form.imageUrl} alt="aperçu" className="mt-2 w-full h-28 object-cover rounded-lg border border-slate-200" onError={(e) => { e.target.style.display = 'none'; }} />
                      )}
                    </div>
                  </form>
                </div>

                {/* Footer actions */}
                <div className="shrink-0 px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center gap-3">
                  <button
                    type="submit"
                    form="activity-form"
                    disabled={saving}
                    className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    {saving ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Enregistrement…
                      </>
                    ) : editingActivityId ? (
                      <><CheckCircle size={14} /> Sauvegarder</>
                    ) : (
                      <><PlusCircle size={14} /> Créer l'activité</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditActivity}
                    className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-600 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 transition-colors text-sm"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════ ACTIVITIES TAB ══════════════════ */}
          {tab === "activities" && (
            <>

              {/* Activity cards grid */}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">{activities.length} activité{activities.length !== 1 ? "s" : ""}</p>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {activities.map((item) => (
                    <article key={item.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div className="relative">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-32 object-cover" />
                        ) : (
                          <div className="w-full h-32 bg-slate-100 flex items-center justify-center">
                            <LayoutGrid size={24} className="text-slate-300" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-slate-200">
                          {item.category}
                        </span>
                        {/* Edit/Delete overlay */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => startEditActivity(item)} className="w-7 h-7 bg-white rounded-md shadow flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors border border-slate-200" title="Modifier">
                            <Pencil size={12} />
                          </button>
                          <button type="button" onClick={() => deleteActivity(item.id, item.title)} className="w-7 h-7 bg-white rounded-md shadow flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border border-slate-200" title="Supprimer">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1 truncate">{item.title}</h4>
                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-2 mb-3">{item.summary}</p>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            <MapPin size={10} className="text-indigo-400" />{item.city}
                          </span>
                          <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                            <Clock size={10} className="text-indigo-400" />{item.durationMinutes} min
                          </span>
                          {item.budgetEstimate !== null && item.budgetEstimate !== undefined && (
                            <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-medium px-2 py-0.5 rounded-md">
                              {Number(item.budgetEstimate).toFixed(0)} TND
                            </span>
                          )}
                        </div>

                        {item.address && (
                          <p className="text-[11px] text-slate-400 truncate">{item.address}</p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ══════════════════ USERS TAB ══════════════════ */}
          {tab === "users" && (
            <div className="grid lg:grid-cols-3 gap-5">
              {/* Participants table */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Users size={15} className="text-indigo-500" />
                    Participants <span className="ml-1 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{filteredParticipants.length}</span>
                  </h2>
                  <input
                    value={participantFilter}
                    onChange={(e) => setParticipantFilter(e.target.value)}
                    placeholder="Rechercher…"
                    className="w-full sm:w-52 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-6 py-3">Participant</th>
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Email</th>
                        <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide px-4 py-3">Inscrit le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredParticipants.map((entry, idx) => (
                        <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                                {initials(entry.fullName)}
                              </div>
                              <span className="font-medium text-slate-800">{entry.fullName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{entry.email}</td>
                          <td className="px-4 py-3 text-slate-400 text-xs">
                            {new Date(entry.createdAt).toLocaleDateString("fr-FR")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredParticipants.length === 0 && (
                    <div className="px-6 py-10 text-center text-slate-400 text-sm">Aucun participant trouvé.</div>
                  )}
                </div>
              </div>

              {/* Admins panel */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-amber-500" />
                  <h2 className="font-semibold text-slate-800">Administrateurs</h2>
                  <span className="ml-auto text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{admins.length}</span>
                </div>
                <ul className="divide-y divide-slate-100">
                  {admins.map((entry, idx) => (
                    <li key={entry.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColors[idx % avatarColors.length]}`}>
                        {initials(entry.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{entry.fullName}</p>
                        <p className="text-xs text-slate-400 truncate">{entry.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* ══════════════════ CREATE USER TAB ══════════════════ */}
          {tab === "createUser" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden max-w-2xl">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                <UserPlus size={15} className="text-indigo-500" />
                <h2 className="font-semibold text-slate-800">Créer un compte</h2>
              </div>

              <form onSubmit={createUser} className="p-6 grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nom complet</label>
                  <input type="text" value={userForm.fullName} onChange={(e) => setUserForm((prev) => ({ ...prev, fullName: e.target.value }))} required placeholder="Prénom Nom" className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Adresse email</label>
                  <input type="email" value={userForm.email} onChange={(e) => setUserForm((prev) => ({ ...prev, email: e.target.value }))} required placeholder="exemple@email.com" className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Mot de passe</label>
                  <input type="password" value={userForm.password} onChange={(e) => setUserForm((prev) => ({ ...prev, password: e.target.value }))} required minLength={8} placeholder="Min. 8 caractères" className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Rôle</label>
                  <select value={userForm.role} onChange={(e) => setUserForm((prev) => ({ ...prev, role: e.target.value }))} className={fieldClass}>
                    <option value="participant">Participant</option>
                    <option value="admin">Administrateur</option>
                  </select>
                </div>

                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    disabled={savingUser}
                    className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm text-sm"
                  >
                    {savingUser ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Création en cours…
                      </>
                    ) : (
                      <><UserPlus size={14} /> Créer le compte</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

