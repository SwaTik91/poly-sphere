import { addCrit } from "./gun.js";

export const LUCK_CAP = 1.6;
export const LEECH_CAP = 14;
export const PICKS_CAP = 6;
export const LEGEND_CAP = 0.9;
export const LIVES_CAP = 8;

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

export function rarityWeight(card, luck = 0, legendLuck = 0) {
  const base = RARITY_WEIGHT[card.rarity] || 1;
  let weight = base;
  if (card.rarity !== "common" && luck > 0) weight *= 1 + luck;
  if ((card.rarity === "epic" || card.rarity === "legendary") && legendLuck > 0) weight *= 1 + legendLuck;
  return weight;
}

export function scaleMight(run, mul) {
  run.might = (run.might || 1) * mul;
}

export function scaleXp(run, mul) {
  run.xpMul = (run.xpMul || 1) * mul;
}

export function queuePicks(run, n) {
  run.nextOffers = Math.min(PICKS_CAP, (run.nextOffers || 0) + n);
}

export function addLuck(run, n) {
  run.luck = Math.min(LUCK_CAP, (run.luck || 0) + n);
}

export function addLeech(run, n) {
  run.leech = Math.min(LEECH_CAP, (run.leech || 0) + n);
}

export function addLegendLuck(run, n) {
  run.legendLuck = Math.min(LEGEND_CAP, (run.legendLuck || 0) + n);
}

export function addLives(run, n) {
  run.lives = Math.min(LIVES_CAP, (run.lives || 0) + n);
}

function plates(run, hp, regen) {
  run.tower.maxHp += hp;
  run.tower.hp += hp;
  run.tower.regen += regen;
}

function sooner(run, n) {
  run.comboNeed = Math.max(3, run.comboNeed - n);
}

function card(id, title, desc, rarity, apply) {
  return { id, title, desc, rarity, apply };
}

export function generalPool() {
  return [
    card("gen-might", "Мощь", "Урон всех орудий +20%", "common", (r) => scaleMight(r, 1.2)),
    card("gen-might-r", "Мощь", "Урон всех орудий +40%", "rare", (r) => scaleMight(r, 1.4)),
    card("gen-might-e", "Мощь", "Урон всех орудий +70%", "epic", (r) => scaleMight(r, 1.7)),
    card("gen-might-l", "Мощь", "Урон всех орудий +100%", "legendary", (r) => scaleMight(r, 2)),

    card("gen-xp", "Добыча", "Опыт за убийства +15%", "common", (r) => scaleXp(r, 1.15)),
    card("gen-xp-r", "Добыча", "Опыт за убийства +30%", "rare", (r) => scaleXp(r, 1.3)),
    card("gen-xp-e", "Добыча", "Опыт за убийства +50%", "epic", (r) => scaleXp(r, 1.5)),
    card("gen-xp-l", "Добыча", "Опыт за убийства +80%", "legendary", (r) => scaleXp(r, 1.8)),

    card("gen-chain", "Черёд", "На следующем усилении два выбора подряд", "common", (r) => queuePicks(r, 2)),
    card("gen-chain-r", "Черёд", "На следующем усилении три выбора подряд", "rare", (r) => queuePicks(r, 3)),
    card("gen-chain-e", "Черёд", "На следующем усилении четыре выбора подряд", "epic", (r) => queuePicks(r, 4)),
    card("gen-chain-l", "Черёд", "На следующем усилении пять выборов подряд", "legendary", (r) => queuePicks(r, 5)),

    card("gen-luck", "Удача", "Редкие карты выпадают чуть чаще", "common", (r) => addLuck(r, 0.12)),
    card("gen-luck-r", "Удача", "Редкие карты выпадают заметно чаще", "rare", (r) => addLuck(r, 0.28)),
    card("gen-luck-e", "Удача", "Редкие, эпические и легендарные карты выпадают гораздо чаще", "epic", (r) => addLuck(r, 0.5)),
    card("gen-luck-l", "Удача", "Редкие, эпические и легендарные карты выпадают почти вдвое чаще", "legendary", (r) => addLuck(r, 0.85)),

    card("gen-plates", "Пластины", "Ядро +80 HP и лёгкий реген", "common", (r) => plates(r, 80, 1.2)),
    card("gen-plates-r", "Пластины", "Ядро +140 HP и реген", "rare", (r) => plates(r, 140, 2)),
    card("gen-plates-e", "Пластины", "Ядро +220 HP и сильный реген", "epic", (r) => plates(r, 220, 3.2)),
    card("gen-plates-l", "Пластины", "Ядро +340 HP и мощный реген", "legendary", (r) => plates(r, 340, 4.5)),

    card("gen-crit", "Крит", "Шанс крита +6%", "common", (r) => addCrit(r, 0.06)),
    card("gen-crit-r", "Крит", "Шанс крита +10%", "rare", (r) => addCrit(r, 0.1)),
    card("gen-crit-e", "Крит", "Шанс крита +15%", "epic", (r) => addCrit(r, 0.15)),
    card("gen-crit-l", "Крит", "Шанс крита +22%", "legendary", (r) => addCrit(r, 0.22)),

    card("gen-sharp", "Заточка", "Эпические и легендарные карты выпадают на 15% чаще", "common", (r) => addLegendLuck(r, 0.15)),
    card("gen-sharp-r", "Заточка", "Эпические и легендарные карты выпадают на 20% чаще", "rare", (r) => addLegendLuck(r, 0.2)),
    card("gen-sharp-e", "Заточка", "Эпические и легендарные карты выпадают на 25% чаще", "epic", (r) => addLegendLuck(r, 0.25)),
    card("gen-sharp-l", "Заточка", "Эпические и легендарные карты выпадают на 30% чаще", "legendary", (r) => addLegendLuck(r, 0.3)),

    card("gen-life", "Жизнь", "1 жизнь: смерть поднимает ядро и отбрасывает всех к краю", "common", (r) => addLives(r, 1)),
    card("gen-life-r", "Жизнь", "2 жизни: смерть поднимает ядро и отбрасывает всех к краю", "rare", (r) => addLives(r, 2)),
    card("gen-life-e", "Жизнь", "3 жизни: смерть поднимает ядро и отбрасывает всех к краю", "epic", (r) => addLives(r, 3)),
    card("gen-life-l", "Жизнь", "4 жизни: смерть поднимает ядро и отбрасывает всех к краю", "legendary", (r) => addLives(r, 4)),

    card("gen-reson", "Резонанс", "Резонанс форм на одно убийство раньше", "common", (r) => sooner(r, 1)),
    card("gen-reson-r", "Резонанс", "Резонанс форм на два убийства раньше", "rare", (r) => sooner(r, 2)),
    card("gen-reson-e", "Резонанс", "Резонанс форм на три убийства раньше", "epic", (r) => sooner(r, 3)),
    card("gen-reson-l", "Резонанс", "Резонанс форм срабатывает с трёх убийств", "legendary", (r) => sooner(r, 4)),

    card("gen-leech", "Кровь", "Убийство лечит ядро на 1", "common", (r) => addLeech(r, 1)),
    card("gen-leech-r", "Кровь", "Убийство лечит ядро на 2", "rare", (r) => addLeech(r, 2)),
    card("gen-leech-e", "Кровь", "Убийство лечит ядро на 4", "epic", (r) => addLeech(r, 4)),
    card("gen-leech-l", "Кровь", "Убийство лечит ядро на 7", "legendary", (r) => addLeech(r, 7)),
  ];
}
