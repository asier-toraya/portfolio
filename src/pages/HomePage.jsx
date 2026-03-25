import { useMemo } from "react";
import { Link } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import WriteupPreviewCard from "../components/WriteupPreviewCard";
import { projects, workshopPlaceholders } from "../content/portfolioContent";
import { getWriteUpsByPlatform } from "../content/technicalContent";

function ParticleBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => {
      const depth = i % 3;
      const size =
        depth === 0 ? Math.random() * 1.5 + 0.5 : depth === 1 ? Math.random() * 4 + 2 : Math.random() * 10 + 4;
      const blur = depth === 0 ? "0px" : depth === 1 ? "1px" : "4px";
      const opacityMultiplier = depth === 0 ? 0.2 : depth === 1 ? 0.1 : 0.05;
      const duration =
        depth === 0 ? 25 + Math.random() * 15 : depth === 1 ? 40 + Math.random() * 20 : 65 + Math.random() * 30;

      return {
        id: i,
        size,
        blur,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        tx: `${(Math.random() - 0.5) * (depth === 0 ? 200 : depth === 1 ? 120 : 60)}px`,
        ty: `${(Math.random() - 0.5) * (depth === 0 ? 200 : depth === 1 ? 120 : 60)}px`,
        delay: `${Math.random() * 5}s`,
        duration: `${duration}s`,
        blinkDuration: `${5 + Math.random() * 5}s`,
        maxOpacity: (0.1 + Math.random() * 0.3) * opacityMultiplier,
      };
    });
  }, []);

  return (
    <div className="particles-container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: p.left,
            top: p.top,
            filter: `blur(${p.blur})`,
            "--tx": p.tx,
            "--ty": p.ty,
            "--max-opacity": p.maxOpacity,
            animationDuration: `${p.duration}, ${p.blinkDuration}`,
            animationDelay: `0s, ${p.delay}`,
          }}
        />
      ))}
    </div>
  );
}

function WriteupGroup({ title, entries }) {
  return (
    <div className="writeup-group">
      <h2>{title}</h2>
      <div className="writeup-list">
        {entries.length > 0 ? (
          entries.map((entry) => <WriteupPreviewCard key={entry.slug} entry={entry} />)
        ) : (
          <article className="writeup-card writeup-card--empty">
            <div className="writeup-card__body">
              <h3>Próximamente</h3>
              <p>Esta categoría todavía no tiene write-ups publicados.</p>
            </div>
          </article>
        )}
      </div>
      <Link className="writeup-group__link" to="/writeups">
        Explorar todos
      </Link>
    </div>
  );
}

