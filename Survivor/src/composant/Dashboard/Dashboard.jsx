import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.scss';

function decodeJwt(token) {
    if (!token)
        return null;
    try {
        const payload = token.split('.')[1];
        const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

const SECTIONS = [
  { key: 'overview', label: 'Overview', icon: '📊', roles: ['admin'] },
  { key: 'events', label: 'Events', icon: '🗓️', roles: ['admin'], endpoint: '/event/get' },
  { key: 'startups', label: 'Startups', icon: '🚀', roles: ['admin'], endpoint: '/startup/get' },
  { key: 'investors', label: 'Investors', icon: '💼', roles: ['user','admin'], endpoint: '/investor/get' },
  { key: 'partners', label: 'Partners', icon: '🤝', roles: ['user','admin'], endpoint: '/partner/get' },
  { key: 'news', label: 'News', icon: '📰', roles: ['admin'], endpoint: '/news/get' },
  { key: 'users', label: 'Users', icon: '👥', roles: ['admin'], endpoint: '/user/get' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState('overview');
  const [dataCache, setDataCache] = useState({}); // { section: {items, error} }
  const [loadingSection, setLoadingSection] = useState(false);
  const redirectedRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);

    // // MODE DEV
    // useEffect(() => {
    //     if (user === null && checking) {
    //         setUser({
    //             id: 'dev-user',
    //             email: 'dev@example.com',
    //             role: 'admin', // mettre 'user' si tu veux tester sans droits admin
    //             raw: { dev: true }
    //         });
    //         setChecking(false);
    //     }
    // }, [user, checking]);

    // MODE USER
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Aucun token. Redirection...');
            redirectedRef.current = true;
            navigate('/Login', { replace: true });
            return;
        }
        const payload = decodeJwt(token);
        if (!payload) {
            setError('Token invalide.');
            localStorage.removeItem('token');
            navigate('/Login', { replace: true });
            return;
        }
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            setError('Session expirée.');
            localStorage.removeItem('token');
            navigate('/Login', { replace: true });
            return;
        }
        // Essayer de récupérer un user complet stocké par la page de login
        let storedUser = null;
        try { storedUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch { }
        const hydrated = {
            id: payload.id || payload.userId || payload.sub,
            email: payload.email || storedUser?.email || '(email inconnu)',
            name: payload.name || storedUser?.name || '',
            role: payload.role || storedUser?.role || 'user',
            raw: payload
        };
        setUser(hydrated);
        localStorage.setItem('user', JSON.stringify({ id: hydrated.id, email: hydrated.email, name: hydrated.name, role: hydrated.role }));
        setChecking(false);
    }, [navigate]);

    const loadSection = useCallback(async (key) => {
        const section = SECTIONS.find(s => s.key === key);
        if (!section || !section.endpoint)
            return;
        if (dataCache[key])
            return;
        setLoadingSection(true);
        try {
        // Support rétro-compatible si l'ancien nom de clé a été utilisé
        const legacy = localStorage.getItem('jwtToken');
        if (legacy && !localStorage.getItem('token')) {
          localStorage.setItem('token', legacy);
          localStorage.removeItem('jwtToken');
        }
        const token = localStorage.getItem('token');
            const res = await fetch(section.endpoint, { headers: token ? { Authorization: 'Bearer ' + token } : {} });
            if (!res.ok)
                throw new Error('HTTP ' + res.status);
            const items = await res.json();
            setDataCache(dc => ({ ...dc, [key]: { items: Array.isArray(items) ? items : (items.data || []), error: null } }));
        } catch (e) {
            setDataCache(dc => ({ ...dc, [key]: { items: [], error: e.message || 'Erreur de chargement' } }));
        } finally {
            setLoadingSection(false);
        }
    }, [dataCache]);

    // Précharger quelques compteurs une fois authentifié
    useEffect(() => {
        if (!checking && user) {
            ['events', 'startups', 'news'].forEach(k => loadSection(k));
            if (user.role === 'admin') loadSection('users');
        }
    }, [checking, user, loadSection]);

    // Sur changement d'onglet
    useEffect(() => {
        if (!checking) loadSection(active);
    }, [active, checking, loadSection]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    // if (checking) {
    //     return (
    //         <div className="dashboard-loading">
    //             Vérification du token...
    //             {error && <div style={{ marginTop: 12, fontSize: '.85rem', opacity: .8 }}>{error}</div>}
    //         </div>
    //     );
    // }

  const safeUser = user || { id: 'loading', email: '...', name: '', role: 'user', raw: {} };
  const accessibleSections = (safeUser ? SECTIONS.filter(s => s.roles.includes(safeUser.role)) : []);
  const current = dataCache[active];

  // ---- CRUD helpers (minimal) ----
  const basePathFromSection = (sectionKey) => {
    switch(sectionKey){
      case 'events': return '/event';
      case 'startups': return '/startup';
      case 'investors': return '/investor';
      case 'partners': return '/partner';
      case 'news': return '/news';
      case 'users': return '/user';
      default: return '';
    }
  };

  const openCreate = (sectionKey) => {
    // Placeholder – future modal form
    alert('Création non implémentée encore pour: ' + sectionKey);
  };

  const openEdit = (sectionKey, row) => {
    alert('Édition non implémentée encore. ID: ' + (row.id || 'n/a'));
  };

  const confirmDelete = async (sectionKey, row) => {
    if (!row || row.id == null) { alert('ID manquant'); return; }
    if (!window.confirm('Supprimer l\'élément #' + row.id + ' ?')) return;
    try {
      const token = localStorage.getItem('token');
      const base = basePathFromSection(sectionKey);
      if (!base) throw new Error('Section inconnue');
      const res = await fetch(`${base}/delete/${row.id}`, { method:'DELETE', headers: token ? { Authorization: 'Bearer ' + token } : {} });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      // Mise à jour locale du cache
      setDataCache(dc => {
        const cur = dc[sectionKey];
        if (!cur) return dc;
        return { ...dc, [sectionKey]: { ...cur, items: cur.items.filter(it => it.id !== row.id) } };
      });
    } catch(e){
      alert('Erreur suppression: ' + (e.message || e));
    }
  };

  const renderModal = () => null; // placeholder

  function renderSection() {
    if (active === 'users' && safeUser.role !== 'admin')
      return <div className="section-error">Forbidden.</div>;
    if (active === 'overview') {
      return (
        <div className="cards-grid">
          <div className="card">
            <h2>Profil</h2>
            <ul className="mini-info kv-list">
              <li><span className="k">ID</span><span className="v" title={safeUser.id}>{safeUser.id}</span></li>
              <li><span className="k">Name</span><span className="v" title={safeUser.name}>{safeUser.name}</span></li>
              <li><span className="k">Email</span><span className="v" title={safeUser.email}>{safeUser.email}</span></li>
              <li><span className="k">Role</span><span className="v">{safeUser.role}</span></li>
            </ul>
          </div>
          <div className="card">
            <h2>Count</h2>
            <ul className="mini-info kv-list">
              <li><span className="k">Events</span><span className="v">{dataCache.events?.items?.length ?? '—'}</span></li>
              <li><span className="k">Startups</span><span className="v">{dataCache.startups?.items?.length ?? '—'}</span></li>
              <li><span className="k">News</span><span className="v">{dataCache.news?.items?.length ?? '—'}</span></li>
              {safeUser.role === 'admin' && (
                <li><span className="k">Users</span><span className="v">{dataCache.users?.items?.length ?? '—'}</span></li>
              )}
            </ul>
          </div>
        </div>
      );
    }
    if (loadingSection && !current)
        return <div className="section-loading">Chargement...</div>;
    if (current?.error)
        return <div className="section-error">Erreur: {current.error}</div>;
    const list = current?.items || [];
    // Table columns heuristics
    const columns = computeColumns(active, list);
    return (
      <div className="table-wrapper">
        <div className="table-toolbar">
          <div className="ttl">
            {SECTIONS.find(s=>s.key===active)?.label} <span className="count-badge">{list.length}</span>
          </div>
          {safeUser.role === 'admin' && (
            <button className="btn primary" onClick={()=>openCreate(active)}>+ Ajouter</button>
          )}
        </div>
        {loadingSection && <div className="inline-loading">Mise à jour...</div>}
        {(!list.length && !loadingSection) && <div className="empty">Aucune donnée.</div>}
        {!!list.length && (
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  {columns.map(c=> <th key={c.key}>{c.label}</th>)}
                  {safeUser.role === 'admin' && <th style={{width:120}}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {list.slice(0,200).map((row,i)=> (
                  <tr key={row.id || row.uuid || i}>
                    {columns.map(c=> <td key={c.key}>{formatCell(c, row)}</td>)}
                    {safeUser.role === 'admin' && (
                      <td className="actions">
                        <button onClick={()=>openEdit(active, row)} className="btn sm">✏️</button>
                        <button onClick={()=>confirmDelete(active, row)} className="btn sm danger">🗑️</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {renderModal()}
      </div>
    );
  }

  return (
    <div className={`admin-dashboard ${menuOpen ? 'has-overlay' : ''}`}>
      {menuOpen && <div className="sidebar-overlay" onClick={()=>setMenuOpen(false)} aria-label="Fermer le menu" />}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand"><span>JEB Admin Panel</span><button className="close-btn" onClick={()=>setMenuOpen(false)} aria-label="Fermer le menu">✕</button></div>
        <div className="user-box" title={safeUser.email}>
          <div className="u-email">{safeUser.email}</div>
          <span className={`u-role role-${safeUser.role}`}>{safeUser.role}</span>
        </div>
        <nav className="nav-sections">
          <ul>
            {accessibleSections.map(sec => (
              <li key={sec.key}>
                <button
                  className={sec.key === active ? 'active' : ''}
                  onClick={() => setActive(sec.key)}
                >
                  <span className="ico" aria-hidden>{sec.icon}</span>
                  <span className="lbl">{sec.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button className="logout-btn-full" onClick={handleLogout}>Log out</button>
      </aside>
      <main className="main-panel">
        <header className="panel-header">
          <button className="menu-toggle" onClick={()=>setMenuOpen(m=>!m)} aria-label={menuOpen? 'Close menu' : 'Open menu'}>{menuOpen? '✕' : '☰'}</button>
          <h1>{SECTIONS.find(s=>s.key===active)?.label}</h1>
        </header>
        <div className="panel-content">{renderSection()}</div>
      </main>
    </div>
  );
}

// Helpers outside component (could be moved) ----
function computeColumns(sectionKey, list) {
  if (!list.length) return [ { key: 'id', label: 'ID' } ];
  const sample = list[0];
  const baseMap = {
    events: ['id','name','location','event_type','dates'],
    startups: ['id','name','email','sector','maturity'],
    investors: ['id','name','email','investor_type'],
    partners: ['id','name','email','partnership_type'],
    news: ['id','title','category','news_date'],
    users: ['id','name','email','role']
  };
  const wanted = baseMap[sectionKey] || Object.keys(sample).slice(0,5);
  return wanted.filter(k=>k in sample).map(k=>({ key: k, label: k.replace(/_/g,' ') }));
}

function formatCell(col, row){
  const val = row[col.key];
  if (val == null || val === '') return '—';
  if (typeof val === 'string' && val.length > 60) return val.slice(0,57)+'…';
  return String(val);
}

// Simple modal state (module scoped) – quick approach; in larger app use context or a modal component
let modalState = { open:false, mode:null, section:null, row:null };
let modalSubscribers = new Set();
function setModal(next){ modalState = { ...modalState, ...next }; modalSubscribers.forEach(fn=>fn(modalState)); }

// Hooks inside component rely on below; kept simple due to constraints.
