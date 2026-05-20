import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MapPin, Clock, RefreshCw, LogOut, Compass, CloudSun, Wind, Droplets, Sparkles, Heart } from "lucide-react";
import http from "../api/http";
import { useAuth } from "../context/AuthContext";

const CITIES = ["Tunis", "Sousse", "Sfax", "Djerba", "Hammamet", "Monastir"];
const TIME_PRESETS = [
  { label: "30 min", value: 30 },
  { label: "1h", value: 60 },
  { label: "1h30", value: 90 },
  { label: "2h", value: 120 },
  { label: "3h+", value: 180 },
];
const CATEGORIES = ["", "Culture", "Patrimoine", "Detente", "Gastronomie", "Shopping", "Nature"];

function getWeatherBadges(activity, weather, returnForecast) {
  if (!weather?.current) return [];

  const current = weather.current;
  const forecast = returnForecast || weather.hourly?.[0] || null;
  const rainProb = forecast?.precipitationProbability ?? 0;
  const wind = Number(current.windKmh ?? 0);
  const temp = Number(current.temperatureC ?? 0);
  const category = (activity.category || "").toLowerCase();
  const isOutdoor = /(detente|nature|patrimoine|plein air|sport|balade)/.test(category);

  const badges = [];

  if (isOutdoor && rainProb < 25 && wind < 28 && temp >= 18 && temp <= 32) {
    badges.push({ text: "Ideal", className: "bg-emerald-50 text-emerald-700 border-emerald-200" });
  }
  if (rainProb >= 45) {
    badges.push({ text: `Pluie ${rainProb}%`, className: "bg-sky-50 text-sky-700 border-sky-200" });
  }
  if (wind >= 35) {
    badges.push({ text: `Vent ${Math.round(wind)} km/h`, className: "bg-amber-50 text-amber-700 border-amber-200" });
  }
  if (temp >= 34) {
    badges.push({ text: "Chaleur", className: "bg-red-50 text-red-700 border-red-200" });
  }
  if (badges.length === 0) {
    badges.push({ text: "Stable", className: "bg-slate-50 text-slate-700 border-slate-200" });
  }

  return badges.slice(0, 2);
}

