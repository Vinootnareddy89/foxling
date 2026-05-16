// src/firebase/progress.js
// Saves and reads user progress from Firestore

import { db } from './config';
import {
  collection, addDoc, getDocs, query,
  where, orderBy, limit, serverTimestamp, updateDoc, doc,
} from 'firebase/firestore';

// ── SAVE PROGRESS ─────────────────────────────────────────
export const saveProgress = async (userId, worksheetId, score, xpEarned) => {
  try {
    await addDoc(collection(db, 'progress'), {
      userId,
      worksheetId,
      score,
      xpEarned,
      completedAt: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('Failed to save progress:', e.message);
    return false;
  }
};

// ── GET USER PROGRESS ─────────────────────────────────────
export const getUserProgress = async (userId) => {
  try {
    const q = query(
      collection(db, 'progress'),
      where('userId', '==', userId),
      orderBy('completedAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.warn('Failed to get progress:', e.message);
    return [];
  }
};

// ── UPDATE USER XP + STREAK ───────────────────────────────
export const updateUserStats = async (userId, newXP, newStreak, newBadges) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      xp:         newXP,
      streak:     newStreak,
      badges:     newBadges,
      lastActive: serverTimestamp(),
    });
    return true;
  } catch (e) {
    console.warn('Failed to update stats:', e.message);
    return false;
  }
};

// ── GET BEST SCORE ────────────────────────────────────────
export const getBestScore = (progressList, worksheetId) => {
  const attempts = progressList.filter(p => p.worksheetId === worksheetId);
  if (attempts.length === 0) return null;
  return Math.max(...attempts.map(p => p.score));
};
