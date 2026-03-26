import { Children, isValidElement } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, NavLink, Navigate, useParams } from "react-router-dom";
import { writeUps, getWriteUpsByPlatform } from "../content/technicalContent";
import DominoText from "../components/DominoText";

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

function WriteupsPage() {
  const { slug } = useParams();
  const windowsWriteUps = getWriteUpsByPlatform("Windows");
  const linuxWriteUps = getWriteUpsByPlatform("Linux");

  const activeWriteup = writeUps.find((entry) => entry.slug === slug) ?? writeUps[0];

  if (!slug && writeUps.length > 0) {
    return <Navigate to={`/writeups/${writeUps[0].slug}`} replace />;
  }

  return (
    <div className="writeups-shell">
      <aside className="writeups-sidebar">
        <Link className="writeups-sidebar__home" to="/">
          ← VOLVER AL INICIO
        </Link>

        <div className="writeups-sidebar__header">
          <p>WRITE-UPS</p>
          <span>{writeUps.length} DOCUMENTOS TECNICOS</span>
        </div>

        <div className="sidebar-scroll-area">
          <div className="sidebar-category">
            <div className="category-label">WINDOWS</div>
            <nav className="writeups-nav">
              {windowsWriteUps.map((entry) => (
                <NavLink
                  key={entry.slug}
                  to={`/writeups/${entry.slug}`}
                  className={({ isActive }) =>
                    `writeups-nav__item writeups-nav__item--${entry.difficulty ?? "medium"}${isActive ? " is-active" : ""}`
                  }
                >
                  <div className="writeups-nav__top">
                    <strong><DominoText text={entry.title} /></strong>
                    <span className="writeups-nav__year">{entry.year}</span>
                  </div>
                  <span className={`writeups-nav__difficulty writeups-nav__difficulty--${entry.difficulty ?? "medium"}`}>
                    {String(entry.difficulty ?? "medium").toUpperCase()}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="sidebar-category">
            <div className="category-label">LINUX</div>
            <nav className="writeups-nav">
              {linuxWriteUps.map((entry) => (
                <NavLink
                  key={entry.slug}
                  to={`/writeups/${entry.slug}`}
                  className={({ isActive }) =>
                    `writeups-nav__item writeups-nav__item--${entry.difficulty ?? "medium"}${isActive ? " is-active" : ""}`
                  }
                >
                  <div className="writeups-nav__top">
                    <strong><DominoText text={entry.title} /></strong>
                    <span className="writeups-nav__year">{entry.year}</span>
                  </div>
                  <span className={`writeups-nav__difficulty writeups-nav__difficulty--${entry.difficulty ?? "medium"}`}>
                    {String(entry.difficulty ?? "medium").toUpperCase()}
                  </span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </aside>

      <main className="writeups-viewer">
        {activeWriteup ? (
          <article className="writeup-article">
            <header className="writeup-article__header">
              <div className="writeup-meta-top">
                <span className="platform-chip">{activeWriteup.platform.toUpperCase()}</span>
                <span className="year-label">{activeWriteup.year}</span>
                <span className="year-label">{activeWriteup.readingMinutes} min lectura</span>
                <span className="year-label">{activeWriteup.imageCount} capturas</span>
              </div>
              <h1>{activeWriteup.title}</h1>
            </header>

            {activeWriteup.summary ? (
              <p className="writeup-article__summary">{activeWriteup.summary}</p>
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
                {activeWriteup.body}
              </ReactMarkdown>
            </div>
          </article>
        ) : (
          <div className="writeup-empty">
            <p>Selecciona un write-up para comenzar la lectura.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default WriteupsPage;
