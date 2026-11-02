export const ACCOUNT_XP_STEP = 80;
const ACCOUNT_TRACK = [
  { crystals: 4, coins: 0, dust: 0 },
  { crystals: 0, coins: 40, dust: 0 },
  { crystals: 0, coins: 0, dust: 10 },
];

export function accountXpNeed(level) {
  return ACCOUNT_XP_STEP * Math.max(1, Number(level) || 1);
}

export function accountTrack(level, count = 3) {
  const start = Math.max(1, Number(level) || 1);
  const rows = [];
  for (let offset = 1; offset <= count; offset += 1) {
    const reached = start + offset;
    const step = ACCOUNT_TRACK[(reached - 2) % ACCOUNT_TRACK.length];
    rows.push({ level: reached, ...step });
  }
  return rows;
}

function ru(n, one, few, many) {
  const abs = Math.abs(Number(n) || 0);
  const n10 = abs % 10;
  const n100 = abs % 100;
  let word = many;
  if (n10 === 1 && n100 !== 11) word = one;
  else if (n10 >= 2 && n10 <= 4 && (n100 < 12 || n100 > 14)) word = few;
  return `${abs} ${word}`;
}

export function accountRewardBits(reward) {
  const bits = [];
  if (reward?.crystals) bits.push(`+${ru(reward.crystals, "кристалл", "кристалла", "кристаллов")}`);
  if (reward?.coins) bits.push(`+${ru(reward.coins, "монета", "монеты", "монет")}`);
  if (reward?.dust) bits.push(`+${reward.dust} пыли`);
  return bits;
}

export function accountStepLabel(step) {
  if (step?.crystals) return `+${step.crystals} ◆`;
  if (step?.coins) return `+${step.coins} ●`;
  if (step?.dust) return `+${step.dust} пыли`;
  return "";
}

export function accountGrantLine(account) {
  if (!account?.level) return "";
  const bits = accountRewardBits(account);
  return bits.length ? `Уровень аккаунта ${account.level}. ${bits.join(", ")}.` : `Уровень аккаунта ${account.level}.`;
}
