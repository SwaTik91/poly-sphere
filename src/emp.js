export const EMP_CD_MIN = 0.5;
export const EMP_SLOW_FLOOR = 0.05;
export const EMP_PUSH_LIMIT = 5;
const EMP_KNOCK_BUDGET = 0.8;
const EMP_KNOCK_SCALE = 80;

export function empAdvance(enemy, emp) {
  const cd = Math.max(0.2, emp.cd || 2.5);
  const slowMul = emp.slowMul ?? 0.45;
  const slowDur = Math.min(Math.max(0, emp.slowDur || 1.15), cd);
  return (enemy.speed || 40) * (slowMul * slowDur + (cd - slowDur));
}

export function empPushDistance(enemy, emp, distFromCore, reach) {
  const advance = empAdvance(enemy, emp);
  if (!(advance > 0)) return 0;
  const radius = reach || emp.radius || 145;
  const close = distFromCore < Math.min(160, Math.max(100, radius * 0.4));
  let share = emp.knock > 0 ? emp.knock / (emp.knock + EMP_KNOCK_SCALE) : 0;
  if (emp.wave && close) share = Math.max(share, 0.9);
  let push = advance * EMP_KNOCK_BUDGET * share;
  if (emp.wave && close) push = Math.min(push, Math.max(0, radius - distFromCore));
  return push;
}

