const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cors = require("cors");
const { resolveThirdPlaceSlots } = require("./annex-c");

admin.initializeApp();
const db = admin.firestore();

const ADMIN_PIN = "lucasiscool";

// ESPN public API — no auth required
const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world";
const ESPN_STANDINGS = "https://site.api.espn.com/apis/v2/sports/soccer/fifa.world/standings";

// ── Team name mapping (ESPN display name → internal key) ──

const ESPN_TEAM_NAME_MAP = {
  "Mexico": "mexico",
  "South Africa": "south-africa",
  "South Korea": "south-korea",
  "Korea Republic": "south-korea",
  "Canada": "canada",
  "Qatar": "qatar",
  "Switzerland": "switzerland",
  "Brazil": "brazil",
  "Morocco": "morocco",
  "Haiti": "haiti",
  "Scotland": "scotland",
  "United States": "usa",
  "USA": "usa",
  "Paraguay": "paraguay",
  "Australia": "australia",
  "Germany": "germany",
  "Ivory Coast": "ivory-coast",
  "Côte d'Ivoire": "ivory-coast",
  "Cote d'Ivoire": "ivory-coast",
  "Ecuador": "ecuador",
  "Curaçao": "curacao",
  "Curacao": "curacao",
  "Netherlands": "netherlands",
  "Japan": "japan",
  "Tunisia": "tunisia",
  "Belgium": "belgium",
  "Egypt": "egypt",
  "Iran": "iran",
  "New Zealand": "new-zealand",
  "Spain": "spain",
  "Saudi Arabia": "saudi-arabia",
  "Uruguay": "uruguay",
  "Cape Verde": "cape-verde",
  "France": "france",
  "Senegal": "senegal",
  "Norway": "norway",
  "Argentina": "argentina",
  "Algeria": "algeria",
  "Austria": "austria",
  "Jordan": "jordan",
  "Portugal": "portugal",
  "Uzbekistan": "uzbekistan",
  "Colombia": "colombia",
  "England": "england",
  "Croatia": "croatia",
  "Ghana": "ghana",
  "Panama": "panama",
  "Bosnia and Herzegovina": "bosnia",
  "Bosnia & Herzegovina": "bosnia",
  "Bosnia-Herzegovina": "bosnia",
  "Sweden": "sweden",
  "Turkey": "turkey",
  "Türkiye": "turkey",
  "Czech Republic": "czechia",
  "Czechia": "czechia",
  "DR Congo": "dr-congo",
  "Congo DR": "dr-congo",
  "Democratic Republic of Congo": "dr-congo",
  "Iraq": "iraq",
  "Poland": "poland",
  "Denmark": "denmark",
  "Jamaica": "jamaica",
  "Kosovo": "kosovo",
  "Bolivia": "bolivia",
};

// Internal key → canonical team name as used in data.js / picks / scoring
const KEY_TO_CANONICAL = {
  "mexico": "Mexico",
  "south-africa": "South Africa",
  "south-korea": "South Korea",
  "czechia": "Czechia",
  "canada": "Canada",
  "bosnia": "Bosnia & Herzegovina",
  "qatar": "Qatar",
  "switzerland": "Switzerland",
  "brazil": "Brazil",
  "morocco": "Morocco",
  "haiti": "Haiti",
  "scotland": "Scotland",
  "usa": "United States",
  "paraguay": "Paraguay",
  "australia": "Australia",
  "turkey": "Türkiye",
  "germany": "Germany",
  "ivory-coast": "Ivory Coast",
  "ecuador": "Ecuador",
  "curacao": "Curaçao",
  "netherlands": "Netherlands",
  "japan": "Japan",
  "sweden": "Sweden",
  "tunisia": "Tunisia",
  "belgium": "Belgium",
  "egypt": "Egypt",
  "iran": "Iran",
  "new-zealand": "New Zealand",
  "spain": "Spain",
  "saudi-arabia": "Saudi Arabia",
  "uruguay": "Uruguay",
  "cape-verde": "Cape Verde",
  "france": "France",
  "senegal": "Senegal",
  "norway": "Norway",
  "iraq": "Iraq",
  "argentina": "Argentina",
  "algeria": "Algeria",
  "austria": "Austria",
  "jordan": "Jordan",
  "portugal": "Portugal",
  "uzbekistan": "Uzbekistan",
  "colombia": "Colombia",
  "dr-congo": "DR Congo",
  "england": "England",
  "croatia": "Croatia",
  "ghana": "Ghana",
  "panama": "Panama",
};

function toCanonicalName(espnName) {
  const key = resolveTeamKey(espnName);
  return key ? KEY_TO_CANONICAL[key] || null : null;
}

