// src/firebase/content.js
// Reads content from Firestore with local caching
import { db } from './config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { WORKSHEETS } from '../data/worksheets';
import { cacheGet, cacheSet, CACHE_TTL } from '../utils/cache';

const CACHE_KEY = 'content_all';

// ── GET ALL CONTENT ───────────────────────────────────────
export const getContent = async (filters = {}, forceRefresh = false) => {
  try {
    // 1. Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cached = await cacheGet(CACHE_KEY, CACHE_TTL.content);
      if (cached) {
        console.log('✓ Content from cache — 0 Firestore reads');
        return applyFilters(cached, filters);
      }
    }

    // 2. Fetch from Firestore
    console.log('↓ Fetching content from Firestore...');
    const snap = await getDocs(
      query(collection(db, 'content'), where('published', '==', true))
    );

    if (snap.empty) {
      console.log('No Firestore content — using local data');
      return applyFilters(WORKSHEETS, filters);
    }

    const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // 3. Save to cache
    await cacheSet(CACHE_KEY, data);
    console.log(`✓ Cached ${data.length} content items`);

    return applyFilters(data, filters);
  } catch (e) {
    console.warn('Firestore read failed, using local:', e.message);
    return applyFilters(WORKSHEETS, filters);
  }
};

// ── GET SINGLE CONTENT ITEM ───────────────────────────────
export const getContentById = async (id) => {
  // Check cache first
  const cached = await cacheGet(CACHE_KEY, CACHE_TTL.content);
  if (cached) {
    const found = cached.find(c => c.id === id);
    if (found) return found;
  }
  // Fallback to local
  return WORKSHEETS.find(w => w.id === id) || null;
};

// ── FORCE REFRESH ─────────────────────────────────────────
export const refreshContent = () => getContent({}, true);

// ── FILTERS ───────────────────────────────────────────────
const applyFilters = (items, { subject, grade, type } = {}) => {
  return items.filter(item => {
    if (subject && subject !== 'All' && item.subject !== subject) return false;
    if (grade   && grade   !== 'All' && item.grade   !== grade)   return false;
    if (type    && item.type !== type)                             return false;
    return true;
  });
};
