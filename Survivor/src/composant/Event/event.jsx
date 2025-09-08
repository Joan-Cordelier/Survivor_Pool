import './event.scss';
import { useEffect, useMemo, useRef, useState } from "react";
import * as EventApi from '../../apis/BackendApi/Event.api';
import Defualt_img from '../../assets/Photo_default.svg';
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// cache simple pour éviter les doublons en mode Strict
let eventsCache = null;
const imageUrlCache = new Map();

const Events = () => {
  // Normalisation des données venant de la table Event
  const normalizeEvent = (e) => ({
    id: e.id ?? e._id ?? `${e.title ?? 'event'}-${Math.random().toString(36).slice(2,8)}`,
    title: e.name ?? e.title ?? 'Untitled event',
    description: e.description ?? '',
    location: e.location ?? '',
    event_type: e.event_type ?? '',
    target_audience: e.target_audience ?? '',
    date: e.dates ?? e.event_date ?? e.date ?? null,
    image: e.image ?? null,
  });

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch depuis ton backend
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    if (eventsCache) {
      setEvents(eventsCache.map(normalizeEvent));
      setLoading(false);
      return () => { mounted = false; };
    }

    EventApi.getAllEvents()
      .then((data) => {
        if (!mounted) return;
        const raw = Array.isArray(data) ? data : (data?.data ?? []);
        eventsCache = raw;
        setEvents(raw.map(normalizeEvent));
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setEvents([]);
      })
      .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  // === Filtres ===
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [audience, setAudience] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const locations = useMemo(
    () => Array.from(new Set(events.map(e => e.location).filter(Boolean))).sort(),
    [events]
  );
  const eventTypes = useMemo(
    () => Array.from(new Set(events.map(e => e.event_type).filter(Boolean))).sort(),
    [events]
  );
  const audiences = useMemo(
    () => Array.from(new Set(events.map(e => e.target_audience).filter(Boolean))).sort(),
    [events]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const ts = (d) => (d ? Date.parse(d) : NaN);

    return events
      .filter(e => {
        const matchesQ = !needle || [e.title, e.description, e.location].some(s => s?.toLowerCase().includes(needle));
        const matchesLoc = !location || e.location === location;
        const matchesType = !eventType || e.event_type === eventType;
        const matchesAud = !audience || e.target_audience === audience;
        const matchesFrom = !dateFrom || ts(e.date) >= ts(dateFrom);
        const matchesTo = !dateTo || ts(e.date) <= ts(dateTo);
        return matchesQ && matchesLoc && matchesType && matchesAud && matchesFrom && matchesTo;
      })
      .sort((a, b) => ts(a.date) - ts(b.date)); // du plus proche au plus lointain
  }, [events, q, location, eventType, audience, dateFrom, dateTo]);

  const clearFilters = () => {
    setQ(""); setLocation(""); setEventType(""); setAudience(""); setDateFrom(""); setDateTo("");
  };

  // Gestion des cartes expand/collapse
  const [expandedId, setExpandedId] = useState(null);
  const cardRefs = useRef({});
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  function scrollIntoViewIfNeeded(el) {
    const r  = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (r.top < 0 || r.bottom > vh) {
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }
  }


  useEffect(() => {
    if (!expandedId) return;
    const el = cardRefs.current[expandedId];
    if (el) scrollIntoViewIfNeeded(el);
  }, [expandedId]);


  return (
    <div className="events-page">
      {/* Filtres */}
      <div className="filters" role="region" aria-label="Event filters">
        <div className="filters-row">
          <input
            type="search"
            placeholder="Rechercher un événement…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">Tous lieux</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="">Tous types</option>
            {eventTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={audience} onChange={(e) => setAudience(e.target.value)}>
            <option value="">Toutes audiences</option>
            {audiences.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          <button className="clear" onClick={clearFilters}>Réinitialiser</button>
        </div>
        <div className="results">
          {filtered.length} événement{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Liste des events */}
      <section className="grid">
        {filtered.map((e) => {
          const expanded = expandedId === e.id;
          return (
            <article
              key={e.id}
              ref={(el) => (cardRefs.current[e.id] = el)}
              className={`card ${expanded ? "expanded" : ""}`}
            >
              <header className="card-header">
                <div className="logo-wrap">
                  <img
                    src={e.image || Defualt_img}
                    alt=""
                    className="logo"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    onError={(ev) => {
                      if (ev.currentTarget.src === Defualt_img) return; // évite boucle
                      ev.currentTarget.onerror = null;
                      ev.currentTarget.src = Defualt_img;
                      // fige aussi dans le state pour les prochains renders
                      setEvents(prev =>
                        prev.map(x => x.id === e.id ? { ...x, image: Defualt_img } : x)
                      );
                    }}
                  />
                </div>

                <div className="title-wrap">
                  <h3 className="title">{e.title}</h3>
                  <p className="kicker">{e.location} — {e.date}</p>
                </div>
                <button className="more" onClick={() => toggle(e.id)}>
                  {expanded ? "Fermer" : "More Details"}
                </button>
              </header>

              {expanded && (
                <div className="card-details">
                  <p>{e.description}</p>
                  <div className="meta">
                    <span className="badge">{e.event_type}</span>
                    <span className="badge">{e.target_audience}</span>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
};

export default Events;
