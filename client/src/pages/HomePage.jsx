import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Sparkles,
  MapPin,
  CloudRain,
  Car,
  Heart,
  Clock,
  Globe,
  Shield,
  ChevronDown,
  Star,
  TrendingUp,
  Users,
  Award,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════ */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      {/* Layered overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-[#0F172A]/90" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

      {/* Decorative blur blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/95 border border-white/20 rounded-full px-5 py-2 text-sm font-medium mb-8 shadow-lg">
          <span className="text-indigo-400 text-base">✦</span>
          Conçu pour les voyageurs d&apos;affaires en Tunisie
          <sup className="text-[10px] font-black ml-0.5">TN</sup>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-5xl md:text-[72px] font-bold text-white leading-[1.02] mb-6 tracking-tight">
          Transformez vos{" "}
          <span className="relative">
            <span className="text-indigo-300 italic">temps morts</span>
            <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-400/40 rounded-full" />
          </span>
          <br />
          en moments précieux
        </h1>

        {/* Subtitle */}
        <p className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
          Notre IA analyse votre agenda et vous suggère des micro-expériences sur mesure
          à <span className="text-white font-medium">Tunis, Sousse, Sfax</span> ou{" "}
          <span className="text-white font-medium">Djerba</span> — selon la météo, le
          trafic et vos envies.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-16">
          <Link
            to="/register"
            className="group bg-indigo-500 text-white font-bold px-9 py-4 rounded-full hover:bg-indigo-600 transition-all hover:scale-105 shadow-xl shadow-indigo-500/25 text-[15px]"
          >
            Optimiser mon prochain voyage
            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
          </Link>
          <a
            href="#demo"
            className="text-white/85 font-semibold hover:text-indigo-300 transition-colors text-[15px] flex items-center gap-2 border border-white/20 rounded-full px-7 py-4 hover:border-indigo-400/40 hover:bg-white/5 backdrop-blur-sm"
          >
            Voir une démo
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          {[
            { icon: "🏆", label: "Top App Bleisure 2025" },
            { icon: "🔒", label: "Données 100% privées" },
            { icon: "⚡", label: "Suggestions en 3 sec" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-white/60 text-sm"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
        <ChevronDown size={24} />
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   STATS BAR
══════════════════════════════════════════════════════════════ */
function StatsBar() {
  const stats = [
    { icon: Users, value: "12 000+", label: "voyageurs actifs" },
    { icon: MapPin, value: "180+", label: "expériences disponibles" },
    { icon: TrendingUp, value: "94 %", label: "de satisfaction" },
    { icon: Award, value: "7 villes", label: "tunisiennes couvertes" },
  ];

  return (
    <section className="bg-slate-900 py-10 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="text-center">
            <Icon className="text-indigo-400 mx-auto mb-2" size={20} />
            <p className="font-serif text-3xl font-bold text-white">{value}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   HOW IT WORKS
══════════════════════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      Icon: Calendar,
      number: "01",
      color: "from-indigo-600 to-indigo-800",
      badge: "2 minutes",
      badgeColor: "bg-indigo-50 text-indigo-600",
      title: "Synchronisez votre agenda",
      description:
        "Connectez votre calendrier en un clic — sans partager le contenu de vos réunions.",
      actions: [
        {
          icon: "🔗",
          label: "Connectez votre calendrier",
          detail: "Google Calendar, Outlook ou Apple Calendar",
        },
        {
          icon: "🔍",
          label: "Nous détectons vos créneaux libres",
          detail: "Uniquement les plages sans rendez-vous",
        },
        {
          icon: "📍",
          label: "Indiquez votre ville du jour",
          detail: "Tunis, Sousse, Sfax, Djerba…",
        },
      ],
      tip: "Pas de calendrier ? Entrez manuellement votre créneau et votre ville.",
    },
    {
      Icon: Sparkles,
      number: "02",
      color: "from-[#B85A10] to-[#8A3E08]",
      badge: "Instantané",
      badgeColor: "bg-[#B85A10]/10 text-[#B85A10]",
      title: "Recevez des suggestions personnalisées",
      description:
        "Notre IA analyse 4 facteurs en temps réel pour vous proposer les expériences idéales.",
      actions: [
        {
          icon: "🌤",
          label: "Météo en temps réel",
          detail: "Intérieur si pluie, extérieur si soleil",
        },
        {
          icon: "🚗",
          label: "Trafic & distance calculés",
          detail: "Seules les activités accessibles dans votre créneau",
        },
        {
          icon: "❤️",
          label: "Vos préférences apprises",
          detail: "Musées, sport, gastronomie, shopping…",
        },
      ],
      tip: "Chaque suggestion inclut durée totale (trajet + visite) pour ne jamais être en retard.",
    },
    {
      Icon: MapPin,
      number: "03",
      color: "from-[#1A6B4A] to-[#0F4A32]",
      badge: "1 tap",
      badgeColor: "bg-[#1A6B4A]/10 text-[#1A6B4A]",
      title: "Réservez & vivez l'instant",
      description:
        "Un seul tap suffit. L'app gère tout le reste : itinéraire, horaires, rappel de départ.",
      actions: [
        {
          icon: "✅",
          label: "Sélectionnez une activité",
          detail: "Appuyez sur « Réserver » ou « Y aller »",
        },
        {
          icon: "🗺",
          label: "Suivez l'itinéraire pas à pas",
          detail: "Navigation GPS intégrée jusqu'au lieu",
        },
        {
          icon: "⏰",
          label: "Rappel automatique de départ",
          detail: "Alerte pour rentrer à temps à votre réunion",
        },
      ],
      tip: "Vous pouvez annuler ou changer d'activité à tout moment sans pénalité.",
    },
  ];

  return (
    <section id="how" className="bg-slate-50 py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block text-xs font-black text-indigo-500 tracking-[3px] uppercase mb-4">
            Comment ça marche
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Une expérience pensée
            <br />
            pour les agendas chargés
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mt-4">
            Trois étapes simples pour redécouvrir chaque ville tunisienne où le travail vous emmène.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line on desktop */}
          <div className="hidden md:block absolute top-14 left-[calc(16.7%+32px)] right-[calc(16.7%+32px)] h-px bg-gradient-to-r from-indigo-200 via-indigo-300 to-emerald-200" />

          {steps.map(({ Icon, number, title, description, color, badge, badgeColor, actions, tip }) => (
            <article
              key={number}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
            >
              {/* Card header */}
              <div className="p-8 pb-5">
                <div className="flex items-start justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg flex-shrink-0`}
                  >
                    <Icon className="text-white" size={24} />
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-serif text-5xl font-bold text-slate-100 select-none leading-none">
                      {number}
                    </span>
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide ${badgeColor}`}>
                      {badge}
                    </span>
                  </div>
                </div>
                <h3 className="font-serif text-xl font-bold text-slate-900 mb-2 leading-snug">
                  {title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-8" />

              {/* Action steps */}
              <div className="px-8 py-5 flex-1 space-y-3.5">
                {actions.map(({ icon, label, detail }) => (
                  <div key={label} className="flex items-start gap-3">
                    <span className="text-lg leading-none mt-0.5 flex-shrink-0">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tip footer */}
              <div className="mx-8 mb-8 mt-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <span className="font-bold text-indigo-500">💡 Bon à savoir : </span>
                  {tip}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* CTA below steps */}
        <div className="text-center mt-14">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-indigo-500 text-white font-bold px-8 py-4 rounded-full hover:bg-indigo-600 transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 text-[15px]"
          >
            Essayer gratuitement — 30 jours
            <span className="ml-1">→</span>
          </Link>
          <p className="text-slate-400 text-sm mt-3">Aucune carte bancaire requise · Annulation à tout moment</p>
        </div>
      </div>
    </section>
  );
}
/* ══════════════════════════════════════════════════════════════
   DEMO
══════════════════════════════════════════════════════════════ */
const SCHEDULE = [
  { time: "09:00", label: "Réunion client — Banque de Tunisie", free: false },
  {
    time: "10:30",
    label: "Créneau libre détecté · 1h45",
    note: "3 expériences suggérées",
    free: true,
  },
  { time: "12:15", label: "Déjeuner — Hôtel Laico Tunis", free: false },
];

const SUGGESTIONS = [
  {
    img: "https://images.unsplash.com/photo-1576502200916-3808e07386a5?auto=format&fit=crop&w=400&q=80",
    category: "PATRIMOINE",
    title: "Site archéologique de Carthage",
    travel: "12 min en taxi",
    duration: "1h",
    rating: 4.8,
    badge: "Populaire",
  },
  {
    img: "https://images.unsplash.com/photo-1590523278191-995cbcda646b?auto=format&fit=crop&w=400&q=80",
    category: "CULTURE",
    title: "Médina & Souk El Attarine",
    travel: "6 min à pied",
    duration: "45 min",
    rating: 4.9,
    badge: "Coup de cœur",
  },
  {
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=400&q=80",
    category: "DÉTENTE",
    title: "Sidi Bou Saïd panoramique",
    travel: "18 min en taxi",
    duration: "1h15",
    rating: 4.7,
    badge: null,
  },
];

function DemoSection() {
  const [selected, setSelected] = useState(0);

  return (
    <section id="demo" className="bg-cream-dark py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-crimson tracking-[3px] uppercase mb-4">
            Démo interactive
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#1A0505] leading-tight">
            Voyez votre journée
            <br />
            transformée
          </h2>
          <p className="text-[#6B3A3A] text-lg max-w-2xl mx-auto mt-4">
            Mardi matin à Tunis. 1h45 entre deux rendez-vous.
            Voici ce que Free Time Optimizer vous propose.
          </p>
        </div>

        <div className="grid md:grid-cols-[380px_1fr] gap-8 items-start">
          {/* Calendar */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-cream-dark sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black text-[#9A6A6A] tracking-[3px] uppercase">MARDI</p>
                <h3 className="font-serif text-2xl font-bold text-[#1A0505]">14 mai · Tunis</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl">☁️</p>
                <p className="text-sm font-bold text-[#6B3A3A]">26°C</p>
              </div>
            </div>

            <div className="space-y-2.5">
              {SCHEDULE.map((item) => (
                <button
                  key={item.time}
                  type="button"
                  onClick={() => item.free && setSelected(0)}
                  className={`w-full text-left rounded-2xl px-4 py-3.5 transition-all ${
                    item.free
                      ? "bg-gradient-to-r from-[#FEF3E2] to-[#FDE8C0] border-2 border-dashed border-gold/60 shadow-sm cursor-pointer hover:shadow-md"
                      : "bg-cream border border-cream-darker cursor-default"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold tabular-nums ${item.free ? "text-gold" : "text-[#9A6A6A]"}`}>
                      {item.time}
                    </span>
                    <span className={`text-sm ${item.free ? "text-crimson font-bold" : "text-[#1A0505] font-medium"}`}>
                      {item.label}
                    </span>
                  </div>
                  {item.note && (
                    <p className="text-xs text-gold-dark mt-1 ml-10 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gold rounded-full" />
                      {item.note}
                    </p>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-5 p-3.5 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-xs text-crimson font-semibold text-center">
                ✦ Créneau 10:30 → 12:15 sélectionné
              </p>
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-semibold text-[#6B3A3A]">
                Suggestions pour{" "}
                <span className="text-[#1A0505] font-bold">10:30 → 12:15</span>
              </p>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-full border border-indigo-100">
                3 résultats
              </span>
            </div>

            <div className="space-y-4">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`w-full text-left bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex ${
                    selected === i
                      ? "border-crimson shadow-lg shadow-crimson/10 ring-1 ring-crimson/20"
                      : "border-cream-dark hover:shadow-md hover:border-cream-darker"
                  }`}
                >
                  <img
                    src={s.img}
                    alt={s.title}
                    className="w-24 h-full object-cover flex-shrink-0"
                    style={{ minHeight: "88px" }}
                  />
                  <div className="flex-1 p-4 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-black text-gold tracking-[2px] uppercase mb-0.5">
                          {s.category}
                        </p>
                        <h4 className="font-serif text-[15px] font-bold text-[#1A0505] leading-snug">
                          {s.title}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1">
                        <Star size={12} className="text-gold fill-gold" />
                        <span className="text-sm font-bold text-[#1A0505]">{s.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#6B3A3A]">
                      <span className="flex items-center gap-1">📍 {s.travel}</span>
                      <span className="flex items-center gap-1">⏱ {s.duration}</span>
                      {s.badge && (
                        <span className="bg-gold/15 text-gold-dark font-bold px-2 py-0.5 rounded-full text-[10px]">
                          {s.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-5 bg-white rounded-2xl border border-cream-dark p-5">
              <p className="text-sm font-semibold text-[#1A0505] mb-2">
                ✦ Pourquoi cette suggestion ?
              </p>
              <p className="text-sm text-[#6B3A3A] leading-relaxed">
                {selected === 0
                  ? "Carthage est à 12 minutes de votre lieu de réunion. Avec 1h45, vous avez le temps d'explorer les ruines et rentrer confortablement."
                  : selected === 1
                  ? "La Médina est à 6 minutes à pied. Idéal pour une immersion culturelle rapide avant votre déjeuner."
                  : "Sidi Bou Saïd offre un cadre exceptionnel pour décompresser. Le trajet de 18 min est inclus dans votre créneau."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FEATURES
══════════════════════════════════════════════════════════════ */
function FeaturesSection() {
  const features = [
    {
      Icon: CloudRain,
      title: "Météo en temps réel",
      description:
        "Activités intérieures par temps de pluie, terrasses ensoleillées par beau temps. Toujours adapté.",
    },
    {
      Icon: Car,
      title: "Trafic & transports",
      description:
        "Calcul intelligent des trajets pour ne jamais manquer votre prochain rendez-vous.",
    },
    {
      Icon: Heart,
      title: "Préférences personnelles",
      description:
        "L'algorithme apprend vos goûts au fil du temps : musées, sport, gastronomie, shopping.",
    },
    {
      Icon: Clock,
      title: "Horaires garantis",
      description:
        "Seuls les lieux ouverts et accessibles dans votre fenêtre de temps vous sont proposés.",
    },
    {
      Icon: Globe,
      title: "Toute la Tunisie couverte",
      description:
        "De Tunis à Djerba, en passant par Sousse, Sfax, Hammamet, Monastir, Tozeur et Tabarka.",
    },
    {
      Icon: Shield,
      title: "Données privées",
      description:
        "Votre agenda reste chiffré et privé. Nous n'utilisons que les créneaux libres, jamais le contenu.",
    },
  ];

  return (
    <section
      id="features"
      className="py-28 px-4 relative overflow-hidden bg-slate-900"
    >
      {/* Decorative */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/3 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-indigo-400 tracking-[3px] uppercase mb-4">
            Fonctionnalités
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight">
            Chaque suggestion est le fruit
            <br />
            d&apos;une analyse complète en temps réel
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/10">
          {features.map(({ Icon, title, description }) => (
            <article
              key={title}
              className="bg-white/[0.03] hover:bg-white/[0.07] transition-colors duration-300 p-8 group"
            >
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 border border-indigo-400/20">
                <Icon className="text-indigo-400" size={20} />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2 leading-snug">{title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   TESTIMONIALS
══════════════════════════════════════════════════════════════ */
const TESTIMONIALS = [
  {
    name: "Mehdi Karoui",
    role: "Directeur commercial, Banque STB",
    city: "Tunis",
    quote:
      "Entre deux réunions au lac, j'ai découvert la Médina comme jamais. Free Time Optimizer a transformé mon voyage d'affaires.",
    avatar: "MK",
    color: "bg-indigo-500",
    stars: 5,
  },
  {
    name: "Salma Ben Youssef",
    role: "Consultante RH, Sfax",
    city: "Sfax",
    quote:
      "L'appli m'a suggéré le musée de Sfax pendant 90 minutes de créneau libre. Parfaitement calculé, je suis revenue pile à l'heure.",
    avatar: "SB",
    color: "bg-[#1A6B4A]",
    stars: 5,
  },
  {
    name: "Thomas Girard",
    role: "Ingénieur projet, Paris → Sousse",
    city: "Sousse",
    quote:
      "Je ne pensais pas visiter la médina de Sousse lors d'un déplacement de 2 jours. Free Time a rendu ça possible, sans stress.",
    avatar: "TG",
    color: "bg-[#B85A10]",
    stars: 5,
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="bg-slate-50 py-28 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block text-xs font-black text-indigo-500 tracking-[3px] uppercase mb-4">
            Témoignages
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Ce que disent nos voyageurs
          </h2>
          <p className="text-slate-500 text-lg max-w-xl mx-auto mt-4">
            Plus de 12 000 voyageurs d&apos;affaires ont déjà transformé leurs déplacements.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-7">
          {TESTIMONIALS.map(({ name, role, city, quote, avatar, color, stars }) => (
            <article
              key={name}
              className="bg-white rounded-2xl p-7 shadow-sm border border-slate-200 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex mb-4">
                {Array.from({ length: stars }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-[15px] leading-relaxed flex-1 mb-6 font-medium italic">
                &ldquo;{quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div
                  className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white text-sm font-black flex-shrink-0`}
                >
                  {avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{name}</p>
                  <p className="text-slate-400 text-xs">{role} · {city}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   FAQ
══════════════════════════════════════════════════════════════ */
const FAQS = [
  {
    q: "Est-ce que mes données d'agenda sont partagées ?",
    a: "Non. Nous lisons uniquement vos créneaux libres, jamais le contenu de vos réunions. Toutes les données sont chiffrées de bout en bout.",
  },
  {
    q: "Quelles villes tunisiennes sont couvertes ?",
    a: "Tunis, Sousse, Sfax, Djerba, Hammamet, Monastir, Tozeur et Tabarka. D'autres villes s'ajoutent régulièrement.",
  },
  {
    q: "Puis-je utiliser l'app sans connecter mon calendrier ?",
    a: "Oui ! Vous pouvez entrer manuellement votre créneau disponible et votre ville pour obtenir des suggestions instantanées.",
  },
  {
    q: "L'application est-elle disponible hors ligne ?",
    a: "Les suggestions téléchargées restent accessibles hors ligne. La géolocalisation nécessite une connexion.",
  },
  {
    q: "Y a-t-il une version entreprise pour les équipes ?",
    a: "Oui, nous proposons des licences entreprise avec tableau de bord RH, rapports d'usage et SSO. Contactez-nous pour un devis.",
  },
];

function FaqSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-slate-100 py-28 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14">
          <span className="inline-block text-xs font-black text-indigo-500 tracking-[3px] uppercase mb-4">
            FAQ
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map(({ q, a }, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className="font-semibold text-slate-900 text-[15px] pr-4">{q}</span>
                <ChevronDown
                  size={18}
                  className={`text-indigo-500 flex-shrink-0 transition-transform duration-200 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   CTA
══════════════════════════════════════════════════════════════ */
function CtaSection() {
  return (
    <section className="bg-slate-50 py-24 px-4">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-2xl p-12 md:p-16 text-center relative overflow-hidden bg-slate-900"
        >
          {/* Blobs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            <p className="text-indigo-400 text-sm font-black tracking-[3px] uppercase mb-4">
              Essai gratuit · 30 jours
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Votre prochain voyage
              <br />
              commence{" "}
              <span className="text-indigo-300 italic">maintenant</span>
            </h2>
            <p className="text-white/65 mb-10 text-lg">
              Aucune carte bancaire requise.
              <br />
              Configuration en moins de 2 minutes.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                to="/register"
                className="bg-indigo-500 text-white font-bold px-9 py-4 rounded-full hover:bg-indigo-600 transition-all hover:scale-105 shadow-xl shadow-indigo-500/25 text-[15px]"
              >
                Démarrer gratuitement →
              </Link>
              <Link
                to="/login"
                className="bg-white/10 text-white font-semibold px-8 py-4 rounded-full border border-white/20 hover:bg-white/20 transition-colors text-[15px]"
              >
                Déjà membre ? Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE EXPORT
══════════════════════════════════════════════════════════════ */
function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <HowItWorksSection />
      <DemoSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <CtaSection />
    </>
  );
}

export default HomePage;
