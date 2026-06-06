const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
const cors = require("cors");

admin.initializeApp();
const db = admin.firestore();

const API_FOOTBALL_KEY = defineSecret("API_FOOTBALL_KEY");

const BASE_URL = "https://v3.football.api-sports.io";
const LEAGUE = 1;
const SEASON = 2026;
const ADMIN_PIN = "lucasiscool";

// ── Team name mapping (API-Football name → internal key) ──

const API_TEAM_NAME_MAP = {
  "Mexico": "Mexico", "South Africa": "South Africa", "South Korea": "South Korea",
  "Canada": "Canada", "Qatar": "Qatar", "Switzerland": "Switzerland",
  "Brazil": "Brazil", "Morocco": "Morocco", "Haiti": "Haiti", "Scotland": "Scotland",
  "United States": "United States", "Paraguay": "Paraguay", "Australia": "Australia",
  "Germany": "Germany", "Ivory Coast": "Ivory Coast", "Ecuador": "Ecuador",
  "Curacao": "Curaçao", "Curaçao": "Curaçao",
  "Netherlands": "Netherlands", "Japan": "Japan", "Tunisia": "Tunisia",
  "Belgium": "Belgium", "Egypt": "Egypt", "Iran": "Iran", "New Zealand": "New Zealand",
  "Spain": "Spain", "Saudi Arabia": "Saudi Arabia", "Uruguay": "Uruguay", "Cape Verde": "Cape Verde",
  "France": "France", "Senegal": "Senegal", "Norway": "Norway",
  "Argentina": "Argentina", "Algeria": "Algeria", "Austria": "Austria", "Jordan": "Jordan",
  "Portugal": "Portugal", "Uzbekistan": "Uzbekistan", "Colombia": "Colombia",
  "England": "England", "Croatia": "Croatia", "Ghana": "Ghana", "Panama": "Panama",
  "Italy": "Italy",
  "Bosnia Herzegovina": "Bosnia & Herzegovina", "Bosnia & Herzegovina": "Bosnia & Herzegovina",
  "Bosnia and Herzegovina": "Bosnia & Herzegovina",
  "Sweden": "Sweden", "Poland": "Poland",
  "Turkey": "Türkiye", "Türkiye": "Türkiye",
  "Kosovo": "Kosovo",
  "Czech Republic": "Czechia", "Czechia": "Czechia",
  "Denmark": "Denmark", "Jamaica": "Jamaica",
  "DR Congo": "DR Congo", "Congo DR": "DR Congo",
  "Bolivia": "Bolivia", "Iraq": "Iraq",
};

// ── Internal key mapping for match lookup (mirrors api-football.js GROUP_MATCHES) ──

const TEAM_KEY_MAP = {
  "Mexico": "mexico", "South Africa": "south-africa", "South Korea": "south-korea",
  "Canada": "canada", "Qatar": "qatar", "Switzerland": "switzerland",
  "Brazil": "brazil", "Morocco": "morocco", "Haiti": "haiti", "Scotland": "scotland",
  "United States": "usa", "Paraguay": "paraguay", "Australia": "australia",
  "Germany": "germany", "Ivory Coast": "ivory-coast", "Ecuador": "ecuador",
  "Curaçao": "curacao",
  "Netherlands": "netherlands", "Japan": "japan", "Tunisia": "tunisia",
  "Belgium": "belgium", "Egypt": "egypt", "Iran": "iran", "New Zealand": "new-zealand",
  "Spain": "spain", "Saudi Arabia": "saudi-arabia", "Uruguay": "uruguay", "Cape Verde": "cape-verde",
  "France": "france", "Senegal": "senegal", "Norway": "norway",
  "Argentina": "argentina", "Algeria": "algeria", "Austria": "austria", "Jordan": "jordan",
  "Portugal": "portugal", "Uzbekistan": "uzbekistan", "Colombia": "colombia",
  "England": "england", "Croatia": "croatia", "Ghana": "ghana", "Panama": "panama",
  "Bosnia & Herzegovina": "bosnia", "Sweden": "sweden",
  "Türkiye": "turkey", "Czechia": "czechia",
  "DR Congo": "dr-congo", "Iraq": "iraq",
};

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

function findKnockoutMatchId(fixture) {
  const date = fixture?.fixture?.date?.slice(0, 10) || "";
  const homeName = fixture?.teams?.home?.name || "";
  const awayName = fixture?.teams?.away?.name || "";
  const sameDateMatches = KNOCKOUT_MATCHES.filter(m => m.date === date);

  if (sameDateMatches.length === 1) return sameDateMatches[0].id;

  const normalizedNames = [homeName, awayName].map(n => n.toLowerCase());
  const match = sameDateMatches.find(candidate => {
    const id = candidate.matchNum;
    return normalizedNames.every(name =>
      name.length > 0 && id > 0
    );
  });

  return match ? match.id : null;
}

function resolveTeamName(apiName) {
  return API_TEAM_NAME_MAP[apiName] || null;
}

function getTeamKey(teamName) {
  return TEAM_KEY_MAP[teamName] || null;
}

