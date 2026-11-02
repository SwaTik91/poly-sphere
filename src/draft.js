import { defaultWep } from "./content.js";
import { dronePool, droneStep } from "./drone.js";
import { empPool, empStep } from "./emp.js";
import { grenadePool, grenadeStep } from "./grenade.js";
import { orbPool, orbStep } from "./orb.js";
import { scatterPool, scatterStep } from "./scatter.js";
import { gunPool, gunStep } from "./gun.js";
import { generalPool, rarityWeight } from "./general.js";
import { laserPool, laserStep } from "./laser.js";

function card(id, title, desc, rarity, apply) {
  return { id, title, desc, rarity, apply };
}

const UNLOCKS = [
  { id: "laser", title: "Лазер", desc: "Луч бьёт сквозь линию врагов", rarity: "rare" },
  { id: "scatter", title: "Дробь", desc: "Близкий конус, сильный отброс", rarity: "rare" },
  { id: "grenade", title: "Заряд", desc: "АоЕ по скоплению", rarity: "rare" },
  { id: "emp", title: "EMP", desc: "Пульс вокруг ядра, замедление", rarity: "common" },
  { id: "orb", title: "Орбиты", desc: "Вращающиеся сферы-щиты", rarity: "rare" },
  { id: "drone", title: "Дрон", desc: "Автономный перехватчик", rarity: "epic" },
];

function tag(cards, who) {
  return cards.map((c) => ({ ...c, who }));
}

function withoutOnce(cards, host) {
  return cards.filter((c) => !(c.once && host && host[c.once]));
}

function unlockCard(spec) {
  return { ...card(spec.id, spec.title, spec.desc, spec.rarity, (r) => {
    r.weapons[spec.id] = true;
    r.wepStats[spec.id] = defaultWep(spec.id);
  }), unlock: true };
}

export function codexCardGroups() {
  const plain = (c) => ({ id: c.id, title: c.title, desc: c.desc, rarity: c.rarity });
  return {
    general: generalPool().map(plain),
    unlocks: UNLOCKS.map((spec) => ({ id: spec.id, title: spec.title, desc: spec.desc, rarity: spec.rarity })),
  };
}

export function weaponMilestone(pipCount) {
  const next = pipCount + 1;
  if (next === 5 || next === 10 || next === 15) return next;
  return 0;
}

export function legendaryOffer(run, weaponKey) {
  const next = weaponMilestone((run.pips?.[weaponKey] || []).length);
  if (!next) return [];
  if (weaponKey === "gun") {
    const level = run.gun?.branch ? next : 5;
    return tag(gunStep(level, run.gun?.branch).cards, "Пулемёт");
  }
  if (weaponKey === "drone") {
    const level = run.drone?.branch ? next : 5;
    return tag(droneStep(level, run.drone?.branch).cards, "Дрон");
  }
  if (weaponKey === "laser") {
    const laser = run.wepStats?.laser;
    const level = laser?.branch ? next : 5;
    return tag(laserStep(level, laser?.branch).cards, "Лазер");
  }
  if (weaponKey === "emp") {
    const emp = run.wepStats?.emp;
    const level = emp?.branch ? next : 5;
    return tag(empStep(level, emp?.branch).cards, "EMP");
  }
  if (weaponKey === "scatter") {
    const scatter = run.wepStats?.scatter;
    const level = scatter?.branch ? next : 5;
    return tag(scatterStep(level, scatter?.branch).cards, "Дробь");
  }
  if (weaponKey === "grenade") {
    const grenade = run.wepStats?.grenade;
    const level = grenade?.branch ? next : 5;
    return tag(grenadeStep(level, grenade?.branch).cards, "Заряд");
  }
  if (weaponKey === "orb") {
    const orb = run.wepStats?.orb;
    const level = orb?.branch ? next : 5;
    return tag(orbStep(level, orb?.branch).cards, "Орбиты");
  }
  return [];
}

function invested(run, key) {
  return (run.pips?.[key] || []).length;
}

function lateOffer(cards, utility) {
  const keep = new Set(["Калибр", "Темп", utility]);
  return cards.filter((card) => keep.has(card.title));
}

