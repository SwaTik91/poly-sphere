export const GRENADE_CD_MIN = 0.55;
export const GRENADE_RADIUS_CAP = 220;
export const GRENADE_BOMB_CAP = 14;
export const GRENADE_WIDTH_CAP = 2.2;
export const GRENADE_REACH_CAP = 8;
export const GRENADE_BOMB_MUL_CAP = 2.2;
export const GRENADE_POOL_CAP = 8;

export function hastenGrenade(grenade, mul) {
  grenade.cd = Math.max(GRENADE_CD_MIN, grenade.cd * mul);
}

export function scaleGrenade(grenade, mul) {
  grenade.dmg *= mul;
  if (grenade.poolDmg) grenade.poolDmg *= mul;
}

export function addRadius(grenade, n) {
  grenade.radius = Math.min(GRENADE_RADIUS_CAP, grenade.radius + n);
}

export function addReach(grenade, n) {
  grenade.reach = Math.min(GRENADE_REACH_CAP, (grenade.reach || 1) + n);
}

export function raiseReach(grenade, value) {
  grenade.reach = Math.min(GRENADE_REACH_CAP, Math.max(grenade.reach || 1, value));
}

export function addWidth(grenade, n) {
  grenade.width = Math.min(GRENADE_WIDTH_CAP, (grenade.width || 0.7) + n);
}

export function widenGrenade(grenade, mul) {
  grenade.width = Math.min(GRENADE_WIDTH_CAP, (grenade.width || 0.7) * mul);
}

export function addBombs(grenade, n) {
  grenade.bombs = Math.min(GRENADE_BOMB_CAP, (grenade.bombs || 0) + n);
}

export function raiseBombs(grenade, count) {
  grenade.bombs = Math.min(GRENADE_BOMB_CAP, Math.max(grenade.bombs || 0, count));
}

export function addBombMul(grenade, n) {
  grenade.bombMul = Math.min(GRENADE_BOMB_MUL_CAP, (grenade.bombMul || 0.55) + n);
}

export function raiseBombMul(grenade, mul) {
  grenade.bombMul = Math.min(GRENADE_BOMB_MUL_CAP, (grenade.bombMul || 0.55) * mul);
}

export function addPool(grenade, n) {
  grenade.pool = Math.min(GRENADE_POOL_CAP, (grenade.pool || 0) + n);
}