const GROUP_MATCHES = {
  1: ["mexico", "south-africa"], 2: ["south-korea", "czechia"], 3: ["canada", "bosnia"], 4: ["usa", "paraguay"],
  5: ["qatar", "switzerland"], 6: ["brazil", "morocco"], 7: ["haiti", "scotland"], 8: ["australia", "turkey"],
  9: ["germany", "curacao"], 10: ["netherlands", "japan"], 11: ["ivory-coast", "ecuador"], 12: ["sweden", "tunisia"],
  13: ["spain", "cape-verde"], 14: ["belgium", "egypt"], 15: ["saudi-arabia", "uruguay"], 16: ["iran", "new-zealand"],
  17: ["france", "senegal"], 18: ["iraq", "norway"], 19: ["argentina", "algeria"], 20: ["austria", "jordan"],
  21: ["portugal", "dr-congo"], 22: ["england", "croatia"], 23: ["ghana", "panama"], 24: ["uzbekistan", "colombia"],
  25: ["czechia", "south-africa"], 26: ["switzerland", "bosnia"], 27: ["canada", "qatar"], 28: ["mexico", "south-korea"],
  29: ["turkey", "paraguay"], 30: ["usa", "australia"], 31: ["scotland", "morocco"], 32: ["brazil", "haiti"],
  33: ["netherlands", "sweden"], 34: ["germany", "ivory-coast"], 35: ["ecuador", "curacao"], 36: ["tunisia", "japan"],
  37: ["spain", "saudi-arabia"], 38: ["belgium", "iran"], 39: ["uruguay", "cape-verde"], 40: ["new-zealand", "egypt"],
  41: ["argentina", "austria"], 42: ["france", "iraq"], 43: ["norway", "senegal"], 44: ["jordan", "algeria"],
  45: ["portugal", "uzbekistan"], 46: ["england", "ghana"], 47: ["panama", "croatia"], 48: ["colombia", "dr-congo"],
  49: ["switzerland", "canada"], 50: ["bosnia", "qatar"], 51: ["scotland", "brazil"], 52: ["morocco", "haiti"],
  53: ["czechia", "mexico"], 54: ["south-africa", "south-korea"], 55: ["ecuador", "germany"], 56: ["curacao", "ivory-coast"],
  57: ["japan", "sweden"], 58: ["tunisia", "netherlands"], 59: ["turkey", "usa"], 60: ["paraguay", "australia"],
  61: ["norway", "france"], 62: ["senegal", "iraq"], 63: ["cape-verde", "saudi-arabia"], 64: ["uruguay", "spain"],
  65: ["egypt", "iran"], 66: ["new-zealand", "belgium"], 67: ["panama", "england"], 68: ["croatia", "ghana"],
  69: ["colombia", "portugal"], 70: ["dr-congo", "uzbekistan"], 71: ["algeria", "austria"], 72: ["jordan", "argentina"],
};

// Group letter → the four internal team keys (order = data.js seeding, used as last-resort tiebreak)
const GROUP_TEAMS = {
  A: ["mexico", "south-africa", "south-korea", "czechia"],
  B: ["canada", "bosnia", "qatar", "switzerland"],
  C: ["brazil", "morocco", "haiti", "scotland"],
  D: ["usa", "paraguay", "australia", "turkey"],
  E: ["germany", "ivory-coast", "ecuador", "curacao"],
  F: ["netherlands", "japan", "sweden", "tunisia"],
  G: ["belgium", "egypt", "iran", "new-zealand"],
  H: ["spain", "saudi-arabia", "uruguay", "cape-verde"],
  I: ["france", "senegal", "norway", "iraq"],
  J: ["argentina", "algeria", "austria", "jordan"],
  K: ["portugal", "uzbekistan", "colombia", "dr-congo"],
  L: ["england", "croatia", "ghana", "panama"],
};

