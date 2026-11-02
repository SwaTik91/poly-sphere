import { gunXpToNext } from "./gun.js";

export { gunXpToNext as droneXpToNext };

export const DRONE_COUNT_CAP = 6;
export const DRONE_CD_MIN = 0.07;

export function addDrones(drone, n) {
  drone.count = Math.min(DRONE_COUNT_CAP, drone.count + n);
}

export function hasten(drone, mul) {
  drone.cd = Math.max(DRONE_CD_MIN, drone.cd * mul);
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function at(id, title, desc, rarity, apply, once) {
  return { ...card(id, title, desc, apply, rarity), once };
}

function raiseFalloff(drone, amount) {
  drone.falloff = Math.max(drone.falloff || 0, amount);
}

function flockCards(level) {
  if (level === 10) {
    return [
      card("wing", "Эскадрилья", "+2 дрона", (r) => addDrones(r.drone, 2)),
      card("spark10", "Спарка", "+3 пули с каждого дрона", (r) => {
        r.drone.pellets += 3;
      }),
      card("tempo10", "Темп", "Стрельба намного быстрее", (r) => hasten(r.drone, 0.62)),
    ];
  }
  return [
    card("carrier", "Авиагруппа", "+3 дрона", (r) => addDrones(r.drone, 3)),
    card("flight", "Звено", "Стрельба ещё быстрее", (r) => hasten(r.drone, 0.58)),
    card("line", "Строй", "Урон ×1,45", (r) => {
      r.drone.dmg *= 1.45;
    }),
  ];
}

function bombCards(level) {
  if (level === 10) {
    return [
      card("he", "Фугас", "Радиус взрыва +50", (r) => {
        r.drone.bombs = true;
        r.drone.radius += 50;
      }),
      card("napalm", "Напалм", "Урон бомб +1,4", (r) => {
        r.drone.bombs = true;
        r.drone.bombMul += 1.4;
      }),
      card("cluster", "Кассета", "Бомба взрывается при попадании, урон бомб +0,6", (r) => {
        r.drone.bombs = true;
        r.drone.bombOnHit = true;
        r.drone.bombMul += 0.6;
      }),
    ];
  }
  return [
    card("nuke", "Залп бомб", "Радиус взрыва +80", (r) => {
      r.drone.bombs = true;
      r.drone.radius += 80;
    }),
    card("arty", "Артобстрел", "Урон бомб +2", (r) => {
      r.drone.bombs = true;
      r.drone.bombMul += 2;
    }),
    card("core", "Ядро", "Взрыв при попадании, урон бомб ×1,35", (r) => {
      r.drone.bombs = true;
      r.drone.bombOnHit = true;
      r.drone.bombMul *= 1.35;
    }),
  ];
}

function huntCards(level) {
  if (level === 10) {
    return [
      card("ap-d", "Пронзание", "Пробивание +8", (r) => {
        r.drone.pierce += 8;
      }),
      card("burst-d", "Очередь", "Стрельба намного быстрее", (r) => hasten(r.drone, 0.72)),
      card("thru10", "Насквозь", "Пуля не останавливается. Следующая цель получает 120% урона", (r) => {
        raiseFalloff(r.drone, 1.2);
      }),
    ];
  }
  return [
    card("exec", "Приговор", "Урон ×2", (r) => {
      r.drone.dmg *= 2;
    }),
    card("lance", "Добой", "Пробивание +10", (r) => {
      r.drone.pierce += 10;
    }),
    card("predator", "Хищник", "Стрельба ещё быстрее", (r) => hasten(r.drone, 0.62)),
  ];
}

export function dronePool(branch) {
  const shared = [
    at("d-cal", "Калибр", "Урон +20%", "common", (r) => (r.drone.dmg *= 1.2)),
    at("d-cal-r", "Калибр", "Урон +40%", "rare", (r) => (r.drone.dmg *= 1.4)),
    at("d-cal-e", "Калибр", "Урон +60%", "epic", (r) => (r.drone.dmg *= 1.6)),
    at("d-cal-l", "Калибр", "Урон +100%", "legendary", (r) => (r.drone.dmg *= 2)),
    at("d-tempo", "Темп", "Стрельба быстрее", "common", (r) => hasten(r.drone, 0.9)),
    at("d-tempo-r", "Темп", "Стрельба заметно быстрее", "rare", (r) => hasten(r.drone, 0.8)),
    at("d-tempo-e", "Темп", "Стрельба гораздо быстрее", "epic", (r) => hasten(r.drone, 0.68)),
    at("d-tempo-l", "Темп", "Стрельба почти вдвое быстрее", "legendary", (r) => hasten(r.drone, 0.55)),
    at("d-rush", "Разгон", "Пули быстрее на 80", "common", (r) => (r.drone.speed += 80)),
    at("d-rush-r", "Разгон", "Пули быстрее на 160", "rare", (r) => (r.drone.speed += 160)),
    at("d-rush-e", "Разгон", "Пули быстрее на 240", "epic", (r) => (r.drone.speed += 240)),
    at("d-rush-l", "Разгон", "Пули быстрее на 400", "legendary", (r) => (r.drone.speed += 400)),
    at("d-range", "Дальность", "Пули живут дольше на 0,3 с", "common", (r) => (r.drone.life += 0.3)),
    at("d-range-r", "Дальность", "Пули живут дольше на 0,55 с", "rare", (r) => (r.drone.life += 0.55)),
    at("d-range-e", "Дальность", "Пули живут дольше на 0,85 с", "epic", (r) => (r.drone.life += 0.85)),
    at("d-range-l", "Дальность", "Пули живут дольше на 1,4 с", "legendary", (r) => (r.drone.life += 1.4)),
    at("d-extra", "Доп. снаряд", "+1 пуля", "common", (r) => (r.drone.pellets += 1)),
    at("d-extra-r", "Доп. снаряд", "+2 пули", "rare", (r) => (r.drone.pellets += 2)),
    at("d-extra-e", "Доп. снаряд", "+3 пули", "epic", (r) => (r.drone.pellets += 3)),
    at("d-extra-l", "Доп. снаряд", "+4 пули", "legendary", (r) => (r.drone.pellets += 4)),
    at("d-ap", "Пробивание", "Пробивание +1", "common", (r) => (r.drone.pierce += 1)),
    at("d-ap-r", "Пробивание", "Пробивание +2", "rare", (r) => (r.drone.pierce += 2)),
    at("d-ap-e", "Пробивание", "Пробивание +3", "epic", (r) => (r.drone.pierce += 3)),
    at("d-ap-l", "Пробивание", "Пробивание +6", "legendary", (r) => (r.drone.pierce += 6)),
  ];
  const branches = {
    flock: [
      at("f-one", "Ещё дрон", "+1 дрон", "common", (r) => addDrones(r.drone, 1)),
      at("f-one-r", "Ещё дрон", "+1 дрон", "rare", (r) => addDrones(r.drone, 1)),
      at("f-one-e", "Ещё дрон", "+2 дрона", "epic", (r) => addDrones(r.drone, 2)),
      at("f-one-l", "Ещё дрон", "+2 дрона", "legendary", (r) => addDrones(r.drone, 2)),
      at("f-spark", "Спарка", "+1 пуля с каждого дрона", "common", (r) => (r.drone.pellets += 1)),
      at("f-spark-r", "Спарка", "+1 пуля с каждого дрона", "rare", (r) => (r.drone.pellets += 1)),
      at("f-spark-e", "Спарка", "+2 пули с каждого дрона", "epic", (r) => (r.drone.pellets += 2)),
      at("f-spark-l", "Спарка", "+2 пули с каждого дрона", "legendary", (r) => (r.drone.pellets += 2)),
    ],
    bomb: [
      at("b-rad", "Воронка", "Радиус взрыва +14", "common", (r) => {
        r.drone.bombs = true;
        r.drone.radius += 14;
      }),
      at("b-rad-r", "Воронка", "Радиус взрыва +28", "rare", (r) => {
        r.drone.bombs = true;
        r.drone.radius += 28;
      }),
      at("b-rad-e", "Воронка", "Радиус взрыва +48", "epic", (r) => {
        r.drone.bombs = true;
        r.drone.radius += 48;
      }),
      at("b-rad-l", "Воронка", "Радиус взрыва +75", "legendary", (r) => {
        r.drone.bombs = true;
        r.drone.radius += 75;
      }),
      at("b-charge", "Заряд", "Урон бомб +0,25", "common", (r) => {
        r.drone.bombs = true;
        r.drone.bombMul += 0.25;
      }),
      at("b-charge-r", "Заряд", "Урон бомб +0,45", "rare", (r) => {
        r.drone.bombs = true;
        r.drone.bombMul += 0.45;
      }),
      at("b-charge-e", "Заряд", "Урон бомб +0,7", "epic", (r) => {
        r.drone.bombs = true;
        r.drone.bombMul += 0.7;
      }),
      at("b-charge-l", "Заряд", "Урон бомб +1,1", "legendary", (r) => {
        r.drone.bombs = true;
        r.drone.bombMul += 1.1;
      }),
    ],
    hunt: [
      at("h-aim", "Прицел", "Урон +15%", "common", (r) => (r.drone.dmg *= 1.15)),
      at("h-aim-r", "Прицел", "Урон +28%", "rare", (r) => (r.drone.dmg *= 1.28)),
      at("h-aim-e", "Прицел", "Урон +45%", "epic", (r) => (r.drone.dmg *= 1.45)),
      at("h-aim-l", "Прицел", "Урон +70%", "legendary", (r) => (r.drone.dmg *= 1.7)),
      at("h-thru", "Насквозь", "Пуля не останавливается, следующая цель получает 70% урона", "common", (r) => raiseFalloff(r.drone, 0.7)),
      at("h-thru-r", "Насквозь", "Пуля не останавливается, следующая цель получает 80% урона", "rare", (r) => raiseFalloff(r.drone, 0.8)),
      at("h-thru-e", "Насквозь", "Пуля не останавливается, следующая цель получает 90% урона", "epic", (r) => raiseFalloff(r.drone, 0.9)),
      at("h-thru-l", "Насквозь", "Пуля не останавливается, следующая цель получает 100% урона", "legendary", (r) => raiseFalloff(r.drone, 1)),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollDroneOffer(branch, drone = {}, n = 3, rng = Math.random) {
  const pool = dronePool(branch).filter((c) => !(c.once && drone[c.once]));
  const out = [];
  const used = new Set();
  let guard = 0;
  while (out.length < n && guard++ < 40) {
    const available = pool.filter((c) => !used.has(c.id));
    if (!available.length) break;
    const sum = available.reduce((acc, c) => acc + (RARITY_WEIGHT[c.rarity] || 1), 0);
    let roll = rng() * sum;
    let picked = available[0];
    for (const c of available) {
      roll -= RARITY_WEIGHT[c.rarity] || 1;
      if (roll <= 0) {
        picked = c;
        break;
      }
    }
    used.add(picked.id);
    out.push(picked);
  }
  return out;
}

export function droneStep(level, branch) {
  if (level === 5) {
    return {
      kind: "choice",
      sub: "Выбери ветку дрона. До конца забега она не меняется.",
      cards: [
        card("flock", "Стая", "+2 дрона, стрельба быстрее", (r) => {
          r.drone.branch = "flock";
          addDrones(r.drone, 2);
          hasten(r.drone, 0.85);
        }),
        card("bomb", "Бомбы", "Дроны сбрасывают бомбы. Взрыв дотягивается до цели", (r) => {
          r.drone.branch = "bomb";
          r.drone.bombs = true;
          r.drone.radius += 56;
          r.drone.bombMul += 0.8;
        }),
        card("hunt", "Охота", "Урон ×1,45, пробивание +4, стрельба быстрее", (r) => {
          r.drone.branch = "hunt";
          r.drone.dmg *= 1.45;
          r.drone.pierce += 4;
          hasten(r.drone, 0.82);
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "flock" ? flockCards(level) : branch === "bomb" ? bombCards(level) : huntCards(level);
    return { kind: "choice", sub: "Легендарное улучшение дрона", cards };
  }
  return {
    kind: "choice",
    sub: "Три усиления дрона. Обычные выпадают чаще, эпики реже.",
    cards: rollDroneOffer(branch),
  };
}
