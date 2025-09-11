import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line } from 'recharts';
import { useNavigate, useLocation } from 'react-router-dom';
import './Dashboard.scss';

/* API CALLS */
import * as EventApi from '../../apis/BackendApi/Event.api';
import * as StartupApi from '../../apis/BackendApi/Startup.api';
import * as InvestorApi from '../../apis/BackendApi/Investor.api';
import * as PartnerApi from '../../apis/BackendApi/Partner.api';
import * as NewsApi from '../../apis/BackendApi/News.api';
import * as UserApi from '../../apis/BackendApi/User.api';
import * as FounderApi from '../../apis/BackendApi/Founder.api';

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
    { key: 'founders', label: 'Founders', icon: '👤', roles: ['admin'], endpoint: '/founder/get' },
    { key: 'investors', label: 'Investors', icon: '💼', roles: ['default', 'admin'], endpoint: '/investor/get' },
    { key: 'partners', label: 'Partners', icon: '🤝', roles: ['default', 'admin'], endpoint: '/partner/get' },
    { key: 'news', label: 'News', icon: '📰', roles: ['admin'], endpoint: '/news/get' },
    { key: 'users', label: 'Users', icon: '👥', roles: ['admin'], endpoint: '/user/get' },
];

const SECTION_FORMS = {
    events: [
        { name: 'name', label: 'Name*', required: true },
        { name: 'dates', label: 'Date', type: 'date', placeholder: '2025-09-04' },
        { name: 'location', label: 'Location' },
        { name: 'event_type', label: 'Type' },
        { name: 'target_audience', label: 'Target audience' },
        { name: 'image', label: 'Image (URL/Base64)' },
        { name: 'description', label: 'Description', textarea: true }
    ],
    startups: [
        { name: 'name', label: 'Name*', required: true },
        { name: 'email', label: 'Email*', required: true, type: 'email' },
        { name: 'legal_status', label: 'Legal status' },
        { name: 'address', label: 'Address' },
        { name: 'phone', label: 'Phone' },
        { name: 'website_url', label: 'Website URL' },
        { name: 'social_media_url', label: 'Social media URL' },
        { name: 'sector', label: 'Sector' },
        { name: 'maturity', label: 'Maturity' },
        { name: 'project_status', label: 'Project status' },
        { name: 'needs', label: 'Needs', textarea: true },
        { name: 'description', label: 'Description', textarea: true }
    ],
    investors: [
        { name: 'name', label: 'Name*', required: true },
        { name: 'email', label: 'Email*', required: true, type: 'email' },
        { name: 'legal_status', label: 'Legal status' },
        { name: 'address', label: 'Address' },
        { name: 'phone', label: 'Phone' },
        { name: 'investor_type', label: 'Investor type' },
        { name: 'investment_focus', label: 'Investment focus', textarea: true },
        { name: 'description', label: 'Description', textarea: true }
    ],
    partners: [
        { name: 'name', label: 'Name*', required: true },
        { name: 'email', label: 'Email*', type: 'email', required: true },
        { name: 'legal_status', label: 'Legal status' },
        { name: 'address', label: 'Address' },
        { name: 'phone', label: 'Phone' },
        { name: 'partnership_type', label: 'Partnership type' },
        { name: 'description', label: 'Description', textarea: true }
    ],
    news: [
        { name: 'title', label: 'Title*', required: true },
        { name: 'description', label: 'Description*', required: true, textarea: true },
        { name: 'news_date', label: 'Date', type: 'date' },
        { name: 'location', label: 'Location' },
        { name: 'category', label: 'Category' },
        { name: 'startup_id', label: 'Startup', select: true },
        { name: 'image', label: 'Image (URL/Base64)' }
    ],
    founders: [
        { name: 'name', label: 'Name*', required: true },
        { name: 'startup_id', label: 'Startup*', select: true, required: true },
        { name: 'image', label: 'Image (URL/Base64)' }
    ]
};

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState(null);
    const [active, setActive] = useState('overview');
    const [dataCache, setDataCache] = useState({});
    const [loadingSection, setLoadingSection] = useState(false);
    const redirectedRef = useRef(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [modal, setModal] = useState({ open: false, mode: null, section: null, row: null, loading: false, error: null });
    const [chartsReady, setChartsReady] = useState(false);
    const [overviewBatchLoading, setOverviewBatchLoading] = useState(false);
    const [imageData, setImageData] = useState(null);

// Export PDF
const pdfRef = useRef(null);
const [exporting, setExporting] = useState(false);

const exportDashboard = useCallback(async () => {
  if (!pdfRef.current) return;

  document.documentElement.classList.add('pdf-export');

  try {
    setExporting(true);

    const html2canvas = (await import('html2canvas')).default;
    const jsPDF = (await import('jspdf')).default;

    const node = pdfRef.current;
    await new Promise((r) => requestAnimationFrame(r));

    const scale = Math.min(2, window.devicePixelRatio || 1.5);
    const canvas = await html2canvas(node, {
      scale,
      useCORS: true,
      backgroundColor: '#ffffff',
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.clientWidth,
    });

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const pxPerMm = canvas.width / pageW;
    const pageHpx = Math.floor(pageH * pxPerMm);

    let y = 0, pageIndex = 0;
    while (y < canvas.height) {
      const sliceH = Math.min(pageHpx, canvas.height - y);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceH;

      const ctx = pageCanvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      const img = pageCanvas.toDataURL('image/png');
      if (pageIndex > 0) doc.addPage();
      doc.addImage(img, 'PNG', 0, 0, pageW, sliceH / pxPerMm);
      doc.setFontSize(9);
      doc.setTextColor(90);
      const title = `JEB Dashboard — ${SECTIONS.find(s => s.key === active)?.label || 'Overview'}`;
      const ts = new Date().toLocaleString();
      doc.text(title, 10, 6);
      doc.text(ts, pageW - 10, 6, { align: 'right' });
      doc.setDrawColor(230); doc.line(10, 8, pageW - 10, 8);
      doc.text(`Page ${pageIndex + 1}`, pageW - 10, pageH - 6, { align: 'right' });

      y += sliceH;
      pageIndex++;
    }

    doc.save(`dashboard_${active}_${new Date().toISOString().slice(0,10)}.pdf`);
  } catch (err) {
    console.error(err);
    alert('PDF export failed. ' + (err?.message || ''));
  } finally {
    setExporting(false);
    document.documentElement.classList.remove('pdf-export');
  }
}, [active]);

    const readImageAsDataUrl = (file) => new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ''));
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        } catch (e) {
            reject(e);
        }
    });

    // MODE USER
    useEffect(() => {
        const token = localStorage.getItem('token');
        let storedUser = null;

        if (!token) {
            setError('No token. Redirecting...');
            redirectedRef.current = true;
            navigate('/Login', { replace: true, state: { from: location?.pathname || '/' } });
            return;
        }
        const payload = decodeJwt(token);
        if (!payload) {
            setError('Invalid token.');
            localStorage.removeItem('token');
            navigate('/Login', { replace: true, state: { from: location?.pathname || '/' } });
            return;
        }
        if (payload.exp && Date.now() / 1000 > payload.exp) {
            setError('Session expired.');
            localStorage.removeItem('token');
            navigate('/Login', { replace: true, state: { from: location?.pathname || '/' } });
            return;
        }
        try {
            storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        } catch { }
        const hydrated = {
            id: payload.id || payload.userId || payload.sub,
            email: payload.email || storedUser?.email || '-',
            name: payload.name || storedUser?.name || '-',
            role: payload.role || storedUser?.role || 'default',
            raw: payload
        };
        setUser(hydrated);
        try {
            const prev = JSON.parse(localStorage.getItem('user') || 'null');
            localStorage.setItem('user', JSON.stringify({ id: hydrated.id, email: hydrated.email, name: hydrated.name, role: hydrated.role, image: prev?.image }));
        } catch {
            localStorage.setItem('user', JSON.stringify({ id: hydrated.id, email: hydrated.email, name: hydrated.name, role: hydrated.role }));
        }
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

            let items = [];
            if (key === 'events')
                items = await EventApi.getAllEvents();
            else if (key === 'startups')
                items = await StartupApi.getAllStartups();
            else if (key === 'investors')
                items = await InvestorApi.getAllInvestors();
            else if (key === 'founders')
                items = await FounderApi.getAllFounders();
            else if (key === 'partners')
                items = await PartnerApi.getAllPartners();
            else if (key === 'news')
                items = await NewsApi.getAllNews();
            else if (key === 'users')
                items = await UserApi.getAllUsers();
            setDataCache(dc => ({ ...dc, [key]: { items: Array.isArray(items) ? items : (items.data || []), error: null } }));
        } catch (e) {
            setDataCache(dc => ({ ...dc, [key]: { items: [], error: e.message || 'Load error' } }));
        } finally {
            setLoadingSection(false);
        }
    }, [dataCache]);

    const batchLoadOverview = useCallback(async () => {
        if (overviewBatchLoading) return;
        const keys = ['events', 'startups', 'investors', 'partners', 'news'];
        const missing = keys.filter(k => !dataCache[k]);
        if (!missing.length) return;
        try {
            setOverviewBatchLoading(true);
            const promises = missing.map(k => {
                if (k === 'events')
                    return EventApi.getAllEvents();
                if (k === 'startups')
                    return StartupApi.getAllStartups();
                if (k === 'investors')
                    return InvestorApi.getAllInvestors();
                if (k === 'partners')
                    return PartnerApi.getAllPartners();
                if (k === 'news')
                    return NewsApi.getAllNews();
                return Promise.resolve([]);
            });
            const settled = await Promise.allSettled(promises);
            const updates = {};
            settled.forEach((res, idx) => {
                const k = missing[idx];
                if (res.status === 'fulfilled') {
                    const value = res.value;
                    const items = Array.isArray(value) ? value : (value?.data || []);
                    updates[k] = { items, error: null };
                } else {
                    updates[k] = { items: [], error: res.reason?.message || 'Load error' };
                }
            });
            if (Object.keys(updates).length) {
                setDataCache(dc => ({ ...dc, ...updates }));
            }
        } finally {
            setOverviewBatchLoading(false);
        }
    }, [dataCache, overviewBatchLoading]);

    useEffect(() => {
        if (!checking && user) {
            if (active === 'overview') {
                batchLoadOverview();
            } else {
                const section = SECTIONS.find(s => s.key === active && s.endpoint);
                if (section && !dataCache[active]) loadSection(active);
            }
        }
    }, [checking, user, active, batchLoadOverview, loadSection, dataCache]);

    useEffect(() => {
        const keys = ['events', 'startups', 'investors', 'partners', 'news'];
        if (keys.every(k => dataCache[k])) {
            const id = requestAnimationFrame(() => setChartsReady(true));
            return () => cancelAnimationFrame(id);
        }
    }, [dataCache]);

    useEffect(() => { }, [active, checking, loadSection]);
    useEffect(() => {
        if (!modal.open || modal.section !== 'users')
            return;

        if (!dataCache.founders) {
            import('../../apis/BackendApi/Founder.api').then(mod => mod.getAllFounders())
                .then(items => setDataCache(dc => ({ ...dc, founders: { items: Array.isArray(items) ? items : (items?.data || []), error: null } })))
                .catch(() => setDataCache(dc => ({ ...dc, founders: { items: [], error: 'Load error' } })));
        }
        if (!dataCache.investors) {
            InvestorApi.getAllInvestors()
                .then(items => setDataCache(dc => ({ ...dc, investors: { items: Array.isArray(items) ? items : (items?.data || []), error: null } })))
                .catch(() => setDataCache(dc => ({ ...dc, investors: { items: [], error: 'Load error' } })));
        }
    }, [modal.open, modal.section, dataCache.founders, dataCache.investors]);

    useEffect(() => {
        if (!modal.open || modal.section !== 'founders') return;
        if (!dataCache.startups) {
            StartupApi.getAllStartups()
                .then(items => setDataCache(dc => ({ ...dc, startups: { items: Array.isArray(items) ? items : (items?.data || []), error: null } })))
                .catch(() => setDataCache(dc => ({ ...dc, startups: { items: [], error: 'Load error' } })));
        }
    }, [modal.open, modal.section, dataCache.startups]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/', { replace: true });
    };

    if (checking) {
        return (
            <div className="dashboard-loading">
                Checking token...
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
            case 'founders': return '/founder';
            case 'investors': return '/investor';
            case 'partners': return '/partner';
            case 'news': return '/news';
            case 'users': return '/user';
            default: return '';
        }
    };

    const openCreate = (sectionKey) => {
        if (sectionKey === 'users' || SECTION_FORMS[sectionKey]) {
            setImageData(null);
            setModal({ open: true, mode: 'create', section: sectionKey, row: null, loading: false, error: null });
        } else {
            alert('Creation not available.');
        }
    };

    const openEdit = (sectionKey, row) => {
        if (sectionKey === 'users' || SECTION_FORMS[sectionKey]) {
            setImageData(row?.image || null);
            setModal({ open: true, mode: 'edit', section: sectionKey, row, loading: false, error: null });
        } else {
            alert('Edition not available.');
        }
    };

    const confirmDelete = async (sectionKey, row) => {
        if (!row || row.id == null) { alert('Missing ID'); return; }
        if (!window.confirm('Delete item #' + row.id + ' ?')) return;
        try {
            const token = localStorage.getItem('token');
            if (sectionKey === 'events')
                await EventApi.deleteEvent(row.id, token);
            else if (sectionKey === 'startups')
                await StartupApi.deleteStartup(row.id, token);
            else if (sectionKey === 'investors')
                await InvestorApi.deleteInvestor(row.id, token);
            else if (sectionKey === 'founders')
                await FounderApi.deleteFounder(row.id, token);
            else if (sectionKey === 'partners')
                await PartnerApi.deletePartner(row.id, token);
            else if (sectionKey === 'news')
                await NewsApi.deleteNews(row.id, token);
            else if (sectionKey === 'users')
                await UserApi.deleteUser(row.id, token);
            setDataCache(dc => {
                const cur = dc[sectionKey];
                if (!cur)
                    return dc;
                return { ...dc, [sectionKey]: { ...cur, items: cur.items.filter(it => it.id !== row.id) } };
            });
        } catch (e) {
            alert('Delete error: ' + (e.message || e));
        }
    };

    const closeModal = () => { setImageData(null); setModal(m => ({ ...m, open: false })); };

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
            setModal(m => ({ ...m, error: 'Missing required fields' }));
            return;
        }
        try {
            setModal(m => ({ ...m, loading: true, error: null }));
            const token = localStorage.getItem('token');
            const imgB64 = (imageData || form.image?.value || '').trim();
            if (imgB64) payload.image = imgB64;
            const created = await UserApi.createUser(payload, token);
            setDataCache(dc => {
                const cur = dc.users; if (!cur) return dc;
                return { ...dc, users: { ...cur, items: [created, ...cur.items] } };
            });
            closeModal();
        } catch (err) {
            setModal(m => ({ ...m, loading: false, error: err.message || 'Creation error' }));
        }
    };

    const submitUserEdit = async (e) => {
        e.preventDefault();
        if (!modal.row)
            return;

        const form = e.target;
        const updateFields = {};
        const name = form.name.value.trim();

        if (name && name !== modal.row.name)
            updateFields.name = name;
        const role = form.role.value.trim();
        if (role && role !== modal.row.role) updateFields.role = role;
        const password = form.password.value;
        if (password) updateFields.password = password;
        const founder_id = form.founder_id.value ? Number(form.founder_id.value) : null;
        if (founder_id !== modal.row.founder_id)
            updateFields.founder_id = founder_id;
        const investor_id = form.investor_id.value ? Number(form.investor_id.value) : null;
        if (investor_id !== modal.row.investor_id)
            updateFields.investor_id = investor_id;
        const imgU = imageData || form.image?.value || null;
        if (imgU !== (modal.row?.image || null))
            updateFields.image = imgU || null;
        if (Object.keys(updateFields).length === 0) { closeModal(); return; }
        try {
            setModal(m => ({ ...m, loading: true, error: null }));
            const token = localStorage.getItem('token');
            const data = await UserApi.updateUser(modal.row.id, { updateFields }, token);
            const updated = data.user || data;
            setDataCache(dc => {
                const cur = dc.users; if (!cur) return dc;
                return { ...dc, users: { ...cur, items: cur.items.map(u => u.id === updated.id ? updated : u) } };
            });
            closeModal();
        } catch (err) {
            setModal(m => ({ ...m, loading: false, error: err.message || 'Update error' }));
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
            if (v === '')
                v = null;
            if (f.textarea)
                v = form[f.name].value;
            if (v !== null && /_id$/.test(f.name) && !isNaN(Number(v)))
                v = Number(v);
            if (v !== null)
                payload[f.name] = v;
        });
        if (fields.some(f => f.name === 'image')) {
            if (imageData)
                payload.image = imageData;
        }
        if (sectionKey === 'events' && payload.dates)
            payload.dates = normalizeDateStr(payload.dates);
        if (sectionKey === 'news' && payload.news_date)
            payload.news_date = normalizeDateStr(payload.news_date);
        for (const f of fields) {
            if (f.required && (payload[f.name] == null || payload[f.name] === '')) {
                setModal(m => ({ ...m, error: 'Missing required fields' }));
                return;
            }
        }
        try {
            setModal(m => ({ ...m, loading: true, error: null }));
            const token = localStorage.getItem('token');
            let created;
            if (sectionKey === 'events')
                created = await EventApi.createEvent(payload, token);
            else if (sectionKey === 'startups')
                created = await StartupApi.createStartup(payload, token);
            else if (sectionKey === 'investors')
                created = await InvestorApi.createInvestor(payload, token);
            else if (sectionKey === 'founders')
                created = await FounderApi.createFounder(payload, token);
            else if (sectionKey === 'partners')
                created = await PartnerApi.createPartner(payload, token);
            else if (sectionKey === 'news')
                created = await NewsApi.createNews(payload, token);
            setDataCache(dc => {
                const cur = dc[sectionKey]; if (!cur) return dc;
                return { ...dc, [sectionKey]: { ...cur, items: [created, ...cur.items] } };
            });
            closeModal();
        } catch (err) {
            setModal(m => ({ ...m, loading: false, error: err.message || 'Creation error' }));
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
            if (v === '') v = null;
            if (f.textarea) v = form[f.name].value;
            if (v !== null && /_id$/.test(f.name) && !isNaN(Number(v))) v = Number(v);
            if (v !== original && !(v == null && (original === null || original === undefined))) {
                updateFields[f.name] = v;
            }
        });
        if (sectionKey === 'events' && Object.prototype.hasOwnProperty.call(updateFields, 'dates')) {
            updateFields.dates = updateFields.dates ? normalizeDateStr(updateFields.dates) : updateFields.dates;
        }
        if (sectionKey === 'news' && Object.prototype.hasOwnProperty.call(updateFields, 'news_date')) {
            updateFields.news_date = updateFields.news_date ? normalizeDateStr(updateFields.news_date) : updateFields.news_date;
        }
        const imgVal = imageData || form.image?.value || null;
        if (imgVal !== (modal.row?.image || null)) {
            updateFields.image = imgVal || null;
        }
        if (Object.keys(updateFields).length === 0) { closeModal(); return; }
        try {
            setModal(m => ({ ...m, loading: true, error: null }));
            const token = localStorage.getItem('token');
            let data;
            if (sectionKey === 'events')
                data = await EventApi.updateEvent(modal.row.id, { updateFields }, token);
            else if (sectionKey === 'startups')
                data = await StartupApi.updateStartup(modal.row.id, { updateFields }, token);
            else if (sectionKey === 'investors')
                data = await InvestorApi.updateInvestor(modal.row.id, { updateFields }, token);
            else if (sectionKey === 'founders')
                data = await FounderApi.updateFounder(modal.row.id, { updateFields }, token);
            else if (sectionKey === 'partners')
                data = await PartnerApi.updatePartner(modal.row.id, { updateFields }, token);
            else if (sectionKey === 'news')
                data = await NewsApi.updateNews(modal.row.id, { updateFields }, token);
            const keyMap = { events: 'event', startups: 'startup', founders: 'founder', investors: 'investor', partners: 'partner', news: 'news' };
            const updated = data[keyMap[sectionKey]] || data;
            setDataCache(dc => {
                const cur = dc[sectionKey]; if (!cur) return dc;
                return { ...dc, [sectionKey]: { ...cur, items: cur.items.map(it => it.id === updated.id ? updated : it) } };
            });
            closeModal();
        } catch (err) {
            setModal(m => ({ ...m, loading: false, error: err.message || 'Update error' }));
        }
    };

    const renderModal = () => {
        if (!modal.open)
            return null;
        if (modal.section === 'users') {
            const isEdit = modal.mode === 'edit';
            const row = modal.row || {};
            return (
                <div className="modal-overlay" onMouseDown={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal(); }}>
                    <div className="modal" role="dialog" aria-modal="true">
                        <div className="modal-head">
                            <h3>{isEdit ? 'Edit user' : 'New user'}</h3>
                            <button className="close-x" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={isEdit ? submitUserEdit : submitUserCreate} className="modal-form">
                            <div className="form-row">
                                <label>Email*</label>
                                <input name="email" type="email" defaultValue={row.email || ''} disabled={isEdit} required />
                            </div>
                            <div className="form-row">
                                <label>Name*</label>
                                <input name="name" type="text" defaultValue={row.name || ''} required />
                            </div>
                            <div className="form-row">
                                <label>Role</label>
                                <select name="role" defaultValue={row.role || 'default'}>
                                    <option value="default">default</option>
                                    <option value="admin">admin</option>
                                    <option value="investor">investor</option>
                                    <option value="founder">founder</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <label>Password{isEdit ? ' (leave empty to keep)' : '*'} </label>
                                <input name="password" type="password" placeholder={isEdit ? '••••••' : ''} {...(!isEdit ? { required: true } : {})} />
                            </div>
                            <div className="form-row-inline">
                                <div>
                                    <label>Founder</label>
                                    <select name="founder_id" defaultValue={row.founder_id || ''}>
                                        <option value="">-- None --</option>
                                        {(dataCache.founders?.items || []).map(f => (
                                            <option key={f.id} value={f.id}>{f.name || ('#' + f.id)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label>Investor</label>
                                    <select name="investor_id" defaultValue={row.investor_id || ''}>
                                        <option value="">-- None --</option>
                                        {(dataCache.investors?.items || []).map(inv => (
                                            <option key={inv.id} value={inv.id}>{inv.name || ('#' + inv.id)}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <label>Avatar image</label>
                                <input type="hidden" name="image" defaultValue={row.image || ''} />
                                {imageData && <div style={{ marginBottom: 8 }}><img src={imageData} alt="preview" style={{ maxWidth: 160, borderRadius: 8 }} /></div>}
                                <input type="file" accept="image/*" onChange={async (e) => {
                                    const inputEl = e.currentTarget;
                                    const formEl = inputEl?.form || null;
                                    const f = inputEl.files?.[0];
                                    if (!f)
                                        return;
                                    if (!f.type.startsWith('image/')) {
                                        alert('Only image files allowed.');
                                        inputEl.value = '';
                                        return;
                                    }
                                    const b64 = await readImageAsDataUrl(f);
                                    setImageData(b64);
                                    const hidden = formEl?.elements?.namedItem('image');
                                    if (hidden && 'value' in hidden)
                                        hidden.value = b64;
                                }} />
                            </div>
                            {modal.error && <div className="form-error">{modal.error}</div>}
                            <div className="modal-actions">
                                <button type="button" className="btn sm" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn primary" disabled={modal.loading}>{modal.loading ? 'Processing...' : (isEdit ? 'Update' : 'Create')}</button>
                            </div>
                        </form>
                    </div>
                </div>
            );
        } else if (SECTION_FORMS[modal.section]) {
            const isEdit = modal.mode === 'edit';
            const fields = SECTION_FORMS[modal.section];
            const row = modal.row || {};
            const startupsList = (dataCache.startups?.items) || [];
            const requireStartup = modal.section === 'founders';
            const noStartups = requireStartup && startupsList.length === 0;
            return (
                <div className="modal-overlay" onMouseDown={(e) => { if (e.target.classList.contains('modal-overlay')) closeModal(); }}>
                    <div className="modal" role="dialog" aria-modal="true">
                        <div className="modal-head">
                            <h3>{isEdit ? 'Edit' : 'Create'} {SECTIONS.find(s => s.key === modal.section)?.label}</h3>
                            <button className="close-x" onClick={closeModal}>✕</button>
                        </div>
                        <form onSubmit={isEdit ? submitGenericEdit : submitGenericCreate} className="modal-form">
                            {fields.map(f => {
                                if (f.name === 'startup_id' && f.select) {
                                    return (
                                        <div className="form-row" key={f.name}>
                                            <label>{f.label}</label>
                                            <select name={f.name} defaultValue={row[f.name] || ''} required>
                                                {startupsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    );
                                }
                                if ((modal.section === 'events' && f.name === 'image') || (modal.section === 'news' && f.name === 'image') || (modal.section === 'founders' && f.name === 'image')) {
                                    return (
                                        <div className="form-row" key={f.name}>
                                            <label>{f.label || 'Image'}</label>
                                            <input type="hidden" name="image" defaultValue={row.image || ''} />
                                            {imageData && <div style={{ marginBottom: 8 }}><img src={imageData} alt="preview" style={{ maxWidth: 240, borderRadius: 8 }} /></div>}
                                            <input type="file" accept="image/*" onChange={async (e) => {
                                                const inputEl = e.currentTarget;
                                                const formEl = inputEl?.form || null;
                                                const f = inputEl.files?.[0];
                                                if (!f) return;
                                                if (!f.type.startsWith('image/')) { alert('Only image files allowed.'); inputEl.value = ''; return; }
                                                const b64 = await readImageAsDataUrl(f);
                                                setImageData(b64);
                                                const hidden = formEl?.elements?.namedItem('image');
                                                if (hidden && 'value' in hidden) hidden.value = b64;
                                            }} />
                                        </div>
                                    );
                                }
                                return (
                                    <div className="form-row" key={f.name}>
                                        <label>{f.label}</label>
                                        {f.textarea ? (
                                            <textarea name={f.name} defaultValue={row[f.name] || ''} style={{ resize: 'vertical', minHeight: 80 }} {...(f.required && !isEdit ? { required: true } : {})} />
                                        ) : (
                                            <input name={f.name} type={f.type || 'text'} defaultValue={row[f.name] || ''} {...(f.required && !isEdit ? { required: true } : {})} />
                                        )}
                                    </div>
                                );
                            })}
                            {modal.error && <div className="form-error">{modal.error}</div>}
                            {noStartups && (
                                <div className="form-error">Create a Startup first to assign a founder.</div>
                            )}
                            <div className="modal-actions">
                                <button type="button" className="btn sm" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn primary" disabled={modal.loading || noStartups}>{modal.loading ? 'Processing...' : (isEdit ? 'Update' : 'Create')}</button>
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
            const requiredKeys = ['events', 'startups', 'investors', 'partners', 'news'];
            const loadingOverview = requiredKeys.some(k => !dataCache[k]);
            if (loadingOverview || !chartsReady) {
                return (
                    <div className="overview-loading" style={{ display: 'grid', gap: 16 }}>
                        <div className="card" style={{ height: 700, background: '#2a2a2a', borderRadius: 12 }} />
                        <div style={{ textAlign: 'center', opacity: .7 }}>{overviewBatchLoading ? 'Fetching data…' : 'Preparing charts…'}</div>
                    </div>
                );
            }
            const today = new Date();
            const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const msDay = 86400000;
            const last7Start = new Date(startToday.getTime() - 7 * msDay);
            const prev7Start = new Date(startToday.getTime() - 14 * msDay);

            const parseDate = (raw) => {
                if (!raw)
                    return null;
                const d = new Date(raw);
                return isNaN(d.getTime()) ? null : d;
            };

            const events = dataCache.events?.items || [];
            const eventsUpcoming = events.filter(ev => {
                const d = parseDate(ev.dates);
                return d && d >= startToday;
            });
            const eventsLast7 = events.filter(ev => {
                const d = parseDate(ev.dates);
                return d && d >= last7Start && d < startToday;
            });
            const eventsPrev7 = events.filter(ev => {
                const d = parseDate(ev.dates);
                return d && d >= prev7Start && d < last7Start;
            });

            const news = dataCache.news?.items || [];
            const newsLast7 = news.filter(n => {
                const d = parseDate(n.news_date);
                return d && d >= last7Start && d < startToday;
            });
            const newsPrev7 = news.filter(n => {
                const d = parseDate(n.news_date);
                return d && d >= prev7Start && d < last7Start;
            });

            const startups = dataCache.startups?.items || [];
            const investors = dataCache.investors?.items || [];
            const partners = dataCache.partners?.items || [];

            const startupsLast7 = startups.filter(s => {
                const d = parseDate(s.created_at);
                return d && d >= last7Start && d < startToday;
            });
            const startupsPrev7 = startups.filter(s => {
                const d = parseDate(s.created_at);
                return d && d >= prev7Start && d < last7Start;
            });
            const investorsLast7 = investors.filter(s => {
                const d = parseDate(s.created_at);
                return d && d >= last7Start && d < startToday;
            });
            const investorsPrev7 = investors.filter(s => {
                const d = parseDate(s.created_at);
                return d && d >= prev7Start && d < last7Start;
            });
            const partnersLast7 = partners.filter(s => {
                const d = parseDate(s.created_at);
                return d && d >= last7Start && d < startToday;
            });
            const partnersPrev7 = partners.filter(s => {
                const d = parseDate(s.created_at);
                return d && d >= prev7Start && d < last7Start;
            });

            const startupsTotal = startups.length;
            const investorsTotal = investors.length;
            const partnersTotal = partners.length;
            const eventsUpcomingTotal = eventsUpcoming.length;
            const newsLast7Total = newsLast7.length;

            const totalsData = [
                { name: 'Startups', value: startupsTotal || 0 },
                { name: 'Investors', value: investorsTotal || 0 },
                { name: 'Partners', value: partnersTotal || 0 },
                { name: 'Upcoming Events', value: eventsUpcomingTotal || 0 },
                { name: 'News (7d)', value: newsLast7Total || 0 }
            ];

            const pct = (cur, prev) => {
                if (prev === 0)
                    return cur === 0 ? 0 : 100;
                return ((cur - prev) / prev) * 100;
            };

            const safePct = (a, b) => {
                try {
                    const val = pct(a, b);
                    if (!isFinite(val)) return 0;
                    return Number(val.toFixed(1));
                } catch { return 0; }
            };
            const growthData = [
                { name: 'Startups', value: safePct(startupsLast7.length, startupsPrev7.length), cur: startupsLast7.length, prev: startupsPrev7.length },
                { name: 'Investors', value: safePct(investorsLast7.length, investorsPrev7.length), cur: investorsLast7.length, prev: investorsPrev7.length },
                { name: 'Partners', value: safePct(partnersLast7.length, partnersPrev7.length), cur: partnersLast7.length, prev: partnersPrev7.length },
                { name: 'Events', value: safePct(eventsLast7.length, eventsPrev7.length), cur: eventsLast7.length, prev: eventsPrev7.length },
                { name: 'News', value: safePct(newsLast7.length, newsPrev7.length), cur: newsLast7.length, prev: newsPrev7.length }
            ];

            const barPalette = ['#6d5dfc', '#8b6dfc', '#a86dfc', '#c26df7', '#dd6df0'];
            const growthColor = (v) => v > 0 ? '#16a34a' : (v < 0 ? '#dc2626' : '#5b6472');
            const GrowthTooltip = ({ active, payload }) => {
                if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 8, fontSize: 12 }}>
                            <strong>{p.name}</strong><br />
                            7d: {p.cur} | Prev: {p.prev}<br />
                            Δ %: {p.value}%
                        </div>
                    );
                }
                return null;
            };
            // 6-month trend across entities
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
            const last6 = [];
            for (let i=5;i>=0;i--) {
                const d = new Date(startToday.getFullYear(), startToday.getMonth()-i, 1);
                last6.push({ key: monthKey(d), label: months[d.getMonth()], y: d.getFullYear() });
            }
            const countByMonth = (arr, dateField) => {
                const map = new Map(last6.map(m => [m.key, 0]));
                arr.forEach(it => {
                    const d = parseDate(it[dateField]);
                    if (!d) return;
                    const key = monthKey(new Date(d.getFullYear(), d.getMonth(), 1));
                    if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
                });
                return last6.map(m => map.get(m.key) || 0);
            };
            const mStartups = countByMonth(startups, 'created_at');
            const mInvestors = countByMonth(investors, 'created_at');
            const mPartners = countByMonth(partners, 'created_at');
            const mEvents = countByMonth(events, 'dates');
            const mNews = countByMonth(news, 'news_date');
            const trend6Data = last6.map((m, idx) => ({ month: `${m.label} ${String(m.y).slice(2)}`, Startups: mStartups[idx], Investors: mInvestors[idx], Partners: mPartners[idx], Events: mEvents[idx], News: mNews[idx] }));

            // Distributions
            const dist = (arr, key) => {
                const map = new Map();
                arr.forEach(it => {
                    const k = (it?.[key] || 'N/A').toString();
                    map.set(k, (map.get(k) || 0) + 1);
                });
                const list = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
                list.sort((a,b) => b.value - a.value);
                if (list.length > 8) {
                    const top = list.slice(0,8);
                    const rest = list.slice(8).reduce((s,x)=>s+x.value,0);
                    if (rest>0) top.push({ name: 'Others', value: rest });
                    return top;
                }
                return list;
            };
            const eventsByType = dist(events, 'event_type');
            const startupsByMaturity = dist(startups, 'maturity');
            const investorsByType = dist(investors, 'investor_type');
            const partnersByType = dist(partners, 'partnership_type');
            const piePalette = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#8b5cf6','#84cc16','#f97316','#14b8a6'];
            const updatedAt = new Date().toLocaleString();
            return (
                <div className="overview-grid">
                    <div className="card kpi-unified">
                        <div className="kpi-head">
                            <div className="ttl">KPI Overview</div>
                            <div className="sub">Updated: {updatedAt}</div>
                        </div>

                        <div className="kpi-charts-grid">
                            <div className="kpi-chart">
                                <h3>Totals by type</h3>
                                <div style={{ width: '100%', height: 360 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={totalsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#d0d0d0" />
                                            <XAxis dataKey="name" stroke="#000" tick={{ fill: '#000', fontSize: 12 }} />
                                            <YAxis stroke="#000" allowDecimals={false} tick={{ fill: '#000', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #ccc', color: '#000' }} />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                                                {totalsData.map((d, i) => <Cell key={d.name} fill={barPalette[i % barPalette.length]} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="kpi-chart">
                                <h3>7-day growth vs previous period</h3>
                                <div style={{ width: '100%', height: 360 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={growthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#d0d0d0" />
                                            <XAxis dataKey="name" stroke="#000" tick={{ fill: '#000', fontSize: 12 }} />
                                            <YAxis stroke="#000" tickFormatter={(v) => v + '%'} tick={{ fill: '#000', fontSize: 12 }} />
                                            <Tooltip content={<GrowthTooltip />} />
                                            <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive={false}>
                                                {growthData.map(g => <Cell key={g.name} fill={growthColor(g.value)} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="kpi-chart" style={{ gridColumn: '1 / -1' }}>
                                <h3>Trend over the last 6 months</h3>
                                <div style={{ width: '100%', height: 380 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={trend6Data} margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis allowDecimals={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="Startups" stroke="#6d5dfc" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="Investors" stroke="#22c55e" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="Partners" stroke="#06b6d4" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="Events" stroke="#f59e0b" strokeWidth={2} dot={false} />
                                            <Line type="monotone" dataKey="News" stroke="#ef4444" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {!!eventsByType.length && (
                                <div className="kpi-chart">
                                    <h3>Events by type</h3>
                                    <div style={{ width: '100%', height: 260 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={eventsByType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                                                    {eventsByType.map((e,i) => (
                                                        <Cell key={e.name} fill={piePalette[i % piePalette.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {!!startupsByMaturity.length && (
                                <div className="kpi-chart">
                                    <h3>Startups by maturity</h3>
                                    <div style={{ width: '100%', height: 260 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={startupsByMaturity} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                                                    {startupsByMaturity.map((e,i) => (
                                                        <Cell key={e.name} fill={piePalette[i % piePalette.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {!!investorsByType.length && (
                                <div className="kpi-chart">
                                    <h3>Investors by type</h3>
                                    <div style={{ width: '100%', height: 260 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={investorsByType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                                                    {investorsByType.map((e,i) => (
                                                        <Cell key={e.name} fill={piePalette[i % piePalette.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {!!partnersByType.length && (
                                <div className="kpi-chart">
                                    <h3>Partners by type</h3>
                                    <div style={{ width: '100%', height: 260 }}>
                                        <ResponsiveContainer>
                                            <PieChart>
                                                <Pie data={partnersByType} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                                                    {partnersByType.map((e,i) => (
                                                        <Cell key={e.name} fill={piePalette[i % piePalette.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (loadingSection && !current)
            return <div className="section-loading">Loading...</div>;
        if (current?.error)
            return <div className="section-error">Error: {current.error}</div>;

        const list = current?.items || [];
        const columns = computeColumns(active, list);

        return (
            <div className="table-wrapper">
                <div className="table-toolbar">
                    <div className="ttl">
                        {SECTIONS.find(s => s.key === active)?.label} <span className="count-badge">{list.length}</span>
                    </div>
                    {safeUser.role === 'admin' && (
                        <button className="btn primary" onClick={() => openCreate(active)}>+ Add</button>
                    )}
                </div>
                {loadingSection && <div className="inline-loading">Refreshing...</div>}
                {(!list.length && !loadingSection) && <div className="empty">No data.</div>}
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
                                                <button onClick={() => openEdit(active, row)} className="btn sm" title="Edit">✏️</button>
                                                <button onClick={() => confirmDelete(active, row)} className="btn sm danger" title="Delete">🗑️</button>
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
            {menuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMenuOpen(false)}
                    aria-label="Close menu"
                />
            )}

            <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="brand">
                    <span>JEB Admin Panel</span>
                    <button
                        className="close-btn"
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                    >
                        ✕
                    </button>
                </div>

                <div className="user-box" title={safeUser.email}>
                    <div className="u-email">{safeUser.email}</div>
                    <span className={`u-role role-${safeUser.role}`}>{safeUser.role}</span>
                </div>

                <nav className="nav-sections">
                    <ul>
                        {accessibleSections.map((sec) => (
                            <li key={sec.key}>
                                <button
                                    className={sec.key === active ? 'active' : ''}
                                    onClick={() => setActive(sec.key)}
                                >
                                    <span className="ico" aria-hidden>
                                        {sec.icon}
                                    </span>
                                    <span className="lbl">{sec.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button className="logout-btn-full" onClick={handleLogout}>
                    Log out
                </button>
            </aside>

            <main className="main-panel">
                <header className="panel-header">
                    <button
                        className="menu-toggle"
                        onClick={() => setMenuOpen((m) => !m)}
                        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    >
                        {menuOpen ? '✕' : '☰'}
                    </button>

                    <h1>{SECTIONS.find((s) => s.key === active)?.label}</h1>

                    {/* Actions header (export) */}
                    <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                        {/* Affiche le bouton sur Overview quand les charts sont prêts.
                Si tu veux l’avoir partout, retire la condition. */}
                        {(active === 'overview' && chartsReady) && (
                            <button className="btn sm" onClick={exportDashboard} disabled={exporting}>
                                {exporting ? 'Exporting…' : 'Export PDF'}
                            </button>
                        )}
                    </div>
                </header>

                {/* Zone capturée pour le PDF */}
                <div className="panel-content" ref={pdfRef}>
                    {renderSection()}
                </div>
            </main>

            {renderModal()}
        </div>
    );


    function computeColumns(sectionKey, list) {
        if (!list.length) return [{ key: 'id', label: 'ID' }];
        const sample = list[0];
        const baseMap = {
            events: ['id', 'name', 'location', 'event_type', 'dates'],
            startups: ['id', 'name', 'email', 'sector', 'maturity'],
            founders: ['id', 'name', 'startup_id'],
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

    function normalizeDateStr(input) {
        if (!input)
            return input;
        if (/^\d{4}-\d{2}-\d{2}$/.test(input))
            return input;

        let s = String(input).trim().replace(/[\/]/g, '-');
        const parts = s.split('-');

        if (parts.length === 3) {
            if (parts[0].length === 4) {
                const [Y, M, D] = parts;
                return [Y, M.padStart(2, '0'), D.padStart(2, '0')].join('-');
            } else {

                const [D, M, Y] = parts;
                if (Y.length === 4) return [Y, M.padStart(2, '0'), D.padStart(2, '0')].join('-');
            }
        }
        

        const d = new Date(input);
        if (!isNaN(d.getTime())) {
            const Y = d.getFullYear();
            const M = String(d.getMonth() + 1).padStart(2, '0');
            const D = String(d.getDate()).padStart(2, '0');

            return `${Y}-${M}-${D}`;
        }
        return input;
    }
}
