import { Link } from "react-router-dom";

function WriteupPreviewCard({ entry }) {
  return (
    <Link className="writeup-card" to={`/writeups/${entry.slug}`}>
      <div className="writeup-card__body">
        <span className="writeup-card__label">{entry.platform}</span>
        <h3>{entry.title}</h3>
        <p>{entry.summary}</p>
      </div>
      <span className="writeup-card__meta">{entry.year || "Actual"}</span>
    </Link>
  );
}

export default WriteupPreviewCard;
