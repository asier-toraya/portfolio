import { parse as parseYaml } from "yaml";

const writeUpImageFiles = import.meta.glob("../../writeups/**/*.{png,jpg,jpeg,gif,webp,svg}", {
  eager: true,
  import: "default",
});

const writeUpDifficultyBySlug = {
  anthem: "easy",
  blaster: "medium",
  blue: "easy",
  ice: "easy",
  library: "medium",
  relevant: "medium",
  retro: "hard",
  techsupport: "easy",
};

function slugFromPath(path) {
  // Path format: ../../writeups/Windows/Anthem/THM-Win-Anthem.md
  const parts = path.split("/");
  return parts[parts.length - 2]; // Folder name is the slug (e.g., Anthem)
}

function platformFromPath(path) {
  // Path format: ../../writeups/Windows/Anthem/THM-Win-Anthem.md
  const parts = path.split("/");
  return parts[parts.length - 3]; // Windows or Linux
}

function splitFrontmatter(rawFile) {
  if (!rawFile.startsWith("---")) {
    return { content: rawFile.trim(), data: {} };
  }

  const closingMarkerIndex = rawFile.indexOf("\n---", 4);

  if (closingMarkerIndex === -1) {
    return { content: rawFile.trim(), data: {} };
  }

  return {
    data: parseYaml(rawFile.slice(4, closingMarkerIndex).trim()) ?? {},
    content: rawFile.slice(closingMarkerIndex + 4).trim(),
  };
}

function normalizeEntry(path, rawFile) {
  const { content, data } = splitFrontmatter(rawFile);
  const slug = data.slug ?? slugFromPath(path);
  const platform = data.platform ?? platformFromPath(path);
  const title = data.title ?? slug;
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const normalizedDifficulty = String(
    data.difficulty ?? writeUpDifficultyBySlug[String(slug).toLowerCase()] ?? "medium",
  ).toLowerCase();

  const resolveImageUrl = (filename) => {
    const assetPath = `../../writeups/${platform}/${slug}/images/${filename}`;
    return writeUpImageFiles[assetPath] ?? `/writeups/${platform}/${slug}/images/${filename}`;
  };

  // Support both markdown image syntax and plain markdown links pointing to local images.
  const processedBody = content
    .replace(/!\[(.*?)\]\(images\/(.*?)\)/g, (match, alt, filename) => {
      return `![${alt}](${resolveImageUrl(filename)})`;
    })
    .replace(/(?<!!)\[(.*?)\]\(images\/(.*?)\)/g, (match, alt, filename) => {
      return `![${alt}](${resolveImageUrl(filename)})`;
    });

  const plainText = processedBody
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = plainText ? plainText.split(" ").length : 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 180));
  const imageCount = (processedBody.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length;

  return {
    slug,
    href: `/writeups/${slug}`,
    title,
    year: String(data.year ?? "2026"),
    difficulty: normalizedDifficulty,
    summary: data.summary ?? "",
    tags,
    platform: platform,
    body: processedBody,
    wordCount,
    readingMinutes,
    imageCount,
  };
}

function sortEntries(a, b) {
  const yearDifference = Number(b.year || 0) - Number(a.year || 0);

  if (yearDifference !== 0) {
    return yearDifference;
  }

  return a.title.localeCompare(b.title, "es");
}

// Recursively look for all markdown files in subdirectories
const writeUpFiles = import.meta.glob("../../writeups/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

export const writeUps = Object.entries(writeUpFiles)
  .map(([path, rawFile]) => normalizeEntry(path, rawFile))
  .sort(sortEntries);

export function getWriteUpsByPlatform(platform) {
  return writeUps.filter((entry) => entry.platform.toLowerCase() === platform.toLowerCase());
}
