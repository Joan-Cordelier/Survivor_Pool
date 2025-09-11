import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Startup.scss';
import * as StartupApi from '../../apis/BackendApi/Startup.api';
import * as UserApi from '../../apis/BackendApi/User.api';

export default function StartupPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [startup, setStartup] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [editing, setEditing] = useState(false);
    const [active, setActive] = useState('overview');



    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [sector, setSector] = useState('');
    const [maturity, setMaturity] = useState('');
    const [projectStatus, setProjectStatus] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const stored = JSON.parse(localStorage.getItem('user') || 'null');
            if (!token || !stored) {
                const from = `${location?.pathname || '/'}${location?.search || ''}${location?.hash || ''}`;
                navigate('/Login', { replace: true, state: { from } });
                return;
            }
            if (stored.role !== 'founder') {
                navigate('/', { replace: true });
                return;
            }
            (async () => {
                try {
                    const full = await UserApi.getUserById(stored.id);
                    const merged = full ? { ...stored, ...full } : stored;
                    setUser(merged);
                    try { localStorage.setItem('user', JSON.stringify(merged)); } catch { }
                } catch {
                    setUser(stored);
                }
            })();
        } catch { }
    }, [navigate, location]);

    useEffect(() => {
        const load = async () => {
            if (!user) return;
            setLoading(true);
            setError(null);
            try {
                let founderId = user.founder_id;
                if (!founderId) {
                    try {
                        const full = await UserApi.getUserById(user.id);
                        if (full && full.founder_id) {
                            const merged = { ...user, ...full };
                            founderId = full.founder_id;
                            setUser(merged);
                            try { localStorage.setItem('user', JSON.stringify(merged)); } catch { }
                        }
                    } catch { }
                }
                if (!founderId) {
                    setError('Aucun founder_id présent sur cet utilisateur.');
                    setStartup(null);
                    return;
                }
                let s = null;
                try {
                    const res = await StartupApi.getStartupById(founderId);
                    s = res?.startup || res;
                } catch (err) {
                    try {
                        const all = await StartupApi.getAllStartups();
                        const arr = Array.isArray(all) ? all : (all?.data || []);
                        s = arr.find(st => Array.isArray(st.founders) && st.founders.some(f => f.id === founderId)) || null;
                    } catch { }
                }
                if (!s || !s.id) {
                    setError('Aucune startup liée à ce fondateur.');
                    setStartup(null);
                } else {
                    setStartup(s);
                    setName(s.name || '');
                    setEmail(s.email || '');
                    setSector(s.sector || '');
                    setMaturity(s.maturity || '');
                    setProjectStatus(s.project_status || '');
                    setWebsiteUrl(s.website_url || '');
                    setDescription(s.description || '');
                }
            } catch (e) {
                setError(e?.message || 'Erreur de Loading');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    // messaging is handled by the shared Messaging component

    async function onSave(e) {
        e?.preventDefault?.();
        if (!startup?.id) return;
        const updateFields = {};
        if (name !== (startup.name || '')) updateFields.name = name.trim();
        if (email !== (startup.email || '')) updateFields.email = email.trim();
        if (sector !== (startup.sector || '')) updateFields.sector = sector;
        if (maturity !== (startup.maturity || '')) updateFields.maturity = maturity;
        if (projectStatus !== (startup.project_status || '')) updateFields.project_status = projectStatus;
        if (websiteUrl !== (startup.website_url || '')) updateFields.website_url = websiteUrl.trim();
        if (description !== (startup.description || '')) updateFields.description = description;
        if (!Object.keys(updateFields).length) {
            setMsg('Aucun changement.');
            return;
        }
        try {
            setSaving(true); setMsg(null);
            const token = localStorage.getItem('token');
            const res = await StartupApi.updateStartup(startup.id, { updateFields }, token);
            const updated = res.startup || res;
            const merged = { ...startup, ...updated };
            setStartup(merged);
            setName(merged.name || '');
            setEmail(merged.email || '');
            setSector(merged.sector || '');
            setMaturity(merged.maturity || '');
            setProjectStatus(merged.project_status || '');
            setWebsiteUrl(merged.website_url || '');
            setDescription(merged.description || '');
            setMsg('Enregistré.');
        } catch (e) {
            setMsg(e?.message || 'Échec de l’enregistrement');
        } finally {
            setSaving(false);
        }
    }

    function onReset() {
        if (!startup) return;
        setName(startup.name || '');
        setEmail(startup.email || '');
        setSector(startup.sector || '');
        setMaturity(startup.maturity || '');
        setProjectStatus(startup.project_status || '');
        setWebsiteUrl(startup.website_url || '');
        setDescription(startup.description || '');
        setMsg(null);
    }

    function exitEdit() {
        onReset();
        setEditing(false);
    }

    const initials = useMemo(() => {
        const s = (startup?.name || '').trim();
        return s ? s[0].toUpperCase() : 'S';
    }, [startup]);

    // messaging is handled by the shared Messaging component

    if (!user) return <div className="startup-page" />;
    if (loading) return <div className="startup-page"><div className="card">Loading…</div></div>;

    return (
        <div className="startup-layout">
            <aside className="startup-sidebar">
                <div className="brand">Espace Startup</div>
                <nav className="startup-nav">
                    <ul>
                        <li>
                            <button className={active === 'overview' ? 'active' : ''} onClick={() => setActive('overview')}>
                                <span className="ico" aria-hidden>📊</span>
                                <span className="lbl">Overview</span>
                            </button>
                        </li>
                        <li>
                            <button className={active === 'messagerie' ? 'active' : ''} onClick={() => setActive('messagerie')}>
                                <span className="ico" aria-hidden>💬</span>
                                <span className="lbl">Messagerie</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="startup-main">
                <header className="startup-panel-header">
                    <h1>{active === 'overview' ? 'Overview' : 'Messagerie'}</h1>
                </header>
                <div className="startup-panel-content">
                    {active === 'overview' && (
                        <div className="startup-page">
                            {!startup ? (
                                <div className="card" style={{ padding: 16 }}>
                                    {error || 'Aucune donnée'}
                                </div>
                            ) : (
                                <div className="startup-card card">
                                    <div className="startup-header">
                                        <div className="startup-avatar" aria-hidden>{initials}</div>
                                        <div>
                                            <div className="startup-name">{(name && name.trim()) || startup.name || 'Sans nom'}</div>
                                            <div className="startup-email">{email || startup.email || ''}</div>
                                        </div>
                                    </div>
                                    <div className="top-actions">
                                        {!editing ? (
                                            <button type="button" className="btn primary" onClick={() => setEditing(true)}>Modifier</button>
                                        ) : (
                                            <button type="button" className="btn ghost danger" onClick={exitEdit}>Fermer</button>
                                        )}
                                    </div>
                                    <form className="startup-body" onSubmit={onSave}>
                                        <div className="grid-2 field-grid">
                                            <div className="field">
                                                <label>Nom</label>
                                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom de la startup" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Email</label>
                                                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="email@startup.com" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Secteur</label>
                                                <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Secteur" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Maturité</label>
                                                <input value={maturity} onChange={e => setMaturity(e.target.value)} placeholder="Idée / MVP / Croissance…" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Status</label>
                                                <input value={projectStatus} onChange={e => setProjectStatus(e.target.value)} placeholder="Statut du projet" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Site Web</label>
                                                <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://…" disabled={!editing} />
                                            </div>
                                        </div>
                                        <div className="field" style={{ marginTop: 16 }}>
                                            <label>Description</label>
                                            <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Décrivez votre projet" disabled={!editing} />
                                        </div>
                                        <div style={{ marginTop: 16 }}>
                                            <div className="lbl">Founders</div>
                                            <ul className="val">
                                                {(startup.founders || []).map(f => (
                                                    <li key={f.id}>#{f.id} {f.name}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        {msg && <div style={{ opacity: .9, marginTop: 8 }}>{msg}</div>}
                                        {editing && (
                                            <div className="actions" style={{ marginTop: 12 }}>
                                                <button type="button" className="btn ghost dark" onClick={onReset}>Réinitialiser</button>
                                                <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
                                            </div>
                                        )}
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
