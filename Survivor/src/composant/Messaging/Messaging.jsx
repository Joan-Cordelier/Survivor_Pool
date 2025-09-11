import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../../composant/Startup/Startup.scss';
import * as UserApi from '../../apis/BackendApi/User.api';
import * as MessageApi from '../../apis/BackendApi/Message.api';

export default function Messaging() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // Messaging state (same shape as before)
    const [conversations, setConversations] = useState([]);
    const [selectedConvId, setSelectedConvId] = useState(null);
    const [messageText, setMessageText] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [contacts, setContacts] = useState([]);
    const [contactQuery, setContactQuery] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [creatingConvId, setCreatingConvId] = useState(null);
    const [msg, setMsg] = useState(null);
    // refs to keep latest values for polling handlers
    const conversationsRef = useRef([]);
    const lastSeenRef = useRef({}); // otherId -> last message time (ms)

    // normalize various server time formats into epoch ms number
    function resolveTime(v) {
        if (v === undefined || v === null) return Date.now();
        if (typeof v === 'number' && !isNaN(v)) return v;
        const n = Number(v);
        if (!isNaN(n) && String(v).trim() !== '') return n;
        const p = Date.parse(String(v));
        if (!isNaN(p)) return p;
        return Date.now();
    }

    // load user and redirect to login if missing
    useEffect(() => {
        try {
            const token = localStorage.getItem('token');
            const stored = JSON.parse(localStorage.getItem('user') || 'null');
            if (!token || !stored) {
                const from = `${location?.pathname || '/'}${location?.search || ''}${location?.hash || ''}`;
                navigate('/Login', { replace: true, state: { from } });
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

    // helper to load conversations
    async function loadConversations() {
        if (!user) return;
        try {
            const token = localStorage.getItem('token');
            const sentRes = await MessageApi.getSentMessages?.(user.id, token);
            const recRes = await MessageApi.getReceivedMessages?.(user.id, token);
            const sentArr = Array.isArray(sentRes) ? sentRes : (sentRes?.data || sentRes?.messages || sentRes || []);
            const recArr = Array.isArray(recRes) ? recRes : (recRes?.data || recRes?.messages || recRes || []);
            const allMsgs = [...(sentArr || []), ...(recArr || [])];

            const groups = {};
            for (const m of allMsgs) {
                const sender = m.sender_id ?? m.senderId ?? m.authorId ?? m.sender ?? null;
                const receiver = m.receiver_id ?? m.receiverId ?? m.to ?? m.receiver ?? null;
                const authorId = sender;
                const otherId = Number(authorId) === Number(user.id) ? Number(receiver) : Number(authorId);
                if (!otherId || otherId === 'null') continue;
                groups[otherId] = groups[otherId] || [];
                groups[otherId].push(m);
            }

            const convs = [];
            for (const otherId of Object.keys(groups)) {
                const raw = groups[otherId];
                const msgs = raw.map(mm => ({
                    id: mm.id ?? mm._id ?? Math.floor(Math.random() * 1e9),
                    authorId: mm.sender_id ?? mm.senderId ?? mm.authorId ?? mm.sender ?? 0,
                    text: mm.content ?? mm.text ?? mm.message ?? '',
                    time: resolveTime(mm.sent_at ?? mm.sentAt ?? mm.time ?? mm.created_at ?? mm.createdAt ?? Date.now()),
                    raw: mm,
                })).sort((a, b) => (a.time || 0) - (b.time || 0));

                const last = msgs[msgs.length - 1];
                let info = null;
                try {
                    const ures = await UserApi.getUserById?.(otherId);
                    info = ures?.user || ures || null;
                } catch (e) { /* ignore */ }

                convs.push({
                    id: `user-${otherId}`,
                    interlocutor: { id: otherId, name: info?.name || `${info?.firstname || ''} ${info?.lastname || ''}`.trim() || `User ${otherId}`, role: info?.role || (info?.is_admin ? 'Admin' : 'User') },
                    lastMessage: last?.text || '',
                    unread: msgs.filter(x => String(x.authorId) !== String(user.id)).length,
                    messages: msgs,
                });
            }

            convs.sort((a, b) => (b.messages[b.messages.length - 1]?.time || 0) - (a.messages[a.messages.length - 1]?.time || 0));
            setConversations(convs);
            // sync refs used by the poller
            conversationsRef.current = convs;
            const map = {};
            for (const c of convs) {
                const oid = String(c.interlocutor?.id);
                map[oid] = c.messages[c.messages.length - 1]?.time || 0;
            }
            lastSeenRef.current = map;
            if (convs.length && !conversations.length) setSelectedConvId(convs[0].id);
        } catch (err) {
            console.error('Failed to load messages', err);
            setConversations([]);
        }
    }

    useEffect(() => { if (!user) return; loadConversations(); }, [user]);

    // polling: fetch only received messages and append truly new messages
    useEffect(() => {
        if (!user) return;
        const POLL_INTERVAL_MS = 8000;
        let mounted = true;

        const processReceived = async () => {
            try {
                const token = localStorage.getItem('token');
                const recRes = await MessageApi.getReceivedMessages?.(user.id, token);
                const recArr = Array.isArray(recRes) ? recRes : (recRes?.data || recRes?.messages || recRes || []);
                if (!Array.isArray(recArr) || !recArr.length) return;

                // iterate received messages and append only messages we don't know about
                for (const mm of recArr) {
                    const sender = mm.sender_id ?? mm.senderId ?? mm.authorId ?? mm.sender ?? null;
                    const otherId = String(sender);
                    const mid = mm.id ?? mm._id ?? mm.message_id ?? null;
                    // see if we already have this message (by id)
                    const existingConv = conversationsRef.current.find(c => String(c.interlocutor?.id) === otherId);
                    const alreadyKnown = existingConv && existingConv.messages.some(m => String(m.id) === String(mid));
                    if (alreadyKnown) continue;

                    // map server message to local shape
                    const mapped = {
                        id: mid ?? Math.floor(Math.random() * 1e9),
                        authorId: Number(sender),
                        text: mm.content ?? mm.text ?? mm.message ?? '',
                        time: resolveTime(mm.sent_at ?? mm.sentAt ?? mm.time ?? mm.created_at ?? mm.createdAt ?? Date.now()),
                        raw: mm,
                    };

                    if (existingConv) {
                        // append to existing conversation
                        setConversations(prev => {
                            const next = prev.map(c => {
                                if (String(c.interlocutor?.id) !== otherId) return c;
                                const msgs = [...(c.messages || []), mapped];
                                return { ...c, messages: msgs, lastMessage: mapped.text || c.lastMessage, unread: (selectedConvId === c.id ? 0 : ((c.unread || 0) + 1)) };
                            }).sort((a, b) => (b.messages[b.messages.length - 1]?.time || 0) - (a.messages[a.messages.length - 1]?.time || 0));
                            conversationsRef.current = next;
                            lastSeenRef.current[otherId] = mapped.time;
                            return next;
                        });
                    } else {
                        // create a new conversation
                        let info = null;
                        try { const ures = await UserApi.getUserById?.(otherId); info = ures?.user || ures || null; } catch (e) { }
                        const newConv = {
                            id: `user-${otherId}`,
                            interlocutor: { id: Number(otherId), name: info?.name || `${info?.firstname || ''} ${info?.lastname || ''}`.trim() || `User ${otherId}`, role: info?.role || (info?.is_admin ? 'Admin' : 'User') },
                            lastMessage: mapped.text || '',
                            unread: 1,
                            messages: [mapped],
                        };
                        setConversations(prev => {
                            const next = [newConv, ...(prev || [])];
                            conversationsRef.current = next;
                            lastSeenRef.current[otherId] = mapped.time;
                            return next;
                        });
                    }
                }
            } catch (e) {
                /* ignore polling errors */
            }
        };

        const id = setInterval(() => { if (!mounted) return; processReceived(); }, POLL_INTERVAL_MS);
        const t = setTimeout(() => { if (mounted) processReceived(); }, 1000);
        return () => { mounted = false; clearInterval(id); clearTimeout(t); };
    }, [user, selectedConvId]);

    const selectedConv = useMemo(() => conversations.find(c => c.id === selectedConvId) || null, [conversations, selectedConvId]);

    // load contacts once when contact filter selected
    useEffect(() => {
        let mounted = true;
        const load = async () => {
            if (filterRole !== 'contact') return;
            if (contacts && contacts.length) return;
            setLoadingContacts(true);
            try {
                const res = await UserApi.getAllUsers?.();
                const arr = Array.isArray(res) ? res : (res?.data || res?.users || []);
                if (!mounted) return;
                setContacts(arr.map(u => ({ id: u.id, name: u.name || `${u.firstname || ''} ${u.lastname || ''}`.trim() || `User ${u.id}`, role: u.role || 'User', raw: u })));
            } catch (e) {
                if (!mounted) return;
                setContacts([]);
            } finally { if (mounted) setLoadingContacts(false); }
        };
        load();
        return () => { mounted = false; };
    }, [filterRole]);

    const messagesListRef = useRef(null);
    useEffect(() => {
        const el = messagesListRef.current;
        if (!el) return;
        const t = setTimeout(() => { try { el.scrollTop = el.scrollHeight; } catch(e){} }, 50);
        return () => clearTimeout(t);
    }, [selectedConvId, selectedConv?.messages?.length]);

    // load messages for selected conversation when empty
    useEffect(() => {
        if (!selectedConv || !user) return;
        if (selectedConv.messages && selectedConv.messages.length) return;
        (async () => {
            try {
                const token = localStorage.getItem('token');
                const sentRes = await MessageApi.getSentMessages?.(user.id, token);
                const recRes = await MessageApi.getReceivedMessages?.(user.id, token);
                const sentArr = Array.isArray(sentRes) ? sentRes : (sentRes?.data || sentRes?.messages || sentRes || []);
                const recArr = Array.isArray(recRes) ? recRes : (recRes?.data || recRes?.messages || recRes || []);
                const all = [...(sentArr || []), ...(recArr || [])];

                const otherId = String(selectedConv.interlocutor?.id);
                const raw = all.filter(m => {
                    const s = m.sender_id ?? m.senderId ?? m.authorId ?? m.sender ?? null;
                    const r = m.receiver_id ?? m.receiverId ?? m.to ?? m.receiver ?? null;
                    return String(s) === otherId || String(r) === otherId;
                });

                const msgs = raw.map(mm => ({
                    id: mm.id ?? mm._id ?? Math.floor(Math.random() * 1e9),
                    authorId: mm.sender_id ?? mm.senderId ?? mm.authorId ?? mm.sender ?? 0,
                    text: mm.content ?? mm.text ?? mm.message ?? '',
                    time: resolveTime(mm.sent_at ?? mm.sentAt ?? mm.time ?? mm.created_at ?? mm.createdAt ?? Date.now()),
                    raw: mm,
                })).sort((a, b) => (a.time || 0) - (b.time || 0));

                setConversations(prev => prev.map(c => c.id === selectedConv.id ? { ...c, messages: msgs, lastMessage: msgs[msgs.length - 1]?.text || c.lastMessage } : c));
            } catch (err) { console.error('Failed to load conversation messages', err); }
        })();
    }, [selectedConvId, user]);

    function startConversationWith(u) {
        try {
            if (!u || (u.id === undefined || u.id === null)) return;
            const targetId = String(u.id);
            const existing = conversations.find(c => String(c.interlocutor?.id) === targetId || String(c.id) === `user-${targetId}`);
            if (existing) { setSelectedConvId(existing.id); setFilterRole('all'); return; }
            const candidateId = `user-${targetId}`;
            if (conversations.some(c => String(c.id) === candidateId)) { setSelectedConvId(candidateId); setFilterRole('all'); return; }
            const newConv = { id: candidateId, interlocutor: { id: Number(u.id), name: u.name || `User ${u.id}`, role: u.role || 'User' }, lastMessage: '', unread: 0, messages: [] };
            setConversations(prev => [newConv, ...prev]);
            setSelectedConvId(newConv.id);
            setFilterRole('all');
        } catch (err) { console.error('startConversationWith error', err, u); }
    }

    function selectConversation(id) {
        setSelectedConvId(id);
        setMessageText('');
        setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c));
    }

    async function sendMessage(e) {
        e?.preventDefault?.();
        if (!selectedConvId) { setMsg('Aucune conversation sélectionnée.'); return; }
        if (!messageText.trim()) { setMsg('Message vide.'); return; }
        const text = messageText.trim();
        const conv = conversations.find(c => c.id === selectedConvId);
        if (!conv) return;
        const receiverId = conv.interlocutor?.id;
        if (!receiverId) return;
        const tempId = `tmp-${Date.now()}`;
        const tempMsg = { id: tempId, authorId: user?.id || 0, text, time: Date.now(), sending: true };
        setConversations(prev => prev.map(c => c.id === selectedConvId ? { ...c, messages: [...c.messages, tempMsg], lastMessage: text } : c));
        setMessageText('');
        try {
            const token = localStorage.getItem('token');
            const sid = Number(user?.id);
            const rid = Number(receiverId);
            if (isNaN(rid) || rid <= 0) { setMsg('Identifiant du destinataire invalide.'); console.error('Invalid receiver id', receiverId); return; }
            const payload = { sender_id: sid, receiver_id: rid, content: text };
            const res = await MessageApi.createMessage?.(payload, token);
            const created = res || (res?.data || res?.message || null) || null;
            if (!created) throw new Error('No response from server when creating message');
            const serverMsg = {
                id: created.id ?? created._id ?? created.message_id ?? Math.floor(Math.random() * 1e9),
                authorId: Number(created.sender_id ?? created.senderId ?? created.authorId ?? user?.id ?? 0),
                text: String(created.content ?? created.content_text ?? created.text ?? created.message ?? text),
                time: created.sent_at ?? created.sentAt ?? created.time ?? created.created_at ?? created.createdAt ?? Date.now(),
                raw: created,
            };
            setConversations(prev => prev.map(c => {
                if (c.id !== selectedConvId) return c;
                const msgs = c.messages.map(m => (m.id === tempId ? serverMsg : m));
                return { ...c, messages: msgs, lastMessage: serverMsg.text || text };
            }));
        } catch (err) {
            console.error('Failed to send message', err);
            setConversations(prev => prev.map(c => {
                if (c.id !== selectedConvId) return c;
                const msgs = c.messages.filter(m => m.id !== tempId);
                return { ...c, messages: msgs };
            }));
            const em = (err && (err.data?.message || err.message || (typeof err === 'string' ? err : JSON.stringify(err)))) || 'Échec de l’envoi du message';
            setMsg(em);
        }
    }

    if (!user) return <div className="startup-page" />;

    return (
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
                                                        <button type="button" className="btn primary" onClick={async () => { setCreatingConvId(u.id); try { startConversationWith(u); } finally { setCreatingConvId(null); } }} disabled={creatingConvId === u.id}>{creatingConvId === u.id ? '…' : 'Message'}</button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>
                            </div>
                        )}

                        {filterRole !== 'contact' && (
                            (conversations.length === 0) ? (
                                <div style={{ padding: 12 }}>Aucune conversation</div>
                            ) : (
                                conversations.map(c => (
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
                                    {msg && <div style={{ color: '#b91c1c', fontSize: 13, marginTop: 6 }}>{msg}</div>}
                                </div>
                            </div>
                            <div className="messages-list" id="messages-list" ref={messagesListRef}>
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
                                <button type="submit" className="btn primary">Send</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