const KNOCKOUT_MATCHES = [
  { id: "match_73", matchNum: 73, round: "R32", date: "2026-06-28" },
  { id: "match_74", matchNum: 74, round: "R32", date: "2026-06-29" },
  { id: "match_75", matchNum: 75, round: "R32", date: "2026-06-29" },
  { id: "match_76", matchNum: 76, round: "R32", date: "2026-06-29" },
  { id: "match_77", matchNum: 77, round: "R32", date: "2026-06-30" },
  { id: "match_78", matchNum: 78, round: "R32", date: "2026-06-30" },
  { id: "match_79", matchNum: 79, round: "R32", date: "2026-06-30" },
  { id: "match_80", matchNum: 80, round: "R32", date: "2026-07-01" },
  { id: "match_81", matchNum: 81, round: "R32", date: "2026-07-01" },
  { id: "match_82", matchNum: 82, round: "R32", date: "2026-07-01" },
  { id: "match_83", matchNum: 83, round: "R32", date: "2026-07-02" },
  { id: "match_84", matchNum: 84, round: "R32", date: "2026-07-02" },
  { id: "match_85", matchNum: 85, round: "R32", date: "2026-07-02" },
  { id: "match_86", matchNum: 86, round: "R32", date: "2026-07-03" },
  { id: "match_87", matchNum: 87, round: "R32", date: "2026-07-03" },
  { id: "match_88", matchNum: 88, round: "R32", date: "2026-07-03" },
  { id: "match_89", matchNum: 89, round: "R16", date: "2026-07-04" },
  { id: "match_90", matchNum: 90, round: "R16", date: "2026-07-04" },
  { id: "match_91", matchNum: 91, round: "R16", date: "2026-07-05" },
  { id: "match_92", matchNum: 92, round: "R16", date: "2026-07-05" },
  { id: "match_93", matchNum: 93, round: "R16", date: "2026-07-06" },
  { id: "match_94", matchNum: 94, round: "R16", date: "2026-07-06" },
  { id: "match_95", matchNum: 95, round: "R16", date: "2026-07-07" },
  { id: "match_96", matchNum: 96, round: "R16", date: "2026-07-07" },
  { id: "match_97", matchNum: 97, round: "QF", date: "2026-07-09" },
  { id: "match_98", matchNum: 98, round: "QF", date: "2026-07-10" },
  { id: "match_99", matchNum: 99, round: "QF", date: "2026-07-11" },
  { id: "match_100", matchNum: 100, round: "QF", date: "2026-07-11" },
  { id: "match_101", matchNum: 101, round: "SF", date: "2026-07-14" },
  { id: "match_102", matchNum: 102, round: "SF", date: "2026-07-15" },
  { id: "match_103", matchNum: 103, round: "3RD", date: "2026-07-18" },
  { id: "match_104", matchNum: 104, round: "FINAL", date: "2026-07-19" },
];

// Static knockout feeder graph (mirrors data.js team1Desc/team2Desc). Used to
// resolve each match's two participants from actual results so completed ESPN
// games can be mapped by their team pair — independent of how many games share
// a date. Descriptors: "1st/2nd Group X", "Best 3rd …", "W/L Match N".
const KNOCKOUT_FEEDERS = {
  match_73:  { t1: "2nd Group A",  t2: "2nd Group B" },
  match_74:  { t1: "1st Group E",  t2: "Best 3rd A/B/C/D/F" },
  match_75:  { t1: "1st Group F",  t2: "2nd Group C" },
  match_76:  { t1: "1st Group C",  t2: "2nd Group F" },
  match_77:  { t1: "1st Group I",  t2: "Best 3rd C/D/F/G/H" },
  match_78:  { t1: "2nd Group E",  t2: "2nd Group I" },
  match_79:  { t1: "1st Group A",  t2: "Best 3rd C/E/F/H/I" },
  match_80:  { t1: "1st Group L",  t2: "Best 3rd E/H/I/J/K" },
  match_81:  { t1: "1st Group D",  t2: "Best 3rd B/E/F/I/J" },
  match_82:  { t1: "1st Group G",  t2: "Best 3rd A/E/H/I/J" },
  match_83:  { t1: "2nd Group K",  t2: "2nd Group L" },
  match_84:  { t1: "1st Group H",  t2: "2nd Group J" },
  match_85:  { t1: "1st Group B",  t2: "Best 3rd E/F/G/I/J" },
  match_86:  { t1: "1st Group J",  t2: "2nd Group H" },
  match_87:  { t1: "1st Group K",  t2: "Best 3rd D/E/I/J/L" },
  match_88:  { t1: "2nd Group D",  t2: "2nd Group G" },
  match_89:  { t1: "W Match 74",   t2: "W Match 77" },
  match_90:  { t1: "W Match 73",   t2: "W Match 75" },
  match_91:  { t1: "W Match 76",   t2: "W Match 78" },
  match_92:  { t1: "W Match 79",   t2: "W Match 80" },
  match_93:  { t1: "W Match 83",   t2: "W Match 84" },
  match_94:  { t1: "W Match 81",   t2: "W Match 82" },
  match_95:  { t1: "W Match 86",   t2: "W Match 88" },
  match_96:  { t1: "W Match 85",   t2: "W Match 87" },
  match_97:  { t1: "W Match 89",   t2: "W Match 90" },
  match_98:  { t1: "W Match 93",   t2: "W Match 94" },
  match_99:  { t1: "W Match 91",   t2: "W Match 92" },
  match_100: { t1: "W Match 95",   t2: "W Match 96" },
  match_101: { t1: "W Match 97",   t2: "W Match 98" },
  match_102: { t1: "W Match 99",   t2: "W Match 100" },
  match_103: { t1: "L Match 101",  t2: "L Match 102" },
  match_104: { t1: "W Match 101",  t2: "W Match 102" },
};

