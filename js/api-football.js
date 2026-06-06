export const API_KEY = "REPLACE_ME";
export const BASE_URL = "https://v3.football.api-sports.io";
export const LEAGUE = 1;
export const SEASON = 2026;
export const SYNC_COOLDOWN_MS = 900000;

export const API_TEAM_NAME_MAP = {
  "Mexico": "mexico",
  "South Africa": "south-africa",
  "South Korea": "south-korea",
  "Canada": "canada",
  "Qatar": "qatar",
  "Switzerland": "switzerland",
  "Brazil": "brazil",
  "Morocco": "morocco",
  "Haiti": "haiti",
  "Scotland": "scotland",
  "United States": "usa",
  "Paraguay": "paraguay",
  "Australia": "australia",
  "Germany": "germany",
  "Ivory Coast": "ivory-coast",
  "Ecuador": "ecuador",
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
  "Italy": "italy",
  "Bosnia": "bosnia",
  "Bosnia & Herzegovina": "bosnia",
  "Sweden": "sweden",
  "Poland": "poland",
  "Turkey": "turkey",
  "Türkiye": "turkey",
  "Kosovo": "kosovo",
  "Czech Republic": "czechia",
  "Czechia": "czechia",
  "Denmark": "denmark",
  "Jamaica": "jamaica",
  "DR Congo": "dr-congo",
  "Congo DR": "dr-congo",
  "Bolivia": "bolivia",
  "Iraq": "iraq"
};

const GROUP_MATCHES = {
  1: ["mexico", "south-africa"], 2: ["south-korea", "uefa-pd"], 3: ["canada", "uefa-pa"], 4: ["usa", "paraguay"],
  5: ["qatar", "switzerland"], 6: ["brazil", "morocco"], 7: ["haiti", "scotland"], 8: ["australia", "uefa-pc"],
  9: ["germany", "curacao"], 10: ["netherlands", "japan"], 11: ["ivory-coast", "ecuador"], 12: ["uefa-pb", "tunisia"],
  13: ["spain", "cape-verde"], 14: ["belgium", "egypt"], 15: ["saudi-arabia", "uruguay"], 16: ["iran", "new-zealand"],
  17: ["france", "senegal"], 18: ["intercont-p2", "norway"], 19: ["argentina", "algeria"], 20: ["austria", "jordan"],
  21: ["portugal", "intercont-p1"], 22: ["england", "croatia"], 23: ["ghana", "panama"], 24: ["uzbekistan", "colombia"],
  25: ["switzerland", "canada"], 26: ["uefa-pa", "qatar"], 27: ["canada", "qatar"], 28: ["mexico", "south-korea"],
  29: ["uefa-pc", "paraguay"], 30: ["usa", "australia"], 31: ["scotland", "morocco"], 32: ["brazil", "haiti"],
  33: ["netherlands", "uefa-pb"], 34: ["germany", "ivory-coast"], 35: ["ecuador", "curacao"], 36: ["tunisia", "japan"],
  37: ["spain", "saudi-arabia"], 38: ["belgium", "iran"], 39: ["uruguay", "cape-verde"], 40: ["new-zealand", "egypt"],
  41: ["argentina", "austria"], 42: ["france", "intercont-p2"], 43: ["norway", "senegal"], 44: ["jordan", "algeria"],
  45: ["portugal", "uzbekistan"], 46: ["england", "ghana"], 47: ["panama", "croatia"], 48: ["colombia", "intercont-p1"],
  49: ["switzerland", "canada"], 50: ["uefa-pa", "qatar"], 51: ["scotland", "brazil"], 52: ["morocco", "haiti"],
  53: ["uefa-pd", "mexico"], 54: ["south-africa", "south-korea"], 55: ["ecuador", "germany"], 56: ["curacao", "ivory-coast"],
  57: ["japan", "uefa-pb"], 58: ["tunisia", "netherlands"], 59: ["uefa-pc", "usa"], 60: ["paraguay", "australia"],
  61: ["norway", "france"], 62: ["senegal", "intercont-p2"], 63: ["cape-verde", "saudi-arabia"], 64: ["uruguay", "spain"],
  65: ["egypt", "iran"], 66: ["new-zealand", "belgium"], 67: ["panama", "england"], 68: ["croatia", "ghana"],
  69: ["colombia", "portugal"], 70: ["intercont-p1", "uzbekistan"], 71: ["algeria", "austria"], 72: ["jordan", "argentina"]
};

