const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cors = require("cors");

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

function findKnockoutMatchId(dateStr) {
  const sameDateMatches = KNOCKOUT_MATCHES.filter(m => m.date === dateStr);
  if (sameDateMatches.length === 1) return sameDateMatches[0].id;
  return null;
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

      const rawGroupId = findGroupMatchId(homeKey, awayKey);
      let matchId;
      let phase;

      if (rawGroupId) {
        matchId = `match_${rawGroupId}`;
        phase = "group";
      } else {
        matchId = findKnockoutMatchId(matchDate);
        phase = "knockout";
      }

      if (!matchId) {
        summary.skipped += 1;
        continue;
      }

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

async function doSyncStandings() {
  const data = await fetchESPNStandings();
  const children = data.children || [];
  if (!children.length) return { updated: 0, rankingsUpdated: 0 };

  // Load existing results/group_* docs so a manual admin entry is never overwritten
  const groupLetters = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const existingRefs = groupLetters.map(g => db.collection("results").doc(`group_${g}`));
  const existingSnaps = await db.getAll(...existingRefs);
  const manualGroups = new Set();
  existingSnaps.forEach((snap, i) => {
    if (snap.exists && snap.data().source === "manual") manualGroups.add(groupLetters[i]);
  });

  const batch = db.batch();
  let updated = 0;
  let rankingsUpdated = 0;

  for (const group of children) {
    const groupName = group.name || ""; // e.g. "Group A"
    const letter = groupName.replace("Group ", "").trim();
    if (!letter || letter.length !== 1) continue;

    const standings = group.standings?.entries || [];
    const teams = standings.map((entry, idx) => {
      const teamName = entry.team?.displayName || "";
      const stats = {};
      for (const s of entry.stats || []) {
        stats[s.name] = s.value;
      }
      return {
        rank: idx + 1,
        team: teamName,
        played: stats["gamesPlayed"] ?? 0,
        win: stats["wins"] ?? 0,
        draw: stats["ties"] ?? 0,
        loss: stats["losses"] ?? 0,
        goalsFor: stats["pointsFor"] ?? 0,
        goalsAgainst: stats["pointsAgainst"] ?? 0,
        goalDiff: stats["pointDifferential"] ?? 0,
        points: stats["points"] ?? 0,
      };
    });

    batch.set(
      db.collection("fifa_standings").doc(`group_${letter}`),
      { groupId: letter, teams, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    updated++;

    // Mirror the live ranking into results/group_X so player scoring updates
    // automatically. Skipped if the admin saved this group manually, before
    // any game in the group has been played (order would be arbitrary), or
    // if any ESPN team name fails to map to a canonical data.js name.
    if (manualGroups.has(letter)) continue;
    if (teams.length !== 4) continue;
    if (!teams.some(t => t.played > 0)) continue;

    const canonical = teams.map(t => toCanonicalName(t.team));
    if (canonical.some(name => !name)) {
      console.warn(`Group ${letter}: unmapped team name in standings`, teams.map(t => t.team));
      continue;
    }

    const isFinal = teams.every(t => t.played >= 3);
    batch.set(
      db.collection("results").doc(`group_${letter}`),
      {
        type: "groupStandings",
        groupId: letter,
        standings: canonical,
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
    console.log("Scheduled sync complete:", { results: resultsSummary, standings: standingsSummary });
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
        res.json({
          success: true,
          results: resultsSummary,
          standings: standingsSummary,
        });
      } catch (err) {
        console.error("HTTP sync error:", err);
        res.status(500).json({ error: err.message || "Sync failed" });
      }
    });
  }
);
