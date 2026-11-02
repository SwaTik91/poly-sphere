export const GUN_RATE_CAP = 24;
export const GUN_CRIT_CAP = 0.9;

export const OFFER_XP_BASE = 800;

export function gunXpToNext(level) {
  const step = Math.max(1, level || 1);
  return OFFER_XP_BASE * 2 ** (step - 1);
}

export function addRate(gun, amount) {
  gun.rate = Math.min(GUN_RATE_CAP, gun.rate + amount);
}

export function addCrit(run, amount) {
  run.crit.chance = Math.min(GUN_CRIT_CAP, run.crit.chance + amount);
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function addCritMul(run, amount) {
  const cap = run.crit.cap || 4;
  const next = Math.min(cap, (run.crit.mul || 2) + amount);
  run.crit.mul = Math.max(run.crit.mul || 2, next);
}

function raiseCritFloor(run, floor) {
  const cap = run.crit.cap || 4;
  const next = Math.min(cap, Math.max(run.crit.mul || 2, floor));
  run.crit.mul = Math.max(run.crit.mul || 2, next);
}

export function swarmPower(swarm) {
  if (typeof swarm === "number") return Math.min(1, Math.max(0, swarm));
  return swarm ? 0.8 : 0;
}

function addSwarm(gun, amount) {
  gun.swarm = Math.min(1, swarmPower(gun.swarm) + amount);
}

function tightenGap(gun, amount, floor) {
  const min = Math.min(gun.gapFloor || 6, floor);
  gun.gapFloor = min;
  gun.gap = Math.max(min, (gun.gap || 12) - amount);
}

function addSeries(gun, n) {
  gun.series = (Number(gun.series) || 0) + n;
}

function tightenEvery(gun, n) {
  gun.every = gun.every > 0 ? Math.min(gun.every, n) : n;
}

function addSpread(gun, deg) {
  gun.spread = (gun.spread || 0) + deg;
}

function raiseFalloff(gun, amount) {
  gun.falloff = Math.max(gun.falloff || 0, amount);
}

export function pelletAngle(aim, index, count, spreadDeg) {
  const step = ((spreadDeg || 0) * Math.PI) / 180;
  return aim + (index - (count - 1) / 2) * step;
}

function queueCards(level) {
  if (level === 10) {
    return [
      card("kazn", "Казнь", "Критический урон ×4", (r) => raiseCritFloor(r, 4)),
      card("edge-q", "Остриё", "После крита ещё 6 выстрелов критические", (r) => addSeries(r.gun, 6)),
      card("drum", "Барабан", "Каждый 2-й выстрел — критический", (r) => tightenEvery(r.gun, 2)),
    ];
  }
  if (level === 15) {
    return [
      card("raskat", "Раскат", "Каждый выстрел — критический", (r) => tightenEvery(r.gun, 1)),
      card("chain", "Цепь", "После крита ещё 10 выстрелов критические", (r) => addSeries(r.gun, 10)),
      card("verdict", "Приговор", "Критический урон ×6", (r) => {
        r.crit.cap = Math.max(r.crit.cap || 4, 6);
        raiseCritFloor(r, 6);
      }),
    ];
  }
  return [];
}

function volleyCards(level) {
  if (level === 10) {
    return [
      card("fan", "Веер", "+6 пуль", (r) => {
        r.gun.pellets += 6;
      }),
      card("pierce", "Пробой", "Пробивание +8", (r) => {
        r.gun.pierce += 8;
      }),
      card("buck", "Картечь", "Угол между пулями +30°", (r) => addSpread(r.gun, 30)),
    ];
  }
  return [
    card("wall", "Стена", "+7 пуль, шаг между пулями до 3", (r) => {
      r.gun.pellets += 7;
      r.gun.gap = Math.min(r.gun.gap || 12, 3);
      r.gun.gapFloor = Math.min(r.gun.gapFloor || 6, r.gun.gap);
    }),
    card("through", "Насквозь", "Пуля не останавливается. Следующая цель получает 120% урона", (r) => {
      raiseFalloff(r.gun, 1.2);
    }),
    card("curtain", "Завеса", "Угол между пулями +45°", (r) => addSpread(r.gun, 45)),
  ];
}

function ricochetCards(level) {
  if (level === 10) {
    return [
      card("carousel", "Карусель", "+6 отскоков", (r) => {
        r.gun.bounces += 6;
      }),
      card("edge", "Кромка", "После каждого отскока урон пули ×3", (r) => {
        r.gun.edgeMul = Math.max(r.gun.edgeMul || 1, 3);
      }),
      card("bank", "Двойной край", "Удар о край выпускает пулю на 100% урона", (r) => {
        r.gun.swarm = Math.max(swarmPower(r.gun.swarm), 1);
      }),
    ];
  }
  return [
    card("swarm", "Рой", "Удар о край выпускает пули в обе стороны на 100% урона", (r) => {
      r.gun.swarm = Math.max(swarmPower(r.gun.swarm), 1);
      r.gun.swarmBoth = true;
    }),
    card("loop", "Петля", "+8 отскоков", (r) => {
      r.gun.bounces += 8;
    }),
    card("boom", "Бумеранг", "После удара о край пуля летит обратно к ядру тем же уроном", (r) => {
      r.gun.returnHome = true;
    }),
  ];
}

function at(id, title, desc, rarity, apply, once) {
  return { ...card(id, title, desc, apply, rarity), once };
}

export function gunPool(branch) {
  const shared = [
    at("cal", "Калибр", "Урон +20%", "common", (r) => (r.gun.dmg *= 1.2)),
    at("cal-r", "Калибр", "Урон +40%", "rare", (r) => (r.gun.dmg *= 1.4)),
    at("cal-e", "Калибр", "Урон +60%", "epic", (r) => (r.gun.dmg *= 1.6)),
    at("cal-l", "Калибр", "Урон +100%", "legendary", (r) => (r.gun.dmg *= 2)),
    at("tempo", "Темп", "+1 выстрел в секунду", "common", (r) => addRate(r.gun, 1)),
    at("tempo-r", "Темп", "+2 выстрела в секунду", "rare", (r) => addRate(r.gun, 2)),
    at("tempo-e", "Темп", "+3 выстрела в секунду", "epic", (r) => addRate(r.gun, 3)),
    at("tempo-l", "Темп", "+6 выстрелов в секунду", "legendary", (r) => addRate(r.gun, 6)),
    at("rush", "Разгон", "Скорость пули +80", "common", (r) => (r.gun.speed += 80)),
    at("rush-r", "Разгон", "Скорость пули +160", "rare", (r) => (r.gun.speed += 160)),
    at("rush-e", "Разгон", "Скорость пули +240", "epic", (r) => (r.gun.speed += 240)),
    at("rush-l", "Разгон", "Скорость пули +400", "legendary", (r) => (r.gun.speed += 400)),
    at("range", "Дальность", "Пуля живёт дольше на 0,4 с", "common", (r) => (r.gun.life += 0.4)),
    at("range-r", "Дальность", "Пуля живёт дольше на 0,8 с", "rare", (r) => (r.gun.life += 0.8)),
    at("range-e", "Дальность", "Пуля живёт дольше на 1,2 с", "epic", (r) => (r.gun.life += 1.2)),
    at("range-l", "Дальность", "Пуля живёт дольше на 2 с", "legendary", (r) => (r.gun.life += 2)),
    at("mass", "Масса", "Отталкивание и урон +10%", "common", (r) => {
      r.gun.dmg *= 1.1;
      r.gun.knock = (r.gun.knock || 0) + 60;
    }),
    at("mass-r", "Масса", "Сильнее отталкивание и урон +20%", "rare", (r) => {
      r.gun.dmg *= 1.2;
      r.gun.knock = (r.gun.knock || 0) + 120;
    }),
    at("mass-e", "Масса", "Ещё сильнее отталкивание и урон +30%", "epic", (r) => {
      r.gun.dmg *= 1.3;
      r.gun.knock = (r.gun.knock || 0) + 180;
    }),
    at("mass-l", "Масса", "Сильный отброс и урон +50%", "legendary", (r) => {
      r.gun.dmg *= 1.5;
      r.gun.knock = (r.gun.knock || 0) + 300;
    }),
    at("extra", "Доп. снаряд", "+1 пуля", "common", (r) => (r.gun.pellets += 1)),
    at("extra-r", "Доп. снаряд", "+2 пули", "rare", (r) => (r.gun.pellets += 2)),
    at("extra-e", "Доп. снаряд", "+3 пули", "epic", (r) => (r.gun.pellets += 3)),
    at("extra-l", "Доп. снаряд", "+4 пули", "legendary", (r) => (r.gun.pellets += 4)),
    at("ap", "Пробивание", "Пробивание +1", "common", (r) => (r.gun.pierce += 1)),
    at("ap-r", "Пробивание", "Пробивание +2", "rare", (r) => (r.gun.pierce += 2)),
    at("ap-e", "Пробивание", "Пробивание +3", "epic", (r) => (r.gun.pierce += 3)),
    at("ap-l", "Пробивание", "Пробивание +6", "legendary", (r) => (r.gun.pierce += 6)),
  ];
  const branches = {
    queue: [
      at("spark", "Искра", "Шанс крита +4%", "common", (r) => addCrit(r, 0.04)),
      at("spark-r", "Искра", "Шанс крита +8%", "rare", (r) => addCrit(r, 0.08)),
      at("spark-e", "Искра", "Шанс крита +12%", "epic", (r) => addCrit(r, 0.12)),
      at("spark-l", "Искра", "Шанс крита +20%", "legendary", (r) => addCrit(r, 0.2)),
      at("hone", "Заточка", "Шанс крита +4% и урон +15%", "common", (r) => {
        addCrit(r, 0.04);
        r.gun.dmg *= 1.15;
      }),
      at("hone-r", "Заточка", "Шанс крита +8% и урон +25%", "rare", (r) => {
        addCrit(r, 0.08);
        r.gun.dmg *= 1.25;
      }),
      at("hone-e", "Заточка", "Шанс крита +12% и урон +35%", "epic", (r) => {
        addCrit(r, 0.12);
        r.gun.dmg *= 1.35;
      }),
      at("hone-l", "Заточка", "Шанс крита +16% и урон +50%", "legendary", (r) => {
        addCrit(r, 0.16);
        r.gun.dmg *= 1.5;
      }),
      at("keen", "Лезвие", "Критический урон +0,25", "common", (r) => addCritMul(r, 0.25)),
      at("keen-r", "Лезвие", "Критический урон +0,5", "rare", (r) => addCritMul(r, 0.5)),
      at("keen-e", "Лезвие", "Критический урон +0,75", "epic", (r) => addCritMul(r, 0.75)),
      at("keen-l", "Лезвие", "Критический урон +1,25", "legendary", (r) => addCritMul(r, 1.25)),
      at("series", "Серия", "После крита ещё 1 выстрел критический", "common", (r) => addSeries(r.gun, 1)),
      at("series-r", "Серия", "После крита ещё 2 выстрела критические", "rare", (r) => addSeries(r.gun, 2)),
      at("series-e", "Серия", "После крита ещё 3 выстрела критические", "epic", (r) => addSeries(r.gun, 3)),
      at("series-l", "Серия", "После крита ещё 4 выстрела критические", "legendary", (r) => addSeries(r.gun, 4)),
      at("count", "Счётчик", "Каждый 6-й выстрел — критический", "common", (r) => tightenEvery(r.gun, 6)),
      at("count-r", "Счётчик", "Каждый 5-й выстрел — критический", "rare", (r) => tightenEvery(r.gun, 5)),
      at("count-e", "Счётчик", "Каждый 4-й выстрел — критический", "epic", (r) => tightenEvery(r.gun, 4)),
      at("count-l", "Счётчик", "Каждый 3-й выстрел — критический", "legendary", (r) => tightenEvery(r.gun, 3)),
      at("kazn-c", "Казнь", "Критический урон не ниже ×2,5", "common", (r) => raiseCritFloor(r, 2.5)),
      at("kazn-r", "Казнь", "Критический урон не ниже ×3", "rare", (r) => raiseCritFloor(r, 3)),
      at("kazn-e", "Казнь", "Критический урон не ниже ×3,5", "epic", (r) => raiseCritFloor(r, 3.5)),
      at("kazn-l", "Казнь", "Критический урон не ниже ×4", "legendary", (r) => raiseCritFloor(r, 4)),
    ],
    volley: [
      at("dense", "Плотность", "Пули залпа ближе на 2", "common", (r) => tightenGap(r.gun, 2, 6)),
      at("dense-r", "Плотность", "Пули залпа ближе на 4", "rare", (r) => tightenGap(r.gun, 4, 6)),
      at("dense-e", "Плотность", "Пули залпа ближе на 6", "epic", (r) => tightenGap(r.gun, 6, 6)),
      at("dense-l", "Плотность", "Пули залпа ближе на 8", "legendary", (r) => tightenGap(r.gun, 8, 4)),
      at("spread", "Веер", "Угол между соседними пулями +4°", "common", (r) => addSpread(r.gun, 4)),
      at("spread-r", "Веер", "Угол между соседними пулями +8°", "rare", (r) => addSpread(r.gun, 8)),
      at("spread-e", "Веер", "Угол между соседними пулями +12°", "epic", (r) => addSpread(r.gun, 12)),
      at("spread-l", "Веер", "Угол между соседними пулями +20°", "legendary", (r) => addSpread(r.gun, 20)),
      at("thru", "Насквозь", "Пуля не останавливается, следующая цель получает 70% урона", "common", (r) => raiseFalloff(r.gun, 0.7)),
      at("thru-r", "Насквозь", "Пуля не останавливается, следующая цель получает 80% урона", "rare", (r) => raiseFalloff(r.gun, 0.8)),
      at("thru-e", "Насквозь", "Пуля не останавливается, следующая цель получает 90% урона", "epic", (r) => raiseFalloff(r.gun, 0.9)),
      at("thru-l", "Насквозь", "Пуля не останавливается, следующая цель получает 100% урона", "legendary", (r) => raiseFalloff(r.gun, 1)),
    ],
    ricochet: [
      at("bounce", "Отскок", "+1 отскок", "common", (r) => (r.gun.bounces += 1)),
      at("bounce-r", "Отскок", "+2 отскока", "rare", (r) => (r.gun.bounces += 2)),
      at("bounce-e", "Отскок", "+3 отскока", "epic", (r) => (r.gun.bounces += 3)),
      at("bounce-l", "Отскок", "+4 отскока", "legendary", (r) => (r.gun.bounces += 4)),
      at("temper", "Закалка", "После отскока урон +15%", "common", (r) => {
        r.gun.edgeMul = (r.gun.edgeMul || 1) + 0.15;
      }),
      at("temper-r", "Закалка", "После отскока урон +30%", "rare", (r) => {
        r.gun.edgeMul = (r.gun.edgeMul || 1) + 0.3;
      }),
      at("temper-e", "Закалка", "После отскока урон +50%", "epic", (r) => {
        r.gun.edgeMul = (r.gun.edgeMul || 1) + 0.5;
      }),
      at("temper-l", "Закалка", "После отскока урон +80%", "legendary", (r) => {
        r.gun.edgeMul = (r.gun.edgeMul || 1) + 0.8;
      }),
      at("spark-w", "Искра от стены", "Удар о край выпускает пулю на 40% урона", "common", (r) => addSwarm(r.gun, 0.4)),
      at("spark-w-r", "Искра от стены", "Удар о край выпускает пулю на 60% урона", "rare", (r) => addSwarm(r.gun, 0.6)),
      at("spark-w-e", "Искра от стены", "Удар о край выпускает пулю на 80% урона", "epic", (r) => addSwarm(r.gun, 0.8)),
      at("spark-w-l", "Искра от стены", "Удар о край выпускает пулю на 100% урона", "legendary", (r) => addSwarm(r.gun, 1)),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollGunOffer(branch, gun = {}, n = 3, rng = Math.random) {
  const pool = gunPool(branch).filter((c) => !(c.once && gun[c.once]));
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

export function gunStep(level, branch) {
  if (level === 5) {
    return {
      kind: "choice",
      sub: "Выбери ветку. До конца забега она не меняется.",
      cards: [
        card("queue", "Очередь", "+6 выстрелов в секунду, шанс крита +25%, множитель крита +0,5", (r) => {
          r.gun.branch = "queue";
          addRate(r.gun, 6);
          addCrit(r, 0.25);
          addCritMul(r, 0.5);
        }),
        card("volley", "Залп", "+4 пули, пробивание +6, угол между пулями 8°", (r) => {
          r.gun.branch = "volley";
          r.gun.pellets += 4;
          r.gun.pierce += 6;
          addSpread(r.gun, 8);
        }),
        card("ricochet", "Рикошет", "4 отскока. Каждый отскок +45% урона, пуля ищет цель", (r) => {
          r.gun.branch = "ricochet";
          r.gun.bounces += 4;
          r.gun.edgeMul = (r.gun.edgeMul || 1) * 1.45;
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "queue" ? queueCards(level) : branch === "volley" ? volleyCards(level) : ricochetCards(level);
    return { kind: "choice", sub: "Легендарное улучшение ветки", cards };
  }
  return {
    kind: "choice",
    sub: "Три усиления. Обычные выпадают чаще, эпики реже.",
    cards: rollGunOffer(branch),
  };
}

export function rollGunShot(gun) {
  gun.shot = (gun.shot || 0) + 1;
  const chained = (gun.chainLeft || 0) > 0;
  if (chained) gun.chainLeft -= 1;
  const counted = gun.every > 0 && gun.shot % gun.every === 0;
  const series = Number(gun.series) || 0;
  return { guaranteedCrit: chained || counted, canChain: !chained && series > 0 };
}

export function reflectBullet(b, worldW, worldH) {
  if (!b.canBounce || b.life <= 0) return null;
  let hit = false;
  const min = 8;
  if (b.x < min && b.vx < 0) {
    b.x = min;
    b.vx *= -1;
    hit = true;
  } else if (b.x > worldW - min && b.vx > 0) {
    b.x = worldW - min;
    b.vx *= -1;
    hit = true;
  }
  if (b.y < min && b.vy < 0) {
    b.y = min;
    b.vy *= -1;
    hit = true;
  } else if (b.y > worldH - min && b.vy > 0) {
    b.y = worldH - min;
    b.vy *= -1;
    hit = true;
  }
  if (!hit) return null;
  if (b.bounces <= 0) {
    b.life = 0;
    return { died: true };
  }
  b.bounces -= 1;
  if (b.edgeMul && b.edgeMul !== 1) {
    if (b.baseDmg == null) b.baseDmg = b.dmg;
    b.dmg = Math.min(b.dmg * b.edgeMul, b.baseDmg * 3);
    b.edged = true;
    b.color = "#fde68a";
  } else {
    b.edged = true;
  }
  return { died: false, swarm: !!b.swarm };
}

export function bulletShouldStop(b) {
  if (b.falloff) {
    b.dmg *= b.falloff;
    return false;
  }
  if (!b.pierce) return true;
  b.pierce -= 1;
  return b.pierce < 0;
}
