import './project.scss';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as StartupApi from '../../apis/BackendApi/Startup.api';

// Petit cache mémoire pour éviter les doubles requêtes en dev (StrictMode)
let startupsCache = null;

const Offre = () => {
  // (hérité) Fonctions analytics + stripe, laissé tel quel
  const handleJoinNowClick = () => {
    const sendAnalyticsEvent = () => {
      if (window.gtag) {
        console.log("Envoi de l'événement à Google Analytics via GTM");
        window.gtag('event', 'click_join_now', {
          event_category: 'Button',
          event_label: 'Join Now',
          value: 1,
        });
      } else {
        console.warn("Google Analytics n'est pas encore chargé.");
      }
    };

    if (!window.gtag) {
      const interval = setInterval(() => {
        if (window.gtag) {
          clearInterval(interval);
          sendAnalyticsEvent();
          handleRedirect();
        }
      }, 100);
    } else {
      sendAnalyticsEvent();
      handleRedirect();
    }
  };

  const handleRedirect = () => {
    axios.post('https://your-api-endpoint.com/track', {
      event: 'click_join_now',
    }).then(() => {
      window.location.href = "https://buy.stripe.com/bIY9C10Q3ePacCY3cc";
    }).catch((error) => {
      console.error("Erreur lors de la requête axios:", error);
      window.location.href = "https://buy.stripe.com/bIY9C10Q3ePacCY3cc";
    });
  };

  // Normalisation d’un objet startup tel que renvoyé par l’API
  const normalizeStartup = (s) => {
    const foundersRaw =
      Array.isArray(s?.founders) ? s.founders :
      Array.isArray(s?.founderNames) ? s.founderNames : [];

    const founders = foundersRaw
      .map((f) => (typeof f === 'string' ? f : (f?.name ?? f?.title ?? '')))
      .filter(Boolean);

    const needsRaw = s?.needs ?? s?.requests ?? [];
    const needs = Array.isArray(needsRaw)
      ? needsRaw
      : String(needsRaw || '')
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);

    return {
      id: s?.id ?? s?._id ?? `${s?.name ?? 'startup'}-${Math.random().toString(36).slice(2, 8)}`,
      name: s?.name ?? s?.title ?? 'Untitled',
      logoUrl: s?.logoUrl ?? s?.logo ?? s?.image ?? 'https://dummyimage.com/64x64/000/fff&text=?',
      // aperçu / court
      shortDescription: s?.shortDescription ?? s?.summary ?? '',
      // détails
      description: s?.description ?? s?.longDescription ?? s?.summary ?? '',
      legal_status: s?.legal_status ?? s?.legalStatus ?? '',
      address: s?.address ?? s?.location ?? '',
      email: s?.email ?? s?.contacts?.email ?? '',
      phone: s?.phone ?? s?.contacts?.phone ?? '',
      created_at: s?.created_at ?? s?.createdAt ?? '',
      website_url: s?.website_url ?? s?.website ?? s?.contacts?.website ?? '',
      social_media_url: s?.social_media_url ?? s?.social ?? s?.contacts?.linkedin ?? s?.contacts?.twitter ?? '',
      project_status: s?.project_status ?? s?.status ?? '',
      sector: s?.sector ?? s?.industry ?? '',
      maturity: s?.maturity ?? s?.stage ?? '',
      founders,
      needs,
      // pour les filtres existants
      location: s?.location ?? s?.city ?? (s?.address || '').split(',')[1]?.trim() ?? '',
    };
  };

  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Récupération depuis l’API (avec cache mémoire)
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    if (startupsCache) {
      if (mounted) {
        setProjects(startupsCache.map(normalizeStartup));
        setLoading(false);
      }
      return () => { mounted = false; };
    }

    StartupApi.getAllStartups()
      .then((data) => {
        if (!mounted) return;
        const raw = Array.isArray(data) ? data : (data && Array.isArray(data.data) ? data.data : []);
        startupsCache = raw;
        setProjects(raw.map(normalizeStartup));
      })
      .catch((err) => {
        console.error('Failed to fetch startups:', err);
        setProjects([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  // Filtres
  const [q, setQ] = useState('');
  const [sector, setSector] = useState('');
  const [maturity, setMaturity] = useState('');
  const [location, setLocation] = useState('');

  const sectors = useMemo(
    () => Array.from(new Set(projects.map((p) => p.sector).filter(Boolean))).sort(),
    [projects]
  );
  const maturities = useMemo(
    () => Array.from(new Set(projects.map((p) => p.maturity).filter(Boolean))).sort(),
    [projects]
  );
  const locations = useMemo(
    () => Array.from(new Set(projects.map((p) => p.location).filter(Boolean))).sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQ = !needle
        ? true
        : [p.name, p.shortDescription, p.description, p.sector, p.maturity, p.address]
            .filter(Boolean)
            .some((s) => s.toLowerCase().includes(needle));
      const matchesSector = !sector || p.sector === sector;
      const matchesMaturity = !maturity || p.maturity === maturity;
      const matchesLocation = !location || p.location === location;
      return matchesQ && matchesSector && matchesMaturity && matchesLocation;
    });
  }, [projects, q, sector, maturity, location]);

  const clearFilters = () => { setQ(''); setSector(''); setMaturity(''); setLocation(''); };

  // Dépliage cartes
  const [expandedId, setExpandedId] = useState(null);
  const cardRefs = useRef({});
  const toggle = (id) => setExpandedId((prev) => (prev === id ? null : id));

  // useEffect(() => {
  //   if (!expandedId) return;
  //   const el = cardRefs.current[expandedId];
  //   el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  // }, [expandedId]);

  // Helpers
  const formatDate = (iso) => {
    const t = Date.parse(iso);
    return Number.isFinite(t)
      ? new Date(t).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
  };

  const normalizeNeeds = (needs) => {
    if (!needs) return [];
    if (Array.isArray(needs)) return needs;
    return String(needs).split(',').map((s) => s.trim()).filter(Boolean);
  };

  // RENDER
  return (
    <div className="projects-page">
      {/* Filters */}
      <div className="filters" role="region" aria-label="Project filters">
        <div className="filters-row">
          <input
            type="search"
            placeholder="Search projects…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search"
          />
          <select aria-label="Sector" value={sector} onChange={(e) => setSector(e.target.value)}>
            <option value="">All sectors</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select aria-label="Maturity" value={maturity} onChange={(e) => setMaturity(e.target.value)}>
            <option value="">All maturity levels</option>
            {maturities.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select aria-label="Location" value={location} onChange={(e) => setLocation(e.target.value)}>
            <option value="">All locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <button className="clear" onClick={clearFilters}>Clear</button>
        </div>
        <div className="results">
          {loading
            ? 'Loading…'
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Grid + expandable cards */}
      <section className="grid">
        {!loading && filtered.length === 0 && (
          <div className="muted" style={{ padding: '8px 4px' }}>No projects found.</div>
        )}

        {filtered.map((p) => {
          const expanded = expandedId === p.id;
          const detailsId = `details-${p.id}`;
          return (
            <article
              key={p.id}
              ref={(el) => (cardRefs.current[p.id] = el)}
              className={`card ${expanded ? 'expanded' : ''}`}
            >
              <header className="card-header">
                <img src={p.logoUrl} alt="" className="logo" />
                <div className="title-wrap">
                  <h3 className="title">{p.name}</h3>
                  {p.shortDescription && <p className="kicker">{p.shortDescription}</p>}
                </div>
                <button
                  className="more"
                  onClick={() => toggle(p.id)}
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                >
                  {expanded ? 'Close' : 'More details'}
                </button>
              </header>

              {/* Aperçu enrichi (carte fermée) */}
              {!expanded && (
                <div className="card-preview">
                  <div className="preview-row badges">
                    {p.legal_status && <span className="badge">{p.legal_status}</span>}
                    {p.sector && (
                      <>
                        <span className="dot" />
                        <span className="badge alt">{p.sector}</span>
                      </>
                    )}
                    {p.maturity && (
                      <>
                        <span className="dot" />
                        <span className="badge">{p.maturity}</span>
                      </>
                    )}
                  </div>

                  <ul className="preview-list">
                    {p.address && (
                      <li className="truncate">
                        <span className="label">Address</span>
                        <span className="value">{p.address}</span>
                      </li>
                    )}
                    {p.email && (
                      <li className="truncate">
                        <span className="label">Email</span>
                        <a className="value link" href={`mailto:${p.email}`}>{p.email}</a>
                      </li>
                    )}
                    {p.phone && (
                      <li className="truncate">
                        <span className="label">Phone</span>
                        <a className="value link" href={`tel:${p.phone}`}>{p.phone}</a>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Détails complets (carte ouverte) */}
              {expanded && (
                <div id={detailsId} role="region" aria-label={`${p.name} details`} className="card-details">
                  <div className="details-grid">
                    <div className="col">
                      <h4>About</h4>
                      {p.description ? <p>{p.description}</p> : <p>No description provided.</p>}

                      <h4>Status</h4>
                      <p>{p.project_status || '—'}</p>

                      {normalizeNeeds(p.needs).length > 0 && (
                        <>
                          <h4>Needs</h4>
                          <div className="chips">
                            {normalizeNeeds(p.needs).map((n, i) => (
                              <span className="chip" key={i}>{n}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="col">
                      <h4>Company</h4>
                      <ul className="list">
                        {p.legal_status && <li>Legal status: {p.legal_status}</li>}
                        {p.created_at && <li>Created: {formatDate(p.created_at)}</li>}
                        {p.sector && <li>Sector: {p.sector}</li>}
                        {p.maturity && <li>Maturity: {p.maturity}</li>}
                        {p.address && <li>Address: {p.address}</li>}
                      </ul>

                      <h4>Contacts</h4>
                      <ul className="list">
                        {p.email && <li><a href={`mailto:${p.email}`}>{p.email}</a></li>}
                        {p.phone && <li><a href={`tel:${p.phone}`}>{p.phone}</a></li>}
                        {p.website_url && (
                          <li><a href={p.website_url} target="_blank" rel="noreferrer">Website ↗</a></li>
                        )}
                        {p.social_media_url && (
                          <li><a href={p.social_media_url} target="_blank" rel="noreferrer">Social media ↗</a></li>
                        )}
                      </ul>

                      <h4>Founders</h4>
                      {Array.isArray(p.founders) && p.founders.length > 0 ? (
                        <ul className="list">
                          {p.founders.map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      ) : (
                        <p className="muted">No founders listed.</p>
                      )}
                    </div>
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

export default Offre;
