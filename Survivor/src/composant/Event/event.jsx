import './event.scss';
import { useEffect, useMemo, useRef, useState } from "react";
import * as EventApi from '../../apis/BackendApi/Event.api';
import Defualt_img from '../../assets/Photo_default.svg';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';



const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";
let eventsCache = null;
const imageUrlCache = new Map();

const Events = () => {
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

  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [eventType, setEventType] = useState("");
  const [audience, setAudience] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
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
        const matchesTo   = !dateTo   || ts(e.date) <= ts(dateTo);
        return matchesQ && matchesLoc && matchesType && matchesAud && matchesFrom && matchesTo;
      })
      .sort((a, b) => ts(a.date) - ts(b.date));
  }, [events, q, location, eventType, audience, dateFrom, dateTo]);

  const fcEvents = useMemo(() => {
    return filtered
      .map(e => {
        if (!e.date) return null;
        const d = new Date(e.date);
        if (isNaN(d)) return null;
        return {
          id: String(e.id),
          title: e.title,
          start: d.toISOString().slice(0, 10),
          allDay: true,
          extendedProps: {
            location: e.location,
            event_type: e.event_type,
            audience: e.target_audience,
          },
        };
      })
      .filter(Boolean);
  }, [filtered]);

  const clearFilters = () => {
    setQ(""); setLocation(""); setEventType(""); setAudience("");
    setDateFrom(""); setDateTo("");
  };

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

  const renderEventContent = (arg) => {
    const { event } = arg;
    return (
      <div className="fc-event-inner">
        <div className="fc-event-title">{event.title}</div>
        {event.extendedProps.location && (
          <div className="fc-event-sub">{event.extendedProps.location}</div>
        )}
      </div>
    );
  };

  return (
    <div className="events-page">
      {}
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

          {}
          <button
            className="calendar-toggle"
            aria-pressed={showCalendar}
            onClick={() => setShowCalendar(s => !s)}
            title={showCalendar ? 'Revenir à la liste' : 'Afficher le calendrier'}
          >
            {showCalendar ? 'Vue liste' : 'Calendar'}
          </button>

          <button className="clear" onClick={clearFilters}>Réinitialiser</button>
        </div>
        <div className="results">
          {loading
            ? 'Loading…'
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {}
      {showCalendar ? (
        <div className="calendar-wrap">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            firstDay={1}
            locale={frLocale}
            headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
            buttonText={{ today: "Aujourd'hui" }}
            height="auto"
            dayMaxEvents={3}
            displayEventTime={false}
            events={fcEvents}
            eventContent={renderEventContent}
            eventClick={(info) => {
              setShowCalendar(false);
              setExpandedId(String(info.event.id));
              setTimeout(() => {
                const el = cardRefs.current[info.event.id];
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 0);
            }}
          />
        </div>
      ) : (
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
                        if (ev.currentTarget.src === Defualt_img) return;
                        ev.currentTarget.onerror = null;
                        ev.currentTarget.src = Defualt_img;
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
      )}
    </div>
  );
};

export default Events;
