import "./About.scss";
import logo from "../../assets/logo.png"; // ajuste le chemin si besoin

const About = () => {
  return (
    <div className="about-page">
      {/* HERO */}
      <header className="about-hero" role="banner">
        <div className="about-logo">
          <img src={logo} alt="JEB Incubator logo" />
        </div>
        <h1 className="about-title">About JEB Incubator</h1>
        <p className="about-sub">
          We connect ambitious startups with the right investors, mentors, and resources —
          so bold ideas become impactful businesses.
        </p>
        <span aria-hidden className="about-accent" />
      </header>

      {/* Mission / Vision */}
      <section className="about-grid">
        <article className="about-card">
          <h2 className="card-title">Our mission</h2>
          <p className="card-text">
            Our mission is to empower startups by connecting them with the right investors,
            mentors, and resources. We strive to create an ecosystem where innovative ideas
            can grow into impactful businesses.
          </p>
        </article>

        <article className="about-card">
          <h2 className="card-title">Our vision</h2>
          <p className="card-text">
            Our vision is to become the leading hub where entrepreneurs and investors
            build the future together, fostering innovation, driving sustainable growth,
            and shaping tomorrow’s economy.
          </p>
        </article>
      </section>

      {/* Piliers */}
      <section className="pillars">
        <h3 className="sec-title">What we offer</h3>
        <div className="pillars-grid">
          <div className="pillar">
            <div className="ic">🤝</div>
            <h4>Smart Matching</h4>
            <p>
              Data-driven matching to connect founders with investors whose theses,
              stages, and sectors align.
            </p>
          </div>
          <div className="pillar">
            <div className="ic">🧭</div>
            <h4>Mentorship</h4>
            <p>
              Operators and domain experts help sharpen strategy, product, and go-to-market,
              from 0→1 to scale-up.
            </p>
          </div>
          <div className="pillar">
            <div className="ic">📊</div>
            <h4>Funding Readiness</h4>
            <p>
              Materials that land: metrics narrative, data room structure, and investor
              Q&A rehearsal.
            </p>
          </div>
          <div className="pillar">
            <div className="ic">🌐</div>
            <h4>Community & Events</h4>
            <p>
              Curated roundtables, demo days, and warm intros to accelerate traction and trust.
            </p>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="steps">
        <h3 className="sec-title">How it works</h3>
        <ol className="steps-list">
          <li>
            <span className="n">1</span>
            <div>
              <h5>Apply</h5>
              <p>Tell us about your product, market, and goals.</p>
            </div>
          </li>
          <li>
            <span className="n">2</span>
            <div>
              <h5>Onboard</h5>
              <p>We assess fit, refine targets, and plan your path to milestones.</p>
            </div>
          </li>
          <li>
            <span className="n">3</span>
            <div>
              <h5>Match & Prepare</h5>
              <p>Warm intros + fundraising prep to meet the right investors with confidence.</p>
            </div>
          </li>
          <li>
            <span className="n">4</span>
            <div>
              <h5>Grow</h5>
              <p>Mentor support, community events, and ongoing check-ins as you scale.</p>
            </div>
          </li>
        </ol>
      </section>

      {/* Stats (exemples / placeholders) */}
      <section className="stats">
        <div className="stat">
          <div className="num">50+</div>
          <div className="lbl">Startups supported</div>
        </div>
        <div className="stat">
          <div className="num">100+</div>
          <div className="lbl">Mentors & experts</div>
        </div>
        <div className="stat">
          <div className="num">€10M+</div>
          <div className="lbl">Introductions facilitated</div>
        </div>
        <div className="stat">
          <div className="num">12</div>
          <div className="lbl">Thematic programs</div>
        </div>
      </section>

      {/* Partenaires (placeholders : réutilise le logo si tu n’as pas encore les marques) */}
      <section className="partners">
        <h3 className="sec-title">Partners & Ecosystem</h3>
        <div className="logos">
          <img src={logo} alt="" />
          <img src={logo} alt="" />
          <img src={logo} alt="" />
          <img src={logo} alt="" />
        </div>
      </section>

      {/* CTA */}
      <section className="cta">
        <h3>Ready to build with us?</h3>
        <p>
          Whether you’re raising your first round or preparing to scale, we can help you
          find the right partners and momentum.
        </p>
        <div className="cta-actions">
          <a className="btn btn-primary" href="/apply">Apply now</a>
          <a className="btn btn-ghost" href="/contact">Contact</a>
        </div>
      </section>
    </div>
  );
};

export default About;