export function scalePool(grenade, mul) {
  if (grenade.poolDmg) grenade.poolDmg *= mul;
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function at(id, title, desc, rarity, apply) {
  return { ...card(id, title, desc, apply, rarity) };
}

function wedgeCards(level) {
  if (level === 10) {
    return [
      card("wd-lane", "Просека", "Клин достаёт дальше", (r) => raiseReach(r.wepStats.grenade, 2.6)),
      card("wd-cross", "Крест", "Поперёк бьёт вторая полоса", (r) => {
        r.wepStats.grenade.shape = "cross";
      }),
      card("wd-briz", "Бризант", "Урон ×2,4", (r) => scaleGrenade(r.wepStats.grenade, 2.4)),
    ];
  }
  return [
    card("wd-rift", "Расселина", "Клин бьёт до края экрана", (r) => raiseReach(r.wepStats.grenade, 8)),
    card("wd-star", "Звезда", "Из взрыва бьют четыре полосы", (r) => {
      r.wepStats.grenade.shape = "star";
    }),
    card("wd-slab", "Пласт", "Клин вдвое шире", (r) => widenGrenade(r.wepStats.grenade, 2)),
  ];
}

function cassCards(level) {
  if (level === 10) {
    return [
      card("cs-eight", "Обойма", "8 бомб", (r) => raiseBombs(r.wepStats.grenade, 8)),
      card("cs-core", "Эпицентр", "В центре взрыв бьёт ещё раз", (r) => {
        r.wepStats.grenade.core = true;
      }),
      card("cs-twin", "Дубль", "Следом летит вторая кассета", (r) => {
        r.wepStats.grenade.twin = true;
      }),
    ];
  }
  return [
    card("cs-rain", "Ливень", "12 бомб", (r) => raiseBombs(r.wepStats.grenade, 12)),
    card("cs-wave", "Вторая волна", "Каждая бомба взрывается ещё раз", (r) => {
      r.wepStats.grenade.twice = true;
    }),
    card("cs-war", "Боеголовка", "Урон бомб ×2,2", (r) => raiseBombMul(r.wepStats.grenade, 2.2)),
  ];
}

function craterCards(level) {
  if (level === 10) {
    return [
      card("cr-resin", "Смола", "Замедление не спадает, пока враг в луже", (r) => {
        r.wepStats.grenade.resin = true;
      }),
      card("cr-pull", "Омут", "Врагов слегка тянет к центру лужи", (r) => {
        r.wepStats.grenade.pull = true;
      }),
      card("cr-heat", "Пекло", "Урон лужи ×2,8", (r) => scalePool(r.wepStats.grenade, 2.8)),
    ];
  }
  return [
    card("cr-all", "Половодье", "Лужа на весь экран", (r) => {
      r.wepStats.grenade.poolAll = true;
    }),
    card("cr-pit", "Яма", "Враги в луже замирают на 2 секунды", (r) => {
      r.wepStats.grenade.pit = 2;
    }),
    card("cr-magma", "Магма", "Смерть в луже взрывается", (r) => {
      r.wepStats.grenade.magma = true;
    }),
  ];
}

export function grenadePool(branch) {
  const shared = [
    at("g-cal", "Калибр", "Урон +20%", "common", (r) => scaleGrenade(r.wepStats.grenade, 1.2)),
    at("g-cal-r", "Калибр", "Урон +40%", "rare", (r) => scaleGrenade(r.wepStats.grenade, 1.4)),
    at("g-cal-e", "Калибр", "Урон +60%", "epic", (r) => scaleGrenade(r.wepStats.grenade, 1.6)),
    at("g-cal-l", "Калибр", "Урон +100%", "legendary", (r) => scaleGrenade(r.wepStats.grenade, 2)),
    at("g-tempo", "Темп", "Заряд летит чаще", "common", (r) => hastenGrenade(r.wepStats.grenade, 0.9)),
    at("g-tempo-r", "Темп", "Заряд летит заметно чаще", "rare", (r) => hastenGrenade(r.wepStats.grenade, 0.82)),
    at("g-tempo-e", "Темп", "Заряд летит гораздо чаще", "epic", (r) => hastenGrenade(r.wepStats.grenade, 0.72)),
    at("g-tempo-l", "Темп", "Заряд летит почти вдвое чаще", "legendary", (r) => hastenGrenade(r.wepStats.grenade, 0.58)),
    at("g-rad", "Воронка", "Радиус +8", "common", (r) => addRadius(r.wepStats.grenade, 8)),
    at("g-rad-r", "Воронка", "Радиус +16", "rare", (r) => addRadius(r.wepStats.grenade, 16)),
    at("g-rad-e", "Воронка", "Радиус +28", "epic", (r) => addRadius(r.wepStats.grenade, 28)),
    at("g-rad-l", "Воронка", "Радиус +45", "legendary", (r) => addRadius(r.wepStats.grenade, 45)),
  ];
  const branches = {
    wedge: [
      at("wd-len", "Длина", "Клин чуть длиннее", "common", (r) => addReach(r.wepStats.grenade, 0.15)),
      at("wd-len-r", "Длина", "Клин заметно длиннее", "rare", (r) => addReach(r.wepStats.grenade, 0.28)),
      at("wd-len-e", "Длина", "Клин гораздо длиннее", "epic", (r) => addReach(r.wepStats.grenade, 0.45)),
      at("wd-len-l", "Длина", "Клин почти вдвое длиннее", "legendary", (r) => addReach(r.wepStats.grenade, 0.65)),
      at("wd-band", "Полоса", "Клин чуть шире", "common", (r) => addWidth(r.wepStats.grenade, 0.06)),
      at("wd-band-r", "Полоса", "Клин заметно шире", "rare", (r) => addWidth(r.wepStats.grenade, 0.12)),
      at("wd-band-e", "Полоса", "Клин гораздо шире", "epic", (r) => addWidth(r.wepStats.grenade, 0.2)),
      at("wd-band-l", "Полоса", "Клин куда шире", "legendary", (r) => addWidth(r.wepStats.grenade, 0.3)),
      at("wd-push", "Напор", "Урон +8%", "common", (r) => scaleGrenade(r.wepStats.grenade, 1.08)),
      at("wd-push-r", "Напор", "Урон +14%", "rare", (r) => scaleGrenade(r.wepStats.grenade, 1.14)),
      at("wd-push-e", "Напор", "Урон +22%", "epic", (r) => scaleGrenade(r.wepStats.grenade, 1.22)),
      at("wd-push-l", "Напор", "Урон +32%", "legendary", (r) => scaleGrenade(r.wepStats.grenade, 1.32)),
    ],
    cassette: [
      at("cs-bit", "Шрапнель", "+1 бомба", "common", (r) => addBombs(r.wepStats.grenade, 1)),
      at("cs-bit-r", "Шрапнель", "+1 бомба", "rare", (r) => addBombs(r.wepStats.grenade, 1)),
      at("cs-bit-e", "Шрапнель", "+2 бомбы", "epic", (r) => addBombs(r.wepStats.grenade, 2)),
      at("cs-bit-l", "Шрапнель", "+2 бомбы", "legendary", (r) => addBombs(r.wepStats.grenade, 2)),
      at("cs-fill", "Начинка", "Урон бомб +0,06", "common", (r) => addBombMul(r.wepStats.grenade, 0.06)),
      at("cs-fill-r", "Начинка", "Урон бомб +0,12", "rare", (r) => addBombMul(r.wepStats.grenade, 0.12)),
      at("cs-fill-e", "Начинка", "Урон бомб +0,2", "epic", (r) => addBombMul(r.wepStats.grenade, 0.2)),
      at("cs-fill-l", "Начинка", "Урон бомб +0,32", "legendary", (r) => addBombMul(r.wepStats.grenade, 0.32)),
    ],
    crater: [
      at("cr-sim", "Тление", "Лужа держится чуть дольше", "common", (r) => addPool(r.wepStats.grenade, 0.35)),
      at("cr-sim-r", "Тление", "Лужа держится заметно дольше", "rare", (r) => addPool(r.wepStats.grenade, 0.7)),
      at("cr-sim-e", "Тление", "Лужа держится гораздо дольше", "epic", (r) => addPool(r.wepStats.grenade, 1.15)),
      at("cr-sim-l", "Тление", "Лужа держится почти вдвое дольше", "legendary", (r) => addPool(r.wepStats.grenade, 1.7)),
      at("cr-boil", "Кипение", "Урон лужи +12%", "common", (r) => scalePool(r.wepStats.grenade, 1.12)),
      at("cr-boil-r", "Кипение", "Урон лужи +22%", "rare", (r) => scalePool(r.wepStats.grenade, 1.22)),
      at("cr-boil-e", "Кипение", "Урон лужи +35%", "epic", (r) => scalePool(r.wepStats.grenade, 1.35)),
      at("cr-boil-l", "Кипение", "Урон лужи +55%", "legendary", (r) => scalePool(r.wepStats.grenade, 1.55)),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollGrenadeOffer(branch, grenade = {}, n = 3, rng = Math.random) {
  const pool = grenadePool(branch).filter((c) => !(c.once && grenade[c.once]));
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

export function grenadeStep(level, branch) {
  if (level === 5) {
    return {
      cards: [
        card("wedge", "Клин", "Широкий клин вперёд по курсу, урон ×3", (r) => {
          const g = r.wepStats.grenade;
          g.branch = "wedge";
          g.shape = "wedge";
          g.dmg *= 3;
          g.width = 0.7;
          g.reach = 1.3;
        }),
        card("cassette", "Кассета", "На взрыве 4 бомбы рвутся вокруг цели, взрыв больнее", (r) => {
          const g = r.wepStats.grenade;
          g.branch = "cassette";
          g.dmg *= 1.5;
          g.bombs = 4;
          g.bombMul = 0.55;
          g.bombSpread = 1;
        }),
        card("crater", "Кратер", "Взрыв больнее и 3 секунды лужа: враги замедляются и получают урон каждую секунду", (r) => {
          const g = r.wepStats.grenade;
          g.branch = "crater";
          g.dmg *= 1.8;
          g.pool = 3;
          g.poolDmg = g.dmg * 0.6;
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "wedge" ? wedgeCards(level) : branch === "cassette" ? cassCards(level) : craterCards(level);
    return { cards };
  }
  return { cards: rollGrenadeOffer(branch) };
}
