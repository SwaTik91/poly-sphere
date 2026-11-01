const PYTHON_EPOCH_ORDINAL = 719163;

export const HORDE_RULES = [
  { id: "elites", title: "Элитки", text: "В орде элитки выходят чаще." },
  { id: "minion", title: "Соратник", text: "Босс орды выходит с лишним соратником." },
  { id: "coins", title: "Монеты", text: "Каждая зачищенная волна орды даёт +20 монет." },
];

export const HORDE_RULE_COINS = 20;

export function dateOrdinal(day) {
  const [year, month, date] = String(day).split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, date) / 86400000) + PYTHON_EPOCH_ORDINAL;
}

export function hordeRuleFor(day) {
  return HORDE_RULES[dateOrdinal(day) % HORDE_RULES.length];
}

export function hordeRuleById(id) {
  return HORDE_RULES.find((rule) => rule.id === id) || null;
}

export function moscowDay(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Moscow",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}
