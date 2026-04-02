// =============================================================
// firebase.js — Firebase init + all shared database functions
// Every page imports this file for DB access
// =============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// -----------------------------------------------------------
// Firebase config
// -----------------------------------------------------------
const firebaseConfig = {
  apiKey:            "AIzaSyCJ8-IRWnv3mNg7LYuEJqyVCKZbKDRqwX0",
  authDomain:        "familybracket-9ab1c.firebaseapp.com",
  projectId:         "familybracket-9ab1c",
  storageBucket:     "familybracket-9ab1c.firebasestorage.app",
  messagingSenderId: "143026711013",
  appId:             "1:143026711013:web:9f05d4faec7c5a3388e70c",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// -----------------------------------------------------------
// SESSION HELPERS
// -----------------------------------------------------------

export function getSessionUser() {
  return sessionStorage.getItem("wc2026_user") || null;
}
export function setSessionUser(username) {
  sessionStorage.setItem("wc2026_user", username);
}
export function clearSessionUser() {
  sessionStorage.removeItem("wc2026_user");
}

// -----------------------------------------------------------
// USER FUNCTIONS
// -----------------------------------------------------------

export async function userExists(username) {
  const snap = await getDoc(doc(db, "users", username.toLowerCase()));
  return snap.exists();
}
export async function createUser(username) {
  await setDoc(doc(db, "users", username.toLowerCase()), {
    displayName: username,
    createdAt:   serverTimestamp(),
  });
}
export async function getUser(username) {
  const snap = await getDoc(doc(db, "users", username.toLowerCase()));
  return snap.exists() ? snap.data() : null;
}
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ username: d.id, ...d.data() }));
}

// -----------------------------------------------------------
// PICKS FUNCTIONS
// -----------------------------------------------------------

/**
 * Save Phase 1 picks.
 *
 * groupPicks format:
 *   {
 *     A: ["Mexico","South Africa","South Korea","UEFA Path D"],   // 1st→4th predictions
 *     ...
 *     L: [...],
 *     thirdPlaceAdvancing: ["Mexico","Brazil",...]  // 8 teams picked to qualify as 3rd-place
 *   }
 *
 * winnerPick: "Spain"
 */
export async function savePhase1Picks(username, groupPicks, winnerPick) {
  await setDoc(
    doc(db, "picks", username.toLowerCase()),
    { groupPicks, winnerPick, phase1SubmittedAt: serverTimestamp() },
    { merge: true }
  );
}

/**
 * Save Phase 2 picks (knockout stage).
 * knockoutPicks: { match_73: "Brazil", match_74: "Germany", ... }
 */
