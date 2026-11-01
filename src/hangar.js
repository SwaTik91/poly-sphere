import { addLeech } from "./general.js";

export const HANGAR_TREE = [
  { id: "heart", title: "Сердце", desc: "+4% урона всех орудий за уровень", max: 5, base: 40, growth: 1.65, requires: null },
  { id: "hp", title: "Обшивка", desc: "+40 HP ядра за уровень", max: 5, base: 40, growth: 1.65, requires: null },
  { id: "charge", title: "Конденсатор", desc: "Овердрайв копится на 12% быстрее и стартует с +6 заряда", max: 5, base: 40, growth: 1.65, requires: null },
  { id: "crit", title: "Контур", desc: "+1% шанса крита за уровень", max: 3, base: 80, growth: 1.7, requires: { node: "heart", level: 2 } },
  { id: "regen", title: "Ремонт", desc: "+0.6 регена ядра за уровень", max: 3, base: 80, growth: 1.7, requires: { node: "hp", level: 2 } },
  { id: "drive", title: "Овертайм", desc: "+0.4 с овердрайва за уровень", max: 3, base: 80, growth: 1.7, requires: { node: "charge", level: 2 } },
  { id: "leech", title: "Подпитка", desc: "Каждое убийство лечит ядро на 1", max: 1, base: 250, growth: 1, requires: { node: "hp", level: 2 } },
];

export const HANGAR_EFFECTS = {
  heart: 0.04,
  hp: 40,
  chargeRate: 0.12,
  chargeStart: 6,
  crit: 0.01,
  regen: 0.6,
  drive: 0.4,
  leech: 1,
};

export function hangarNode(id) {
  return HANGAR_TREE.find((n) => n.id === id) || null;
}

export function hangarCost(id, level) {
  const node = hangarNode(id);
  if (!node) return null;
  return Math.round(node.base * Math.pow(node.growth, level));
}

export function hangarMax(id) {
  const node = hangarNode(id);
  return node ? node.max : 0;
}

export function hangarUnlocked(hangar, id) {
  const node = hangarNode(id);
  if (!node || !node.requires) return true;
  return (hangar?.[node.requires.node] || 0) >= node.requires.level;
}

export function applyHangar(run, hangar) {
  if (!run || !hangar) return;
  const heart = hangar.heart || 0;
  const hp = hangar.hp || 0;
  const charge = hangar.charge || 0;
  run.might = (run.might || 1) * (1 + heart * HANGAR_EFFECTS.heart);
  if (run.tower) {
    const bonus = hp * HANGAR_EFFECTS.hp;
    run.tower.maxHp += bonus;
    run.tower.hp += bonus;
    run.tower.regen += (hangar.regen || 0) * HANGAR_EFFECTS.regen;
  }
  if (run.overdrive) {
    run.overdrive.charge = (run.overdrive.charge || 0) + charge * HANGAR_EFFECTS.chargeStart;
    run.overdrive.chargeRate = 1 + charge * HANGAR_EFFECTS.chargeRate;
    run.overdrive.dur += (hangar.drive || 0) * HANGAR_EFFECTS.drive;
  }
  if (run.crit) run.crit.chance += (hangar.crit || 0) * HANGAR_EFFECTS.crit;
  if ((hangar.leech || 0) > 0) addLeech(run, (hangar.leech || 0) * HANGAR_EFFECTS.leech);
}
