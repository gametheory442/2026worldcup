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
// Username stored in sessionStorage so it persists across
// page navigations but clears when the browser is closed
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

/**
 * Check if a username already exists in Firestore
 * Returns true/false
 */
export async function userExists(username) {
  const ref  = doc(db, "users", username.toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists();
}

/**
 * Create a new user document
 * Called on first login for a new username
 */
export async function createUser(username) {
  const key = username.toLowerCase();
  await setDoc(doc(db, "users", key), {
    displayName: username,
    createdAt:   serverTimestamp(),
  });
}

/**
 * Get a user document
 * Returns the data object or null
 */
export async function getUser(username) {
  const snap = await getDoc(doc(db, "users", username.toLowerCase()));
  return snap.exists() ? snap.data() : null;
}

/**
 * Get all users (for leaderboard)
 * Returns array of { username, ...userData }
 */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map(d => ({ username: d.id, ...d.data() }));
}

// -----------------------------------------------------------
// PICKS FUNCTIONS
// -----------------------------------------------------------

/**
 * Save Phase 1 picks (group stage winners + tournament winner)
 * groupPicks: { match_1: "Mexico", match_2: "South Korea", ... }
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

/**
 * Load all picks for a user
 * Returns { groupPicks, winnerPick, knockoutPicks } or null
 */
export async function getUserPicks(username) {
  const snap = await getDoc(doc(db, "picks", username.toLowerCase()));
  return snap.exists() ? snap.data() : null;
}

/**
 * Load picks for all users (for leaderboard scoring)
 * Returns array of { username, groupPicks, winnerPick, knockoutPicks }
 */
export async function getAllPicks() {
  const snap = await getDocs(collection(db, "picks"));
  return snap.docs.map(d => ({ username: d.id, ...d.data() }));
}

// -----------------------------------------------------------
// RESULTS FUNCTIONS
// -----------------------------------------------------------

/**
 * Save/update the result for a single match
 * matchId:  "match_6"
 * winner:   "Brazil"  (the team that won, or "draw" for group stage draws)
 * phase:    "group" | "knockout"
 */
export async function saveResult(matchId, winner, phase) {
  await setDoc(
    doc(db, "results", matchId),
    {
      winner,
      phase,
      enteredAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Get the result for a single match
 * Returns { winner, phase, enteredAt } or null
 */
export async function getResult(matchId) {
  const snap = await getDoc(doc(db, "results", matchId));
  return snap.exists() ? snap.data() : null;
}

/**
 * Get all results (for scoring / leaderboard)
 * Returns object keyed by matchId: { match_6: { winner, phase }, ... }
 */
export async function getAllResults() {
  const snap = await getDocs(collection(db, "results"));
  const results = {};
  snap.docs.forEach(d => { results[d.id] = d.data(); });
  return results;
}

// -----------------------------------------------------------
// TOURNAMENT CONFIG
// This single document controls the live phase state
// Admin flips phase1Locked / phase2Locked when the time comes
// -----------------------------------------------------------

const CONFIG_REF = doc(db, "config", "tournament");

/**
 * Get the current tournament config
 * Returns:
 * {
 *   phase1Locked: bool,
 *   phase2Locked: bool,
 *   currentPhase: 1 | 2,
 *   tournamentStarted: bool,
 * }
 */
export async function getTournamentConfig() {
  const snap = await getDoc(CONFIG_REF);
  if (snap.exists()) return snap.data();

  // Default config if document doesn't exist yet
  return {
    phase1Locked:       false,
    phase2Locked:       false,
    currentPhase:       1,
    tournamentStarted:  false,
  };
}

/**
 * Update specific fields in tournament config
 * e.g. updateTournamentConfig({ phase1Locked: true })
 */
export async function updateTournamentConfig(updates) {
  await setDoc(CONFIG_REF, updates, { merge: true });
}

// -----------------------------------------------------------
// ADMIN AUTH
// Simple PIN-based admin check — no real auth needed for a
// family site. PIN is checked client-side only.
// Set your pin below — change before going live.
// -----------------------------------------------------------

const ADMIN_PIN = "lucasiscool";   // ← change this before launch

export function checkAdminPin(pin) {
  return pin === ADMIN_PIN;
}

// -----------------------------------------------------------
// LEADERBOARD SCORING
// calculateScores(allPicks, allResults) → sorted leaderboard
// -----------------------------------------------------------

/**
 * Calculate scores for all participants
 * allPicks:   array from getAllPicks()
 * allResults: object from getAllResults()
 * scoring:    TOURNAMENT_DATA.scoring
 * Returns array sorted by score descending:
 * [{ username, score, breakdown: { groupStage, advances, winner, knockout } }, ...]
 */
export function calculateScores(allPicks, allResults, scoring) {
  return allPicks
    .map(entry => {
      const { username, groupPicks = {}, winnerPick, knockoutPicks = {} } = entry;
      let groupStagePoints  = 0;
      let knockoutPoints    = 0;
      let winnerPoints      = 0;

      // ── Group stage match picks ──
      Object.entries(groupPicks).forEach(([matchId, pickedWinner]) => {
        const result = allResults[matchId];
        if (!result) return;
        if (result.winner === pickedWinner) {
          groupStagePoints += scoring.correctGroupMatchWinner;
        }
      });

      // ── Tournament winner pick ──
      const finalResult = allResults["match_104"];
      if (finalResult && winnerPick && finalResult.winner === winnerPick) {
        winnerPoints = scoring.correctTournamentWinner;
      }

      // ── Knockout picks ──
      const knockoutScoreMap = {
        match_73: scoring.correctR32Winner,  match_74: scoring.correctR32Winner,
        match_75: scoring.correctR32Winner,  match_76: scoring.correctR32Winner,
        match_77: scoring.correctR32Winner,  match_78: scoring.correctR32Winner,
        match_79: scoring.correctR32Winner,  match_80: scoring.correctR32Winner,
        match_81: scoring.correctR32Winner,  match_82: scoring.correctR32Winner,
        match_83: scoring.correctR32Winner,  match_84: scoring.correctR32Winner,
        match_85: scoring.correctR32Winner,  match_86: scoring.correctR32Winner,
        match_87: scoring.correctR32Winner,  match_88: scoring.correctR32Winner,
        match_89: scoring.correctR16Winner,  match_90: scoring.correctR16Winner,
        match_91: scoring.correctR16Winner,  match_92: scoring.correctR16Winner,
        match_93: scoring.correctR16Winner,  match_94: scoring.correctR16Winner,
        match_95: scoring.correctR16Winner,  match_96: scoring.correctR16Winner,
        match_97: scoring.correctQFWinner,   match_98: scoring.correctQFWinner,
        match_99: scoring.correctQFWinner,   match_100: scoring.correctQFWinner,
        match_101: scoring.correctSFWinner,  match_102: scoring.correctSFWinner,
        match_104: scoring.correctFinalWinner,
      };

      Object.entries(knockoutPicks).forEach(([matchId, pickedWinner]) => {
        const result = allResults[matchId];
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
