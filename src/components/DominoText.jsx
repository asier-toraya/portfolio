function DominoText({ text, className = "" }) {
  const words = text.split(" ");

  return (
    <span className={`domino-text${className ? ` ${className}` : ""}`} aria-label={text}>
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="domino-text__word" aria-hidden="true">
          {Array.from(word).map((char, charIndex) => (
            <span
              key={`${char}-${charIndex}`}
              className="domino-text__char"
              style={{ "--domino-index": charIndex }}
            >
              {char}
            </span>
          ))}
          {wordIndex < words.length - 1 ? (
            <span className="domino-text__space" aria-hidden="true">
              {" "}
            </span>
          ) : null}
        </span>
      ))}
    </span>
  );
}

export default DominoText;
