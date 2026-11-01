import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from server import parts_bridge
from server.rewards import (
    ACHIEVEMENT_CRYSTALS,
    CRIT_CAP,
    achievement_crystals,
    ACCOUNT_XP_STEP,
    account_track,
    apply_account_xp,
    buy_crystal_item,
    coin_reward,
    daily_tasks,
    DUST_PACK_COINS,
    DUST_PACK_DUST,
    HORDE_RULE_COINS,
    endless_crystals,
    horde_rule_for,
    kill_caps,
    reroll_price,
    first_clear_crystals,
    hangar_node_price,
    legacy_hangar_refund,
    HANGAR_TREE,
    LEADERBOARD_SIZE,
    MAX_LEVEL,
    ready_achievements,
    chest_pity_rarity,
    season_days_left,
    season_for_date,
    season_label,
    xp_reward,
    ENEMY_COINS,
    WAVES_PER_LEVEL,
)

MOSCOW = ZoneInfo("Europe/Moscow")
DEFAULT_LOADOUT_JSON = "[null,null,null,null,null,null,null,null]"
WEAPON_SLOTS = 5
FREE_WEAPONS = ("gun", "drone")
ALL_WEAPONS = ("gun", "drone", "laser", "scatter", "grenade", "emp", "orb")
DEFAULT_WEAPON_LOADOUT = ["gun", "drone", None, None, None]
DEFAULT_WEAPON_LOADOUT_JSON = json.dumps(DEFAULT_WEAPON_LOADOUT)
PART_RARITY_ORDER = ["common", "rare", "epic", "legendary"]
PART_RARITY_STEP = {"common": 1, "rare": 2, "epic": 3, "legendary": 4}
SALVAGE_DUST = {"common": 5, "rare": 15, "epic": 40, "legendary": 100}
POLISH_MAX = 5
POLISH_COST = [30, 50, 80, 120, 180]
ENDLESS_PART_CHANCE = 0.30
ENDLESS_PART_EVERY = 5
LEVEL_PART_CHANCE = 0.40
LEVEL_PART_PITY = 3
TESTERS = {"sharon"}
GUESTS_PER_IP_PER_DAY = 20
EVENT_RETENTION_DAYS = 90
HORDE_FIRST_WAVE = 11
HORDE_CLAIM_GAP = timedelta(seconds=3)
LEVEL_NOTE_GAP = timedelta(seconds=2)
