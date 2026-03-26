import { Link } from "react-router-dom";
import DominoText from "./DominoText";

function WriteupPreviewCard({ entry }) {
  const difficulty = String(entry.difficulty ?? "medium").toLowerCase();
  const className = `writeup-card writeup-card--${difficulty}${entry.href ? " writeup-card--link" : ""}`;

  const content = (
    <>
      <div className="writeup-card__body">
        <div className="writeup-card__top">
          <span className="writeup-card__label">{entry.platform}</span>
          <span className="writeup-card__meta writeup-card__meta--top">{entry.year || "Actual"}</span>
        </div>
        <h3>{entry.href ? <DominoText text={entry.title} /> : entry.title}</h3>
        <p>{entry.summary}</p>
        <div className="writeup-card__stats">
          <span>{entry.readingMinutes} min</span>
          <span>{entry.imageCount} capturas</span>
        </div>
      </div>
      <span className={`writeup-card__difficulty writeup-card__difficulty--${difficulty}`}>
        {difficulty.toUpperCase()}
      </span>
    </>
  );

  if (!entry.href) {
    return <article className={className}>{content}</article>;
  }

  return (
    <Link className={className} to={entry.href}>
      {content}
    </Link>
  );
}

export default WriteupPreviewCard;
