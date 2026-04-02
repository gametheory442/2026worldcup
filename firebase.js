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
  updateDoc,
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
  const ref  = doc(db, "users", username.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function createUser(username) {
  const key = username.toLowerCase();
  await setDoc(doc(db, "users", key), {
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
 * Save Phase 1 picks (group standings predictions + tournament winner)
 *
 * groupPicks format (NEW — standings-based):
 *   { A: ["Mexico","South Africa","South Korea","UEFA Path D"], B: [...], ... }
 *   Each value is an ordered array of 4 team names (1st → 4th place prediction)
 *
 * winnerPick: "Spain"
 */
export async function savePhase1Picks(username, groupPicks, winnerPick) {
  const key = username.toLowerCase();
  await setDoc(
    doc(db, "picks", key),
    {
      groupPicks,
      winnerPick,
      phase1SubmittedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Save Phase 2 picks (knockout stage)
 * knockoutPicks: { match_73: "Brazil", match_74: "Germany", ... }
 */
export async function savePhase2Picks(username, knockoutPicks) {
  const key = username.toLowerCase();
  await setDoc(
    doc(db, "picks", key),
    {
      knockoutPicks,
      phase2SubmittedAt: serverTimestamp(),
    },
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
 * groupId:    "A" through "L"
 * standings:  ["Mexico", "South Africa", "South Korea", "UEFA Path D"]  (1st → 4th)
 */
export async function saveGroupStandings(groupId, standings) {
  await setDoc(
    doc(db, "results", `group_${groupId}`),
    {
      type:      "groupStandings",
      groupId,
      standings, // ordered array: [1st, 2nd, 3rd, 4th]
      enteredAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Get final standings for a single group.
 * Returns { standings: [...], enteredAt } or null.
 */
export async function getGroupStandings(groupId) {
  const snap = await getDoc(doc(db, "results", `group_${groupId}`));
  return snap.exists() ? snap.data() : null;
}

/**
 * Get all group standings results.
 * Returns object keyed by groupId: { A: { standings: [...] }, B: {...}, ... }
 */
export async function getAllGroupStandings() {
  const groups = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  const result = {};
  await Promise.all(
    groups.map(async g => {
      const snap = await getDoc(doc(db, "results", `group_${g}`));
      if (snap.exists()) result[g] = snap.data();
    })
  );
  return result;
}

/**
 * Save/update the result for a single knockout match.
 * matchId:  "match_73"
 * winner:   "Brazil"
 * phase:    "knockout"
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
 * Get all results (knockout matches).
 * Returns object keyed by matchId: { match_73: { winner, phase }, ... }
 * NOTE: group_A through group_L docs are excluded (handled by getAllGroupStandings).
 */
export async function getAllResults() {
  const snap = await getDocs(collection(db, "results"));
  const results = {};
  snap.docs.forEach(d => {
    // Skip group standings docs — those are handled separately
    if (!d.id.startsWith("group_")) {
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
  return {
    phase1Locked:      false,
    phase2Locked:      false,
    currentPhase:      1,
    tournamentStarted: false,
  };
}

export async function updateTournamentConfig(updates) {
  await setDoc(CONFIG_REF, updates, { merge: true });
}

// -----------------------------------------------------------
// ADMIN AUTH
// -----------------------------------------------------------

const ADMIN_PIN = "lucasiscool";   // ← change before launch

export function checkAdminPin(pin) {
  return pin === ADMIN_PIN;
}

// -----------------------------------------------------------
// LEADERBOARD SCORING
// -----------------------------------------------------------

/**
 * Score group standings predictions.
 *
 * Scoring per position per group:
 *   +3  exact position match (predicted 1st and they finished 1st, etc.)
 *   +1  correctly predicted whether a team advances (top 2) or is eliminated (bottom 2)
 *
 * So max per group = 4 teams × (up to 4 pts each in best case) = varies
 * Realistic max per group = 4 × (3+1) = 16 pts, but +1 is conditional on not getting exact
 *
 * Actual scoring breakdown per team slot:
 *   - Exact position:                   +3 pts
 *   - Not exact, but advance/elim tier: +1 pt  (predicted to advance and they advanced, OR predicted eliminated and they were eliminated)
 *   - Complete miss:                     0 pts
 *
 * @param {Object} groupPicks     — { A: ["Mexico","...","...","..."], ... }
 * @param {Object} groupStandings — { A: { standings: ["Mexico","...","...","..."] }, ... }
 * @returns {Object} { total, byGroup: { A: { pts, detail: [{team,predicted,actual,pts}] } } }
 */
export function scoreGroupStandings(groupPicks, groupStandings) {
  const GROUPS = ["A","B","C","D","E","F","G","H","I","J","K","L"];
  let total = 0;
  const byGroup = {};

  GROUPS.forEach(g => {
    const predicted = groupPicks?.[g];   // array of 4 teams in predicted order
    const actual    = groupStandings?.[g]?.standings; // array of 4 teams in actual order

    if (!predicted || !Array.isArray(predicted) || predicted.length < 4 ||
        !actual    || !Array.isArray(actual)    || actual.length < 4) {
      byGroup[g] = { pts: 0, detail: [], entered: !!actual };
      return;
    }

    let groupPts = 0;
    const detail = [];

    for (let i = 0; i < 4; i++) {
      const predictedTeam = predicted[i];
      const actualTeam    = actual[i];
      const actualPos     = actual.indexOf(predictedTeam); // where they actually finished

      let pts = 0;

      if (predictedTeam === actualTeam) {
        // Exact position
        pts = 3;
      } else if (actualPos !== -1) {
        // Team is in the results, just wrong position
        // +1 if advance/eliminate tier is correct
        // predicted positions 0,1 = advance tier; 2,3 = eliminate tier
        const predictedAdvances = i <= 1;
        const actuallyAdvances  = actualPos <= 1;
        if (predictedAdvances === actuallyAdvances) {
          pts = 1;
        }
      }

      groupPts += pts;
      detail.push({
        team: predictedTeam,
        predictedPos: i + 1,
        actualPos: actualPos + 1,
        pts,
      });
    }

    byGroup[g] = { pts: groupPts, detail, entered: true };
    total += groupPts;
  });

  return { total, byGroup };
}

/**
 * Calculate scores for all participants.
 * allPicks:         array from getAllPicks()
 * allKoResults:     object from getAllResults() (knockout matches only)
 * allGroupResults:  object from getAllGroupStandings()
 * scoring:          TOURNAMENT_DATA.scoring
 *
 * Returns sorted array:
 * [{ username, score, breakdown: { groupStage, knockout, winner } }, ...]
 */
export function calculateScores(allPicks, allKoResults, allGroupResults, scoring) {
  return allPicks
    .map(entry => {
      const { username, groupPicks = {}, winnerPick, knockoutPicks = {} } = entry;

      // ── Group standings score ──
      const { total: groupStagePoints } = scoreGroupStandings(groupPicks, allGroupResults);

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
        if (!result) return;
        if (result.winner === pickedWinner) {
          knockoutPoints += (knockoutScoreMap[matchId] || 0);
        }
      });

      const total = groupStagePoints + knockoutPoints + winnerPoints;

      return {
        username,
        score: total,
        breakdown: {
          groupStage: groupStagePoints,
          knockout:   knockoutPoints,
          winner:     winnerPoints,
        },
      };
    })
    .sort((a, b) => b.score - a.score);
}
