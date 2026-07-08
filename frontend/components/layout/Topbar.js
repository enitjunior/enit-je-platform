import { useRouter } from 'next/router';
import { useAuth } from '../../lib/auth';

const PAGE_TITLES = {
  '/admin/dashboard': 'Tableau de bord',
  '/admin/trainings': 'Gestion des formations',
  '/admin/proposals': 'Propositions de formations',
  '/admin/users':     'Membres',
  '/admin/progress':  'Vue d\'ensemble de la progression',
  '/member/dashboard': 'Mon tableau de bord',
  '/member/trainings': 'Formations disponibles',
  '/member/progress':  'Ma progression',
  '/member/proposals': 'Mes propositions',
};

export default function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const title = PAGE_TITLES[router.pathname] || 'Plateforme';

  const now = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        .je-search-input::placeholder {
          color: rgba(40, 55, 77, 0.45);
        }
      `}</style>
      <header className="fixed top-4 left-24 right-4 h-16 bg-white/70 backdrop-blur-md
                       border border-white/40 rounded-2xl shadow-lg z-20 flex items-center px-8 justify-between"
              style={{ fontFamily: "'Montserrat', sans-serif" }}>
        <div>
          <h1 className="font-bold text-navy-900" style={{ fontSize: 22, fontWeight: 700 }}>{title}</h1>
          <p className="text-slate-400 mt-0.5" style={{ fontSize: 13, fontWeight: 500 }}>{now}</p>
        </div>

        <div style={{ flex: 1, maxWidth: 520, margin: '0 32px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'rgba(40, 55, 77, 0.06)',
            border: '1px solid rgba(40, 55, 77, 0.08)',
            borderRadius: 999,
            padding: '12px 18px',
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#28374d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.55 }}>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>

            <input
              type="text"
              placeholder="Rechercher..."
              className="je-search-input"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 500,
                color: '#28374d',
              }}
            />

            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#28374d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.55 }}>
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <img src="/logo-enit-horizontal.png" alt="ENIT Junior Entreprise" style={{ height: 52, width: 'auto', objectFit: 'contain', flexShrink: 0 }} />
        </div>
      </header>
    </>
  );
}