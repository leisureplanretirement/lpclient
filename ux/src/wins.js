import { ACCOUTREMENTS, DEFAULT_AVATAR, normalizeAvatar } from './avatar/avatarSchema';
import { recordWin } from './api';

// The coach marks a recognised prudent decision with a line like
//   🏅 **Win:** Paid off your last credit card {win:laurel}
// (see lpserver Documents/YoungAdultFinancialConcerns.md).
const WIN_TOKEN = /\{win:([a-z-]+)\}/g;
const WIN_LINE = /^.*\*\*Win:\*\*\s*(.*?)\s*\{win:([a-z-]+)\}.*$/gm;

/** Returns [{ key, title }] for every valid win marker in an assistant message. */
export function extractWins(text) {
  if (!text) return [];
  const wins = [];
  for (const match of text.matchAll(WIN_LINE)) {
    const [, title, key] = match;
    if (key in ACCOUTREMENTS) wins.push({ key, title: title.replace(/[*_]/g, '').trim() });
  }
  return wins;
}

/** Splits an assistant message into the prose (markers removed) and its wins. */
export function splitWins(text) {
  if (!text) return { body: text ?? '', wins: [] };
  const wins = extractWins(text);
  if (wins.length === 0) return { body: text.replace(WIN_TOKEN, '').trim(), wins };
  const body = text.replace(WIN_LINE, '').replace(WIN_TOKEN, '').replace(/\n{3,}/g, '\n\n').trim();
  return { body, wins };
}

// Logged-out visitors keep their portrait and wins in this browser only.
const LOCAL_KEY = 'lp_local_profile';

export function loadLocalProfile() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || 'null');
    if (stored && typeof stored === 'object') {
      return { avatar: normalizeAvatar(stored.avatar), wins: Array.isArray(stored.wins) ? stored.wins : [] };
    }
  } catch {
    // Storage blocked or corrupt: fall through to a fresh profile.
  }
  return { avatar: { ...DEFAULT_AVATAR }, wins: [] };
}

export function saveLocalProfile(profile) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(profile));
  } catch {
    // Private mode etc. — the portrait simply won't persist.
  }
}

function earnedFrom(wins) {
  return [...new Set(['sprig', ...wins.map(w => w.accoutrement)])];
}

/**
 * Records a win and returns { profile, newlyEarned }. Authenticated members are recorded on the
 * server; visitors locally. Never throws — recognition is a nicety, not a blocker.
 */
export async function claimWin(key, title, token) {
  if (token) {
    try {
      return await recordWin(key, title, token);
    } catch (e) {
      console.warn('Could not record win on the server', e);
      return { profile: null, newlyEarned: false };
    }
  }
  const local = loadLocalProfile();
  if (local.wins.some(w => w.accoutrement === key)) return { profile: local, newlyEarned: false };
  const wins = [...local.wins, { id: `${Date.now()}`, accoutrement: key, title, earnedAt: new Date().toISOString() }];
  const profile = { avatar: { ...local.avatar, accoutrements: earnedFrom(wins) }, wins };
  saveLocalProfile(profile);
  return { profile, newlyEarned: true };
}