function determineWinner(fixture) {
  const homeName = resolveTeamName(fixture?.teams?.home?.name);
  const awayName = resolveTeamName(fixture?.teams?.away?.name);
  const goals = fixture?.goals || {};
  const score = fixture?.score || {};

  if (score.penalty?.home != null) {
    return score.penalty.home > score.penalty.away ? homeName : awayName;
  }
  if (score.extratime?.home != null) {
    return goals.home > goals.away ? homeName : awayName;
  }
  if (goals.home === goals.away) return "draw";
  return goals.home > goals.away ? homeName : awayName;
}

// ── API fetch helpers ──

async function fetchFixtures(apiKey) {
  const url = `${BASE_URL}/fixtures?league=${LEAGUE}&season=${SEASON}`;
  const res = await fetch(url, { headers: { "x-apisports-key": apiKey } });
  if (!res.ok) throw new Error(`API-Football fixtures request failed: ${res.status}`);
  const data = await res.json();
  if (data.errors && typeof data.errors === "object" && Object.keys(data.errors).length) {
    throw new Error(`API-Football error: ${Object.values(data.errors).join(", ")}`);
  }
  return data.response || [];
}

async function fetchStandings(apiKey) {
  const url = `${BASE_URL}/standings?league=${LEAGUE}&season=${SEASON}`;
  const res = await fetch(url, { headers: { "x-apisports-key": apiKey } });
  if (!res.ok) throw new Error(`API-Football standings request failed: ${res.status}`);
  const data = await res.json();
  if (data.errors && typeof data.errors === "object" && Object.keys(data.errors).length) {
    throw new Error(`API-Football error: ${Object.values(data.errors).join(", ")}`);
  }
  return data.response || [];
}

// ── Core sync logic ──

async function doSyncResults(apiKey) {
  const summary = { synced: 0, skipped: 0, errors: [] };
  const fixtures = await fetchFixtures(apiKey);
  const finishedStatuses = new Set(["FT", "AET", "PEN"]);
  const finished = fixtures.filter(f => finishedStatuses.has(f?.fixture?.status?.short));

  const batch = db.batch();
  let batchCount = 0;

  for (const fixture of finished) {
    try {
      const homeName = resolveTeamName(fixture?.teams?.home?.name);
      const awayName = resolveTeamName(fixture?.teams?.away?.name);

      if (!homeName || !awayName) {
        summary.skipped += 1;
        continue;
      }

      const homeKey = getTeamKey(homeName);
      const awayKey = getTeamKey(awayName);

      if (!homeKey || !awayKey) {
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
        matchId = findKnockoutMatchId(fixture);
        phase = "knockout";
      }

      if (!matchId) {
        summary.skipped += 1;
        continue;
      }

      const winner = determineWinner(fixture);
      const goals = fixture?.goals || {};

      const docData = {
        winner,
        phase,
        homeTeam: homeName,
        awayTeam: awayName,
        homeGoals: goals.home ?? null,
        awayGoals: goals.away ?? null,
        enteredAt: admin.firestore.FieldValue.serverTimestamp(),
        source: "api-football",
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

async function doSyncStandings(apiKey) {
  const response = await fetchStandings(apiKey);
  if (!response.length) return { updated: 0 };

  const league = response[0]?.league;
  if (!league?.standings) return { updated: 0 };

  const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const batch = db.batch();
  let updated = 0;

  for (let i = 0; i < league.standings.length && i < 12; i++) {
    const groupTeams = league.standings[i];
    if (!groupTeams || !groupTeams.length) continue;

    const groupLetter = GROUP_LETTERS[i];
    const teams = groupTeams.map(entry => ({
      rank: entry.rank,
      team: resolveTeamName(entry.team?.name) || entry.team?.name,
      played: entry.all?.played ?? 0,
      win: entry.all?.win ?? 0,
      draw: entry.all?.draw ?? 0,
      loss: entry.all?.lose ?? 0,
      goalsFor: entry.all?.goals?.for ?? 0,
      goalsAgainst: entry.all?.goals?.against ?? 0,
      goalDiff: entry.goalsDiff ?? 0,
      points: entry.points ?? 0,
    }));

    batch.set(
      db.collection("fifa_standings").doc(`group_${groupLetter}`),
      { groupId: groupLetter, teams, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
      { merge: true }
    );
    updated++;
  }

  if (updated > 0) await batch.commit();
  return { updated };
}

// ── Scheduled function: every 10 min, 9am–midnight PT ──

exports.syncResultsScheduled = onSchedule(
  {
    schedule: "*/10 9-23 * * *",
    timeZone: "America/Los_Angeles",
    secrets: [API_FOOTBALL_KEY],
    memory: "256MiB",
    timeoutSeconds: 60,
  },
  async () => {
    const apiKey = API_FOOTBALL_KEY.value();
    const resultsSummary = await doSyncResults(apiKey);
    const standingsSummary = await doSyncStandings(apiKey);
    console.log("Scheduled sync complete:", { results: resultsSummary, standings: standingsSummary });
  }
);

// ── HTTP function: admin-triggered sync ──

const corsHandler = cors({ origin: true });

exports.syncResultsHttp = onRequest(
  {
    secrets: [API_FOOTBALL_KEY],
    memory: "256MiB",
    timeoutSeconds: 60,
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
        const apiKey = API_FOOTBALL_KEY.value();
        const resultsSummary = await doSyncResults(apiKey);
        const standingsSummary = await doSyncStandings(apiKey);
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
