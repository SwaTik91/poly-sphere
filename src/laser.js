export function rayEnd(x, y, angle, w, h) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let t = 1e9;
  let axis = "x";
  if (Math.abs(dx) > 1e-6) {
    const nt = dx > 0 ? (w - x) / dx : -x / dx;
    if (nt > 0.001 && nt < t) t = nt;
  }
  if (Math.abs(dy) > 1e-6) {
    const nt = dy > 0 ? (h - y) / dy : -y / dy;
    if (nt > 0.001 && nt < t) {
      t = nt;
      axis = "y";
    }
  }
  return { x: x + dx * t, y: y + dy * t, axis };
}

export function reflectAngle(angle, axis) {
  return axis === "x" ? Math.PI - angle : -angle;
}

export const LASER_CD_MIN = 0.22;
export const LASER_RAY_CAP = 8;
export const LASER_WIDTH_CAP = 40;
export const LASER_BOUNCE_CAP = 5;

export function hastenLaser(laser, mul) {
  laser.cd = Math.max(LASER_CD_MIN, laser.cd * mul);
}

export function addRays(laser, n) {
  laser.rays = Math.min(LASER_RAY_CAP, (laser.rays || 1) + n);
}

export function addWidth(laser, n) {
  laser.width = Math.min(LASER_WIDTH_CAP, laser.width + n);
}

export function widenLaser(laser, mul) {
  laser.width = Math.min(LASER_WIDTH_CAP, laser.width * mul);
}

export function addBounces(laser, n) {
  laser.bounces = Math.min(LASER_BOUNCE_CAP, (laser.bounces || 0) + n);
}

