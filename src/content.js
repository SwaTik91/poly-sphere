export const VW = 720;
export const VH = 1280;

export const SHAPES = {
  circle: { glyph: "●", name: "Сфера" },
  triangle: { glyph: "▲", name: "Клин" },
  square: { glyph: "■", name: "Куб" },
  hex: { glyph: "⬢", name: "Призма" },
  diamond: { glyph: "◆", name: "Щит" },
  dash: { glyph: "➤", name: "Рывок" },
  heal: { glyph: "✚", name: "Лекарь" },
  boss: { glyph: "✸", name: "Босс" },
  mite: { glyph: "▴", name: "Осколок" },
  blade: { glyph: "☽", name: "Клинок" },
  mote: { glyph: "◉", name: "Искра" },
  shard: { glyph: "⬡", name: "Грань" },
  wisp: { glyph: "✦", name: "Огонёк" },
};

export const WEAPON_INFO = {
  gun: { name: "Пулемёт", color: "#7ee8ff" },
  laser: { name: "Лазер", color: "#60a5fa" },
  scatter: { name: "Дробь", color: "#fbbf24" },
  grenade: { name: "Заряд", color: "#fb7185" },
  emp: { name: "EMP", color: "#c084fc" },
  orb: { name: "Орбиты", color: "#34d399" },
  drone: { name: "Дрон", color: "#f472b6" },
};

export const RESONANCE_INFO = { name: "Резонанс", color: "#e9d5ff" };

export function weaponLabel(tag) {
  if (tag === "resonance") return RESONANCE_INFO.name;
  return WEAPON_INFO[tag]?.name || tag;
}

export function weaponColor(tag) {
  if (tag === "resonance") return RESONANCE_INFO.color;
  return WEAPON_INFO[tag]?.color || "#8ea2c6";
}

export function damageShares(dmgByWeapon) {
  const total = Object.values(dmgByWeapon || {}).reduce((sum, n) => sum + (n > 0 ? n : 0), 0);
  const shares = {};
  if (total <= 0) return shares;
  for (const [tag, amount] of Object.entries(dmgByWeapon)) {
    if (amount > 0) shares[tag] = amount / total;
  }
  return shares;
}

export const CRYSTAL_SHOP = {
  critPrice: 25,
  critBonus: 2,
  critCap: 10,
  weaponPrice: 40,
  fourthPrice: 50,
};

const QUEUED_CARDS = {
  Калибр: (r) => (r.gun.dmg *= 1.35),
  Темп: (r) => (r.gun.rate *= 1.25),
  Сервопривод: (r) => (r.gun.autoTurn *= 1.45),
  Пластины: (r) => {
    r.tower.maxHp += 80;
    r.tower.hp += 80;
    r.tower.regen += 1.2;
  },
};

export function applyQueuedCard(run, title) {
  const apply = QUEUED_CARDS[title];
  if (!apply) return false;
  apply(run);
  return true;
}

export function startingLoadout(profile = {}) {
  const loadout = Array.isArray(profile.weaponLoadout)
    ? profile.weaponLoadout
    : ["gun", "drone"];
  const weapons = { gun: true };
  const wepStats = {};
  for (const id of loadout) {
    if (!id || id === "gun") continue;
    if (!WEAPON_INFO[id]) continue;
    weapons[id] = true;
    if (id !== "drone") wepStats[id] = defaultWep(id);
  }
  return { weapons, wepStats, cards: profile.fourthCard ? 4 : 3 };
}

export function defaultWep(id) {
  switch (id) {
    case "laser":
      return { dmg: 32, cd: 0.6, width: 14, timer: 0, branch: null, rays: 1, spread: 0.28, bounces: 0, edgeMul: 1, burn: 0 };
    case "scatter":
      return { dmg: 22, cd: 0.7, n: 8, knock: 70, gap: 0.1, pierce: 0, timer: 0, branch: null, centerMul: 1, shards: 0, shardMul: 0.45 };
    case "grenade":
      return { dmg: 58, cd: 1.45, radius: 100, timer: 0, branch: null, bombs: 0, bombMul: 0.55, poolDmg: 20 };
    case "emp":
      return { dmg: 16, cd: 2.5, radius: 145, slow: 0.45, slowMul: 0.45, slowDur: 1.7, hits: 1, knock: 0, timer: 0, branch: null };
    case "orb":
      return { dmg: 18, count: 3, radius: 104, spin: 2, branch: null, reach: 1, fly: [] };
    case "drone":
      return { dmg: 24, count: 1, cd: 0.24, bombs: false, timer: 0 };
    default:
      return {};
  }
}

export const ENEMY_KINDS = [
  { type: "circle", hp: 50, speed: 58, dmg: 7, r: 16, color: "#7dd3fc", xp: 6, coins: 2 },
  { type: "triangle", hp: 34, speed: 92, dmg: 6, r: 14, color: "#fbbf24", xp: 7, coins: 2, zigzag: true },
  { type: "square", hp: 110, speed: 40, dmg: 12, r: 20, color: "#fb7185", xp: 10, coins: 3 },
  { type: "hex", hp: 70, speed: 52, dmg: 8, r: 18, color: "#c084fc", xp: 11, coins: 3, split: 3 },
  { type: "diamond", hp: 84, speed: 48, dmg: 9, r: 17, color: "#34d399", xp: 10, coins: 3, shield: 50 },
];

