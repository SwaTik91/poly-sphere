export function collectionNews(unlocked, viewed) {
  const keys = [];
  const have = new Set();
  for (const key of unlocked || []) {
    if (!key || have.has(key)) continue;
    have.add(key);
    keys.push(key);
  }
  if (!Array.isArray(viewed)) return { fresh: [], viewed: keys };
  const known = new Set(viewed);
  return { fresh: keys.filter((key) => !known.has(key)), viewed };
}

export function formatFresh(labels, limit = 3) {
  const names = [];
  const seen = new Set();
  for (const label of labels || []) {
    if (!label || seen.has(label)) continue;
    seen.add(label);
    names.push(label);
  }
  if (!names.length) return "";
  if (names.length <= limit) return names.join(", ");
  const rest = names.length - limit;
  return `${names.slice(0, limit).join(", ")} и ещё ${rest}`;
}