export function hastenEmp(emp, mul) {
  emp.cd = Math.max(EMP_CD_MIN, emp.cd * mul);
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function at(id, title, desc, rarity, apply) {
  return { ...card(id, title, desc, apply, rarity) };
}

function deepenSlow(emp, mul) {
  emp.slowMul = Math.max(EMP_SLOW_FLOOR, (emp.slowMul ?? 0.45) * mul);
}

function addSlowDur(emp, amount) {
  emp.slowDur = (emp.slowDur || 1.7) + amount;
}

function raiseFreeze(emp, amount) {
  emp.freeze = Math.max(emp.freeze || 0, amount);
}

function raiseHits(emp, count) {
  emp.hits = Math.max(emp.hits || 1, count);
}

function raiseChain(emp, mode, jumps, mul) {
  const rank = { ring: 1, all: 2 };
  if ((rank[mode] || 0) >= (rank[emp.chain] || 0)) emp.chain = mode;
  emp.chainJumps = Math.max(emp.chainJumps || 0, jumps);
  emp.chainMul = Math.max(emp.chainMul || 0, mul);
}

function raiseRing(emp, mul) {
  emp.ring2 = Math.max(emp.ring2 || 0, mul);
}

function raiseKnock(emp, amount) {
  emp.knock = Math.max(emp.knock || 0, amount);
}

function cageCards(level) {
  if (level === 10) {
    return [
      card("cg-ice", "Лёд", "Остановка на 1,2 с", (r) => raiseFreeze(r.wepStats.emp, 1.2)),
      card("cg-trap", "Капкан", "Замедление не спадает, пока враг внутри радиуса", (r) => {
        r.wepStats.emp.trap = true;
      }),
      card("cg-mute", "Глушь", "Замедление держится ещё на 1,8 с", (r) => addSlowDur(r.wepStats.emp, 1.8)),
    ];
  }
  return [
    card("cg-stop", "Стоп-кадр", "Остановка на 2,4 с", (r) => raiseFreeze(r.wepStats.emp, 2.4)),
    card("cg-jail", "Тюрьма", "Вышедший из кольца ещё 2 секунды ползёт", (r) => {
      r.wepStats.emp.prison = Math.max(r.wepStats.emp.prison || 0, 2);
    }),
    card("cg-quiet", "Тишина", "Импульс и замедление на весь экран", (r) => {
      r.wepStats.emp.silence = true;
    }),
  ];
}

function stormCards(level) {
  if (level === 10) {
    return [
      card("st-arc", "Молния", "Молния прыгает на 7 целей в кольце полным уроном", (r) => {
        raiseChain(r.wepStats.emp, "ring", 7, 1);
      }),
      card("st-gale", "Гроза", "Три удара за импульс", (r) => raiseHits(r.wepStats.emp, 3)),
      card("st-push", "Напор", "Урон ×1,9", (r) => {
        r.wepStats.emp.dmg *= 1.9;
      }),
    ];
  }
  return [
    card("st-boom", "Гром", "Урон ×2,2", (r) => {
      r.wepStats.emp.dmg *= 2.2;
    }),
    card("st-all", "Цепь", "Молния прыгает по всему экрану на 10 целей полным уроном", (r) => {
      raiseChain(r.wepStats.emp, "all", 10, 1);
    }),
    card("st-fast", "Шквал", "Импульс вдвое чаще", (r) => hastenEmp(r.wepStats.emp, 0.5)),
  ];
}

function domeCards(level) {
  if (level === 10) {
    return [
      card("dm-ring", "Второе кольцо", "Ещё один импульс в 2,1 раза дальше первого", (r) => raiseRing(r.wepStats.emp, 2.1)),
      card("dm-shell", "Панцирь", "Ядро получает 160 HP в момент импульса", (r) => {
        r.wepStats.emp.heal = Math.max(r.wepStats.emp.heal || 0, 160);
      }),
      card("dm-tide", "Отлив", "Отброс 240", (r) => raiseKnock(r.wepStats.emp, 240)),
    ];
  }
  return [
    card("dm-sky", "Горизонт", "Импульс на весь экран", (r) => {
      r.wepStats.emp.full = true;
    }),
    card("dm-fort", "Бастион", "Щит: следующий удар по ядру не проходит", (r) => {
      r.wepStats.emp.guard = Math.max(r.wepStats.emp.guard || 0, 1);
    }),
    card("dm-wave", "Волна", "Отброс выкидывает ближних к краю экрана", (r) => {
      r.wepStats.emp.wave = true;
    }),
  ];
}

export function empPool(branch) {
  const shared = [
    at("e-cal", "Калибр", "Урон +20%", "common", (r) => (r.wepStats.emp.dmg *= 1.2)),
    at("e-cal-r", "Калибр", "Урон +40%", "rare", (r) => (r.wepStats.emp.dmg *= 1.4)),
    at("e-cal-e", "Калибр", "Урон +60%", "epic", (r) => (r.wepStats.emp.dmg *= 1.6)),
    at("e-cal-l", "Калибр", "Урон +100%", "legendary", (r) => (r.wepStats.emp.dmg *= 2)),
    at("e-tempo", "Темп", "Импульс чаще", "common", (r) => hastenEmp(r.wepStats.emp, 0.9)),
    at("e-tempo-r", "Темп", "Импульс заметно чаще", "rare", (r) => hastenEmp(r.wepStats.emp, 0.82)),
    at("e-tempo-e", "Темп", "Импульс гораздо чаще", "epic", (r) => hastenEmp(r.wepStats.emp, 0.72)),
    at("e-tempo-l", "Темп", "Импульс почти вдвое чаще", "legendary", (r) => hastenEmp(r.wepStats.emp, 0.58)),
    at("e-field", "Поле", "Радиус +18", "common", (r) => (r.wepStats.emp.radius += 18)),
    at("e-field-r", "Поле", "Радиус +34", "rare", (r) => (r.wepStats.emp.radius += 34)),
    at("e-field-e", "Поле", "Радиус +52", "epic", (r) => (r.wepStats.emp.radius += 52)),
    at("e-field-l", "Поле", "Радиус +80", "legendary", (r) => (r.wepStats.emp.radius += 80)),
  ];
  const branches = {
    cage: [
      at("cg-grip", "Хватка", "Враги в кольце медленнее", "common", (r) => deepenSlow(r.wepStats.emp, 0.92)),
      at("cg-grip-r", "Хватка", "Враги в кольце заметно медленнее", "rare", (r) => deepenSlow(r.wepStats.emp, 0.84)),
      at("cg-grip-e", "Хватка", "Враги в кольце гораздо медленнее", "epic", (r) => deepenSlow(r.wepStats.emp, 0.72)),
      at("cg-grip-l", "Хватка", "Враги в кольце почти стоят", "legendary", (r) => deepenSlow(r.wepStats.emp, 0.6)),
      at("cg-hold", "Удержание", "Замедление +0,3 с", "common", (r) => addSlowDur(r.wepStats.emp, 0.3)),
      at("cg-hold-r", "Удержание", "Замедление +0,55 с", "rare", (r) => addSlowDur(r.wepStats.emp, 0.55)),
      at("cg-hold-e", "Удержание", "Замедление +0,85 с", "epic", (r) => addSlowDur(r.wepStats.emp, 0.85)),
      at("cg-hold-l", "Удержание", "Замедление +1,2 с", "legendary", (r) => addSlowDur(r.wepStats.emp, 1.2)),
    ],
    storm: [
      at("st-heat", "Накал", "Урон +12%", "common", (r) => (r.wepStats.emp.dmg *= 1.12)),
      at("st-heat-r", "Накал", "Урон +24%", "rare", (r) => (r.wepStats.emp.dmg *= 1.24)),
      at("st-heat-e", "Накал", "Урон +40%", "epic", (r) => (r.wepStats.emp.dmg *= 1.4)),
      at("st-heat-l", "Накал", "Урон +60%", "legendary", (r) => (r.wepStats.emp.dmg *= 1.6)),
      at("st-arc-c", "Дуга", "Молния прыгает на 2 цели, 40% урона", "common", (r) => raiseChain(r.wepStats.emp, "ring", 2, 0.4)),
      at("st-arc-r", "Дуга", "Молния прыгает на 3 цели, 55% урона", "rare", (r) => raiseChain(r.wepStats.emp, "ring", 3, 0.55)),
      at("st-arc-e", "Дуга", "Молния прыгает на 4 цели, 70% урона", "epic", (r) => raiseChain(r.wepStats.emp, "ring", 4, 0.7)),
      at("st-arc-l", "Дуга", "Молния прыгает на 5 целей, 85% урона", "legendary", (r) => raiseChain(r.wepStats.emp, "ring", 5, 0.85)),
    ],
    dome: [
      at("dm-ring-c", "Кольцо", "Второе кольцо в 1,25 раза дальше", "common", (r) => raiseRing(r.wepStats.emp, 1.25)),
      at("dm-ring-r", "Кольцо", "Второе кольцо в 1,4 раза дальше", "rare", (r) => raiseRing(r.wepStats.emp, 1.4)),
      at("dm-ring-e", "Кольцо", "Второе кольцо в 1,55 раза дальше", "epic", (r) => raiseRing(r.wepStats.emp, 1.55)),
      at("dm-ring-l", "Кольцо", "Второе кольцо в 1,75 раза дальше", "legendary", (r) => raiseRing(r.wepStats.emp, 1.75)),
      at("dm-push", "Толчок", "Отброс +20", "common", (r) => (r.wepStats.emp.knock = (r.wepStats.emp.knock || 0) + 20)),
      at("dm-push-r", "Толчок", "Отброс +40", "rare", (r) => (r.wepStats.emp.knock = (r.wepStats.emp.knock || 0) + 40)),
      at("dm-push-e", "Толчок", "Отброс +70", "epic", (r) => (r.wepStats.emp.knock = (r.wepStats.emp.knock || 0) + 70)),
      at("dm-push-l", "Толчок", "Отброс +110", "legendary", (r) => (r.wepStats.emp.knock = (r.wepStats.emp.knock || 0) + 110)),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollEmpOffer(branch, emp = {}, n = 3, rng = Math.random) {
  const pool = empPool(branch).filter((c) => !(c.once && emp[c.once]));
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

export function empStep(level, branch) {
  if (level === 5) {
    return {
      cards: [
        card("cage", "Ступор", "Враги в кольце почти встают, замедление держится вдвое дольше", (r) => {
          r.wepStats.emp.branch = "cage";
          r.wepStats.emp.slowMul = 0.12;
          r.wepStats.emp.slowDur = (r.wepStats.emp.slowDur || 1.7) * 2;
        }),
        card("storm", "Разряд", "Урон +50%, импульс бьёт дважды", (r) => {
          r.wepStats.emp.branch = "storm";
          r.wepStats.emp.dmg *= 1.5;
          r.wepStats.emp.hits = 2;
        }),
        card("dome", "Купол", "Радиус +55%, врагов отталкивает от ядра", (r) => {
          r.wepStats.emp.branch = "dome";
          r.wepStats.emp.radius *= 1.55;
          r.wepStats.emp.knock = 90;
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "cage" ? cageCards(level) : branch === "storm" ? stormCards(level) : domeCards(level);
    return { cards };
  }
  return { cards: rollEmpOffer(branch) };
}
