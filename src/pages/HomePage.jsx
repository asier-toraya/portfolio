import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DominoText from "../components/DominoText";
import ProjectCard from "../components/ProjectCard";
import WriteupPreviewCard from "../components/WriteupPreviewCard";
import { projects, reports, workshopPlaceholders } from "../content/portfolioContent";
import { getWriteUpsByPlatform } from "../content/technicalContent";
import cordobaWorkshopImage from "../../images/cordoba-1.jpeg";
import concienciacionWorkshopImage from "../../images/concienciacion-1.jpeg";
import ctfWorkshopImage from "../../images/ctf-1.jpeg";

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

function WaveBackground() {
  return (
    <div className="wave-background" aria-hidden="true">
      <span className="wave-background__stripe wave-background__stripe--1" />
      <span className="wave-background__stripe wave-background__stripe--2" />
      <span className="wave-background__stripe wave-background__stripe--3" />
    </div>
  );
}

function CornerStripes() {
  return (
    <div className="corner-stripes" aria-hidden="true">
      <span className="corner-stripes__bar corner-stripes__bar--1" />
      <span className="corner-stripes__bar corner-stripes__bar--2" />
      <span className="corner-stripes__bar corner-stripes__bar--3" />
      <span className="corner-stripes__bar corner-stripes__bar--4" />
    </div>
  );
}

