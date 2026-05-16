// src/utils/cache.js
// Caches Firestore data locally to reduce reads
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_TTL = {
  content:  60 * 60 * 1000,  // 1 hour  — content changes rarely
  profile:  5  * 60 * 1000,  // 5 mins  — XP/streak change often
  progress: 10 * 60 * 1000,  // 10 mins — progress changes per session
};

// Save to cache
export const cacheSet = async (key, data) => {
  try {
    await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (e) { console.warn('Cache set failed:', e); }
};

// Get from cache — returns null if expired
export const cacheGet = async (key, ttl) => {
  try {
    const raw = await AsyncStorage.getItem(`cache_${key}`);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    const age = Date.now() - timestamp;
    if (age > ttl) return null; // expired
    return data;
  } catch (e) { return null; }
};

// Clear specific cache key
export const cacheClear = async (key) => {
  try { await AsyncStorage.removeItem(`cache_${key}`); }
  catch (e) { console.warn('Cache clear failed:', e); }
};

// Clear all cache
export const cacheClearAll = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter(k => k.startsWith('cache_'));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (e) { console.warn('Cache clear all failed:', e); }
};

export { CACHE_TTL };
