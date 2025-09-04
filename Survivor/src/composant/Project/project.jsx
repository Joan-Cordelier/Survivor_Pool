import './project.scss';
import axios from 'axios';
import { useEffect, useMemo, useRef, useState } from "react";
import * as StartupApi from '../../apis/BackendApi/Startup.api';

// Simple in-memory cache to avoid duplicate network requests during
// React 18 StrictMode (dev) remounts. This persists for the page lifetime.
let startupsCache = null;

const Offre = () => {
  // === Tes fonctions existantes (analytics + stripe) ===
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

  // === Données demo (remplace par ton API quand prête) ===
  // Projects are now loaded from the backend. We keep a small normalization step
  // to adapt different shapes that the API may return.

  const normalizeStartup = (s) => ({
    id: s.id ?? s._id ?? `${s.name ?? 'startup'}-${Math.random().toString(36).slice(2,8)}`,
    name: s.name ?? s.title ?? 'Untitled',
    logoUrl: s.logoUrl ?? s.logo ?? s.image ?? 'https://dummyimage.com/64x64/000/fff&text=?',
    shortDescription: s.shortDescription ?? s.summary ?? '',
    description: s.description ?? s.longDescription ?? s.summary ?? '',
    founders: (Array.isArray(s.founders) ? s.founders : (Array.isArray(s.founderNames) ? s.founderNames : []))
      .map((f) => (typeof f === 'string' ? f : (f?.name ?? f?.title ?? ''))).filter(Boolean),
    contacts: s.contacts ?? { email: s.email, website: s.website, linkedin: s.linkedin },
    maturity: s.maturity ?? s.stage ?? '',
    sector: s.sector ?? s.industry ?? '',
    location: s.location ?? s.city ?? '',
    progress: s.progress ?? s.status ?? '',
    needs: Array.isArray(s.needs) ? s.needs : (s.needs ? [s.needs] : (Array.isArray(s.requests) ? s.requests : [])),
    updatedAt: s.updatedAt ?? s.updated_at ?? s.updated ?? null,
  });

  // === State ===
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from backend (uses fetch-based API client)
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    // Use cache when available to avoid duplicate requests in dev StrictMode
    if (startupsCache) {
      setProjects(startupsCache.map(normalizeStartup));
      setLoading(false);
      return () => { mounted = false; };
    }

    StartupApi.getAllStartups()
      .then((data) => {
        if (!mounted) return;
        // Accept either an array directly or an envelope { data: [...] }
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
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("");
  const [maturity, setMaturity] = useState("");
  const [location, setLocation] = useState("");

  const sectors = useMemo(
    () => Array.from(new Set(projects.map(p => p.sector).filter(Boolean))).sort(),
    [projects]
  );
  const maturities = useMemo(
    () => Array.from(new Set(projects.map(p => p.maturity).filter(Boolean))).sort(),
    [projects]
  );
  const locations = useMemo(
    () => Array.from(new Set(projects.map(p => p.location).filter(Boolean))).sort(),
    [projects]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesQ = !needle
        ? true
        : [p.name, p.shortDescription, p.description]
            .filter(Boolean)
            .some((s) => s.toLowerCase().includes(needle));
      const matchesSector = !sector || p.sector === sector;
      const matchesMaturity = !maturity || p.maturity === maturity;
      const matchesLocation = !location || p.location === location;
      return matchesQ && matchesSector && matchesMaturity && matchesLocation;
    });
  }, [projects, q, sector, maturity, location]);

  const clearFilters = () => { setQ(""); setSector(""); setMaturity(""); setLocation(""); };

  // Expand/collapse
  const [expandedId, setExpandedId] = useState(null);
  const cardRefs = useRef({});
  const toggle = (id) => setExpandedId(prev => prev === id ? null : id);

  useEffect(() => {
    if (!expandedId) return;
    const el = cardRefs.current[expandedId];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [expandedId]);

  // === RENDER (sans framer-motion) ===
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
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Grid + expandable cards */}
      <section className="grid">
        {filtered.map((p) => {
          const expanded = expandedId === p.id;
          const detailsId = `details-${p.id}`;
          return (
            <article
              key={p.id}
              ref={(el) => (cardRefs.current[p.id] = el)}
              className={`card ${expanded ? "expanded" : ""}`}
            >
              <header className="card-header">
                <img src={p.logoUrl} alt="" className="logo" />
                <div className="title-wrap">
                  <h3 className="title">{p.name}</h3>
                  <p className="kicker">{p.shortDescription}</p>
                </div>
                <button
                  className="more"
                  onClick={() => toggle(p.id)}
                  aria-expanded={expanded}
                  aria-controls={detailsId}
                >
                  {expanded ? "Close" : "More details"}
                </button>
              </header>

              {expanded && (
                <div
                  id={detailsId}
                  role="region"
                  aria-label={`${p.name} details`}
                  className="card-details"
                >
                  <div className="details-grid">
                    <div className="col">
                      <h4>About</h4>
                      <p>{p.description}</p>
                      <h4>Progress</h4>
                      <p>{p.progress}</p>
                      {!!p.needs?.length && (
                        <>
                          <h4>Needs</h4>
                          <div className="chips">
                            {p.needs.map((n, i) => (
                              <span className="chip" key={i}>{n}</span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div className="col">
                      <h4>Founders</h4>
                      <ul className="list">
                        {p.founders.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>

                      <h4>Contacts</h4>
                      <ul className="list">
                        {p.contacts?.email && (
                          <li><a href={`mailto:${p.contacts.email}`}>{p.contacts.email}</a></li>
                        )}
                        {p.contacts?.website && (
                          <li>
                            <a href={p.contacts.website} target="_blank" rel="noreferrer">
                              Website ↗
                            </a>
                          </li>
                        )}
                        {p.contacts?.linkedin && (
                          <li>
                            <a href={p.contacts.linkedin} target="_blank" rel="noreferrer">
                              LinkedIn ↗
                            </a>
                          </li>
                        )}
                      </ul>

                      <div className="meta">
                        <span className="badge">{p.sector}</span>
                        <span className="dot" />
                        <span className="badge alt">{p.maturity}</span>
                        <span className="dot" />
                        <span className="badge">{p.location}</span>
                      </div>
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


    //         <div className='offer-container'>
    //             <div className="offer-wrapper">
    //                 <div className="offer-content">
    //                     <h2 className="offer-title">ABONNEZ-VOUS AU SERVICE COMPLET</h2>
    //                     <ul className="offer-list">
    //                         <li>Premières 45 minutes gratuites pour discuter de votre projet avec notre expert</li>
    //                         <li>Accès à notre communauté de français expatriés qui vivent déjà en Thaïlande</li>
    //                         <li>Accès à l&apos;e-learning, afin de pouvoir trouver toute l&apos;info qui vous intéresse</li>
    //                         <li>Accès illimité pendant 1 an</li>
    //                     </ul>
    //                     <button id='join-now' className="offer-button" onClick={handleJoinNowClick}>
    //                         Join Now
    //                     </button>
    //                 </div>
    //                 <div className="offer-image">
    //                     <img src={expertImage} alt="Expert" />
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // };

//     export default Offre
// }
