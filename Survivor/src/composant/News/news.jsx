import './news.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as NewsApi from '../../apis/BackendApi/News.api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Petit cache mémoire pour éviter les doubles requêtes en dev (StrictMode)
let itemsCache = null;

const News = () => {
  // Normalisation des données venant de la table News
  const normalizeNews = (n) => ({
    id: n.id ?? `${n.title ?? 'news'}-${Math.random().toString(36).slice(2,8)}`,
    title: n.title ?? 'Untitled news',
    description: n.description ?? '',
    location: n.location ?? '',
    category: n.category ?? '',
    startup_id: n.startup_id ?? '',
    news_date: n.news_date ?? '',
    image: n.image ?? ''
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    if (itemsCache) {
      setItems(itemsCache.map(normalizeNews));
      setLoading(false);
      return () => { mounted = false; };
    }

    NewsApi.getAllNews()
        .then((data) => {
          if (!mounted) return;
          const raw = Array.isArray(data) ? data : (data?.data ?? []);
          itemsCache = raw;
          setItems(raw.map(normalizeNews));
          setError(null);
        })
        .catch((err) => {
          console.error('Failed to fetch news:', err);
          setItems([]);
          setError('Failed to fetch news.');
        })
        .finally(() => mounted && setLoading(false));

    return () => { mounted = false; };
  }, []);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [startupId, setStartupId] = useState('');

  const categories = useMemo(
    () => Array.from(new Set((items || []).map(n => n?.category).filter(Boolean))).sort(),
    [items]
  );
  const locations = useMemo(
    () => Array.from(new Set((items || []).map(n => n?.location).filter(Boolean))).sort(),
    [items]
  );
  const startupIds = useMemo(
    () => Array.from(new Set((items || []).map(n => n?.startup_id).filter(v => v !== undefined && v !== null))).sort((a,b)=>a-b),
    [items]
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const safeItems = Array.isArray(items) ? items : [];

    const byQuery = (n) => {
      if (!needle) return true;
      const hay = [
        n?.title ?? '',
        n?.description ?? '',
        n?.location ?? '',
        n?.category ?? ''
      ].join(' ').toLowerCase();
      return hay.includes(needle);
    };

    const byCat = (n) => !category || n?.category === category;
    const byLoc = (n) => !location || n?.location === location;
    const byStartup = (n) => !startupId || String(n?.startup_id) === String(startupId);

    const safeParse = (d) => {
      const t = Date.parse(d);
      return Number.isFinite(t) ? t : 0;
    };

    return safeItems
      .filter(n => byQuery(n) && byCat(n) && byLoc(n) && byStartup(n))
      .sort((a, b) => safeParse(b?.news_date) - safeParse(a?.news_date));
  }, [items, q, category, location, startupId]);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 6;
  const paged = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);

  const clearFilters = () => {
    setQ(''); setCategory(''); setLocation(''); setStartupId('');
  };

  const [expandedId, setExpandedId] = useState(null);
  const cardRefs = useRef({});
  const toggle = (id) => setExpandedId(prev => (prev === id ? null : id));

  useEffect(() => {
    if (!expandedId) return;
    const el = cardRefs.current[expandedId];
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [expandedId]);

  const formatDate = (iso) => {
    const t = Date.parse(iso);
    return Number.isFinite(t)
      ? new Date(t).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
      : '—';
  };

  const stripMarkdown = (md = '') =>
    md
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
      .replace(/[#>*_~]/g, '')
      .trim();

  const excerpt = (md, len = 220) => {
    const txt = stripMarkdown(md);
    return txt.length > len ? txt.slice(0, len - 1) + '…' : txt;
  };

  const USE_MARKDOWN = false;

  return (
    <div className="news-page">
      {error && <div className="news-error">⚠️ {error}</div>}

      {/* Filters */}
      <div className="filters" role="region" aria-label="News filters">
        <div className="filters-row">
          <input
            type="search"
            placeholder="Search news…"
            aria-label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select aria-label="Category" value={category} onChange={(e)=>setCategory(e.target.value)}>
            <option value="">All categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Location" value={location} onChange={(e)=>setLocation(e.target.value)}>
            <option value="">All locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select aria-label="Startup" value={startupId} onChange={(e)=>setStartupId(e.target.value)}>
            <option value="">All startups</option>
            {startupIds.map(id => <option key={id} value={id}>Startup #{id}</option>)}
          </select>
          <button className="clear" onClick={clearFilters}>Clear</button>
        </div>
        <div className="results">
          {loading
            ? 'Loading…'
            : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      {/* Grid */}
      <section className="news-grid">
        {paged.map(n => {
          const expanded = expandedId === n?.id;
          const detailsId = `news-${n?.id}`;
          const image = n?.image || n?.image_url || n?.imageUrl;

          return (
            <article
              key={n?.id ?? Math.random()}
              ref={(el) => (cardRefs.current[n?.id] = el)}
              className={`news-card ${expanded ? 'expanded' : ''}`}
            >
              {image && (
                <div className="thumb">
                  <img src={image} alt="" loading="lazy" />
                  {n?.category && <span className="badge cat">{n.category}</span>}
                </div>
              )}

              <header className="hdr">
                <h3 className="title">{n?.title ?? 'Untitled'}</h3>
                <div className="meta">
                  <span className="when">{formatDate(n?.news_date)}</span>
                  <span className="dot" />
                  <span className="where">{n?.location ?? '—'}</span>
                </div>
              </header>

              {!expanded ? (
                <>
                  <button className="more" onClick={() => toggle(n?.id)} aria-expanded={expanded} aria-controls={detailsId}>
                    Read more
                  </button>
                </>
              ) : (
                <>
                  <div id={detailsId} className="body">
                    {USE_MARKDOWN ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {n?.description || ''}
                      </ReactMarkdown>
                    ) : (
                      <div className="body--plain">{n?.description || ''}</div>
                    )}
                  </div>
                  <div className="actions">
                    <button className="more ghost" onClick={() => toggle(n?.id)}>Close</button>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </section>

      {/* Pagination */}
      {paged.length < filtered.length && (
        <div className="loadmore-wrap">
          <button className="loadmore" onClick={() => setPage(p => p + 1)}>
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

export default News;