export function raiseEdge(laser, mul) {
  laser.edgeMul = Math.max(laser.edgeMul || 1, mul);
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function at(id, title, desc, rarity, apply) {
  return { ...card(id, title, desc, apply, rarity) };
}

function cutterCards(level) {
  if (level === 10) {
    return [
      card("cut-exec", "Казнь", "Враг ниже 25% здоровья умирает от луча", (r) => {
        r.wepStats.laser.execute = 0.25;
      }),
      card("cut-spread", "Огарок", "Горение перекидывается на следующего в линии", (r) => {
        r.wepStats.laser.burnSpread = true;
      }),
      card("cut-heat", "Накал", "Урон ×1,65", (r) => {
        r.wepStats.laser.dmg *= 1.65;
      }),
    ];
  }
  return [
    card("cut-hold", "Разрез", "Луч держится и жжёт всех в линии", (r) => {
      r.wepStats.laser.hold = 0.55;
    }),
    card("cut-ash", "Пепел", "Смерть от горения взрывается по соседям", (r) => {
      r.wepStats.laser.ash = true;
    }),
    card("cut-white", "Белый", "Урон ×1,8", (r) => {
      r.wepStats.laser.dmg *= 1.8;
    }),
  ];
}

function prismCards(level) {
  if (level === 10) {
    return [
      card("pr-spec", "Спектр", "+3 луча", (r) => addRays(r.wepStats.laser, 3)),
      card("pr-lens", "Линза", "Лучи толще вдвое", (r) => widenLaser(r.wepStats.laser, 2)),
      card("pr-fan", "Рассеяние", "Веер шире", (r) => {
        r.wepStats.laser.spread *= 1.9;
      }),
    ];
  }
  return [
    card("pr-more", "Веер", "+4 луча", (r) => addRays(r.wepStats.laser, 4)),
    card("pr-wide", "Полотна", "Каждый луч вдвое толще", (r) => widenLaser(r.wepStats.laser, 2)),
    card("pr-spin", "Карусель", "Лучи крутятся вокруг ядра", (r) => {
      r.wepStats.laser.spin = true;
    }),
  ];
}

function mirrorCards(level) {
  if (level === 10) {
    return [
      card("mi-glass", "Второе стекло", "+2 отскока", (r) => addBounces(r.wepStats.laser, 2)),
      card("mi-edge", "Кромка", "После отскока урон ×2", (r) => raiseEdge(r.wepStats.laser, 2)),
      card("mi-spark", "Искра", "Отскок выпускает короткий боковой луч", (r) => {
        r.wepStats.laser.spark = true;
      }),
    ];
  }
  return [
    card("mi-loop", "Петля", "Урон на отскоках не падает", (r) => {
      r.wepStats.laser.steady = true;
    }),
    card("mi-shard", "Осколки", "Каждый отскок даёт боковой луч", (r) => {
      r.wepStats.laser.shards = true;
    }),
    card("mi-back", "Бумеранг", "Отражённый луч возвращается к ядру и бьёт ещё раз", (r) => {
      r.wepStats.laser.boomerang = true;
    }),
  ];
}

export function laserPool(branch) {
  const shared = [
    at("l-cal", "Калибр", "Урон +20%", "common", (r) => (r.wepStats.laser.dmg *= 1.2)),
    at("l-cal-r", "Калибр", "Урон +40%", "rare", (r) => (r.wepStats.laser.dmg *= 1.4)),
    at("l-cal-e", "Калибр", "Урон +60%", "epic", (r) => (r.wepStats.laser.dmg *= 1.6)),
    at("l-cal-l", "Калибр", "Урон +100%", "legendary", (r) => (r.wepStats.laser.dmg *= 2)),
    at("l-tempo", "Темп", "Луч бьёт чаще", "common", (r) => hastenLaser(r.wepStats.laser, 0.9)),
    at("l-tempo-r", "Темп", "Луч бьёт заметно чаще", "rare", (r) => hastenLaser(r.wepStats.laser, 0.82)),
    at("l-tempo-e", "Темп", "Луч бьёт гораздо чаще", "epic", (r) => hastenLaser(r.wepStats.laser, 0.72)),
    at("l-tempo-l", "Темп", "Луч бьёт почти вдвое чаще", "legendary", (r) => hastenLaser(r.wepStats.laser, 0.58)),
    at("l-wide", "Ширина", "Луч толще на 2", "common", (r) => addWidth(r.wepStats.laser, 2)),
    at("l-wide-r", "Ширина", "Луч толще на 4", "rare", (r) => addWidth(r.wepStats.laser, 4)),
    at("l-wide-e", "Ширина", "Луч толще на 6", "epic", (r) => addWidth(r.wepStats.laser, 6)),
    at("l-wide-l", "Ширина", "Луч толще на 10", "legendary", (r) => addWidth(r.wepStats.laser, 10)),
  ];
  const branches = {
    cut: [
      at("cut-hot", "Прожиг", "Урон +12%", "common", (r) => (r.wepStats.laser.dmg *= 1.12)),
      at("cut-hot-r", "Прожиг", "Урон +24%", "rare", (r) => (r.wepStats.laser.dmg *= 1.24)),
      at("cut-hot-e", "Прожиг", "Урон +36%", "epic", (r) => (r.wepStats.laser.dmg *= 1.36)),
      at("cut-hot-l", "Прожиг", "Урон +50%", "legendary", (r) => (r.wepStats.laser.dmg *= 1.5)),
      at("cut-coal", "Очаг", "Горение +0,12", "common", (r) => {
        r.wepStats.laser.burn = (r.wepStats.laser.burn || 0) + 0.12;
      }),
      at("cut-coal-r", "Очаг", "Горение +0,25", "rare", (r) => {
        r.wepStats.laser.burn = (r.wepStats.laser.burn || 0) + 0.25;
      }),
      at("cut-coal-e", "Очаг", "Горение +0,4", "epic", (r) => {
        r.wepStats.laser.burn = (r.wepStats.laser.burn || 0) + 0.4;
      }),
      at("cut-coal-l", "Очаг", "Горение +0,65", "legendary", (r) => {
        r.wepStats.laser.burn = (r.wepStats.laser.burn || 0) + 0.65;
      }),
    ],
    prism: [
      at("pr-ray", "Луч", "+1 луч", "common", (r) => addRays(r.wepStats.laser, 1)),
      at("pr-ray-r", "Луч", "+1 луч", "rare", (r) => addRays(r.wepStats.laser, 1)),
      at("pr-ray-e", "Луч", "+2 луча", "epic", (r) => addRays(r.wepStats.laser, 2)),
      at("pr-ray-l", "Луч", "+2 луча", "legendary", (r) => addRays(r.wepStats.laser, 2)),
      at("pr-spread", "Сектор", "Веер чуть шире", "common", (r) => {
        r.wepStats.laser.spread *= 1.12;
      }),
      at("pr-spread-r", "Сектор", "Веер заметно шире", "rare", (r) => {
        r.wepStats.laser.spread *= 1.25;
      }),
      at("pr-spread-e", "Сектор", "Веер гораздо шире", "epic", (r) => {
        r.wepStats.laser.spread *= 1.4;
      }),
      at("pr-spread-l", "Сектор", "Веер почти вдвое шире", "legendary", (r) => {
        r.wepStats.laser.spread *= 1.6;
      }),
    ],
    mirror: [
      at("mi-rim", "Грань", "После отскока урон ×1,15", "common", (r) => raiseEdge(r.wepStats.laser, 1.15)),
      at("mi-rim-r", "Грань", "После отскока урон ×1,35", "rare", (r) => raiseEdge(r.wepStats.laser, 1.35)),
      at("mi-rim-e", "Грань", "После отскока урон ×1,55", "epic", (r) => raiseEdge(r.wepStats.laser, 1.55)),
      at("mi-rim-l", "Грань", "После отскока урон ×1,8", "legendary", (r) => raiseEdge(r.wepStats.laser, 1.8)),
      at("mi-hop", "Отскок", "+1 отскок", "common", (r) => addBounces(r.wepStats.laser, 1)),
      at("mi-hop-r", "Отскок", "+1 отскок", "rare", (r) => addBounces(r.wepStats.laser, 1)),
      at("mi-hop-e", "Отскок", "+1 отскок", "epic", (r) => addBounces(r.wepStats.laser, 1)),
      at("mi-hop-l", "Отскок", "+1 отскок", "legendary", (r) => addBounces(r.wepStats.laser, 1)),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollLaserOffer(branch, laser = {}, n = 3, rng = Math.random) {
  const pool = laserPool(branch).filter((c) => !(c.once && laser[c.once]));
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

export function laserStep(level, branch) {
  if (level === 5) {
    return {
      cards: [
        card("cut", "Резак", "Урон ×2. Цель горит и теряет ещё столько же урона за секунду", (r) => {
          r.wepStats.laser.branch = "cut";
          r.wepStats.laser.dmg *= 2;
          r.wepStats.laser.burn = 1;
        }),
        card("prism", "Призма", "Ещё 2 луча веером, каждый пробивает строй", (r) => {
          r.wepStats.laser.branch = "prism";
          r.wepStats.laser.rays = 3;
          r.wepStats.laser.spread = 0.28;
        }),
        card("mirror", "Зеркало", "Луч бьёт край экрана и отражается один раз", (r) => {
          r.wepStats.laser.branch = "mirror";
          r.wepStats.laser.bounces = 1;
          r.wepStats.laser.edgeMul = 1;
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "cut" ? cutterCards(level) : branch === "prism" ? prismCards(level) : mirrorCards(level);
    return { cards };
  }
  return { cards: rollLaserOffer(branch) };
}
