import DominoText from "./DominoText";

function ProjectCard({ project }) {
  return (
    <article className="project-card">
      {project.repoHref ? (
        <a
          className="project-card__repo-link"
          href={project.repoHref}
          target="_blank"
          rel="noreferrer"
          aria-label={`Repositorio de ${project.title} en GitHub`}
        >
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
      ) : null}

      <a className="project-card__main-link" href={project.href} target="_blank" rel="noreferrer">
        <div className="project-card__body">
          <div className="project-card__header">
            <span>{project.stack}</span>
            <h3>{project.title}</h3>
          </div>
          <p>{project.summary}</p>
          <span className="project-card__cta">
            <DominoText text={project.ctaLabel ?? "Ver repositorio"} />
          </span>
        </div>
      </a>
    </article>
  );
}

export default ProjectCard;
