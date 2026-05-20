import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { href: "#how", label: "Comment ça marche" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#demo", label: "Démo" },
  { href: "#testimonials", label: "Témoignages" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
      <div className="w-9 h-9 rounded-xl bg-crimson flex items-center justify-center flex-shrink-0 shadow-md shadow-crimson/30">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="8" stroke="#D4A017" strokeWidth="1.5" fill="none" />
          <circle cx="12" cy="12" r="3.5" fill="none" stroke="#D4A017" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="1.2" fill="#D4A017" />
          <line x1="12" y1="4" x2="12" y2="6.5" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="12" y1="17.5" x2="12" y2="20" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="4" y1="12" x2="6.5" y2="12" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="17.5" y1="12" x2="20" y2="12" stroke="#D4A017" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>
      <span className="font-serif text-[18px] leading-none">
        <span className="text-[#1A0505] font-bold">Free Time </span>
        <span className="text-gold italic font-bold">Optimizer</span>
        <sup className="text-crimson text-[9px] font-sans font-black ml-0.5 not-italic">TN</sup>
      </span>
    </Link>
  );
}

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardPath = user?.role === "admin" ? "/dashboard/admin" : "/dashboard/participant";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md shadow-md shadow-black/5 border-b border-cream-dark"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between py-4">
          <Logo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={`text-sm font-semibold transition-colors ${
                  scrolled ? "text-[#3A1010] hover:text-crimson" : "text-white/90 hover:text-gold"
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    scrolled
                      ? "text-crimson hover:bg-crimson/8"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Mon espace
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="bg-crimson text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-crimson-700 transition-all shadow-md shadow-crimson/25 hover:shadow-lg hover:shadow-crimson/35 hover:-translate-y-0.5"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-sm font-semibold px-4 py-2 rounded-full transition-all ${
                    scrolled
                      ? "text-crimson hover:bg-crimson/8"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="bg-crimson text-white text-sm font-bold px-5 py-2.5 rounded-full hover:bg-crimson-700 transition-all shadow-md shadow-crimson/25 hover:shadow-lg hover:shadow-crimson/35 hover:-translate-y-0.5"
                >
                  Commencer →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`md:hidden p-2 rounded-xl ${scrolled ? "text-crimson" : "text-white"}`}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white flex flex-col pt-20 px-6 pb-8 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="text-lg font-semibold text-[#1A0505] py-3 border-b border-cream-dark hover:text-crimson transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMenuOpen(false)}
                  className="text-center border border-crimson text-crimson font-bold py-3 rounded-full"
                >
                  Mon espace
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="text-center bg-crimson text-white font-bold py-3 rounded-full shadow-md shadow-crimson/25"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-center border border-crimson text-crimson font-bold py-3 rounded-full"
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="text-center bg-crimson text-white font-bold py-3 rounded-full shadow-md shadow-crimson/25"
                >
                  Commencer gratuitement →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
