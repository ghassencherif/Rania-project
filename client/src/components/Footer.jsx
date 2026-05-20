import { Link } from "react-router-dom";
import { MapPin, Mail, Globe, Share2, Send } from "lucide-react";

const CITIES = ["Tunis", "Sousse", "Sfax", "Djerba", "Hammamet", "Monastir", "Tozeur"];

export default function Footer() {
  return (
    <footer className="bg-[#0E0202] text-white/60">
      {/* Main footer */}
      <div className="max-w-6xl mx-auto px-4 pt-16 pb-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-crimson rounded-lg flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold fill-current">
                  <path d="M12 2L13.9 8.3H20.5L15.3 12.1L17.2 18.4L12 14.6L6.8 18.4L8.7 12.1L3.5 8.3H10.1L12 2Z" />
                </svg>
              </div>
              <span className="font-serif text-white font-bold text-lg leading-none">
                Free Time <span className="text-gold">Optimizer</span>
                <span className="text-[10px] font-black align-super text-crimson ml-0.5">TN</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">
              Transformez vos déplacements professionnels en expériences mémorables à travers la Tunisie.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-crimson/80 flex items-center justify-center transition-colors"
              >
                <Share2 size={14} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-crimson/80 flex items-center justify-center transition-colors"
              >
                <Globe size={14} />
              </a>
              <a
                href="#"
                aria-label="Contact"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-crimson/80 flex items-center justify-center transition-colors"
              >
                <Send size={14} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase text-xs">Produit</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: "Comment ça marche", href: "/#how" },
                { label: "Fonctionnalités", href: "/#features" },
                { label: "Témoignages", href: "/#testimonials" },
                { label: "Se connecter", href: "/login" },
                { label: "Créer un compte", href: "/register" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase text-xs">Villes</h4>
            <ul className="space-y-2.5 text-sm">
              {CITIES.map((city) => (
                <li key={city} className="flex items-center gap-1.5">
                  <MapPin size={11} className="text-crimson flex-shrink-0" />
                  <span>{city}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal / Contact */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 tracking-wide uppercase text-xs">Informations</h4>
            <ul className="space-y-2.5 text-sm mb-6">
              {[
                "Mentions légales",
                "Politique de confidentialité",
                "Conditions d'utilisation",
                "Accessibilité",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-gold transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="mailto:contact@freetime.tn"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-gold transition-colors"
            >
              <Mail size={13} />
              contact@freetime.tn
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/8 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/30">
          <p>© {new Date().getFullYear()} Free Time Optimizer TN. Tous droits réservés.</p>
          <p className="flex items-center gap-1">
            Conçu avec <span className="text-crimson text-base">♥</span> pour les bleisure travelers
          </p>
        </div>
      </div>
    </footer>
  );
}