export function battlePool(run) {
  const cards = tag(generalPool(), "Общая карта");
  const weapons = run.weapons || {};
  const weaponCount = Object.values(weapons).filter(Boolean).length;
  const canUnlock = weaponCount < 5;

  const gunCards = withoutOnce(gunPool(run.gun?.branch), run.gun);
  const gunOffer = invested(run, "gun") < 15 ? gunCards : lateOffer(gunCards, "Пробивание");
  cards.push(...tag(gunOffer, "Пулемёт"));

  if (weapons.drone && run.drone) {
    const pool = withoutOnce(dronePool(run.drone.branch), run.drone);
    const offer = invested(run, "drone") < 15 ? pool : lateOffer(pool, "Пробивание");
    cards.push(...tag(offer, "Дрон"));
  }

  if (weapons.emp && run.wepStats?.emp) {
    const pool = withoutOnce(empPool(run.wepStats.emp.branch), run.wepStats.emp);
    const offer = invested(run, "emp") < 15 ? pool : lateOffer(pool, "Поле");
    cards.push(...tag(offer, "EMP"));
  }

  if (weapons.orb && run.wepStats?.orb) {
    const pool = withoutOnce(orbPool(run.wepStats.orb.branch), run.wepStats.orb);
    const offer = invested(run, "orb") < 15 ? pool : lateOffer(pool, "Рой");
    cards.push(...tag(offer, "Орбиты"));
  }

  if (weapons.laser && run.wepStats?.laser) {
    const pool = withoutOnce(laserPool(run.wepStats.laser.branch), run.wepStats.laser);
    const offer = invested(run, "laser") < 15 ? pool : lateOffer(pool, "Ширина");
    cards.push(...tag(offer, "Лазер"));
  }

  if (weapons.scatter && run.wepStats?.scatter) {
    const pool = withoutOnce(scatterPool(run.wepStats.scatter.branch), run.wepStats.scatter);
    const offer = invested(run, "scatter") < 15 ? pool : lateOffer(pool, "Картечь");
    cards.push(...tag(offer, "Дробь"));
  }

  if (weapons.grenade && run.wepStats?.grenade) {
    const pool = withoutOnce(grenadePool(run.wepStats.grenade.branch), run.wepStats.grenade);
    const offer = invested(run, "grenade") < 15 ? pool : lateOffer(pool, "Воронка");
    cards.push(...tag(offer, "Заряд"));
  }

  for (const spec of UNLOCKS) {
    if (!weapons[spec.id] && canUnlock) cards.push({ ...unlockCard(spec), who: spec.title });
  }

  return cards;
}

function pickFeatured(cards, rng, luck, legendLuck) {
  const groups = new Map();
  for (const card of cards) {
    const list = groups.get(card.who) || [];
    list.push(card);
    groups.set(card.who, list);
  }
  const names = [...groups.keys()];
  const who = names[Math.floor(rng() * names.length)];
  return pickWeighted(groups.get(who), rng, luck, legendLuck);
}

function pickWeighted(cards, rng, luck, legendLuck) {
  const sum = cards.reduce((acc, c) => acc + rarityWeight(c, luck, legendLuck), 0);
  let roll = rng() * sum;
  let picked = cards[0];
  for (const c of cards) {
    roll -= rarityWeight(c, luck, legendLuck);
    if (roll <= 0) return c;
  }
  return picked;
}

const HOME = new Set(["Пулемёт", "Дрон", "Общая карта"]);

export function rollBattleOffer(run, n = 3, rng = Math.random) {
  const pool = battlePool(run);
  const out = [];
  const used = new Set();
  const luck = run.luck || 0;
  const legendLuck = run.legendLuck || 0;
  const featured = pool.filter((c) => !HOME.has(c.who));
  if (featured.length && n > 0) {
    const picked = pickFeatured(featured, rng, luck, legendLuck);
    used.add(picked.id);
    out.push(picked);
  }
  while (out.length < n) {
    const available = pool.filter((c) => !used.has(c.id));
    if (!available.length) break;
    const picked = pickWeighted(available, rng, luck, legendLuck);
    used.add(picked.id);
    out.push(picked);
  }
  return out;
}