export const ENEMY_SPAWN = [
  { minWave: 2, chance: 0.35 },
  { minWave: 3, chance: 0.28 },
  { minWave: 4, chance: 0.22 },
  { minWave: 5, chance: 0.2 },
];

export const WAVE_GROWTH = { hpPow: 1.15, chapter: 0.26, dmgPerWave: 0.05 };
export const WAVE_XP_GROWTH = 1.12;

export function waveXpMul(wave) {
  const step = Math.max(0, Math.floor(wave || 1) - 1);
  return WAVE_XP_GROWTH ** step;
}
export const LEVEL_WAVES = 10;
export const ENDLESS_WAVE_SEC = 45;
export const ENDLESS_PACK = 18;
export const HORDE_WAVES = 30;
export const HORDE_PACK_GROWTH = 1.12;
export const HORDE_BOSS_GROWTH = 1.06;

export function hordeStep(wave) {
  return Math.max(1, (wave || 1) - LEVEL_WAVES);
}

export function hordePackHpMul(step) {
  return HORDE_PACK_GROWTH ** (Math.max(1, step) - 1);
}

export function hordeBossHpMul(step) {
  const opening = WAVE_GROWTH.hpPow ** (LEVEL_WAVES - 1);
  return opening * HORDE_BOSS_GROWTH ** (Math.max(1, step) - 1);
}

export function hordeBossDmgMul(step) {
  const opening = 1 + (LEVEL_WAVES - 1) * WAVE_GROWTH.dmgPerWave;
  return opening * HORDE_BOSS_GROWTH ** (Math.max(1, step) - 1);
}

export const BOSS_RULES = {
  monolith: "Редко бьёт в упор",
  reaper: "Один рывок к ядру",
  satellite: "Держит дистанцию",
  crystal: "Бьёт лучом",
  crown: "Щит, пока живы огоньки",
};

export const BOSS_KINDS = [
  { id: "monolith", name: "Монолит", hp: 980, speed: 14, dmg: 18, r: 72, color: "#fb7185", xp: 70, coins: 28, shot: "spike", minion: "mite" },
  { id: "reaper", name: "Жнец", hp: 920, speed: 15, dmg: 17, r: 66, color: "#fbbf24", xp: 74, coins: 28, shot: "arc", minion: "blade" },
  { id: "satellite", name: "Спутник", hp: 1080, speed: 13, dmg: 18, r: 70, color: "#7dd3fc", xp: 78, coins: 28, shot: "orb", minion: "mote" },
  { id: "crystal", name: "Кристалл", hp: 1040, speed: 14, dmg: 19, r: 68, color: "#c084fc", xp: 82, coins: 28, shot: "beam", minion: "shard" },
  { id: "crown", name: "Корона", hp: 1120, speed: 12, dmg: 20, r: 74, color: "#34d399", xp: 90, coins: 28, shot: "ring", minion: "wisp" },
];

export const BOSS_MINIONS = {
  mite: { type: "mite", hp: 22, speed: 74, dmg: 4, r: 11, color: "#fda4af", xp: 4, coins: 1 },
  blade: { type: "blade", hp: 16, speed: 98, dmg: 5, r: 10, color: "#fde68a", xp: 4, coins: 1 },
  mote: { type: "mote", hp: 24, speed: 66, dmg: 4, r: 12, color: "#bae6fd", xp: 5, coins: 1 },
  shard: { type: "shard", hp: 28, speed: 70, dmg: 5, r: 12, color: "#e9d5ff", xp: 5, coins: 1 },
  wisp: { type: "wisp", hp: 20, speed: 80, dmg: 4, r: 11, color: "#a7f3d0", xp: 5, coins: 1 },
};

export function isBossWave(wave) {
  return wave > 0 && wave % 2 === 0;
}

// Внутри уровня волны 1–5 остаются прежними. Дальше обычные враги
// крепчают вдвое медленнее, а боссы — полной степенью номера волны.
export function campaignWave(wave) {
  const step = Math.max(1, wave || 1);
  if (step <= 5) return step;
  return 5 + (step - 5) * 0.45;
}

export function bossKind(wave) {
  const step = Math.floor((Math.max(1, wave) - 1) / 2);
  return BOSS_KINDS[step % BOSS_KINDS.length];
}