// First knockout date — used to tell knockout games apart from group games by
// date rather than by team pair (two group-stage opponents can legitimately
// meet again in a late knockout round, so a pair-based filter is wrong).
const KNOCKOUT_START = "2026-06-28";

// Canonical team name (as used in data.js / picks / standings) → group letter.
const CANONICAL_TO_GROUP = {};
for (const [letter, keys] of Object.entries(GROUP_TEAMS)) {
  for (const key of keys) {
    const name = KEY_TO_CANONICAL[key];
    if (name) CANONICAL_TO_GROUP[name] = letter;
  }
}

// ── Match lookup helpers ──

function buildMatchLookup() {
  const lookup = {};
  for (const [matchId, teams] of Object.entries(GROUP_MATCHES)) {
    const key = [...teams].sort().join("|");
    lookup[key] = Number(matchId);
  }
  return lookup;
}

const MATCH_LOOKUP = buildMatchLookup();

function findGroupMatchId(teamKey1, teamKey2) {
  const key = [teamKey1, teamKey2].sort().join("|");
  return MATCH_LOOKUP[key] || null;
}

function resolveTeamKey(espnName) {
  return ESPN_TEAM_NAME_MAP[espnName] || null;
}

// ── ESPN fetch helpers ──

function toDateString(date) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function toESPNDate(date) {
  return date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
}

async function fetchESPNEvents(date) {
  const url = `${ESPN_BASE}/scoreboard?dates=${toESPNDate(date)}&limit=50`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`ESPN scoreboard request failed: ${res.status} for date ${toDateString(date)}`);
  const data = await res.json();
  return data.events || [];
}

async function fetchAllESPNEvents() {
  // Fetch a rolling window: yesterday, today, and tomorrow (catches late-finishing games)
  const now = new Date();
  const dates = [-1, 0, 1].map(offset => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return d;
  });

  const results = await Promise.allSettled(dates.map(d => fetchESPNEvents(d)));
  const events = [];
  for (const result of results) {
    if (result.status === "fulfilled") events.push(...result.value);
  }
  return events;
}

async function fetchESPNStandings() {
  const url = `${ESPN_STANDINGS}?limit=50`;
  const res = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!res.ok) throw new Error(`ESPN standings request failed: ${res.status}`);
  return res.json();
}

// ── Parse ESPN event into normalized match data ──

function parseESPNEvent(event) {
  const status = event.status?.type;
  if (!status?.completed) return null;

  const competition = event.competitions?.[0];
  if (!competition) return null;

  const home = competition.competitors?.find(c => c.homeAway === "home");
  const away = competition.competitors?.find(c => c.homeAway === "away");
  if (!home || !away) return null;

  const homeName = home.team?.displayName || "";
  const awayName = away.team?.displayName || "";
  const homeGoals = parseInt(home.score, 10);
  const awayGoals = parseInt(away.score, 10);

  // Detect penalty shootout from notes or status detail
  const notes = (competition.notes || []).map(n => (n.headline || "").toLowerCase());
  const statusDetail = (status.detail || "").toLowerCase();
  const isPenalty = notes.some(n => n.includes("penalty") || n.includes("shootout"))
    || statusDetail.includes("penalty") || statusDetail.includes("shootout")
    || status.name === "STATUS_FINAL_PEN";
  const isAET = notes.some(n => n.includes("extra time") || n.includes("aet"))
    || statusDetail.includes("extra time") || statusDetail.includes("aet")
    || status.name === "STATUS_FINAL_AET";

  // For penalties: ESPN shows the score after 90/120 min (which may be tied),
  // and the winner is indicated by the "winner" flag on the competitor
  let winner;
  if (isPenalty) {
    const winnerComp = competition.competitors?.find(c => c.winner === true);
    if (winnerComp) {
      winner = resolveTeamKey(winnerComp.team?.displayName);
    } else {
      // Fallback: higher score wins (shouldn't happen for ties-then-penalty)
      winner = homeGoals > awayGoals
        ? resolveTeamKey(homeName)
        : resolveTeamKey(awayName);
    }
  } else if (homeGoals === awayGoals) {
    winner = "draw";
  } else {
    winner = homeGoals > awayGoals ? resolveTeamKey(homeName) : resolveTeamKey(awayName);
  }

  const matchDate = (event.date || "").slice(0, 10);

  return {
    homeName,
    awayName,
    homeKey: resolveTeamKey(homeName),
    awayKey: resolveTeamKey(awayName),
    homeGoals: isNaN(homeGoals) ? null : homeGoals,
    awayGoals: isNaN(awayGoals) ? null : awayGoals,
    winner,
    matchDate,
    isPenalty,
    isAET,
  };
}

