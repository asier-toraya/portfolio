import { Link } from "react-router-dom";
import DominoText from "./DominoText";

function WriteupPreviewCard({ entry }) {
  const className = `writeup-card${entry.href ? " writeup-card--link" : ""}`;

  const content = (
    <>
      <div className="writeup-card__body">
        <span className="writeup-card__label">{entry.platform}</span>
        <h3>{entry.href ? <DominoText text={entry.title} /> : entry.title}</h3>
        <p>{entry.summary}</p>
        <div className="writeup-card__stats">
          <span>{entry.readingMinutes} min</span>
          <span>{entry.imageCount} capturas</span>
        </div>
      </div>
      <span className="writeup-card__meta">{entry.year || "Actual"}</span>
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
