import math
from datetime import datetime

ENEMY_COINS = {
    "circle": 2,
    "triangle": 2,
    "square": 3,
    "hex": 3,
    "diamond": 3,
    "dash": 3,
    "heal": 4,
    "split": 1,
    "boss": 28,
    "mite": 1,
    "blade": 1,
    "mote": 1,
    "shard": 1,
    "wisp": 1,
}

WAVES_PER_LEVEL = 10
PACK_CAP = 18
HORDE_WAVE_BUDGET = 30
KILL_SLACK = 2
MINION_SPAN = 40


def kill_caps(waves_cleared):
    waves = max(0, int(waves_cleared)) + 1 + HORDE_WAVE_BUDGET
    trash = waves * PACK_CAP * KILL_SLACK
    caps = {
        kind: trash
        for kind in ("circle", "triangle", "square", "hex", "diamond", "dash", "heal")
    }
    caps["split"] = trash * 3
    caps["boss"] = waves * KILL_SLACK
    minions = waves * MINION_SPAN * KILL_SLACK
    for kind in ("mite", "blade", "mote", "shard", "wisp"):
        caps[kind] = minions
    return caps


def coin_reward(kills, ended_level, ended_wave, won, started_level=1):
    total = sum(int(kills.get(kind, 0)) * coins for kind, coins in ENEMY_COINS.items())
    total += (int(ended_level) - int(started_level)) * WAVES_PER_LEVEL + int(ended_wave)
    if won:
        total += 40
    return total


def xp_reward(kills, waves_cleared, levels_cleared):
    kills_total = sum(int(kills.get(kind, 0)) for kind in ENEMY_COINS)
    return kills_total + 10 * int(waves_cleared) + 40 * int(levels_cleared)


ACCOUNT_XP_STEP = 80
ACCOUNT_REWARDS = (
    {"kind": "crystals", "amount": 4},
    {"kind": "coins", "amount": 40},
    {"kind": "dust", "amount": 10},
)


def account_level_reward(level):
    level = int(level)
    reward = {"crystals": 0, "coins": 0, "dust": 0}
    if level < 2:
        return reward
    step = ACCOUNT_REWARDS[(level - 2) % len(ACCOUNT_REWARDS)]
    reward[step["kind"]] = step["amount"]
    return reward


def account_track(level, count=3):
    level = max(1, int(level))
    rows = []
    for offset in range(1, int(count) + 1):
        reached = level + offset
        rows.append({"level": reached, **account_level_reward(reached)})
    return rows


def apply_account_xp(level, xp, gained):
    level = max(1, int(level))
    xp = int(xp) + int(gained)
    reward = {"crystals": 0, "coins": 0, "dust": 0}
    while xp >= ACCOUNT_XP_STEP * level:
        xp -= ACCOUNT_XP_STEP * level
        level += 1
        step = account_level_reward(level)
        for key in reward:
            reward[key] += step[key]
    return level, xp, reward


LEVELS_PER_CHAPTER = 5
CHAPTERS = 8
MAX_LEVEL = LEVELS_PER_CHAPTER * CHAPTERS