// ── Core sync logic ──

async function doSyncResults() {
  const summary = { synced: 0, skipped: 0, errors: [] };
  const events = await fetchAllESPNEvents();

  const batch = db.batch();
  let batchCount = 0;

  for (const event of events) {
    try {
      const match = parseESPNEvent(event);
      if (!match) {
        summary.skipped += 1;
        continue;
      }

      const { homeName, awayName, homeKey, awayKey, homeGoals, awayGoals, winner, matchDate, isPenalty, isAET } = match;

      if (!homeKey || !awayKey) {
        console.warn(`Unmapped ESPN team: "${homeName}" or "${awayName}"`);
        summary.skipped += 1;
        continue;
      }

      if (!winner) {
        summary.skipped += 1;
        continue;
      }

      // Group matches are mapped by their team pair here. Knockout matches are
      // handled by doSyncKnockout() — it resolves each bracket slot to a real
      // team first, then maps games by team pair (date mapping fails when
      // several knockout games share a day).
      const rawGroupId = findGroupMatchId(homeKey, awayKey);
      if (!rawGroupId) {
        summary.skipped += 1;
        continue;
      }
      const matchId = `match_${rawGroupId}`;
      const phase = "group";

      const docData = {
        winner,
        phase,
        homeTeam: homeName,
        awayTeam: awayName,
        homeGoals: homeGoals ?? null,
        awayGoals: awayGoals ?? null,
        isPenalty: isPenalty || false,
        isAET: isAET || false,
        enteredAt: admin.firestore.FieldValue.serverTimestamp(),
        source: "espn",
      };

      batch.set(db.collection("results").doc(matchId), docData, { merge: true });
      batchCount++;
      summary.synced += 1;

      if (batchCount >= 450) {
        await batch.commit();
        batchCount = 0;
      }
    } catch (err) {
      summary.errors.push(err?.message || String(err));
    }
  }

  if (batchCount > 0) await batch.commit();
  return summary;
}

