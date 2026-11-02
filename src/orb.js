export const ORB_COUNT_CAP = 8;
export const ORB_SPIN_CAP = 7;
export const ORB_LUNGE_CD_MIN = 0.4;
export const ORB_GUARD_CD_MIN = 1.2;

export function addOrbs(orb, n) {
  orb.count = Math.min(ORB_COUNT_CAP, orb.count + n);
}

export function hastenOrb(orb, mul) {
  orb.spin = Math.min(ORB_SPIN_CAP, orb.spin * mul);
}

export function hastenLunge(orb, mul) {
  orb.lungeCd = Math.max(ORB_LUNGE_CD_MIN, (orb.lungeCd || 1.3) * mul);
}

export function hastenGuard(orb, mul) {
  orb.guardCd = Math.max(ORB_GUARD_CD_MIN, (orb.guardCd || 4) * mul);
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function at(id, title, desc, rarity, apply) {
  return { ...card(id, title, desc, apply, rarity) };
}

function addReach(orb, amount) {
  orb.reach = (orb.reach || 1) + amount;
}

function addLungeMul(orb, amount) {
  orb.lungeMul = (orb.lungeMul || 8) + amount;
}

function bladeCards(level) {
  if (level === 10) {
    return [
      card("bl-teeth", "Зубья", "Ещё 3 лезвия", (r) => addOrbs(r.wepStats.orb, 3)),
      card("bl-arc", "Размах", "Дуга лезвия вдвое длиннее", (r) => {
        r.wepStats.orb.reach *= 2;
      }),
      card("bl-hone", "Заточка", "Урон ×1,6", (r) => {
        r.wepStats.orb.dmg *= 1.6;
      }),
    ];
  }
  return [
    card("bl-saw", "Пила", "Лезвия смыкаются и режут всё кольцо", (r) => {
      r.wepStats.orb.saw = true;
    }),
    card("bl-inner", "Ближний круг", "Второе кольцо лезвий у ядра", (r) => {
      r.wepStats.orb.inner = true;
    }),
    card("bl-bleed", "Кровоток", "Порез жжёт ещё секунду тем же уроном", (r) => {
      r.wepStats.orb.bleed = true;
    }),
  ];
}

function wardCards(level) {
  if (level === 10) {
    return [
      card("wd-stock", "Запас", "Блок копится до двух зарядов", (r) => {
        r.wepStats.orb.guardMax = Math.max(r.wepStats.orb.guardMax || 1, 2);
      }),
      card("wd-back", "Отдача", "Съеденный удар бьёт врага его уроном ×3", (r) => {
        r.wepStats.orb.reflect = true;
      }),
      card("wd-hold", "Упор", "Пока щит цел, враг на кольце почти стоит", (r) => {
        r.wepStats.orb.pin = true;
      }),
    ];
  }
  return [
    card("wd-wall", "Стена", "Враги не проходят кольцо, пока есть заряд", (r) => {
      r.wepStats.orb.wall = true;
    }),
    card("wd-flash", "Вспышка", "Съеденный удар взрывается по кольцу", (r) => {
      r.wepStats.orb.flash = true;
    }),
    card("wd-mend", "Отклик", "Каждый блок лечит ядро на 120 HP", (r) => {
      r.wepStats.orb.mend = Math.max(r.wepStats.orb.mend || 0, 120);
    }),
  ];
}

function lungeCards(level) {
  if (level === 10) {
    return [
      card("lg-series", "Серия", "Выпады вдвое чаще", (r) => hastenLunge(r.wepStats.orb, 0.5)),
      card("lg-through", "Насквозь", "Удар ранит всех на пути к цели", (r) => {
        r.wepStats.orb.through = true;
      }),
      card("lg-hook", "Крюк", "После удара сфера бьёт ещё одну цель", (r) => {
        r.wepStats.orb.hook = true;
      }),
    ];
  }
  return [
    card("lg-salvo", "Залп", "Все сферы разом бьют в самую густую группу", (r) => {
      r.wepStats.orb.salvo = true;
    }),
    card("lg-anchor", "Якорь", "Сфера висит на враге и бьёт, пока тот жив", (r) => {
      r.wepStats.orb.anchor = true;
    }),
    card("lg-comet", "Комета", "Удар выпада ×1,5", (r) => {
      r.wepStats.orb.lungeMul *= 1.5;
    }),
  ];
}

export function orbPool(branch) {
  const shared = [
    at("o-cal", "Калибр", "Урон +20%", "common", (r) => (r.wepStats.orb.dmg *= 1.2)),
    at("o-cal-r", "Калибр", "Урон +40%", "rare", (r) => (r.wepStats.orb.dmg *= 1.4)),
    at("o-cal-e", "Калибр", "Урон +60%", "epic", (r) => (r.wepStats.orb.dmg *= 1.6)),
    at("o-cal-l", "Калибр", "Урон +100%", "legendary", (r) => (r.wepStats.orb.dmg *= 2)),
    at("o-tempo", "Темп", "Кольцо крутится быстрее", "common", (r) => hastenOrb(r.wepStats.orb, 1.15)),
    at("o-tempo-r", "Темп", "Кольцо крутится заметно быстрее", "rare", (r) => hastenOrb(r.wepStats.orb, 1.3)),
    at("o-tempo-e", "Темп", "Кольцо крутится гораздо быстрее", "epic", (r) => hastenOrb(r.wepStats.orb, 1.5)),
    at("o-tempo-l", "Темп", "Кольцо крутится почти вдвое быстрее", "legendary", (r) => hastenOrb(r.wepStats.orb, 1.8)),
    at("o-swarm", "Рой", "Ещё одна орбита", "common", (r) => addOrbs(r.wepStats.orb, 1)),
    at("o-swarm-r", "Рой", "Ещё одна орбита", "rare", (r) => addOrbs(r.wepStats.orb, 1)),
    at("o-swarm-e", "Рой", "Ещё две орбиты", "epic", (r) => addOrbs(r.wepStats.orb, 2)),
    at("o-swarm-l", "Рой", "Ещё две орбиты", "legendary", (r) => addOrbs(r.wepStats.orb, 2)),
  ];
  const branches = {
    blade: [
      at("bl-edge", "Кромка", "Урон +10%", "common", (r) => (r.wepStats.orb.dmg *= 1.1)),
      at("bl-edge-r", "Кромка", "Урон +20%", "rare", (r) => (r.wepStats.orb.dmg *= 1.2)),
      at("bl-edge-e", "Кромка", "Урон +32%", "epic", (r) => (r.wepStats.orb.dmg *= 1.32)),
      at("bl-edge-l", "Кромка", "Урон +45%", "legendary", (r) => (r.wepStats.orb.dmg *= 1.45)),
      at("bl-arc-c", "Дуга", "Размах +0,3", "common", (r) => addReach(r.wepStats.orb, 0.3)),
      at("bl-arc-r", "Дуга", "Размах +0,55", "rare", (r) => addReach(r.wepStats.orb, 0.55)),
      at("bl-arc-e", "Дуга", "Размах +0,85", "epic", (r) => addReach(r.wepStats.orb, 0.85)),
      at("bl-arc-l", "Дуга", "Размах +1,3", "legendary", (r) => addReach(r.wepStats.orb, 1.3)),
    ],
    ward: [
      at("wd-cd", "Заряд", "Щит заряжается быстрее", "common", (r) => hastenGuard(r.wepStats.orb, 0.9)),
      at("wd-cd-r", "Заряд", "Щит заряжается заметно быстрее", "rare", (r) => hastenGuard(r.wepStats.orb, 0.82)),
      at("wd-cd-e", "Заряд", "Щит заряжается гораздо быстрее", "epic", (r) => hastenGuard(r.wepStats.orb, 0.7)),
      at("wd-cd-l", "Заряд", "Щит заряжается почти вдвое быстрее", "legendary", (r) => hastenGuard(r.wepStats.orb, 0.55)),
      at("wd-push", "Толчок", "Отброс от кольца +12", "common", (r) => (r.wepStats.orb.knock = (r.wepStats.orb.knock || 0) + 12)),
      at("wd-push-r", "Толчок", "Отброс от кольца +24", "rare", (r) => (r.wepStats.orb.knock = (r.wepStats.orb.knock || 0) + 24)),
      at("wd-push-e", "Толчок", "Отброс от кольца +40", "epic", (r) => (r.wepStats.orb.knock = (r.wepStats.orb.knock || 0) + 40)),
      at("wd-push-l", "Толчок", "Отброс от кольца +70", "legendary", (r) => (r.wepStats.orb.knock = (r.wepStats.orb.knock || 0) + 70)),
    ],
    lunge: [
      at("lg-hit", "Натиск", "Удар выпада +0,4", "common", (r) => addLungeMul(r.wepStats.orb, 0.4)),
      at("lg-hit-r", "Натиск", "Удар выпада +0,8", "rare", (r) => addLungeMul(r.wepStats.orb, 0.8)),
      at("lg-hit-e", "Натиск", "Удар выпада +1,4", "epic", (r) => addLungeMul(r.wepStats.orb, 1.4)),
      at("lg-hit-l", "Натиск", "Удар выпада +2,2", "legendary", (r) => addLungeMul(r.wepStats.orb, 2.2)),
      at("lg-rush", "Рывок", "Выпады чаще", "common", (r) => hastenLunge(r.wepStats.orb, 0.92)),
      at("lg-rush-r", "Рывок", "Выпады заметно чаще", "rare", (r) => hastenLunge(r.wepStats.orb, 0.84)),
      at("lg-rush-e", "Рывок", "Выпады гораздо чаще", "epic", (r) => hastenLunge(r.wepStats.orb, 0.72)),
      at("lg-rush-l", "Рывок", "Выпады почти вдвое чаще", "legendary", (r) => hastenLunge(r.wepStats.orb, 0.6)),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollOrbOffer(branch, orb = {}, n = 3, rng = Math.random) {
  const pool = orbPool(branch).filter((c) => !(c.once && orb[c.once]));
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

export function orbStep(level, branch) {
  if (level === 5) {
    return {
      cards: [
        card("blade", "Серп", "Каждая сфера становится лезвием, режет втрое шире и бьёт ×2", (r) => {
          const o = r.wepStats.orb;
          o.branch = "blade";
          o.dmg *= 2;
          o.reach = 3;
        }),
        card("ward", "Барьер", "Кольцо отталкивает врагов и съедает один удар по ядру. Заряд возвращается за 4 с", (r) => {
          const o = r.wepStats.orb;
          o.branch = "ward";
          o.guardMax = 1;
          o.guard = 1;
          o.guardCd = 4;
          o.guardT = 4;
          o.knock = 70;
        }),
        card("lunge", "Выпад", "Каждая сфера срывается к ближайшему врагу, бьёт разово ×8 и возвращается", (r) => {
          const o = r.wepStats.orb;
          o.branch = "lunge";
          o.lunge = true;
          o.lungeCd = 1.3;
          o.lungeT = 0.4;
          o.lungeMul = 8;
          o.fly = [];
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "blade" ? bladeCards(level) : branch === "ward" ? wardCards(level) : lungeCards(level);
    return { cards };
  }
  return { cards: rollOrbOffer(branch) };
}