export function bossForWave(wave, chapter = 1, power = 1, everyWave = false) {
  const kind = everyWave ? BOSS_KINDS[(Math.max(1, wave) - 1) % BOSS_KINDS.length] : bossKind(wave);
  const chapterMul = 1 + (chapter - 1) * WAVE_GROWTH.chapter;
  const scale = everyWave
    ? hordeBossHpMul(hordeStep(wave)) * chapterMul
    : Math.pow(WAVE_GROWTH.hpPow, wave - 1) * chapterMul * (power || 1);
  const dmgScale = everyWave
    ? hordeBossDmgMul(hordeStep(wave))
    : (1 + (wave - 1) * WAVE_GROWTH.dmgPerWave) * (power || 1);
  return {
    type: "boss",
    boss: true,
    bossId: kind.id,
    name: kind.name,
    shot: kind.shot,
    minion: kind.minion,
    hp: kind.hp * scale,
    speed: kind.speed,
    dmg: kind.dmg * dmgScale,
    r: kind.r,
    color: kind.color,
    xp: kind.xp,
    coins: kind.coins,
  };
}

export function minionForBoss(bossId, strong, wave, chapter = 1, power = 1, horde = false) {
  const kind = BOSS_KINDS.find((row) => row.id === bossId) || BOSS_KINDS[0];
  const base = BOSS_MINIONS[kind.minion];
  const chapterMul = 1 + (chapter - 1) * WAVE_GROWTH.chapter;
  const scale = horde
    ? hordeBossHpMul(hordeStep(wave)) * chapterMul * (power || 1)
    : Math.pow(WAVE_GROWTH.hpPow, wave - 1) * chapterMul * (power || 1);
  const dmgScale = horde
    ? hordeBossDmgMul(hordeStep(wave)) * (power || 1)
    : (1 + (wave - 1) * WAVE_GROWTH.dmgPerWave) * (power || 1);
  const tough = strong ? 2.2 : 1;
  return {
    type: base.type,
    hp: base.hp * scale * tough,
    speed: base.speed,
    dmg: base.dmg * dmgScale * tough,
    r: Math.round(base.r * (strong ? 1.28 : 1)),
    color: base.color,
    xp: strong ? base.xp * 2 : base.xp,
    coins: base.coins,
    strong: !!strong,
  };
}

export const SPECIAL_ENEMIES = {
  dash: { type: "dash", hp: 42, speed: 80, dmg: 8, r: 14, color: "#f97316", xp: 9, coins: 3, dash: { cd: 2.0, dur: 0.5, mul: 3.2 } },
  heal: { type: "heal", hp: 58, speed: 46, dmg: 5, r: 15, color: "#22d3ee", xp: 13, coins: 4, healAura: { radius: 130, hps: 12, tick: 0.5 } },
};
export const SPECIAL_SPAWN = { minWave: 3, chance: 0.06, healShare: 0.35 };
export const ELITE = {
  minWave: 4,
  chance: 0.02,
  hpMul: 2.8,
  dmgMul: 1.3,
  rMul: 1.35,
  coinMul: 3,
  xpMul: 2.5,
  mods: ["armor", "swift", "burst"],
};
export const WAVE_COUNT_BASE = 8;
export const WAVE_COUNT_STEP = 2;
export const WAVE_COUNT_MULT = 1;

export function endlessEnemyWave(wave) {
  return ((wave - 1) % 5) + 1;
}

export function enemyForWave(wave, chapter, power = 1, rng = Math.random, hordeRule = null) {
  const scale = Math.pow(WAVE_GROWTH.hpPow, wave - 1) * (1 + (chapter - 1) * WAVE_GROWTH.chapter) * power;

  let idx = 0;
  for (let i = 0; i < ENEMY_SPAWN.length; i++) {
    const row = ENEMY_SPAWN[i];
    if (wave >= row.minWave && rng() < row.chance) idx = i + 1;
  }
  let e;
  if (wave >= SPECIAL_SPAWN.minWave && rng() < SPECIAL_SPAWN.chance) {
    const base = rng() < SPECIAL_SPAWN.healShare ? SPECIAL_ENEMIES.heal : SPECIAL_ENEMIES.dash;
    e = { ...base };
    if (base.dash) e.dash = { ...base.dash };
    if (base.healAura) e.healAura = { ...base.healAura };
  } else {
    e = { ...ENEMY_KINDS[idx] };
  }
  e.hp *= scale;
  e.dmg *= (1 + (wave - 1) * WAVE_GROWTH.dmgPerWave) * power;

  const eliteRoll = hordeRule === "elites"
    ? rng() < ELITE.chance * 4
    : wave >= ELITE.minWave && rng() < ELITE.chance;
  if (eliteRoll) {
    const mod = ELITE.mods[Math.floor(rng() * ELITE.mods.length)];
    e.elite = mod;
    e.hp *= ELITE.hpMul;
    e.dmg *= ELITE.dmgMul;
    e.r = Math.round(e.r * ELITE.rMul);
    e.xp = Math.round(e.xp * ELITE.xpMul);
    if (mod === "armor") e.shield = (e.shield || 0) + e.hp * 0.5;
    else if (mod === "swift") e.speed *= 1.6;
    else if (mod === "burst") e.burstOnDeath = true;
  }
  return e;
}

export function waveCount(wave) {
  return (WAVE_COUNT_BASE + wave * WAVE_COUNT_STEP) * WAVE_COUNT_MULT;
}
