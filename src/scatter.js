export const SCATTER_CD_MIN = 0.32;
export const SCATTER_PELLET_CAP = 16;
export const SCATTER_SHARD_CAP = 9;
const SCATTER_KNOCK_BUDGET = 0.7;
const SCATTER_KNOCK_SCALE = 90;

export function hastenScatter(scatter, mul) {
  scatter.cd = Math.max(SCATTER_CD_MIN, scatter.cd * mul);
}

export function addPellets(scatter, n) {
  scatter.n = Math.min(SCATTER_PELLET_CAP, scatter.n + n);
}

export function addShards(scatter, n) {
  scatter.shards = Math.min(SCATTER_SHARD_CAP, (scatter.shards || 0) + n);
}

export function raiseShards(scatter, count) {
  scatter.shards = Math.min(SCATTER_SHARD_CAP, Math.max(scatter.shards || 0, count));
}

export function raiseShardMul(scatter, mul) {
  scatter.shardMul = Math.max(scatter.shardMul || 0, mul);
}

export function scatterPushCap(enemy, knock, cd, slowMul = 1) {
  const step = Math.max(0.35, cd || 0.7);
  const slow = slowMul > 0 && slowMul < 1 ? slowMul : (enemy.slow || 0) > 0 ? enemy.slowMul ?? 1 : 1;
  const advance = (enemy.speed || 40) * slow * step;
  if (!(advance > 0) || !(knock > 0)) return 0;
  return advance * SCATTER_KNOCK_BUDGET * (knock / (knock + SCATTER_KNOCK_SCALE));
}

function card(id, title, desc, apply, rarity = "legendary") {
  return { id, title, desc, rarity, apply };
}

const RARITY_WEIGHT = { common: 8, rare: 4, epic: 2, legendary: 1 };

function at(id, title, desc, rarity, apply) {
  return { ...card(id, title, desc, apply, rarity) };
}

function waveCards(level) {
  if (level === 10) {
    return [
      card("wv-dam", "Плотина", "Конус накрывает полкруга", (r) => {
        r.wepStats.scatter.gap = Math.PI / Math.max(3, r.wepStats.scatter.n);
      }),
      card("wv-out", "Выброс", "Отброс ×3", (r) => {
        r.wepStats.scatter.knock *= 3;
      }),
      card("wv-bog", "Топь", "Задетые на секунду вязнут", (r) => {
        r.wepStats.scatter.bog = true;
      }),
    ];
  }
  return [
    card("wv-two", "Прибой", "Сразу второй вал", (r) => {
      r.wepStats.scatter.volley = true;
    }),
    card("wv-cliff", "Обрыв", "Отброс 420", (r) => {
      r.wepStats.scatter.knock = Math.max(r.wepStats.scatter.knock, 420);
    }),
    card("wv-cord", "Кордон", "Отброшенный секунду ползёт к ядру", (r) => {
      r.wepStats.scatter.cordon = true;
    }),
  ];
}

function sheafCards(level) {
  if (level === 10) {
    return [
      card("sh-ham", "Кувалда", "Удар центра ×1,25", (r) => {
        r.wepStats.scatter.centerMul *= 1.25;
      }),
      card("sh-rim", "Обод", "Края бьют вдвое больнее", (r) => {
        r.wepStats.scatter.rim = true;
      }),
      card("sh-fork", "Вилка", "Такой же удар по второй ближайшей цели", (r) => {
        r.wepStats.scatter.fork = true;
      }),
    ];
  }
  return [
    card("sh-pierce", "Прокол", "Центр прошивает строй, урон не падает", (r) => {
      r.wepStats.scatter.steady = true;
    }),
    card("sh-far", "Метель", "Края летят вдвое дальше", (r) => {
      r.wepStats.scatter.far = true;
    }),
    card("sh-bar", "Лом", "Урон центра ×1,4", (r) => {
      r.wepStats.scatter.centerMul *= 1.4;
    }),
  ];
}