function SectionSeparator({ className = "" }) {
  const dotColors = useMemo(() => {
    const palette = [
      "rgba(156, 214, 255, 0.92)",
      "rgba(255, 220, 160, 0.92)",
      "rgba(176, 240, 200, 0.92)",
    ];

    return Array.from({ length: 4 }, () => palette[Math.floor(Math.random() * palette.length)]);
  }, []);

  return (
    <div className={`section-separator home-reveal${className ? ` ${className}` : ""}`} aria-hidden="true">
      {dotColors.map((color, index) => (
        <span
          key={`${color}-${index}`}
          className="section-separator__dot"
          style={{ "--separator-index": index, color }}
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
              <h3>Proximamente</h3>
              <p>Esta categoria todavia no tiene write-ups publicados.</p>
            </div>
          </article>
        )}
      </div>
      <Link className="writeup-group__link" to="/writeups">
        <DominoText text="Explorar todos" />
      </Link>
    </div>
  );
}

function HomePage() {
  const [activeWorkshop, setActiveWorkshop] = useState(null);
  const [isHeroBrandAnimating, setIsHeroBrandAnimating] = useState(false);
  const heroBrandHoverTimeoutRef = useRef(null);
  const windowsWriteUps = getWriteUpsByPlatform("Windows");
  const linuxWriteUps = getWriteUpsByPlatform("Linux");

  const triggerHeroBrandHover = () => {
    if (isHeroBrandAnimating) {
      return;
    }

    setIsHeroBrandAnimating(true);
    window.clearTimeout(heroBrandHoverTimeoutRef.current);
    heroBrandHoverTimeoutRef.current = window.setTimeout(() => {
      setIsHeroBrandAnimating(false);
      heroBrandHoverTimeoutRef.current = null;
    }, 1200);
  };

  useEffect(() => {
    const revealElements = Array.from(document.querySelectorAll(".home-reveal"));

    if (revealElements.length === 0) {
      return undefined;
    }

    if (typeof IntersectionObserver === "undefined") {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(heroBrandHoverTimeoutRef.current);
    };
  }, []);

  const formationItems = [
    {
      title: "Hacking Etico",
      summary: "Pentesting para detectar vulnerabilidades en sistemas y redes con enfoque practico y controlado.",
    },
    {
      title: "Incidentes de Ciberseguridad",
      summary: "Gestion y respuesta ante eventos de seguridad, con analisis de riesgos y planes de actuacion.",
    },
    {
      title: "Puesta en Produccion Segura",
      summary: "Despliegue seguro de aplicaciones y servicios con foco en validacion y reduccion de vulnerabilidades.",
    },
    {
      title: "Analisis Forense",
      summary: "Adquisicion y estudio de evidencias digitales para investigacion, preservacion y analisis tecnico.",
    },
    {
      title: "Bastionado de Redes y Sistemas",
      summary: "Reduccion de superficie de ataque mediante configuraciones seguras, segmentacion y monitorizacion.",
    },
    {
      title: "Normativa de Ciberseguridad",
      summary: "Aplicacion de marcos legales y normativos para mantener el cumplimiento y la alineacion con estandares de seguridad.",
    },
  ];

  const placeholderEntry = (id, platform) => ({
    slug: `placeholder-${id}-${platform.toLowerCase()}`,
    href: null,
    title: "Proximamente",
    summary: "Este write-up esta en fase de redaccion y se publicara proximamente.",
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
  const workshopItems = workshopPlaceholders.map((item, index) => ({
    ...item,
    image:
      index === 0
        ? cordobaWorkshopImage
        : index === 1
          ? concienciacionWorkshopImage
          : ctfWorkshopImage,
  }));

  return (
    <>
      <WaveBackground />
      <CornerStripes />
      <ParticleBackground />
      <div className="portfolio-page">
        <nav className="top-nav" aria-label="Secciones principales">
          <a href="#experiencia"><DominoText text="Experiencia" /></a>
          <a href="#proyectos"><DominoText text="Proyectos" /></a>
          <Link to="/writeups"><DominoText text="Write-ups" /></Link>
          <Link to="/reports"><DominoText text="Informes" /></Link>
          <a href="#talleres"><DominoText text="Talleres" /></a>
          <a href="#sobre-mi"><DominoText text="Sobre mi" /></a>
        </nav>

        <section className="section section--hero home-reveal home-reveal--hero">
          <div className="hero-brand">
            <span className="brand-label">PORTFOLIO</span>
            <div className="brand-name-lockup">
              <h1
                className={`brand-name${isHeroBrandAnimating ? " is-hover-animating" : ""}`}
                onMouseEnter={triggerHeroBrandHover}
              >
                <DominoText className="brand-name__domino" text="ASIER" />
              </h1>
              <span className="brand-signature">GONZALEZ AIT-ABDESSLAM</span>
            </div>
          </div>
        </section>

        <section id="experiencia" className="section section--experience home-reveal">
          <div className="chip">EXPERIENCIA LABORAL</div>

          <div className="experience-list">
            <article className="experience-item">
              <div className="experience-header">
                <h3>
                  <a
                    className="experience-link"
                    href="https://linkedin.com/in/kasier"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DominoText text="Desarrollador web (Full Stack)" />
                  </a>
                </h3>
                <span className="experience-date">2024</span>
              </div>
              <p className="experience-company">Nytelweb</p>
              <p className="experience-desc">
                - Desarrollo y evolución de aplicaciones web empresariales. <br />
                - Resolución de incidencias funcionales y técnicas para mantener la continuidad
                operativa. <br />
                - Mejoras de usabilidad y rendimiento
              </p>
            </article>

            <article className="experience-item">
              <div className="experience-header">
                <h3>
                  <a
                    className="experience-link"
                    href="https://linkedin.com/in/kasier"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DominoText text="Desarrollador web (Front End)" />
                  </a>
                </h3>
                <span className="experience-date">2022 - 2023</span>
              </div>
              <p className="experience-company">Bosonit</p>
              <p className="experience-desc">
                - Mantenimiento evolutivo de aplicaciones web corporativas. <br />
                - Corrección de incidencias y ajustes funcionales en entorno productivo. <br />
              </p>
            </article>

            <article className="experience-item">
              <div className="experience-header">
                <h3>
                  <a
                    className="experience-link"
                    href="https://linkedin.com/in/kasier"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <DominoText text="Auxiliar de soporte TI y Artilleria" />
                  </a>
                </h3>
                <span className="experience-date">2017 - 2021</span>
              </div>
              <p className="experience-company">Ministerio de Defensa</p>
              <p className="experience-desc">
                - Gestión y resolución de incidencias en entorno institucional. <br />
                - Diagnóstico técnico y recuperación de servicio en puestos y sistemas. <br />
                - Análisis de fallos en equipos y servicios para identificar la causa del problema. <br />
              </p>
            </article>
          </div>
        </section>
        <SectionSeparator />

        <section className="section section--split">
          <article id="proyectos" className="panel--split home-reveal">
            <div className="chip">PROYECTOS</div>
            <p className="panel-intro">
              Herramientas, laboratorios y utilidades construidas para aprender, automatizar y validar escenarios
              técnicos reales.
            </p>
            <div className="project-list">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          </article>
          <SectionSeparator className="section-separator--split" />

          <article id="writeups" className="panel--split home-reveal">
            <div className="chip">WRITE-UPS</div>
            <p className="panel-intro">
              Resoluciones técnicas documentadas con metodología, comandos, capturas y decisiones tomadas durante cada
              compromiso.
            </p>
            <div className="writeup-column-layout">
              <WriteupGroup title="WINDOWS" entries={windowsList} />
              <WriteupGroup title="LINUX" entries={linuxList} />
            </div>
          </article>
        </section>
        <SectionSeparator />

        <section id="talleres" className="section section--workshops home-reveal">
          <div className="chip">TALLERES</div>
          <p className="panel-intro">
            Talleres impartidos en diferentes eventos y organizaciones.
          </p>
          <div className="workshop-grid">
            {workshopItems.map((item, index) => (
              <button
                key={`${item.title}-${index}`}
                type="button"
                className="workshop-card workshop-card--button"
                onClick={() => setActiveWorkshop(item)}
              >
                <div className="workshop-card__body">
                  <h3>{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <div className="workshop-card__footer">
                  <span className="workshop-card__date">{item.date}</span>
                  <span className="workshop-card__cta">
                    <DominoText text="Ver imagen" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
        <SectionSeparator />

        <section id="informes" className="section panel--split section--reports home-reveal">
          <div className="chip">INFORMES</div>
          <p className="panel-intro">
            Documentos tecnicos y metodologicos elaborados para formalizar procesos, criterio analitico y entregables
            de ciberseguridad.
          </p>
          <div className="project-list">
            {reports.map((report) => (
              <ProjectCard key={report.slug} project={report} />
            ))}
          </div>
        </section>
        <SectionSeparator />

        <section id="sobre-mi" className="section section--about">
          <article className="panel--about-main home-reveal">
            <div className="chip">SOBRE MI</div>
            <div className="about-copy">
              <p>
                Técnico Superior en Desarrollo de Aplicaciones Web (DAW), especializado en ciberseguridad. (Curso de Especialización en Ciberseguridad en Entornos de las Tecnologías de la Información).
              </p>
              <p>

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
                <a href="https://linkedin.com/in/kasier" target="_blank" rel="noreferrer" aria-label="LinkedIn">
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
                <a href="mailto:cybersec.asier@proton.me">
                  <DominoText text="cybersec.asier@proton.me" />
                </a>
              </div>
            </div>
          </article>

          <aside className="about-stack about-stack--vertical home-reveal">
            <div className="chip">FORMACION</div>
            {formationItems.slice(0, 3).map((item) => (
              <article key={item.title} className="panel--stack-card">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </aside>

          <div className="about-stack about-stack--horizontal home-reveal">
            {formationItems.slice(3).map((item) => (
              <article key={item.title} className="panel--stack-card">
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {activeWorkshop ? (
        <div
          className="workshop-dialog"
          role="dialog"
          aria-modal="true"
          aria-label={activeWorkshop.title}
          onClick={() => setActiveWorkshop(null)}
        >
          <div className="workshop-dialog__panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="workshop-dialog__close"
              aria-label="Cerrar imagen"
              onClick={() => setActiveWorkshop(null)}
            >
              Cerrar
            </button>
            <img src={activeWorkshop.image} alt={activeWorkshop.title} className="workshop-dialog__image" />
          </div>
        </div>
      ) : null}
    </>
  );
}

export default HomePage;
