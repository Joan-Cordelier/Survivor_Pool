import { useEffect, useMemo, useState } from 'react';
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

    // Messaging state
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [contacts, setContacts] = useState([]);
    const [contactQuery, setContactQuery] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [creatingConvId, setCreatingConvId] = useState(null);

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

    // Initialize mock conversations when startup loads
    useEffect(() => {
        if (!startup) return;
        const convs = [];
        // create a conversation for each founder
        (startup.founders || []).forEach(f => {
            convs.push({
                id: `founder-${f.id}`,
                interlocutor: { id: f.id, name: f.name || `Founder ${f.id}`, role: f.role || 'Founder' },
                lastMessage: 'Bonjour',
                unread: 0,
                messages: [
                    { id: 1, authorId: f.id, text: `Salut, je suis ${f.name || 'le fondateur'}.`, time: Date.now() - 1000 * 60 * 60 },
                    { id: 2, authorId: user?.id || 0, text: 'Bonjour !', time: Date.now() - 1000 * 60 * 30 }
                ]
            });
        });
        // add a sample investor conversation
        convs.push({
            id: 'investor-1',
            interlocutor: { id: 999, name: 'InvestCorp', role: 'Investor' },
            lastMessage: 'Intéressant',
            unread: 1,
            messages: [
                { id: 1, authorId: 999, text: 'Bonjour, intéressé par votre projet.', time: Date.now() - 1000 * 60 * 60 * 24 },
            ]
        });
        setConversations(convs);
        if (convs.length) setSelectedConvId(convs[0].id);
    }, [startup, user]);

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

    const selectedConv = useMemo(() => conversations.find(c => c.id === selectedConvId) || null, [conversations, selectedConvId]);
    const filteredConversations = useMemo(() => {
        if (!filterRole || filterRole === 'all') return conversations;
        return conversations.filter(c => (c.interlocutor?.role || '').toLowerCase() === filterRole.toLowerCase());
    }, [conversations, filterRole]);

    // load all users when contact filter is selected (only once)
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (filterRole !== 'contact') return;
            if (contacts && contacts.length) return; // already loaded
            setLoadingContacts(true);
            try {
                const res = await UserApi.getAllUsers?.();
                const arr = Array.isArray(res) ? res : (res?.data || res?.users || []);
                if (!mounted) return;
                setContacts(arr.map(u => ({ id: u.id, name: u.name || `${u.firstname || ''} ${u.lastname || ''}`.trim() || `User ${u.id}`, role: u.role || 'User', raw: u })));
            } catch (e) {
                if (!mounted) return;
                setContacts([]);
            } finally {
                if (mounted) setLoadingContacts(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, [filterRole]);

    // start or open a conversation with a given user (from contacts)
    function startConversationWith(u) {
        try {
            if (!u || (u.id === undefined || u.id === null)) return;
            const targetId = String(u.id);
            // check by interlocutor id or by conv id
            const existing = conversations.find(c => String(c.interlocutor?.id) === targetId || String(c.id) === `user-${targetId}`);
            if (existing) {
                setSelectedConvId(existing.id);
                setFilterRole('all');
                return;
            }
            // avoid race: if conv id already being created, select it
            const candidateId = `user-${targetId}`;
            if (conversations.some(c => String(c.id) === candidateId)) {
                setSelectedConvId(candidateId);
                setFilterRole('all');
                return;
            }
            const newConv = {
                id: candidateId,
                interlocutor: { id: u.id, name: u.name || `User ${u.id}`, role: u.role || 'User' },
                lastMessage: '',
                unread: 0,
                messages: []
            };
            setConversations(prev => [newConv, ...prev]);
            setSelectedConvId(newConv.id);
            setFilterRole('all');
        } catch (err) {
            console.error('startConversationWith error', err, u);
        }
    }

    function selectConversation(id) {
        setSelectedConvId(id);
        setMessageText('');
        // mark as read
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    }

    function sendMessage(e) {
        e?.preventDefault?.();
        if (!selectedConvId || !messageText.trim()) return;
        const text = messageText.trim();
        setConversations(prev => prev.map(c => {
            if (c.id !== selectedConvId) return c;
            const nextId = (c.messages.length ? c.messages[c.messages.length - 1].id + 1 : 1);
            const msg = { id: nextId, authorId: user?.id || 0, text, time: Date.now() };
            return { ...c, messages: [...c.messages, msg], lastMessage: text };
        }));
        setMessageText('');
        // simple auto-reply for demo
        setTimeout(() => {
            setConversations(prev => prev.map(c => {
                if (c.id !== selectedConvId) return c;
                const nextId = (c.messages.length ? c.messages[c.messages.length - 1].id + 1 : 1) + 1;
                const reply = { id: nextId, authorId: c.interlocutor.id, text: 'Merci, reçu.', time: Date.now() };
                return { ...c, messages: [...c.messages, reply], lastMessage: reply.text };
            }));
        }, 800);
    }

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
                    {active === 'messagerie' && (
                        <div className="startup-page">
                            <div className="messaging-layout">
                                <div className="conv-list card">
                                    <div className="conv-filters" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            {['all', 'Founder', 'Investor', 'Admin'].map(r => (
                                                <button key={r} type="button" className={"conv-filter-btn" + (filterRole.toLowerCase() === r.toString().toLowerCase() ? ' active' : '')} onClick={() => setFilterRole(r)}>{r === 'all' ? 'Tous' : r}</button>
                                            ))}
                                        </div>
                                        <div>
                                            <button type="button" className={"conv-filter-btn" + (filterRole.toLowerCase() === 'contact' ? ' active' : '')} onClick={() => setFilterRole('contact')}>Make Contacts</button>
                                        </div>
                                    </div>

                                    <div className="conv-scroll">
                                    {/* Contact search UI */}
                                    {filterRole === 'contact' && (
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <input className="contact-search" placeholder="Rechercher un contact..." value={contactQuery} onChange={e => setContactQuery(e.target.value)} style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid rgba(0,0,0,0.08)' }} />
                                            </div>
                                            <div style={{ maxHeight: 420, overflow: 'auto' }}>
                                                {loadingContacts ? <div style={{ padding: 12 }}>Loading...</div> : (
                                                    contacts
                                                        .filter(u => !contactQuery || `${u.name}`.toLowerCase().includes(contactQuery.toLowerCase()))
                                                        .map(u => (
                                                            <div key={u.id} className={"conv-item contact-item" + (selectedConvId === `user-${u.id}` ? ' active' : '')}>
                                                                <div className="conv-avatar" aria-hidden>{(u.name || 'U')[0].toUpperCase()}</div>
                                                                <div className="conv-meta">
                                                                    <div className="conv-name">{u.name}</div>
                                                                    <div className="conv-role">{u.role}</div>
                                                                </div>
                                                                <div>
                                                                    <button type="button" className="btn primary" onClick={async () => {
                                                                        setCreatingConvId(u.id);
                                                                        try { startConversationWith(u); } finally { setCreatingConvId(null); }
                                                                    }} disabled={creatingConvId === u.id}>{creatingConvId === u.id ? '…' : 'Message'}</button>
                                                                </div>
                                                            </div>
                                                        ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Conversation list (non-contact) */}
                                    {filterRole !== 'contact' && (
                                        (filteredConversations.length === 0) ? (
                                            <div style={{ padding: 12 }}>Aucune conversation</div>
                                        ) : (
                                            filteredConversations.map(c => (
                                                <div key={c.id} className={"conv-item" + (c.id === selectedConvId ? ' active' : '')} onClick={() => selectConversation(c.id)}>
                                                    <div className="conv-avatar" aria-hidden>{(c.interlocutor.name || 'U')[0].toUpperCase()}</div>
                                                    <div className="conv-meta">
                                                        <div className="conv-name">{c.interlocutor.name}</div>
                                                        <div className="conv-role">{c.interlocutor.role}</div>
                                                        <div className="conv-last" style={{ fontSize: 12, opacity: .65 }}>{c.lastMessage}</div>
                                                    </div>
                                                    {c.unread ? <div style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>{c.unread}</div> : null}
                                                </div>
                                            ))
                                        )
                                    )}
                                    </div>
                                </div>
                                <div className="messages-panel card">
                                    {!selectedConv ? (
                                        <div style={{ padding: 18 }}>Sélectionnez une conversation</div>
                                    ) : (
                                        <>
                                            <div style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div className="conv-avatar" aria-hidden style={{ width: 48, height: 48 }}>{(selectedConv.interlocutor.name || 'U')[0].toUpperCase()}</div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: 700 }}>{selectedConv.interlocutor.name}</div>
                                                    <div style={{ fontSize: 12, opacity: .7 }}>{selectedConv.interlocutor.role}</div>
                                                </div>
                                            </div>
                                            <div className="messages-list" id="messages-list">
                                                {(selectedConv.messages || []).map(m => (
                                                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.authorId === (user?.id || 0) ? 'flex-end' : 'flex-start' }}>
                                                        <div className={"msg " + (m.authorId === (user?.id || 0) ? 'me' : 'them')}>
                                                            {m.text}
                                                        </div>
                                                        <div className="msg-time">{new Date(m.time).toLocaleString()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                            <form className="msg-input" onSubmit={sendMessage}>
                                                <textarea value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Écrire un message..." />
                                                <button type="submit" className="btn primary">Envoyer</button>
                                            </form>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

