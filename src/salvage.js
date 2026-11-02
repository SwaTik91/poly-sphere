export const RARITY_ORDER = ["common", "rare", "epic", "legendary"];

export const SALVAGE_DUST = {
  common: 5,
  rare: 15,
  epic: 40,
  legendary: 100,
};

export const POLISH_MAX = 5;
export const POLISH_COST = [30, 50, 80, 120, 180];
export const DUST_PACK = { coins: 200, dust: 10 };

export function nextRarity(rarity) {
  const idx = RARITY_ORDER.indexOf(rarity);
  if (idx < 0 || idx >= RARITY_ORDER.length - 1) return null;
  return RARITY_ORDER[idx + 1];
}

export function salvageValue(rarity) {
  return SALVAGE_DUST[rarity] || 0;
}

export function polishCost(level) {
  const n = Math.max(0, Math.floor(Number(level) || 0));
  if (n >= POLISH_MAX) return null;
  return POLISH_COST[n];
}

export function canUpgrade(rarity) {
  return nextRarity(rarity) !== null;
}