function buildMatchLookup(matches) {
  return Object.entries(matches).reduce((lookup, [matchId, teams]) => {
    const [team1, team2] = teams;
    const sortedKey = [team1, team2].sort().join("|");
    const reverseKey = [team2, team1].join("|");
    lookup[sortedKey] = Number(matchId);
    lookup[reverseKey] = Number(matchId);
    return lookup;
  }, {});
}

export const MATCH_LOOKUP = buildMatchLookup(GROUP_MATCHES);

export function resolveTeamKey(apiName) {
  const teamKey = API_TEAM_NAME_MAP[apiName] || null;
  if (!teamKey) console.warn(`API-Football team name not mapped: ${apiName}`);
  return teamKey;
}

export function findMatchId(teamKey1, teamKey2) {
  const key = [teamKey1, teamKey2].sort().join("|");
  return MATCH_LOOKUP[key] || null;
}

export function determineWinner(fixture) {
  const homeKey = resolveTeamKey(fixture?.teams?.home?.name);
  const awayKey = resolveTeamKey(fixture?.teams?.away?.name);
  const goals = fixture?.goals || {};
  const score = fixture?.score || {};

  if (score.penalty?.home != null) {
    return score.penalty.home > score.penalty.away ? homeKey : awayKey;
  }

  if (score.extratime?.home != null) {
    return goals.home > goals.away ? homeKey : awayKey;
  }

  if (goals.home === goals.away) return "draw";
  return goals.home > goals.away ? homeKey : awayKey;
}

export async function fetchAllFixtures() {
  const url = `${BASE_URL}/fixtures?league=${LEAGUE}&season=${SEASON}`;
  const res = await fetch(url, {
    headers: {
      "x-apisports-key": API_KEY
    }
  });

  if (!res.ok) {
    throw new Error(`API-Football request failed with status ${res.status}`);
  }

  const data = await res.json();
  if (Array.isArray(data.errors) && data.errors.length) {
    throw new Error(`API-Football error: ${data.errors.join(", ")}`);
  }
  if (data.errors && typeof data.errors === "object" && Object.keys(data.errors).length) {
    throw new Error(`API-Football error: ${Object.values(data.errors).join(", ")}`);
  }

  return data.response || [];
}

function fixtureDate(fixture) {
  return fixture?.fixture?.date?.slice(0, 10) || "";
}

function findKnockoutMatchId(fixture, matches = []) {
  const date = fixtureDate(fixture);
  const homeName = fixture?.teams?.home?.name || "";
  const awayName = fixture?.teams?.away?.name || "";
  const sameDateMatches = matches.filter(match => match.date === date);

  if (sameDateMatches.length === 1) return sameDateMatches[0].matchNum || sameDateMatches[0].id;

  const normalizedNames = [homeName, awayName].map(name => name.toLowerCase());
  const match = sameDateMatches.find(candidate => {
    const labels = [
      candidate.team1,
      candidate.team2,
      candidate.team1Desc,
      candidate.team2Desc
    ].filter(Boolean).map(label => label.toLowerCase());

    return normalizedNames.every(name => labels.some(label => label.includes(name) || name.includes(label)));
  });

  return match ? match.matchNum || match.id : null;
}

export async function syncResults(saveResultFn, matches = []) {
  const summary = { synced: 0, skipped: 0, errors: [] };
  const fixtures = await fetchAllFixtures();
  const finishedStatuses = new Set(["FT", "AET", "PEN"]);
  const finishedFixtures = fixtures.filter(fixture => finishedStatuses.has(fixture?.fixture?.status?.short));

  for (const fixture of finishedFixtures) {
    try {
      const homeKey = resolveTeamKey(fixture?.teams?.home?.name);
      const awayKey = resolveTeamKey(fixture?.teams?.away?.name);
      const winnerKey = determineWinner(fixture);

      if (!homeKey || !awayKey || !winnerKey) {
        summary.skipped += 1;
        continue;
      }

      let matchId = findMatchId(homeKey, awayKey);
      if (!matchId) matchId = findKnockoutMatchId(fixture, matches);

      if (!matchId) {
        summary.skipped += 1;
        continue;
      }

      await saveResultFn(matchId, winnerKey);
      summary.synced += 1;
    } catch (err) {
      summary.errors.push(err?.message || String(err));
    }
  }

  return summary;
}