function bunchCards(level) {
  if (level === 10) {
    return [
      card("bn-five", "Россыпь", "Осколков шесть", (r) => raiseShards(r.wepStats.scatter, 6)),
      card("bn-heart", "Сердце", "Осколки бьют полным уроном дроби", (r) => raiseShardMul(r.wepStats.scatter, 1)),
      card("bn-echo", "Эхо", "Каждый осколок лопается ещё раз", (r) => {
        r.wepStats.scatter.echo = true;
      }),
    ];
  }
  return [
    card("bn-fall", "Обвал", "Смерть от дроби выпускает новую гроздь", (r) => {
      r.wepStats.scatter.avalanche = true;
    }),
    card("bn-awl", "Шило", "Осколки пробивают одну цель", (r) => {
      r.wepStats.scatter.shardPierce = Math.max(r.wepStats.scatter.shardPierce || 0, 1);
    }),
    card("bn-heat", "Жар", "Урон осколков ×2,2", (r) => {
      r.wepStats.scatter.shardMul = (r.wepStats.scatter.shardMul || 0.45) * 2.2;
    }),
  ];
}

export function scatterPool(branch) {
  const shared = [
    at("s-cal", "Калибр", "Урон +20%", "common", (r) => (r.wepStats.scatter.dmg *= 1.2)),
    at("s-cal-r", "Калибр", "Урон +40%", "rare", (r) => (r.wepStats.scatter.dmg *= 1.4)),
    at("s-cal-e", "Калибр", "Урон +60%", "epic", (r) => (r.wepStats.scatter.dmg *= 1.6)),
    at("s-cal-l", "Калибр", "Урон +100%", "legendary", (r) => (r.wepStats.scatter.dmg *= 2)),
    at("s-tempo", "Темп", "Залп чаще", "common", (r) => hastenScatter(r.wepStats.scatter, 0.9)),
    at("s-tempo-r", "Темп", "Залп заметно чаще", "rare", (r) => hastenScatter(r.wepStats.scatter, 0.82)),
    at("s-tempo-e", "Темп", "Залп гораздо чаще", "epic", (r) => hastenScatter(r.wepStats.scatter, 0.72)),
    at("s-tempo-l", "Темп", "Залп почти вдвое чаще", "legendary", (r) => hastenScatter(r.wepStats.scatter, 0.58)),
    at("s-shot", "Картечь", "+1 дробинка", "common", (r) => addPellets(r.wepStats.scatter, 1)),
    at("s-shot-r", "Картечь", "+2 дробинки", "rare", (r) => addPellets(r.wepStats.scatter, 2)),
    at("s-shot-e", "Картечь", "+3 дробинки", "epic", (r) => addPellets(r.wepStats.scatter, 3)),
    at("s-shot-l", "Картечь", "+4 дробинки", "legendary", (r) => addPellets(r.wepStats.scatter, 4)),
  ];
  const branches = {
    wave: [
      at("wv-push", "Толчок", "Отброс +10", "common", (r) => (r.wepStats.scatter.knock += 10)),
      at("wv-push-r", "Толчок", "Отброс +20", "rare", (r) => (r.wepStats.scatter.knock += 20)),
      at("wv-push-e", "Толчок", "Отброс +35", "epic", (r) => (r.wepStats.scatter.knock += 35)),
      at("wv-push-l", "Толчок", "Отброс +55", "legendary", (r) => (r.wepStats.scatter.knock += 55)),
      at("wv-cone", "Раструб", "Конус чуть шире", "common", (r) => (r.wepStats.scatter.gap *= 1.1)),
      at("wv-cone-r", "Раструб", "Конус заметно шире", "rare", (r) => (r.wepStats.scatter.gap *= 1.2)),
      at("wv-cone-e", "Раструб", "Конус гораздо шире", "epic", (r) => (r.wepStats.scatter.gap *= 1.35)),
      at("wv-cone-l", "Раструб", "Конус почти вдвое шире", "legendary", (r) => (r.wepStats.scatter.gap *= 1.5)),
    ],
    sheaf: [
      at("sh-core", "Ядро", "Удар центра +6%", "common", (r) => (r.wepStats.scatter.centerMul *= 1.06)),
      at("sh-core-r", "Ядро", "Удар центра +10%", "rare", (r) => (r.wepStats.scatter.centerMul *= 1.1)),
      at("sh-core-e", "Ядро", "Удар центра +14%", "epic", (r) => (r.wepStats.scatter.centerMul *= 1.14)),
      at("sh-core-l", "Ядро", "Удар центра +18%", "legendary", (r) => (r.wepStats.scatter.centerMul *= 1.18)),
      at("sh-bore", "Пробой", "Пробивание +1", "common", (r) => (r.wepStats.scatter.pierce += 1)),
      at("sh-bore-r", "Пробой", "Пробивание +2", "rare", (r) => (r.wepStats.scatter.pierce += 2)),
      at("sh-bore-e", "Пробой", "Пробивание +3", "epic", (r) => (r.wepStats.scatter.pierce += 3)),
      at("sh-bore-l", "Пробой", "Пробивание +5", "legendary", (r) => (r.wepStats.scatter.pierce += 5)),
    ],
    bunch: [
      at("bn-bit", "Осколок", "+1 осколок", "common", (r) => addShards(r.wepStats.scatter, 1)),
      at("bn-bit-r", "Осколок", "+1 осколок", "rare", (r) => addShards(r.wepStats.scatter, 1)),
      at("bn-bit-e", "Осколок", "+2 осколка", "epic", (r) => addShards(r.wepStats.scatter, 2)),
      at("bn-bit-l", "Осколок", "+2 осколка", "legendary", (r) => addShards(r.wepStats.scatter, 2)),
      at("bn-spark", "Искра", "Урон осколков +0,08", "common", (r) => {
        r.wepStats.scatter.shardMul = (r.wepStats.scatter.shardMul || 0.45) + 0.08;
      }),
      at("bn-spark-r", "Искра", "Урон осколков +0,16", "rare", (r) => {
        r.wepStats.scatter.shardMul = (r.wepStats.scatter.shardMul || 0.45) + 0.16;
      }),
      at("bn-spark-e", "Искра", "Урон осколков +0,28", "epic", (r) => {
        r.wepStats.scatter.shardMul = (r.wepStats.scatter.shardMul || 0.45) + 0.28;
      }),
      at("bn-spark-l", "Искра", "Урон осколков +0,4", "legendary", (r) => {
        r.wepStats.scatter.shardMul = (r.wepStats.scatter.shardMul || 0.45) + 0.4;
      }),
    ],
  };
  return branch && branches[branch] ? shared.concat(branches[branch]) : shared;
}

