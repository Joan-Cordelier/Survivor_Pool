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
    { key: 'investors', label: 'Investors', icon: '💼', roles: ['user', 'admin'], endpoint: '/investor/get' },
    { key: 'partners', label: 'Partners', icon: '🤝', roles: ['user', 'admin'], endpoint: '/partner/get' },
    { key: 'news', label: 'News', icon: '📰', roles: ['admin'], endpoint: '/news/get' },
    { key: 'users', label: 'Users', icon: '👥', roles: ['admin'], endpoint: '/user/get' },
];

const SECTION_FORMS = {
    events: [
        { name: 'name', label: 'Nom*', required: true },
        { name: 'dates', label: 'Date', type: 'date', placeholder: '2025-09-04' },
        { name: 'location', label: 'Lieu' },
        { name: 'event_type', label: 'Type' },
        { name: 'target_audience', label: 'Audience' },
        { name: 'image', label: 'Image (URL/Base64)' },
        { name: 'description', label: 'Description', textarea: true }
    ],
    startups: [
        { name: 'name', label: 'Nom*', required: true },
        { name: 'email', label: 'Email*', required: true, type: 'email' },
        { name: 'legal_status', label: 'Statut légal' },
        { name: 'address', label: 'Adresse' },
        { name: 'phone', label: 'Téléphone' },
        { name: 'website_url', label: 'Site web' },
        { name: 'social_media_url', label: 'Réseaux sociaux' },
        { name: 'sector', label: 'Secteur' },
        { name: 'maturity', label: 'Maturité' },
        { name: 'project_status', label: 'Statut projet' },
        { name: 'needs', label: 'Besoins', textarea: true },
        { name: 'description', label: 'Description', textarea: true }
    ],
    investors: [
        { name: 'name', label: 'Nom*', required: true },
        { name: 'email', label: 'Email*', required: true, type: 'email' },
        { name: 'legal_status', label: 'Statut légal' },
        { name: 'address', label: 'Adresse' },
        { name: 'phone', label: 'Téléphone' },
        { name: 'investor_type', label: 'Type investisseur' },
        { name: 'investment_focus', label: 'Focus investissement', textarea: true },
        { name: 'description', label: 'Description', textarea: true }
    ],
    partners: [
        { name: 'name', label: 'Nom', required: true },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'legal_status', label: 'Statut légal' },
        { name: 'address', label: 'Adresse' },
        { name: 'phone', label: 'Téléphone' },
        { name: 'partnership_type', label: 'Type partenariat' },
        { name: 'description', label: 'Description', textarea: true }
    ],
    news: [
        { name: 'title', label: 'Titre*', required: true },
        { name: 'description', label: 'Description*', required: true, textarea: true },
        { name: 'news_date', label: 'Date', type: 'date' },
        { name: 'location', label: 'Lieu' },
        { name: 'category', label: 'Catégorie' },
        { name: 'startup_id', label: 'Startup ID', type: 'number' }
    ]
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState(null);
    const [active, setActive] = useState('overview');
    const [dataCache, setDataCache] = useState({});
    const [loadingSection, setLoadingSection] = useState(false);
    const redirectedRef = useRef(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [modal, setModal] = useState({ open:false, mode:null, section:null, row:null, loading:false, error:null });

    // MODE USER
    useEffect(() => {
        const token = localStorage.getItem('token');
        let storedUser = null;

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
        try {
            storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        } catch {}
        const hydrated = {
            id: payload.id || payload.userId || payload.sub,
            email: payload.email || storedUser?.email || '-',
            name: payload.name || storedUser?.name || '-',
            role: payload.role || storedUser?.role || 'default',
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
            const legacy = localStorage.getItem('jwtToken');
            if (legacy && !localStorage.getItem('token')) {
                localStorage.setItem('token', legacy);
                localStorage.removeItem('jwtToken');
            }
            const token = localStorage.getItem('token');
            const res = await fetch(section.endpoint, {headers: token ? { Authorization: 'Bearer ' + token } : {}});
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

    useEffect(() => {
        if (!checking && user) {
            ['events', 'startups', 'news'].forEach(k => loadSection(k));
            if (user.role === 'admin') loadSection('users');
        }
    }, [checking, user, loadSection]);

    useEffect(() => {
        if (!checking)
            loadSection(active);
    }, [active, checking, loadSection]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    if (checking) {
        return (
            <div className="dashboard-loading">
                Vérification du token...
                {error && <div style={{ marginTop: 12, fontSize: '.85rem', opacity: .8 }}>{error}</div>}
            </div>
        );
    }

    const safeUser = user || { id: 'loading', email: '...', name: '', role: 'user', raw: {} };
    const accessibleSections = (safeUser ? SECTIONS.filter(s => s.roles.includes(safeUser.role)) : []);
    const current = dataCache[active];

    const basePathFromSection = (sectionKey) => {
        switch (sectionKey) {
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
        if (sectionKey === 'users' || SECTION_FORMS[sectionKey]) {
            setModal({ open:true, mode:'create', section:sectionKey, row:null, loading:false, error:null });
        } else {
            alert('Création non disponible.');
        }
    };

    const openEdit = (sectionKey, row) => {
        if (sectionKey === 'users' || SECTION_FORMS[sectionKey]) {
            setModal({ open:true, mode:'edit', section:sectionKey, row, loading:false, error:null });
        } else {
            alert('Edition non disponible.');
        }
    };

    const confirmDelete = async (sectionKey, row) => {
        if (!row || row.id == null) { alert('ID manquant'); return; }
        if (!window.confirm('Supprimer l\'élément #' + row.id + ' ?')) return;
        try {
            const token = localStorage.getItem('token');
            const base = basePathFromSection(sectionKey);
            if (!base)
                throw new Error('Section inconnue');
            const res = await fetch(`${base}/delete/${row.id}`, { method: 'DELETE', headers: token ? { Authorization: 'Bearer ' + token } : {} });
            if (!res.ok)
                throw new Error('HTTP ' + res.status);
            setDataCache(dc => {
                const cur = dc[sectionKey];
                if (!cur)
                    return dc;
                return { ...dc, [sectionKey]: { ...cur, items: cur.items.filter(it => it.id !== row.id) } };
            });
        } catch (e) {
            alert('Erreur suppression: ' + (e.message || e));
        }
    };

        const closeModal = () => setModal(m => ({ ...m, open:false }));

        const submitUserCreate = async (e) => {
                e.preventDefault();
                const form = e.target;
                const payload = {
                        email: form.email.value.trim(),
                        name: form.name.value.trim(),
                        role: form.role.value.trim() || 'default',
                        password: form.password.value,
                        founder_id: form.founder_id.value ? Number(form.founder_id.value) : null,
                        investor_id: form.investor_id.value ? Number(form.investor_id.value) : null,
                };
                if (!payload.email || !payload.name || !payload.password) {
                        setModal(m=>({...m,error:'Champs requis manquants'}));
                        return;
                }
                try {
                        setModal(m=>({...m,loading:true,error:null}));
                        const token = localStorage.getItem('token');
                        const res = await fetch('/user/create', { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? {Authorization:'Bearer '+token}:{}) }, body: JSON.stringify(payload) });
                        if (!res.ok) {
                            let msg = 'HTTP '+res.status;
                            try { const errJson = await res.json(); msg = errJson.message || msg; } catch {}
                            throw new Error(msg);
                        }
                        const created = await res.json();
                        // Update cache
                        setDataCache(dc => {
                                const cur = dc.users; if (!cur) return dc;
                                return { ...dc, users:{ ...cur, items:[created, ...cur.items] } };
                        });
                        closeModal();
                } catch(err) {
                        setModal(m=>({...m,loading:false,error: err.message || 'Erreur création'}));
                }
        };

        const submitUserEdit = async (e) => {
                e.preventDefault();
                if (!modal.row) return;
                const form = e.target;
                const updateFields = {};
                const name = form.name.value.trim(); if (name && name !== modal.row.name) updateFields.name = name;
                const role = form.role.value.trim(); if (role && role !== modal.row.role) updateFields.role = role;
                const password = form.password.value; if (password) updateFields.password = password;
                const founder_id = form.founder_id.value ? Number(form.founder_id.value) : null; if (founder_id !== modal.row.founder_id) updateFields.founder_id = founder_id;
                const investor_id = form.investor_id.value ? Number(form.investor_id.value) : null; if (investor_id !== modal.row.investor_id) updateFields.investor_id = investor_id;
                if (Object.keys(updateFields).length === 0) { closeModal(); return; }
                try {
                        setModal(m=>({...m,loading:true,error:null}));
                        const token = localStorage.getItem('token');
                        const res = await fetch(`/user/update/${modal.row.id}`, { method:'PUT', headers:{ 'Content-Type':'application/json', ...(token? {Authorization:'Bearer '+token}:{}) }, body: JSON.stringify({ updateFields }) });
                        if (!res.ok) throw new Error('HTTP '+res.status);
                        const data = await res.json();
                        const updated = data.user || data;
                        setDataCache(dc => {
                                const cur = dc.users; if (!cur) return dc;
                                return { ...dc, users:{ ...cur, items: cur.items.map(u=> u.id===updated.id ? updated : u) } };
                        });
                        closeModal();
                } catch(err) {
                        setModal(m=>({...m,loading:false,error: err.message || 'Erreur mise à jour'}));
                }
        };

        // Soumissions génériques (hors users)
    const submitGenericCreate = async (e) => {
            e.preventDefault();
            const sectionKey = modal.section;
            const fields = SECTION_FORMS[sectionKey] || [];
            const form = e.target;
            const payload = {};
            fields.forEach(f => {
        let v = form[f.name]?.value;
                if (f.type === 'number' && v !== '') v = Number(v);
                if (v === '') v = null;
                if (f.textarea) v = form[f.name].value; // déjà fait mais clair
        if (v !== null) payload[f.name] = v;
            });
            // Validation minimale required
            for (const f of fields) {
                if (f.required && (payload[f.name] == null || payload[f.name] === '')) {
                    setModal(m => ({ ...m, error: 'Champs requis manquants' }));
                    return;
                }
            }
            try {
                setModal(m=>({...m,loading:true,error:null}));
                const token = localStorage.getItem('token');
                const base = basePathFromSection(sectionKey);
                const res = await fetch(`${base}/create`, { method:'POST', headers:{ 'Content-Type':'application/json', ...(token? {Authorization:'Bearer '+token}:{}) }, body: JSON.stringify(payload) });
                if (!res.ok) {
                    let msg = 'HTTP '+res.status;
                    try { const ej = await res.json(); msg = ej.message || msg; } catch {}
                    throw new Error(msg);
                }
                const created = await res.json();
                setDataCache(dc => {
                    const cur = dc[sectionKey]; if (!cur) return dc;
                    return { ...dc, [sectionKey]: { ...cur, items: [created, ...cur.items] } };
                });
                closeModal();
            } catch(err) {
                setModal(m=>({...m,loading:false,error: err.message || 'Erreur création'}));
            }
        };

        const submitGenericEdit = async (e) => {
            e.preventDefault();
            const sectionKey = modal.section;
            if (!modal.row) return;
            const fields = SECTION_FORMS[sectionKey] || [];
            const form = e.target;
            const updateFields = {};
            fields.forEach(f => {
                const original = modal.row[f.name];
                let v = form[f.name]?.value;
                if (f.type === 'number' && v !== '') v = Number(v);
                if (v === '') v = null;
                if (f.textarea) v = form[f.name].value;
                if (v !== original && !(v == null && (original === null || original === undefined))) {
                    updateFields[f.name] = v;
                }
            });
            if (Object.keys(updateFields).length === 0) { closeModal(); return; }
            try {
                setModal(m=>({...m,loading:true,error:null}));
                const token = localStorage.getItem('token');
                const base = basePathFromSection(sectionKey);
                const res = await fetch(`${base}/update/${modal.row.id}`, { method:'PUT', headers:{ 'Content-Type':'application/json', ...(token? {Authorization:'Bearer '+token}:{}) }, body: JSON.stringify({ updateFields }) });
                if (!res.ok) {
                    let msg = 'HTTP '+res.status;
                    try { const ej = await res.json(); msg = ej.message || msg; } catch {}
                    throw new Error(msg);
                }
                const data = await res.json();
                const keyMap = { events:'event', startups:'startup', investors:'investor', partners:'partner', news:'news' };
                const updated = data[keyMap[sectionKey]] || data;
                setDataCache(dc => {
                    const cur = dc[sectionKey]; if (!cur) return dc;
                    return { ...dc, [sectionKey]: { ...cur, items: cur.items.map(it => it.id === updated.id ? updated : it) } };
                });
                closeModal();
            } catch(err) {
                setModal(m=>({...m,loading:false,error: err.message || 'Erreur mise à jour'}));
            }
        };

        const renderModal = () => {
                if (!modal.open) return null;
                if (modal.section === 'users') {
                        const isEdit = modal.mode === 'edit';
                        const row = modal.row || {};
                        return (
                            <div className="modal-overlay" onMouseDown={(e)=>{ if(e.target.classList.contains('modal-overlay')) closeModal(); }}>
                                <div className="modal" role="dialog" aria-modal="true">
                                    <div className="modal-head">
                                        <h3>{isEdit? 'Modifier utilisateur' : 'Nouvel utilisateur'}</h3>
                                        <button className="close-x" onClick={closeModal}>✕</button>
                                    </div>
                                    <form onSubmit={isEdit? submitUserEdit : submitUserCreate} className="modal-form">
                                        <div className="form-row">
                                            <label>Email*</label>
                                            <input name="email" type="email" defaultValue={row.email||''} disabled={isEdit} required />
                                        </div>
                                        <div className="form-row">
                                            <label>Nom*</label>
                                            <input name="name" type="text" defaultValue={row.name||''} required />
                                        </div>
                                        <div className="form-row">
                                            <label>Rôle</label>
                                            <select name="role" defaultValue={row.role||'default'}>
                                                <option value="default">default</option>
                                                <option value="admin">admin</option>
                                                <option value="user">user</option>
                                            </select>
                                        </div>
                                        <div className="form-row">
                                            <label>Mot de passe{isEdit? ' (laisser vide pour ne pas changer)' : '*'} </label>
                                            <input name="password" type="password" placeholder={isEdit? '••••••' : ''} {...(!isEdit? {required:true}: {})} />
                                        </div>
                                        <div className="form-row-inline">
                                            <div>
                                                <label>Founder ID</label>
                                                <input name="founder_id" type="number" defaultValue={row.founder_id||''} />
                                            </div>
                                            <div>
                                                <label>Investor ID</label>
                                                <input name="investor_id" type="number" defaultValue={row.investor_id||''} />
                                            </div>
                                        </div>
                                        {modal.error && <div className="form-error">{modal.error}</div>}
                                        <div className="modal-actions">
                                            <button type="button" className="btn sm" onClick={closeModal}>Annuler</button>
                                            <button type="submit" className="btn primary" disabled={modal.loading}>{modal.loading? 'En cours...' : (isEdit? 'Mettre à jour' : 'Créer')}</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        );
                } else if (SECTION_FORMS[modal.section]) {
                    const isEdit = modal.mode === 'edit';
                    const fields = SECTION_FORMS[modal.section];
                    const row = modal.row || {};
                    return (
                        <div className="modal-overlay" onMouseDown={(e)=>{ if(e.target.classList.contains('modal-overlay')) closeModal(); }}>
                            <div className="modal" role="dialog" aria-modal="true">
                                <div className="modal-head">
                                    <h3>{isEdit ? 'Modifier' : 'Créer'} {SECTIONS.find(s=>s.key===modal.section)?.label}</h3>
                                    <button className="close-x" onClick={closeModal}>✕</button>
                                </div>
                                <form onSubmit={isEdit? submitGenericEdit : submitGenericCreate} className="modal-form">
                                    {fields.map(f => (
                                        <div className="form-row" key={f.name}>
                                            <label>{f.label}</label>
                                            {f.textarea ? (
                                                <textarea name={f.name} defaultValue={row[f.name] || ''} style={{resize:'vertical', minHeight:80}} {...(f.required && !isEdit ? {required:true}: {})} />
                                            ) : (
                                                <input name={f.name} type={f.type || 'text'} defaultValue={row[f.name] || ''} {...(f.required && !isEdit ? {required:true}: {})} />
                                            )}
                                        </div>
                                    ))}
                                    {modal.error && <div className="form-error">{modal.error}</div>}
                                    <div className="modal-actions">
                                        <button type="button" className="btn sm" onClick={closeModal}>Annuler</button>
                                        <button type="submit" className="btn primary" disabled={modal.loading}>{modal.loading ? 'En cours...' : (isEdit? 'Mettre à jour' : 'Créer')}</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    );
                }
                return null;
        };

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
        const columns = computeColumns(active, list);

        return (
            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="ttl">
                        {SECTIONS.find(s => s.key === active)?.label} <span className="count-badge">{list.length}</span>
                    </div>
                    {safeUser.role === 'admin' && (
                        <button className="btn primary" onClick={() => openCreate(active)}>+ Ajouter</button>
                    )}
                </div>
                {loadingSection && <div className="inline-loading">Mise à jour...</div>}
                {(!list.length && !loadingSection) && <div className="empty">Aucune donnée.</div>}
                {!!list.length && (
                    <div className="table-scroll">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {columns.map(c => <th key={c.key}>{c.label}</th>)}
                                    {safeUser.role === 'admin' && <th style={{ width: 120 }}>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {list.slice(0, 200).map((row, i) => (
                                    <tr key={row.id || row.uuid || i}>
                                        {columns.map(c => <td key={c.key}>{formatCell(c, row)}</td>)}
                                        {safeUser.role === 'admin' && (
                                            <td className="actions">
                                                <button onClick={() => openEdit(active, row)} className="btn sm">✏️</button>
                                                <button onClick={() => confirmDelete(active, row)} className="btn sm danger">🗑️</button>
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
            {menuOpen && <div className="sidebar-overlay" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" />}
            <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="brand"><span>JEB Admin Panel</span><button className="close-btn" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu">✕</button></div>
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
                    <button className="menu-toggle" onClick={() => setMenuOpen(m => !m)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? '✕' : '☰'}</button>
                    <h1>{SECTIONS.find(s => s.key === active)?.label}</h1>
                </header>
                <div className="panel-content">{renderSection()}</div>
            </main>
            {renderModal()}
        </div>
    );
}

// Helpers outside component (could be moved) ----
function computeColumns(sectionKey, list) {
    if (!list.length) return [{ key: 'id', label: 'ID' }];
    const sample = list[0];
    const baseMap = {
        events: ['id', 'name', 'location', 'event_type', 'dates'],
        startups: ['id', 'name', 'email', 'sector', 'maturity'],
        investors: ['id', 'name', 'email', 'investor_type'],
        partners: ['id', 'name', 'email', 'partnership_type'],
        news: ['id', 'title', 'category', 'news_date'],
        users: ['id', 'name', 'email', 'role']
    };
    const wanted = baseMap[sectionKey] || Object.keys(sample).slice(0, 5);
    return wanted.filter(k => k in sample).map(k => ({ key: k, label: k.replace(/_/g, ' ') }));
}

function formatCell(col, row) {
    const val = row[col.key];
    if (val == null || val === '') return '—';
    if (typeof val === 'string' && val.length > 60) return val.slice(0, 57) + '…';
    return String(val);
}
