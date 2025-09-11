import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Startup.scss';
import MsgIcon from '../../assets/envelope.svg';
import * as StartupApi from '../../apis/BackendApi/Startup.api';
import * as UserApi from '../../apis/BackendApi/User.api';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    LineChart,
    Line,
} from 'recharts';

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
    const [active, setActive] = useState('informations');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [sector, setSector] = useState('');
    const [maturity, setMaturity] = useState('');
    const [projectStatus, setProjectStatus] = useState('');
    const [websiteUrl, setWebsiteUrl] = useState('');
    const [description, setDescription] = useState('');
    const [oppKpi, setOppKpi] = useState(null);

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
                    setError('No founder_id present on this user.');
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
                    setError('No startup linked to this founder.');
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
                    // Build placeholder KPIs (to be wired to real data later)
                    try {
                        const foundersCount = Array.isArray(s.founders) ? s.founders.length : 1;
                        const total = Math.max(4, foundersCount * 4);
                        const won = Math.max(1, Math.floor(total * 0.25));
                        const lost = Math.max(0, Math.floor(total * 0.12));
                        const inProgress = Math.max(1, Math.floor(total * 0.4));
                        const open = Math.max(0, total - won - lost - inProgress);
                        const winRate = total > 0 ? Math.round((won / (won + lost || 1)) * 100) : 0;
                        setOppKpi({ total, open, inProgress, won, lost, winRate, lastUpdated: new Date().toISOString() });
                    } catch {}
                }
            } catch (e) {
                setError(e?.message || 'Loading error');
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
        if (sector !== (startup.sector || '')) updateFields.sector = sector;
        if (maturity !== (startup.maturity || '')) updateFields.maturity = maturity;
        if (projectStatus !== (startup.project_status || '')) updateFields.project_status = projectStatus;
        if (websiteUrl !== (startup.website_url || '')) updateFields.website_url = websiteUrl.trim();
        if (description !== (startup.description || '')) updateFields.description = description;
        if (!Object.keys(updateFields).length) {
            setMsg('No changes.');
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
            setMsg('Saved.');
        } catch (e) {
            setMsg(e?.message || 'Save failed');
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

    const statusColors = useMemo(() => ({
        open: '#10b981',
        inProgress: '#f59e0b',
        won: '#8b5cf6',
        lost: '#ef4444',
    }), []);

    const statusData = useMemo(() => {
        if (!oppKpi) return [];
        return [
            { name: 'Open', key: 'open', value: oppKpi.open || 0, fill: statusColors.open },
            { name: 'In Progress', key: 'inProgress', value: oppKpi.inProgress || 0, fill: statusColors.inProgress },
            { name: 'Won', key: 'won', value: oppKpi.won || 0, fill: statusColors.won },
            { name: 'Lost', key: 'lost', value: oppKpi.lost || 0, fill: statusColors.lost },
        ];
    }, [oppKpi, statusColors]);

    const trendData = useMemo(() => {
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const now = new Date();
        const seed = (startup?.id || 7) + (oppKpi?.total || 13);
        const rng = (i) => {
            let x = (seed * 9301 + 49297 + i * 233280) % 233280;
            return x / 233280;
        };
        const list = [];
        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const m = months[d.getMonth()];
            const base = Math.max(1, Math.floor((oppKpi?.total || 6) / 3));
            const open = Math.max(0, Math.round(base * (0.8 + rng(i) * 0.4)));
            const inProgress = Math.max(0, Math.round(base * (0.9 + rng(i + 1) * 0.6)));
            const won = Math.max(0, Math.round(base * (0.4 + rng(i + 2) * 0.6)));
            const lost = Math.max(0, Math.round(base * (0.2 + rng(i + 3) * 0.4)));

            list.push({ month: m, open, inProgress, won, lost });
        }
        return list;
    }, [oppKpi, startup]);


    if (!user)
        return <div className="startup-page" />;
    if (loading)
        return <div className="startup-page"><div className="card">Loading…</div></div>;

    return (
        <div className="startup-layout">
            <aside className="startup-sidebar">
                <div className="brand">Startup Space</div>
                <nav className="startup-nav">
                    <ul>
                        <li>
                            <button className={active === 'overview' ? 'active' : ''} onClick={() => setActive('overview')}>
                                <span className="ico" aria-hidden>📊</span>
                                <span className="lbl">Overview</span>
                            </button>
                        </li>
                        <li>
                            <button className={active === 'informations' ? 'active' : ''} onClick={() => setActive('informations')}>
                                <span className="ico" aria-hidden>ℹ️</span>
                                <span className="lbl">Information</span>
                            </button>
                        </li>
                    </ul>
                </nav>
            </aside>
            <main className="startup-main">
                <header className="startup-panel-header">
                    <h1>{active === 'overview' ? 'Overview' : 'Information'}</h1>
                </header>
                <div className="startup-panel-content">
                    {active === 'overview' && (
                        <div className="startup-page">
                            <div className="kpi card">
                                <div className="kpi-header">
                                    <div className="kpi-title">Opportunity tracking</div>
                                    {oppKpi?.lastUpdated && (
                                        <div className="kpi-sub">Last update: {new Date(oppKpi.lastUpdated).toLocaleString()}</div>
                                    )}
                                </div>
                                <div className="kpi-summary">
                                    <div className="kpi-total">
                                        <div className="lbl">Total opportunities</div>
                                        <div className="val">{oppKpi?.total ?? '—'}</div>
                                    </div>
                                    <div className="kpi-rate">
                                        <div className="lbl">Win rate</div>
                                        <div className="val">{Number.isFinite(oppKpi?.winRate) ? `${oppKpi.winRate}%` : '—'}</div>
                                    </div>
                                </div>

                                <div className="charts-grid">
                                    <div className="chart-card">
                                        <div className="chart-title">Status distribution</div>
                                        <div className="chart-body">
                                            {statusData.length === 0 ? (
                                                <div className="empty">—</div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <PieChart>
                                                        <Pie
                                                            data={statusData}
                                                            dataKey="value"
                                                            nameKey="name"
                                                            innerRadius={60}
                                                            outerRadius={85}
                                                            paddingAngle={2}
                                                        >
                                                            {statusData.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(val) => [val, 'Count']} />
                                                        <Legend />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-title">Volumes by status</div>
                                        <div className="chart-body">
                                            {statusData.length === 0 ? (
                                                <div className="empty">—</div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height={220}>
                                                    <BarChart data={statusData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="name" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Bar dataKey="value" radius={[6,6,0,0]}>
                                                            {statusData.map((entry, index) => (
                                                                <Cell key={`cell-b-${index}`} fill={entry.fill} />
                                                            ))}
                                                        </Bar>
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>

                                    <div className="chart-card wide">
                                        <div className="chart-title">Trend (last 6 months)</div>
                                        <div className="chart-body">
                                            {trendData.length === 0 ? (
                                                <div className="empty">—</div>
                                            ) : (
                                                <ResponsiveContainer width="100%" height={240}>
                                                    <LineChart data={trendData} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis dataKey="month" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Line type="monotone" dataKey="open" name="Open" stroke={statusColors.open} strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="inProgress" name="In progress" stroke={statusColors.inProgress} strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="won" name="Won" stroke={statusColors.won} strokeWidth={2} dot={false} />
                                                        <Line type="monotone" dataKey="lost" name="Lost" stroke={statusColors.lost} strokeWidth={2} dot={false} />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="kpi-note">It's a placeholder not real connected data.</div>
                            </div>
                        </div>
                    )}
                    {active === 'informations' && (
                        <div className="startup-page">
                            {!startup ? (
                                <div className="card" style={{ padding: 16 }}>
                                    {error || 'No data'}
                                </div>
                            ) : (
                                <div className="startup-card card">
                                    <div className="startup-header">
                                        <div className="startup-avatar" aria-hidden>{initials}</div>
                                        <div>
                                            <div className="startup-name">{(name && name.trim()) || startup.name || 'Untitled'}</div>
                                            <div className="startup-email">{email || startup.email || ''}</div>
                                        </div>
                                    </div>
                                    <div className="top-actions">
                                        {!editing ? (
                                            <button type="button" className="btn primary" onClick={() => setEditing(true)}>Edit</button>
                                        ) : (
                                            <button type="button" className="btn ghost danger" onClick={exitEdit}>Close</button>
                                        )}
                                    </div>
                                    <form className="startup-body" onSubmit={onSave}>
                                        <div className="grid-2 field-grid">
                                            <div className="field">
                                                <label>Name</label>
                                                <input value={name} onChange={e => setName(e.target.value)} placeholder="Startup name" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Email <span style={{ opacity: .7, fontWeight: 400 }}>(not editable)</span></label>
                                                <input value={email} onChange={() => {}} placeholder="email@startup.com" disabled />
                                            </div>
                                            <div className="field">
                                                <label>Sector</label>
                                                <input value={sector} onChange={e => setSector(e.target.value)} placeholder="Sector" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Maturity</label>
                                                <input value={maturity} onChange={e => setMaturity(e.target.value)} placeholder="Idea / MVP / Growth…" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Status</label>
                                                <input value={projectStatus} onChange={e => setProjectStatus(e.target.value)} placeholder="Project status" disabled={!editing} />
                                            </div>
                                            <div className="field">
                                                <label>Website</label>
                                                <input value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://…" disabled={!editing} />
                                            </div>
                                        </div>
                                        <div className="field" style={{ marginTop: 16 }}>
                                            <label>Description</label>
                                            <textarea rows={5} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe your project" disabled={!editing} />
                                        </div>
                                        <div className="founders-section" style={{ marginTop: 16 }}>
                                            <div className="lbl">Founders</div>
                                            <div className="founders-list">
                                                {(Array.isArray(startup.founders) ? startup.founders : []).length === 0 && (
                                                    <div className="empty" style={{ padding: 12 }}>No founders</div>
                                                )}
                                                {(Array.isArray(startup.founders) ? startup.founders : []).map(f => {
                                                    const letter = (f?.name || 'F').trim().charAt(0).toUpperCase();
                                                    return (
                                                        <div className="founder-item" key={f.id}>
                                                            <div className="left">
                                                                <div className="founder-avatar" aria-hidden>
                                                                    {f?.image ? <img src={f.image} alt={f.name} /> : letter}
                                                                </div>
                                                                <div className="founder-name" title={f.name}>{f.name}</div>
                                                            </div>
                                                            <div className="founder-id">ID#{f.id}</div>
                                                            <div className="founder-actions">
                                                                <button
                                                                    type="button"
                                                                    className="btn msg"
                                                                    title={`Contact ${f.name}`}
                                                                    onClick={() => navigate('/Messaging', { state: { founderId: f.id, founderName: f.name, startupId: startup.id } })}
                                                                >
                                                                <span className="ico" aria-hidden>
                                                                    <img src={MsgIcon} alt="" />
                                                                </span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        {msg && <div style={{ opacity: .9, marginTop: 8 }}>{msg}</div>}
                                        {editing && (
                                            <div className="actions" style={{ marginTop: 12 }}>
                                                <button type="button" className="btn ghost dark" onClick={onReset}>Reset</button>
                                                <button type="submit" className="btn primary" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
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