export function rollScatterOffer(branch, scatter = {}, n = 3, rng = Math.random) {
  const pool = scatterPool(branch).filter((c) => !(c.once && scatter[c.once]));
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

export function scatterStep(level, branch) {
  if (level === 5) {
    return {
      cards: [
        card("wave", "Вал", "Конус шире: урон ×2,5, дробинки прошивают строй и толкают вдвое сильнее", (r) => {
          const s = r.wepStats.scatter;
          s.branch = "wave";
          s.gap = 0.2;
          s.pierce = 4;
          s.knock *= 2;
          s.dmg *= 2.5;
        }),
        card("sheaf", "Сноп", "Средняя дробина наносит урон всего залпа одним ударом", (r) => {
          const s = r.wepStats.scatter;
          s.branch = "sheaf";
          s.center = true;
          s.centerMul = 1;
        }),
        card("bunch", "Гроздь", "Дробинка при попадании лопается на три короткие", (r) => {
          const s = r.wepStats.scatter;
          s.branch = "bunch";
          s.cluster = true;
          s.shards = 3;
          s.shardMul = 0.45;
          s.shardLife = 0.16;
        }),
      ],
    };
  }
  if (level === 10 || level === 15) {
    const cards = branch === "wave" ? waveCards(level) : branch === "sheaf" ? sheafCards(level) : bunchCards(level);
    return { cards };
  }
  return { cards: rollScatterOffer(branch) };
}