function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const [searchParams] = useSearchParams();

  const [slotBanner, setSlotBanner] = useState("");

  const [filters, setFilters] = useState(() => ({
    city: "Tunis",
    availableMinutes: Number(searchParams.get("availableMinutes") || 120),
    category: "",
    maxBudget: "",
    maxDistanceKm: "",
    sortBy: "duration",
  }));
  const [recommendations, setRecommendations] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  const requestUserLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationError("Geolocalisation indisponible sur ce navigateur.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationError("");
      },
      () => {
        setLocationError("Autorisez la geolocalisation pour activer le filtre distance.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const loadWeather = async (city) => {
    setWeatherLoading(true);
    setWeatherError("");
    try {
      const response = await http.get("/weather/today", { params: { city } });
      setWeather(response.data);
    } catch (requestError) {
      setWeather(null);
      setWeatherError(requestError.response?.data?.message || "Meteo indisponible pour le moment.");
    } finally {
      setWeatherLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        userLat: userLocation?.latitude,
        userLng: userLocation?.longitude,
      };
      const response = await http.get("/activities/recommendations", { params });
      setRecommendations(response.data.recommendations);
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const res = await http.get("/participant/favorites");
      setFavoriteIds((res.data.favorites || []).map((item) => item.activityId));
    } catch {
      setFavoriteIds([]);
    }
  };

  const toggleFavorite = async (activityId) => {
    const isFavorite = favoriteIds.includes(activityId);
    try {
      if (isFavorite) {
        await http.delete(`/participant/favorites/${activityId}`);
        setFavoriteIds((prev) => prev.filter((id) => id !== activityId));
      } else {
        await http.post(`/participant/favorites/${activityId}`);
        setFavoriteIds((prev) => [...prev, activityId]);
      }
    } catch {
      // Intentionally silent to keep flow uninterrupted
    }
  };

  const markCompleted = async (activityId) => {
    try {
      await http.post("/participant/history", { activityId, action: "completed" });
    } catch {
      // Intentionally silent to keep flow uninterrupted
    }
  };

  useEffect(() => {
    loadRecommendations();
    loadFavorites();
  }, []);

  useEffect(() => {
    requestUserLocation();
  }, []);

  /* If arriving from AgendaPage, show the pre-filled slot banner */
  useEffect(() => {
    const start = searchParams.get("slotStart");
    const end   = searchParams.get("slotEnd");
    const mins  = searchParams.get("availableMinutes");
    if (start && end && mins) {
      setSlotBanner(`Créneau détecté depuis votre agenda : ${start} → ${end} (${mins} min)`);
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      loadRecommendations();
    }
  }, [userLocation]);

  useEffect(() => {
    loadWeather(filters.city);
  }, [filters.city]);

  const endTimeLabel = (() => {
    if (!weather?.current?.time) return null;
    const end = new Date(weather.current.time);
    end.setMinutes(end.getMinutes() + Number(filters.availableMinutes || 0));
    return end.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  })();

  const returnForecast = (() => {
    if (!weather?.hourly?.length || !weather?.current?.time) return null;
    const returnDate = new Date(weather.current.time);
    returnDate.setMinutes(returnDate.getMinutes() + Number(filters.availableMinutes || 0));
    let best = weather.hourly[0];
    let bestDelta = Number.POSITIVE_INFINITY;
    weather.hourly.forEach((slot) => {
      const delta = Math.abs(new Date(slot.time).getTime() - returnDate.getTime());
      if (delta < bestDelta) {
        bestDelta = delta;
        best = slot;
      }
    });
    return best;
  })();

  return (
    <div className="min-h-screen bg-slate-100 pt-[72px] flex">
      {/* ── Sidebar ── */}
      <aside className="w-72 shrink-0 bg-[#0F172A] min-h-[calc(100vh-72px)] sticky top-[72px] self-start flex flex-col overflow-y-auto">
        {/* User greeting */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-500/20 rounded-full flex items-center justify-center shrink-0">
              <span className="text-indigo-300 text-sm font-bold">
                {(user?.fullName || "?").split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">Bonjour, {user?.fullName?.split(" ")[0]}</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Planificateur bleisure</p>
            </div>
          </div>
        </div>

        {/* Session summary */}
        <div className="px-5 py-3 border-b border-white/10 bg-white/[0.03]">
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-semibold mb-1">Session</p>
          <p className="text-white text-xs">
            <span className="font-bold text-indigo-300">{filters.city}</span>
            <span className="text-slate-400"> · {filters.availableMinutes} min</span>
            {endTimeLabel && <span className="text-slate-500"> · retour {endTimeLabel}</span>}
          </p>
        </div>

        {/* Filters */}
        <div className="flex-1 px-4 py-5 space-y-5 overflow-y-auto">
          {/* Ville */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ville</p>
            <div className="flex flex-wrap gap-1.5">
              {CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, city }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    filters.city === city
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 bg-white/5 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Temps */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Temps disponible</p>
            <div className="flex flex-wrap gap-1.5">
              {TIME_PRESETS.map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFilters((p) => ({ ...p, availableMinutes: value }))}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
                    filters.availableMinutes === value
                      ? "bg-indigo-500 text-white"
                      : "text-slate-400 bg-white/5 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Clock size={9} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Catégorie */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Catégorie</p>
            <select
              value={filters.category}
              onChange={(e) => setFilters((p) => ({ ...p, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {CATEGORIES.map((category) => (
                <option key={category || "all"} value={category} className="bg-slate-800 text-white">
                  {category || "Toutes les catégories"}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Budget max (TND)</p>
            <input
              type="number"
              min="0"
              value={filters.maxBudget}
              onChange={(e) => setFilters((p) => ({ ...p, maxBudget: e.target.value }))}
              placeholder="Ex: 40"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Distance */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Distance max (km)</p>
            <input
              type="number"
              min="1"
              value={filters.maxDistanceKm}
              onChange={(e) => setFilters((p) => ({ ...p, maxDistanceKm: e.target.value }))}
              placeholder="Ex: 8"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
            <p className="text-[10px] text-slate-500 mt-1.5">
              {userLocation
                ? `📍 ${userLocation.latitude.toFixed(3)}, ${userLocation.longitude.toFixed(3)}`
                : locationError || "Position non détectée"}
            </p>
            <button
              type="button"
              onClick={requestUserLocation}
              className="mt-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Utiliser ma position
            </button>
          </div>

          {/* Trier */}
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Trier par</p>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters((p) => ({ ...p, sortBy: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="duration" className="bg-slate-800">Durée la plus courte</option>
              <option value="closest" className="bg-slate-800">Le plus proche</option>
              <option value="budget" className="bg-slate-800">Le moins cher</option>
            </select>
          </div>

          {/* Weather widget */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Météo live</p>
              <button
                type="button"
                onClick={() => loadWeather(filters.city)}
                className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Rafraîchir
              </button>
            </div>
            {weatherLoading && <p className="text-xs text-slate-400">Chargement…</p>}
            {!weatherLoading && weatherError && <p className="text-xs text-red-400">{weatherError}</p>}
            {!weatherLoading && weather && (
              <>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-white font-bold text-2xl leading-none">{Math.round(weather.current.temperatureC)}°C</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{weather.current.weatherText}</p>
                  </div>
                  <CloudSun size={22} className="text-amber-400" />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                    <p className="text-slate-500">Humidité</p>
                    <p className="text-slate-200 font-semibold flex items-center gap-1">
                      <Droplets size={10} className="text-indigo-400" />{weather.current.humidity}%
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg px-2.5 py-2">
                    <p className="text-slate-500">Vent</p>
                    <p className="text-slate-200 font-semibold flex items-center gap-1">
                      <Wind size={10} className="text-indigo-400" />{Math.round(weather.current.windKmh)} km/h
                    </p>
                  </div>
                </div>
                {returnForecast && (
                  <p className="text-[10px] text-slate-400 mt-2">
                    Retour {endTimeLabel}:{" "}
                    <span className="text-slate-300 font-medium">{Math.round(returnForecast.temperatureC)}°C · {returnForecast.weatherText}</span>
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex flex-col gap-1 mb-3">
            <Link to="/dashboard/agenda" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold transition-colors flex items-center gap-1.5">
              📅 Mon agenda
            </Link>
            <div className="flex items-center gap-3 flex-wrap mt-1">
              <Link to="/dashboard/profile" className="text-[11px] text-slate-400 hover:text-white transition-colors">Profil</Link>
              <span className="text-white/10 text-xs">·</span>
              <Link to="/dashboard/favorites" className="text-[11px] text-slate-400 hover:text-white transition-colors">Favoris</Link>
              <span className="text-white/10 text-xs">·</span>
              <Link to="/dashboard/history" className="text-[11px] text-slate-400 hover:text-white transition-colors">Historique</Link>
            </div>
          </div>
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
        {/* Page header bar */}
        <div className="bg-white border-b border-slate-200 px-7 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-slate-900 text-lg leading-none">Mes recommandations</h1>
            <p className="text-slate-400 text-xs mt-1">
              {filters.city} · {filters.availableMinutes} min disponibles{endTimeLabel ? ` · retour à ${endTimeLabel}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={loadRecommendations}
            className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Recherche…" : "Actualiser"}
          </button>
        </div>

        {/* Slot banner from agenda */}
        {slotBanner && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-7 py-2.5 flex items-center justify-between">
            <p className="text-xs font-semibold text-indigo-700 flex items-center gap-2">
              📅 {slotBanner}
            </p>
            <button
              type="button"
              onClick={() => setSlotBanner("")}
              className="text-indigo-400 hover:text-indigo-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Activity grid */}
        <div className="px-7 py-6">
          {loading && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <span className="inline-block w-7 h-7 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mb-3" />
              <p className="text-slate-400 text-sm">Recherche des meilleures expériences…</p>
            </div>
          )}

          {!loading && recommendations.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
              <p className="text-3xl mb-3">🧭</p>
              <p className="font-semibold text-slate-700 mb-1">Aucune activité disponible</p>
              <p className="text-sm text-slate-400">Essayez une autre ville ou un créneau plus long.</p>
            </div>
          )}

          {!loading && recommendations.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">
                {recommendations.length} activité{recommendations.length !== 1 ? "s" : ""} trouvée{recommendations.length !== 1 ? "s" : ""}
              </p>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {recommendations.map((item) => {
                  const weatherBadges = getWeatherBadges(item, weather, returnForecast);
                  const isFav = favoriteIds.includes(item.id);
                  return (
                    <article
                      key={item.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className="relative">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-36 object-cover" />
                        ) : (
                          <div className="w-full h-36 bg-slate-100 flex items-center justify-center">
                            <MapPin size={28} className="text-slate-300" />
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm text-slate-600 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border border-slate-200">
                          {item.category}
                        </span>
                        {weatherBadges.length > 0 && (
                          <span className={`absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${weatherBadges[0].className}`}>
                            {weatherBadges[0].text}
                          </span>
                        )}
                      </div>

                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 text-sm mb-1 leading-snug">{item.title}</h4>
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
                          {item.distanceKm !== null && item.distanceKm !== undefined && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                              <Compass size={10} className="text-indigo-400" />{Number(item.distanceKm).toFixed(1)} km
                            </span>
                          )}
                          {item.transportOptions && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-md">
                              <Sparkles size={10} className="text-indigo-400" />Transport
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => toggleFavorite(item.id)}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border transition-colors ${
                              isFav
                                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                          >
                            <Heart size={10} className={isFav ? "fill-rose-500 text-rose-500" : ""} />
                            {isFav ? "Favori" : "Ajouter"}
                          </button>
                          <button
                            type="button"
                            onClick={() => markCompleted(item.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 transition-colors"
                          >
                            ✓ Réalisée
                          </button>
                          <Link
                            to={`/dashboard/activity/${item.id}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border bg-slate-50 text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
                          >
                            Détails
                          </Link>
                          {item.latitude !== null && item.longitude !== null && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100 transition-colors"
                            >
                              Itinéraire
                            </a>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default ParticipantDashboard;
