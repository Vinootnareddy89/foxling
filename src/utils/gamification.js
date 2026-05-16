// src/utils/gamification.js

export const LEVELS = [
  { level: 1, name: 'Fox Kit',      minXP: 0,    maxXP: 200,  color: '#f05a1a', emoji: '🚀' },
  { level: 2, name: 'Trail Blazer',       minXP: 200,  maxXP: 500,  color: '#f7b731', emoji: '⭐' },
  { level: 3, name: 'Forest Scout',      minXP: 500,  maxXP: 900,  color: '#26de81', emoji: '🌙' },
  { level: 4, name: 'Wild Explorer',  minXP: 900,  maxXP: 1400, color: '#45aaf2', emoji: '🌌' },
  { level: 5, name: 'Foxling Legend',    minXP: 1400, maxXP: 9999, color: '#fd9644', emoji: '🌟' },
];

export const BADGES = [
  { id: 'first_worksheet', name: 'First Steps',    emoji: '👣', desc: 'Complete your first worksheet' },
  { id: 'streak_3',        name: 'On Fire!',       emoji: '🔥', desc: '3-day learning streak' },
  { id: 'perfect_score',   name: 'Perfect!',       emoji: '💯', desc: 'Get 100% on any worksheet' },
  { id: 'math_master',     name: 'Math Master',    emoji: '🧮', desc: 'Complete 3 Math worksheets' },
  { id: 'reading_star',    name: 'Reading Star',   emoji: '📚', desc: 'Complete 3 Reading worksheets' },
  { id: 'level_up',        name: 'Level Up!',      emoji: '⬆️', desc: 'Reach Level 2' },
  { id: 'speed_demon',     name: 'Speed Demon',    emoji: '⚡', desc: 'Score 50+ in Quick Fire game' },
  { id: 'week_warrior',    name: 'Week Warrior',   emoji: '📅', desc: '7-day learning streak' },
];

export const getLevelInfo = (xp) =>
  [...LEVELS].reverse().find(l => xp >= l.minXP) || LEVELS[0];

export const getXPProgress = (xp) => {
  const lvl   = getLevelInfo(xp);
  const range = lvl.maxXP - lvl.minXP;
  const earned = xp - lvl.minXP;
  return Math.min(100, Math.round((earned / range) * 100));
};

export const checkNewBadges = (profile, progressList) => {
  const earned    = new Set(profile.badges || []);
  const mathDone  = progressList.filter(p => p.worksheetId?.includes('math')).length;
  const readDone  = progressList.filter(p => p.worksheetId?.includes('read')).length;
  const hasPerfect = progressList.some(p => p.score === 100);
  const newBadges = [];

  const check = (id, condition) => {
    if (condition && !earned.has(id)) newBadges.push(id);
  };

  check('first_worksheet', progressList.length >= 1);
  check('streak_3',        (profile.streak || 0) >= 3);
  check('week_warrior',    (profile.streak || 0) >= 7);
  check('perfect_score',   hasPerfect);
  check('math_master',     mathDone >= 3);
  check('reading_star',    readDone >= 3);
  check('level_up',        (profile.xp || 0) >= 200);

  return { newBadges, allBadges: [...earned, ...newBadges] };
};

export const isNewDay = (lastActiveTimestamp) => {
  const last = new Date(lastActiveTimestamp);
  const now  = new Date();
  return last.toDateString() !== now.toDateString();
};

export const calcStreak = (lastActive, currentStreak) => {
  if (!lastActive) return 1;
  const last = new Date(lastActive);
  const now  = new Date();
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return currentStreak;        // same day, no change
  if (diffDays === 1) return currentStreak + 1;    // consecutive day
  return 1;                                        // streak broken
};
