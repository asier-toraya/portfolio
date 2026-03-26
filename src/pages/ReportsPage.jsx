import { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import DominoText from "../components/DominoText";
import { reports } from "../content/reportsContent";

function isStandaloneCodeParagraph(children) {
  const normalizedChildren = Children.toArray(children).filter((child) => {
    return !(typeof child === "string" && child.trim() === "");
  });

  if (normalizedChildren.length !== 1) {
    return false;
  }

  const [child] = normalizedChildren;
  return isValidElement(child) && child.type === "code";
}

function ReportsPage() {
  const { slug } = useParams();
  const activeReport = reports.find((entry) => entry.slug === slug) ?? reports[0];

  if (!slug && reports.length > 0) {
    return <Navigate to={`/reports/${reports[0].slug}`} replace />;
  }

  return (
    <div className="writeups-shell">
      <aside className="writeups-sidebar">
        <Link className="writeups-sidebar__home" to="/">
          ← VOLVER AL INICIO
        </Link>

        <div className="writeups-sidebar__header">
          <p>INFORMES</p>
          <span>{reports.length} DOCUMENTOS TECNICOS</span>
        </div>

        <div className="sidebar-scroll-area">
          <div className="sidebar-category">
            <div className="category-label">REPORTS</div>
            <nav className="writeups-nav">
              {reports.map((entry) => (
                <NavLink
                  key={entry.slug}
                  to={`/reports/${entry.slug}`}
                  className={({ isActive }) => `writeups-nav__item${isActive ? " is-active" : ""}`}
                >
                  <div className="writeups-nav__top">
                    <strong><DominoText text={entry.title} /></strong>
                    <span className="writeups-nav__year">{entry.year}</span>
                  </div>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <main className="writeups-viewer">
        {activeReport ? (
          <article className="writeup-article">
            <header className="writeup-article__header">
              <div className="writeup-meta-top">
                <span className="platform-chip">REPORT</span>
                <span className="year-label">{activeReport.year}</span>
                <span className="year-label">{activeReport.readingMinutes} min lectura</span>
                <span className="year-label">{activeReport.imageCount} capturas</span>
              </div>
              <h1>{activeReport.title}</h1>
            </header>

            {activeReport.summary ? (
              <p className="writeup-article__summary">{activeReport.summary}</p>
            ) : null}

            <div className="writeup-article__body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ children, ...props }) => {
                    if (isStandaloneCodeParagraph(children)) {
                      const codeElement = Children.toArray(children)[0];
                      return (
                        <pre className="writeup-command">
                          <code>{codeElement.props.children}</code>
                        </pre>
                      );
                    }

                    return <p {...props}>{children}</p>;
                  },
                  code: ({ inline, className, children, ...props }) => (
                    <code
                      className={className}
                      data-inline={inline ? "true" : "false"}
                      {...props}
                    >
                      {children}
                    </code>
                  ),
                  a: ({ href, children, ...props }) => (
                    <a href={href} target="_blank" rel="noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                  img: ({ node, ...props }) => <img {...props} loading="lazy" />,
                }}
              >
                {activeReport.body}
              </ReactMarkdown>
            </div>
          </article>
        ) : (
          <div className="writeup-empty">
            <p>Selecciona un informe para comenzar la lectura.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default ReportsPage;
