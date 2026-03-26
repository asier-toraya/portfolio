import { parse as parseYaml } from "yaml";

function slugFromPath(path) {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1] ?? "";
  return fileName.replace(/\.md$/i, "");
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
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const plainText = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/[#>*_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const wordCount = plainText ? plainText.split(" ").length : 0;
  const readingMinutes = Math.max(1, Math.round(wordCount / 180));
  const imageCount = (content.match(/!\[[^\]]*\]\([^)]+\)/g) ?? []).length;

  return {
    slug,
    href: `/reports/${slug}`,
    title: data.title ?? slug,
    year: String(data.year ?? "2026"),
    summary: data.summary ?? "",
    tags,
    body: content,
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

const reportFiles = import.meta.glob("../../reports/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw",
});

export const reports = Object.entries(reportFiles)
  .map(([path, rawFile]) => normalizeEntry(path, rawFile))
  .sort(sortEntries);