def level_clear_crystals(level):
    return 6 + ((int(level) - 1) // LEVELS_PER_CHAPTER) * 4


def chapter_bonus_crystals(chapter):
    return 20 + (int(chapter) - 1) * 10


def chapter_of(level):
    return (int(level) - 1) // LEVELS_PER_CHAPTER + 1


def chapter_levels(chapter):
    start = (int(chapter) - 1) * LEVELS_PER_CHAPTER + 1
    return set(range(start, start + LEVELS_PER_CHAPTER))


def levels_in_run(started_level, levels_cleared, already):
    owned = set(already)
    played = []
    for offset in range(int(levels_cleared)):
        level = int(started_level) + offset
        if level < 1 or level > MAX_LEVEL:
            break
        if not set(range(1, level)).issubset(owned | set(played)):
            break
        played.append(level)
    return played


def first_clear_crystals(already, levels_cleared, started_level=1):
    owned = set(already)
    new_levels = []
    crystals = 0
    autos = []
    for level in levels_in_run(started_level, levels_cleared, owned):
        if level in owned:
            continue
        new_levels.append(level)
        crystals += level_clear_crystals(level)
        if level == 1:
            autos.append("first_boss")
        if level == 3:
            autos.append("three_levels")
    cleared_after = owned | set(new_levels)
    for chapter in range(1, CHAPTERS + 1):
        levels = chapter_levels(chapter)
        if levels & set(new_levels) and levels.issubset(cleared_after):
            crystals += chapter_bonus_crystals(chapter)
            autos.append(f"chapter_{chapter}")
    return new_levels, crystals, autos


DAILY_SETS = (
    (("wave3", 2), ("kills40", 2), ("chest", 3), ("level", 4), ("endless5", 4)),
    (("wave6", 3), ("kills80", 3), ("salvage", 2), ("level", 4), ("endless8", 3)),
    (("kills40", 2), ("kills150", 3), ("dust", 2), ("level", 4), ("endless12", 4)),
)
META_TASKS = {"chest", "salvage", "dust"}
ACHIEVEMENT_CRYSTALS = {
    "first_blood": 2,
    "first_boss": 8,
    "three_levels": 20,
    "kills_100": 5,
    "kills_500": 10,
    "kills_2000": 25,
    "hangar": 3,
    "hangar_10": 12,
    "chest": 3,
    "chest_10": 12,
    "endless_10": 8,
    "endless_25": 20,
    "chapter_1": 20,
    "chapter_2": 30,
    "chapter_3": 40,
    "chapter_4": 50,
    "chapter_5": 60,
    "chapter_6": 70,
    "chapter_7": 80,
    "chapter_8": 90,
}
WEAPONS = ("laser", "scatter", "grenade", "emp", "orb", "drone")
CRIT_CAP = 10
CHEST_PITY = 10
CHEST_PITY_EPIC = 0.6


def daily_set_for(day):
    year, month, date = (int(part) for part in str(day).split("-"))
    index = datetime(year, month, date).toordinal() % len(DAILY_SETS)
    return DAILY_SETS[index]


def _daily_done(task_id, progress):
    progress = progress or {}
    kills = int(progress.get("kills") or 0)
    wave = int(progress.get("best_wave") or 0)
    if progress.get("level"):
        wave = max(wave, 10)
    endless = int(progress.get("endless") or 0)
    checks = {
        "wave3": wave >= 3,
        "wave6": wave >= 6,
        "kills40": kills >= 40,
        "kills80": kills >= 80,
        "kills150": kills >= 150,
        "level": bool(progress.get("level")),
        "endless5": endless >= 5,
        "endless8": endless >= 8,
        "endless12": endless >= 12,
        "chest": int(progress.get("chests") or 0) >= 1,
        "salvage": int(progress.get("salvages") or 0) >= 1,
        "dust": int(progress.get("dust_buys") or 0) >= 1,
    }
    return bool(checks[task_id])


def daily_tasks(progress, claimed, day):
    claimed_set = set(claimed or [])
    return [
        {
            "id": task_id,
            "crystals": crystals,
            "done": _daily_done(task_id, progress),
            "claimed": task_id in claimed_set,
        }
        for task_id, crystals in daily_set_for(day)
    ]


def ready_achievements(stats, claimed):
    cleared = set(stats["cleared_levels"])
    best_endless = int(stats.get("best_endless", 0))
    ready = []
    if stats["kills"] >= 1:
        ready.append("first_blood")
    if 1 in cleared:
        ready.append("first_boss")
    if 3 in cleared:
        ready.append("three_levels")
    if stats["kills"] >= 100:
        ready.append("kills_100")
    if stats["kills"] >= 500:
        ready.append("kills_500")
    if stats["kills"] >= 2000:
        ready.append("kills_2000")
    if stats["hangar_buys"] >= 1:
        ready.append("hangar")
    if stats["hangar_buys"] >= 10:
        ready.append("hangar_10")
    if stats["chests"] >= 1:
        ready.append("chest")
    if stats["chests"] >= 10:
        ready.append("chest_10")
    if best_endless >= 10:
        ready.append("endless_10")
    if best_endless >= 25:
        ready.append("endless_25")
    for chapter in range(1, CHAPTERS + 1):
        if chapter_levels(chapter).issubset(cleared):
            ready.append(f"chapter_{chapter}")
    owned = set(claimed)
    return [item for item in ready if item not in owned]


def achievement_crystals(achievement_id):
    return ACHIEVEMENT_CRYSTALS[achievement_id]


def validate_endless(level, wave):
    if type(level) is not int or level not in range(1, MAX_LEVEL + 1):
        raise ValueError("Некорректный уровень")
    if type(wave) is not int or wave not in range(1, 41):
        raise ValueError("Некорректная волна")
    return level, wave


DUST_PACK_COINS = 200
DUST_PACK_DUST = 10

REROLL_COINS = (1000, 2000, 3000, 4000, 5000)
REROLL_CRYSTALS = (1, 2, 3, 4, 5, 10, 20)


def reroll_price(used):
    used = int(used)
    if used < 0:
        raise ValueError("Некорректный реролл")
    if used < 2:
        return {"kind": "free", "amount": 0}
    coin_index = used - 2
    if coin_index < len(REROLL_COINS):
        return {"kind": "coins", "amount": REROLL_COINS[coin_index]}
    crystal_index = coin_index - len(REROLL_COINS)
    if crystal_index < len(REROLL_CRYSTALS):
        return {"kind": "crystals", "amount": REROLL_CRYSTALS[crystal_index]}
    return None


HORDE_RULES = ("elites", "minion", "coins")
HORDE_RULE_COINS = 20


def horde_rule_for(day):
    year, month, date = (int(part) for part in str(day).split("-"))
    index = datetime(year, month, date).toordinal() % len(HORDE_RULES)
    return HORDE_RULES[index]


def endless_crystals(level, wave):
    validate_endless(level, wave)
    bonus = (int(wave) // 5) * 2
    return min(15, 5 + bonus)


LEADERBOARD_SIZE = 20


def season_for_date(d):
    return d.year * 12 + (d.month - 1)


def season_label(season):
    year, month = divmod(int(season), 12)
    return f"{year}-{month + 1:02d}"


def season_days_left(d):
    import calendar

    last_day = calendar.monthrange(d.year, d.month)[1]
    return last_day - d.day + 1


def hangar_price(owned_level):
    return round(40 * math.pow(1.65, int(owned_level)))


HANGAR_TREE = {
    "heart": {"max": 5, "base": 40, "growth": 1.65, "requires": None},
    "hp": {"max": 5, "base": 40, "growth": 1.65, "requires": None},
    "charge": {"max": 5, "base": 40, "growth": 1.65, "requires": None},
    "crit": {"max": 3, "base": 80, "growth": 1.7, "requires": ("heart", 2)},
    "regen": {"max": 3, "base": 80, "growth": 1.7, "requires": ("hp", 2)},
    "drive": {"max": 3, "base": 80, "growth": 1.7, "requires": ("charge", 2)},
    "leech": {"max": 1, "base": 250, "growth": 1, "requires": ("hp", 2)},
}

# Цены старого ангара. Нужны только чтобы один раз вернуть уже потраченные монеты.
LEGACY_HANGAR_NODES = {
    "crit": {"max": 5, "base": 60, "growth": 1.6},
    "regen": {"max": 4, "base": 70, "growth": 1.7},
    "drive": {"max": 3, "base": 90, "growth": 1.8},
}


def hangar_node_price(node, level):
    spec = HANGAR_TREE[node]
    return round(spec["base"] * math.pow(spec["growth"], int(level)))


def legacy_hangar_refund(atk, hp, charge, nodes=None):
    total = 0
    for owned in (atk, hp, charge):
        for level in range(max(0, int(owned or 0))):
            total += hangar_price(level)
    for node, spec in LEGACY_HANGAR_NODES.items():
        owned = min(max(0, int((nodes or {}).get(node) or 0)), spec["max"])
        for level in range(owned):
            total += round(spec["base"] * math.pow(spec["growth"], level))
    return total


def buy_crystal_item(profile, kind, weapon=None):
    crystals = int(profile["crystals"])
    crit_bonus = int(profile["crit_bonus"])
    weapons = list(profile["weapons"])
    fourth_card = bool(profile["fourth_card"])
    if kind == "crit":
        if crit_bonus + 2 > CRIT_CAP:
            raise ValueError("crit cap")
        if crystals < 25:
            raise ValueError("crystals")
        return {**profile, "crystals": crystals - 25, "crit_bonus": crit_bonus + 2}
    if kind == "weapon":
        if weapon not in WEAPONS or weapon in weapons:
            raise ValueError("weapon")
        if crystals < 40:
            raise ValueError("crystals")
        return {**profile, "crystals": crystals - 40, "weapons": weapons + [weapon]}
    if kind == "fourth_card":
        if fourth_card:
            raise ValueError("owned")
        if crystals < 50:
            raise ValueError("crystals")
        return {**profile, "crystals": crystals - 50, "fourth_card": True}
    raise ValueError("kind")


def chest_pity_rarity(opened_before, roll):
    if (int(opened_before) + 1) % CHEST_PITY != 0:
        return None
    if float(roll) < CHEST_PITY_EPIC:
        return "epic"
    return "legendary"