function HomePage() {
  const windowsWriteUps = getWriteUpsByPlatform("Windows");
  const linuxWriteUps = getWriteUpsByPlatform("Linux");

  const placeholderEntry = (id, platform) => ({
    slug: `placeholder-${id}-${platform.toLowerCase()}`,
    title: "Próximamente",
    summary: "Este write-up está en fase de redacción y se publicará próximamente.",
    platform,
    year: "2026",
    tags: [],
  });

  const fillWriteupList = (entries, platform, count) => {
    const placeholdersNeeded = Math.max(0, count - entries.length);
    const placeholders = Array.from({ length: placeholdersNeeded }, (_, index) =>
      placeholderEntry(index + 1, platform),
    );

    return [...entries, ...placeholders].slice(0, count);
  };

  const windowsList = fillWriteupList(windowsWriteUps, "Windows", 3);
  const linuxList = fillWriteupList(linuxWriteUps, "Linux", 3);

  return (
    <>
      <ParticleBackground />
      <div className="portfolio-page">
        <section className="section section--hero">
          <div className="hero-brand">
            <span className="brand-label">PORTFOLIO</span>
            <h1 className="brand-name">ASIER</h1>
          </div>
        </section>

        <section className="section section--experience">
          <div className="chip">EXPERIENCIA LABORAL</div>
          <div className="experience-list">
            <article className="experience-item">
              <div className="experience-header">
                <h3>Analista de Ciberseguridad (Junior)</h3>
                <span className="experience-date">2025 — ACTUALIDAD</span>
              </div>
              <p className="experience-company">Empresa de Tecnología S.A.</p>
              <p className="experience-desc">
                Monitorización de eventos de seguridad, gestión de alertas en SOC y soporte en auditorías internas.
              </p>
            </article>

            <article className="experience-item">
              <div className="experience-header">
                <h3>Técnico de Sistemas / Prácticas</h3>
                <span className="experience-date">2024 — 2025</span>
              </div>
              <p className="experience-company">Servicios Informáticos Locales</p>
              <p className="experience-desc">
                Mantenimiento de infraestructura de red, bastionado de servidores Windows/Linux y gestión de backups.
              </p>
            </article>

            <article className="experience-item">
              <div className="experience-header">
                <h3>Desarrollador Web Junior</h3>
                <span className="experience-date">2023 — 2024</span>
              </div>
              <p className="experience-company">Agencia Digital Creative</p>
              <p className="experience-desc">
                Desarrollo de interfaces con React y despliegue de microservicios, con foco en la seguridad del código.
              </p>
            </article>
          </div>
        </section>

        <section className="section section--split">
          <article className="panel--split">
            <div className="chip">PROYECTOS</div>
            <p className="panel-intro">Proyectos personales, experimentos y sistemas varios.</p>
            <div className="project-list">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </article>

          <article className="panel--split">
            <div className="chip">WRITE-UPS</div>
            <p className="panel-intro">Una colección en crecimiento de walkthroughs prácticos.</p>
            <div className="writeup-column-layout">
              <WriteupGroup title="WINDOWS" entries={windowsList} />
              <WriteupGroup title="LINUX" entries={linuxList} />
            </div>
          </article>
        </section>

        <section className="section section--workshops">
          <div className="chip">TALLERES</div>
          <p className="panel-intro">
            Espacio dedicado a laboratorios practicos y material didactico orientado al aprendizaje aplicado.
          </p>
          <div className="workshop-grid">
            {workshopPlaceholders.map((item, index) => (
              <article key={`${item.title}-${index}`} className="workshop-card">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section section--about">
          <article className="panel--about-main">
            <div className="chip">SOBRE MI</div>
            <div className="about-copy">
              <p>
                Técnico Superior en Desarrollo de Aplicaciones Web (DAW), especializado en ciberseguridad y
                actualmente en formación en el IES Rafael Alberti.
              </p>
              <br />
              <p>
                En este portfolio comparto proyectos prácticos y personales sobre seguridad, como hardening,
                análisis forense y auditorías, aplicando lo aprendido de forma real.
              </p>
            </div>

            <div className="about-contact">
              <div className="contact-links">
                <a href="https://github.com/asier-toraya" target="_blank" rel="noreferrer" aria-label="GitHub">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </a>
                <a href="https://linkedin.com/in/katsier" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
              <div className="contact-email">
                <a href="mailto:cybersec.asier@proton.me">cybersec.asier@proton.me</a>
              </div>
            </div>
          </article>

          <aside className="about-stack">
            <div className="chip">FORMACIÓN</div>
            <article className="panel--stack-card">
              <h3>HACKING ETICO</h3>
              <p>Identificación proactiva de vulnerabilidades y explotación controlada de sistemas.</p>
            </article>
            <article className="panel--stack-card">
              <h3>FORENSICS</h3>
              <p>Análisis de artefactos digitales y preservación de la cadena de custodia.</p>
            </article>
            <article className="panel--stack-card">
              <h3>SYSTEM HARDENING</h3>
              <p>Implementación de configuraciones críticas para reducir la superficie de ataque.</p>
            </article>
            <article className="panel--stack-card">
              <h3>INCIDENT RESPONSE</h3>
              <p>Gestión estratégica y contención de amenazas en entornos comprometidos.</p>
            </article>
            <article className="panel--stack-card">
              <h3>OSINT</h3>
              <p>Investigación y recolección de inteligencia mediante fuentes abiertas.</p>
            </article>
          </aside>
        </section>
      </div>
    </>
  );
}

export default HomePage;
