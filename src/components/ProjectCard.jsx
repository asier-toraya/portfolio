import DominoText from "./DominoText";

function ProjectCard({ project }) {
  return (
    <a className="project-card" href={project.href} target="_blank" rel="noreferrer">
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
  );
}

export default ProjectCard;