export async function savePhase2Picks(username, knockoutPicks) {
  await setDoc(
    doc(db, "picks", username.toLowerCase()),
    { knockoutPicks, phase2SubmittedAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getUserPicks(username) {
  const snap = await getDoc(doc(db, "picks", username.toLowerCase()));
  return snap.exists() ? snap.data() : null;
}
export async function getAllPicks() {
  const snap = await getDocs(collection(db, "picks"));
  return snap.docs.map(d => ({ username: d.id, ...d.data() }));
}

// -----------------------------------------------------------
// RESULTS FUNCTIONS
// -----------------------------------------------------------

/**
 * Save the final standings for a group.
 * groupId:   "A"–"L"
 * standings: ["Mexico","South Africa","South Korea","UEFA Path D"]  (1st→4th)
 */
export async function saveGroupStandings(groupId, standings) {
  await setDoc(
    doc(db, "results", `group_${groupId}`),
    { type: "groupStandings", groupId, standings, enteredAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getGroupStandings(groupId) {
  const snap = await getDoc(doc(db, "results", `group_${groupId}`));
  return snap.exists() ? snap.data() : null;
}

/**
 * Get all 12 group standings.
 * Returns { A: { standings: [...] }, B: {...}, ... }
 */
export async function getAllGroupStandings() {
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const result = {};
  await Promise.all(groups.map(async g => {
    const snap = await getDoc(doc(db, "results", `group_${g}`));
    if (snap.exists()) result[g] = snap.data();
  }));
  return result;
}

/**
 * Save which 3rd-place teams actually advanced (admin enters this after group stage).
 * advancingTeams: array of 8 team name strings
 */
export async function saveThirdPlaceQualifiers(advancingTeams) {
  await setDoc(
    doc(db, "results", "third_place_qualifiers"),
    { teams: advancingTeams, enteredAt: serverTimestamp() },
    { merge: true }
  );
}

export async function getThirdPlaceQualifiers() {
  const snap = await getDoc(doc(db, "results", "third_place_qualifiers"));
  return snap.exists() ? snap.data().teams : null;
}

/**
 * Save/update the result for a knockout match.
 */
export async function saveResult(matchId, winner, phase) {
  await setDoc(
    doc(db, "results", matchId),
    { winner, phase, enteredAt: serverTimestamp() },
    { merge: true }
  );
}
export async function getResult(matchId) {
  const snap = await getDoc(doc(db, "results", matchId));
  return snap.exists() ? snap.data() : null;
}

/**
 * Get all knockout match results.
 * Returns { match_73: { winner, phase }, ... }
 * Excludes group_* and third_place_qualifiers docs.
 */
export async function getAllResults() {
  const snap = await getDocs(collection(db, "results"));
  const results = {};
  snap.docs.forEach(d => {
    if (!d.id.startsWith("group_") && d.id !== "third_place_qualifiers") {
      results[d.id] = d.data();
    }
  });
  return results;
}

// -----------------------------------------------------------
// TOURNAMENT CONFIG
// -----------------------------------------------------------

const CONFIG_REF = doc(db, "config", "tournament");

export async function getTournamentConfig() {
  const snap = await getDoc(CONFIG_REF);
  if (snap.exists()) return snap.data();
  return { phase1Locked: false, phase2Locked: false, currentPhase: 1, tournamentStarted: false };
}
export async function updateTournamentConfig(updates) {
  await setDoc(CONFIG_REF, updates, { merge: true });
}

// -----------------------------------------------------------
// ADMIN AUTH
// -----------------------------------------------------------

const ADMIN_PIN = "lucasiscool";   // ← change before launch

export function checkAdminPin(pin) { return pin === ADMIN_PIN; }

// -----------------------------------------------------------
// LEADERBOARD SCORING
// -----------------------------------------------------------

/**
 * Score group standings predictions.
 *
 * Advancement tiers (for the +1 consolation point):
 *   - Position 1 or 2 in group  → always advances
 *   - Position 3 in group       → advances ONLY if in actualThirdPlaceQualifiers
 *   - Position 4 in group       → always eliminated
 *
 * Points per predicted team slot:
 *   +3  exact position match
 *   +1  wrong position but correct tier (advance vs eliminated), using
 *        user's own thirdPlaceAdvancing picks for predicted tier and
 *        actualThirdPlaceQualifiers for actual tier
 *   0   otherwise
 *
 * @param {Object}   groupPicks               — { A: [t,t,t,t], ..., thirdPlaceAdvancing: [...] }
 * @param {Object}   groupStandings           — { A: { standings: [t,t,t,t] }, ... }
 * @param {string[]} actualThirdPlaceQualifiers — 8 teams that actually advanced as 3rd-place (or null if not yet entered)
 */
export function scoreGroupStandings(groupPicks, groupStandings, actualThirdPlaceQualifiers) {
  const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const actualThirdSet = new Set(actualThirdPlaceQualifiers || []);
  // User's predicted 3rd-place advancers
  const predictedThirdSet = new Set(Array.isArray(groupPicks?.thirdPlaceAdvancing) ? groupPicks.thirdPlaceAdvancing : []);

  let total = 0;
  const byGroup = {};

  GROUPS.forEach(g => {
    const predicted = groupPicks?.[g];
    const actual    = groupStandings?.[g]?.standings;

    if (!predicted || !Array.isArray(predicted) || predicted.length < 4 ||
        !actual    || !Array.isArray(actual)    || actual.length < 4) {
      byGroup[g] = { pts: 0, detail: [], entered: !!actual };
      return;
    }

    let groupPts = 0;
    const detail = [];

    for (let i = 0; i < 4; i++) {
      const predictedTeam = predicted[i];
      const actualPos     = actual.indexOf(predictedTeam); // 0-based index in actual standings

      let pts = 0;

      if (predicted[i] === actual[i]) {
        // Exact position match
        pts = 3;
      } else if (actualPos !== -1) {
        // Team is in results but at the wrong position.
        // Award +1 if the advance/eliminate tier prediction is correct.
        // Only applies when actualThirdPlaceQualifiers has been entered.
        if (actualThirdPlaceQualifiers !== null) {
          const predictedAdvances = teamPredictedToAdvance(predictedTeam, i, predictedThirdSet);
          const actuallyAdvances  = teamActuallyAdvances(predictedTeam, actualPos, actualThirdSet);
          if (predictedAdvances === actuallyAdvances) pts = 1;
        }
      }

      groupPts += pts;
      detail.push({ team: predictedTeam, predictedPos: i + 1, actualPos: actualPos + 1, pts });
    }

    byGroup[g] = { pts: groupPts, detail, entered: true };
    total += groupPts;
  });

  return { total, byGroup };
}

/**
 * Did the user predict this team would advance?
 * - Predicted pos 0 or 1 (1st/2nd): always advances
 * - Predicted pos 2 (3rd): advances only if user picked them in thirdPlaceAdvancing
 * - Predicted pos 3 (4th): always eliminated
 */
function teamPredictedToAdvance(team, predictedIdx, predictedThirdSet) {
  if (predictedIdx <= 1) return true;
  if (predictedIdx === 2) return predictedThirdSet.has(team);
  return false; // 4th place
}

/**
 * Did this team actually advance?
 * - Actual pos 0 or 1 (1st/2nd): always advances
 * - Actual pos 2 (3rd): advances only if in actualThirdSet
 * - Actual pos 3 (4th): always eliminated
 */
function teamActuallyAdvances(team, actualIdx, actualThirdSet) {
  if (actualIdx <= 1) return true;
  if (actualIdx === 2) return actualThirdSet.has(team);
  return false; // 4th place
}

/**
 * Calculate scores for all participants.
 *
 * @param {Array}    allPicks                  — from getAllPicks()
 * @param {Object}   allKoResults              — from getAllResults()
 * @param {Object}   allGroupResults           — from getAllGroupStandings()
 * @param {string[]|null} actualThirdQualifiers — from getThirdPlaceQualifiers(), or null
 * @param {Object}   scoring                   — TOURNAMENT_DATA.scoring
 */
export function calculateScores(allPicks, allKoResults, allGroupResults, actualThirdQualifiers, scoring) {
  return allPicks
    .map(entry => {
      const { username, groupPicks = {}, winnerPick, knockoutPicks = {} } = entry;

      // ── Group standings score ──
      const { total: groupStagePoints } = scoreGroupStandings(groupPicks, allGroupResults, actualThirdQualifiers);

      // ── Tournament winner pick ──
      let winnerPoints = 0;
      const finalResult = allKoResults["match_104"];
      if (finalResult && winnerPick && finalResult.winner === winnerPick) {
        winnerPoints = scoring.correctTournamentWinner;
      }

      // ── Knockout picks ──
      const knockoutScoreMap = {
        match_73:  scoring.correctR32Winner,  match_74:  scoring.correctR32Winner,
        match_75:  scoring.correctR32Winner,  match_76:  scoring.correctR32Winner,
        match_77:  scoring.correctR32Winner,  match_78:  scoring.correctR32Winner,
        match_79:  scoring.correctR32Winner,  match_80:  scoring.correctR32Winner,
        match_81:  scoring.correctR32Winner,  match_82:  scoring.correctR32Winner,
        match_83:  scoring.correctR32Winner,  match_84:  scoring.correctR32Winner,
        match_85:  scoring.correctR32Winner,  match_86:  scoring.correctR32Winner,
        match_87:  scoring.correctR32Winner,  match_88:  scoring.correctR32Winner,
        match_89:  scoring.correctR16Winner,  match_90:  scoring.correctR16Winner,
        match_91:  scoring.correctR16Winner,  match_92:  scoring.correctR16Winner,
        match_93:  scoring.correctR16Winner,  match_94:  scoring.correctR16Winner,
        match_95:  scoring.correctR16Winner,  match_96:  scoring.correctR16Winner,
        match_97:  scoring.correctQFWinner,   match_98:  scoring.correctQFWinner,
        match_99:  scoring.correctQFWinner,   match_100: scoring.correctQFWinner,
        match_101: scoring.correctSFWinner,   match_102: scoring.correctSFWinner,
        match_104: scoring.correctFinalWinner,
      };

      let knockoutPoints = 0;
      Object.entries(knockoutPicks).forEach(([matchId, pickedWinner]) => {
        const result = allKoResults[matchId];
        if (result && result.winner === pickedWinner) {
          knockoutPoints += (knockoutScoreMap[matchId] || 0);
        }
      });

      return {
        username,
        score: groupStagePoints + knockoutPoints + winnerPoints,
        breakdown: { groupStage: groupStagePoints, knockout: knockoutPoints, winner: winnerPoints },
      };
    })
    .sort((a, b) => b.score - a.score);
}