// Group tables are computed from our own synced match results — ESPN's
// standings endpoint lags its scoreboard feed by hours, so it can't be the
// source of truth for live scoring. ESPN's order is kept only as a residual
// tiebreak (it eventually reflects fair-play points we can't compute).
async function doSyncStandings() {
  let espnOrder = {}; // letter → { teamKey: index }
  try {
    const data = await fetchESPNStandings();
    for (const group of data.children || []) {
      const letter = (group.name || "").replace("Group ", "").trim();
      if (!letter || letter.length !== 1) continue;
      const order = {};
      (group.standings?.entries || []).forEach((entry, idx) => {
        const key = resolveTeamKey(entry.team?.displayName || "");
        if (key) order[key] = idx;
      });
      espnOrder[letter] = order;
    }
  } catch (err) {
    console.warn("ESPN standings fetch failed; using seeding as residual tiebreak:", err.message);
  }

  // One read of the results collection gives both the group match scores and
  // which groups the admin has manually overridden.
  const resultsSnap = await db.collection("results").get();
  const manualGroups = new Set();
  const groupGames = [];
  resultsSnap.docs.forEach(d => {
    const data = d.data();
    const groupDoc = d.id.match(/^group_([A-L])$/);
    if (groupDoc) {
      if (data.source === "manual") manualGroups.add(groupDoc[1]);
      return;
    }
    const m = d.id.match(/^match_(\d+)$/);
    if (!m || Number(m[1]) > 72) return;
    const homeKey = resolveTeamKey(data.homeTeam || "");
    const awayKey = resolveTeamKey(data.awayTeam || "");
    if (!homeKey || !awayKey) return;
    if (typeof data.homeGoals !== "number" || typeof data.awayGoals !== "number") return;
    groupGames.push({ homeKey, awayKey, homeGoals: data.homeGoals, awayGoals: data.awayGoals });
  });

  const batch = db.batch();
  let updated = 0;
  let rankingsUpdated = 0;

  for (const [letter, teamKeys] of Object.entries(GROUP_TEAMS)) {
    const keySet = new Set(teamKeys);
    const games = groupGames.filter(g => keySet.has(g.homeKey) && keySet.has(g.awayKey));

    const stats = {};
    teamKeys.forEach(k => { stats[k] = { played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0 }; });
    for (const g of games) {
      stats[g.homeKey].played++; stats[g.awayKey].played++;
      stats[g.homeKey].gf += g.homeGoals; stats[g.homeKey].ga += g.awayGoals;
      stats[g.awayKey].gf += g.awayGoals; stats[g.awayKey].ga += g.homeGoals;
      if (g.homeGoals > g.awayGoals)      { stats[g.homeKey].win++;  stats[g.awayKey].loss++; }
      else if (g.homeGoals < g.awayGoals) { stats[g.awayKey].win++;  stats[g.homeKey].loss++; }
      else                                { stats[g.homeKey].draw++; stats[g.awayKey].draw++; }
    }
    const pts = k => stats[k].win * 3 + stats[k].draw;
    const gd  = k => stats[k].gf - stats[k].ga;

    // Head-to-head between two tied teams (negative → a ranks ahead of b).
    // FIFA applies head-to-head among the full tied subset; pairwise is a
    // close approximation and the admin can manually override any group.
    const h2h = (a, b) => {
      let aPts = 0, bPts = 0, aGoals = 0, bGoals = 0;
      for (const g of games) {
        if (!((g.homeKey === a && g.awayKey === b) || (g.homeKey === b && g.awayKey === a))) continue;
        const aG = g.homeKey === a ? g.homeGoals : g.awayGoals;
        const bG = g.homeKey === a ? g.awayGoals : g.homeGoals;
        aGoals += aG; bGoals += bG;
        if (aG > bG) aPts += 3; else if (aG < bG) bPts += 3; else { aPts += 1; bPts += 1; }
      }
      return (bPts - aPts) || (bGoals - aGoals);
    };

    const sorted = [...teamKeys].sort((a, b) =>
      pts(b) - pts(a) ||
      gd(b) - gd(a) ||
      stats[b].gf - stats[a].gf ||
      h2h(a, b) ||
      ((espnOrder[letter]?.[a] ?? 99) - (espnOrder[letter]?.[b] ?? 99)) ||
      teamKeys.indexOf(a) - teamKeys.indexOf(b)
    );

    const teams = sorted.map((k, idx) => ({
      rank: idx + 1,
      team: KEY_TO_CANONICAL[k],
      played: stats[k].played,
      win: stats[k].win,
      draw: stats[k].draw,
      loss: stats[k].loss,
      goalsFor: stats[k].gf,
      goalsAgainst: stats[k].ga,
      goalDiff: gd(k),
      points: pts(k),
    }));

    batch.set(
      db.collection("fifa_standings").doc(`group_${letter}`),
      { groupId: letter, teams, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    updated++;

    // Mirror the ranking into results/group_X so player scoring updates
    // automatically — unless the admin saved this group manually, or no
    // game has been played yet (order would be arbitrary).
    if (manualGroups.has(letter)) continue;
    if (!games.length) continue;

    const isFinal = teamKeys.every(k => stats[k].played >= 3);
    batch.set(
      db.collection("results").doc(`group_${letter}`),
      {
        type: "groupStandings",
        groupId: letter,
        standings: sorted.map(k => KEY_TO_CANONICAL[k]),
        // Teams that have actually played — only these have a determined
        // position, so only these earn points (scoring holds the rest at 0).
        playedTeams: sorted.filter(k => stats[k].played > 0).map(k => KEY_TO_CANONICAL[k]),
        source: "espn",
        final: isFinal,
        enteredAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    rankingsUpdated++;
  }

  if (updated > 0 || rankingsUpdated > 0) await batch.commit();
  return { updated, rankingsUpdated };
}

// ── Knockout bracket sync ──────────────────────────────────
// Resolves each knockout match's two participants from the *actual* results
// (final group standings + Annex C best-third + earlier-round winners), then
// maps completed ESPN knockout games to the right match by their team pair.
// Winners are stored as canonical team names so existing player picks score
// correctly. This is date-independent, so multi-game days resolve fine.

function groupIsFinal(g) {
  return !!(g && Array.isArray(g.standings) && g.standings.length === 4 && g.final !== false);
}

// Mirror of the frontend computeBestThirdSlots: map each "Best 3rd" R32 slot to
// the real team via the entered qualifiers + Annex C, then let any admin
// override win. Returns { match_79: "Brazil", ... } (canonical names).
function computeBestThirdSlots(thirdQualifiers, groupStandings, slotOverrides) {
  const best = {};
  const letters = Array.isArray(thirdQualifiers)
    ? thirdQualifiers.map(t => CANONICAL_TO_GROUP[t]).filter(Boolean) : [];
  if (letters.length === 8 && new Set(letters).size === 8 && letters.every(L => groupIsFinal(groupStandings[L]))) {
    const slotMap = resolveThirdPlaceSlots(letters);
    if (slotMap) {
      for (const [matchId, letter] of Object.entries(slotMap)) {
        best[matchId] = groupStandings[letter].standings[2];
      }
    }
  }
  for (const [matchId, team] of Object.entries(slotOverrides || {})) {
    if (team) best[matchId] = team;
  }
  return best;
}

// Resolve a single descriptor to a canonical team name, or null if not yet
// determined. ctx = { groupStandings, bestThird, koWinner }.
function resolveKnockoutDesc(desc, matchId, ctx) {
  if (!desc || desc === "TBD") return null;
  let m;
  if ((m = desc.match(/^1st Group ([A-L])$/))) return groupIsFinal(ctx.groupStandings[m[1]]) ? ctx.groupStandings[m[1]].standings[0] : null;
  if ((m = desc.match(/^2nd Group ([A-L])$/))) return groupIsFinal(ctx.groupStandings[m[1]]) ? ctx.groupStandings[m[1]].standings[1] : null;
  if (desc.startsWith("Best 3rd")) return ctx.bestThird[matchId] || null;
  if ((m = desc.match(/^W Match (\d+)$/))) return ctx.koWinner["match_" + m[1]] || null;
  if ((m = desc.match(/^L Match (\d+)$/))) {
    const fid = "match_" + m[1];
    const w = ctx.koWinner[fid];
    const t1 = resolveKnockoutSlot(fid, 1, ctx);
    const t2 = resolveKnockoutSlot(fid, 2, ctx);
    if (!w || !t1 || !t2) return null;
    return w === t1 ? t2 : (w === t2 ? t1 : null);
  }
  return null;
}

function resolveKnockoutSlot(matchId, slotNum, ctx) {
  const f = KNOCKOUT_FEEDERS[matchId];
  if (!f) return null;
  return resolveKnockoutDesc(slotNum === 1 ? f.t1 : f.t2, matchId, ctx);
}

async function doSyncKnockout() {
  const summary = { synced: 0, skipped: 0, errors: [] };

  // 1. Read the results collection: group standings, best-third inputs, and any
  //    knockout winners already stored (manual or from a previous run).
  const resultsSnap = await db.collection("results").get();
  const groupStandings = {};   // letter → { standings:[4 names], final }
  const storedWinner = {};     // match_id → winner already stored
  const storedSource = {};     // match_id → source of existing knockout doc
  let thirdQualifiers = null;
  let slotOverrides = {};

  resultsSnap.docs.forEach(d => {
    const data = d.data();
    let m;
    if ((m = d.id.match(/^group_([A-L])$/))) {
      groupStandings[m[1]] = { standings: data.standings || [], final: data.final };
    } else if (d.id === "third_place_qualifiers") {
      thirdQualifiers = Array.isArray(data.teams) ? data.teams : null;
    } else if (d.id === "bracket_overrides") {
      slotOverrides = data.slots || {};
    } else if ((m = d.id.match(/^match_(\d+)$/)) && Number(m[1]) >= 73) {
      storedWinner[d.id] = data.winner || null;
      storedSource[d.id] = data.source || null;
    }
  });

  const bestThird = computeBestThirdSlots(thirdQualifiers, groupStandings, slotOverrides);
  // koWinner starts from stored winners and grows as we assign this run's
  // results, so an earlier-round win can feed a later-round participant in the
  // same pass.
  const ctx = { groupStandings, bestThird, koWinner: { ...storedWinner } };

  // 2. Parse completed ESPN games and key the knockout ones by their team pair.
  const events = await fetchAllESPNEvents();
  const espnByPair = {}; // "TeamA|TeamB" (sorted canonical) → parsed game
  for (const event of events) {
    try {
      const match = parseESPNEvent(event);
      if (!match) continue;
      const { homeKey, awayKey, winner } = match;
      if (!homeKey || !awayKey || !winner || winner === "draw") continue;
      // Only knockout-stage games (by date). Group games are handled elsewhere;
      // filtering by date (not by team pair) lets a same-group knockout rematch
      // still map correctly.
      if (!match.matchDate || match.matchDate < KNOCKOUT_START) continue;
      const homeName = KEY_TO_CANONICAL[homeKey];
      const awayName = KEY_TO_CANONICAL[awayKey];
      const winnerName = KEY_TO_CANONICAL[winner];
      if (!homeName || !awayName || !winnerName) {
        console.warn(`Knockout: unmapped team key (${homeKey}/${awayKey})`);
        continue;
      }
      const pairKey = [homeName, awayName].sort().join("|");
      espnByPair[pairKey] = {
        homeName, awayName, winnerName,
        homeGoals: match.homeGoals, awayGoals: match.awayGoals,
        isPenalty: match.isPenalty, isAET: match.isAET,
      };
    } catch (err) {
      summary.errors.push(err?.message || String(err));
    }
  }

  // 3. Iterate the bracket: whenever both participants of an unassigned match
  //    are known, look for a completed ESPN game with that exact team pair.
  const batch = db.batch();
  let batchCount = 0;
  const assigned = new Set();
  let progress = true;
  let passes = 0;
  while (progress && passes < 8) {
    progress = false;
    passes++;
    for (const km of KNOCKOUT_MATCHES) {
      if (assigned.has(km.id)) continue;
      // Never overwrite a result the admin set by hand.
      if (storedSource[km.id] === "manual") { assigned.add(km.id); continue; }

      const t1 = resolveKnockoutSlot(km.id, 1, ctx);
      const t2 = resolveKnockoutSlot(km.id, 2, ctx);
      if (!t1 || !t2) continue;

      const game = espnByPair[[t1, t2].sort().join("|")];
      if (!game) continue;

      if (game.winnerName !== t1 && game.winnerName !== t2) {
        summary.errors.push(`${km.id}: ESPN winner "${game.winnerName}" is not a participant (${t1} vs ${t2})`);
        assigned.add(km.id);
        continue;
      }

      assigned.add(km.id);
      ctx.koWinner[km.id] = game.winnerName; // unlock downstream resolution
      progress = true;

      // Skip the write if the stored winner already matches.
      if (storedWinner[km.id] === game.winnerName) {
        summary.skipped += 1;
        continue;
      }

      batch.set(db.collection("results").doc(km.id), {
        winner: game.winnerName,
        phase: "knockout",
        homeTeam: game.homeName,
        awayTeam: game.awayName,
        homeGoals: game.homeGoals ?? null,
        awayGoals: game.awayGoals ?? null,
        isPenalty: game.isPenalty || false,
        isAET: game.isAET || false,
        enteredAt: admin.firestore.FieldValue.serverTimestamp(),
        source: "espn",
      }, { merge: true });
      batchCount++;
      summary.synced += 1;
      if (batchCount >= 450) { await batch.commit(); batchCount = 0; }
    }
  }

  if (batchCount > 0) await batch.commit();
  return summary;
}

// ── Scheduled function: every 10 min, 9am–midnight PT ──

exports.syncResultsScheduled = onSchedule(
  {
    schedule: "*/10 9-23 * * *",
    timeZone: "America/Los_Angeles",
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async () => {
    const resultsSummary = await doSyncResults();
    const standingsSummary = await doSyncStandings();
    const knockoutSummary = await doSyncKnockout();
    console.log("Scheduled sync complete:", { results: resultsSummary, standings: standingsSummary, knockout: knockoutSummary });
  }
);

// ── HTTP function: admin-triggered sync ──

const corsHandler = cors({ origin: true });

exports.syncResultsHttp = onRequest(
  {
    memory: "256MiB",
    timeoutSeconds: 60,
    invoker: "public",
  },
  (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === "OPTIONS") {
        res.status(204).send("");
        return;
      }

      const token = req.body?.adminToken || req.query?.adminToken;
      if (token !== ADMIN_PIN) {
        res.status(403).json({ error: "Invalid admin token" });
        return;
      }

      try {
        const resultsSummary = await doSyncResults();
        const standingsSummary = await doSyncStandings();
        const knockoutSummary = await doSyncKnockout();
        res.json({
          success: true,
          results: resultsSummary,
          standings: standingsSummary,
          knockout: knockoutSummary,
        });
      } catch (err) {
        console.error("HTTP sync error:", err);
        res.status(500).json({ error: err.message || "Sync failed" });
      }
    });
  }
);

// Internal helpers exposed for offline tests (not used in production paths).
exports._test = {
  doSyncKnockout,
  computeBestThirdSlots,
  resolveKnockoutSlot,
  groupIsFinal,
  KNOCKOUT_FEEDERS,
  CANONICAL_TO_GROUP,
  KEY_TO_CANONICAL,
  GROUP_TEAMS,
};
