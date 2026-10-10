// Deterministically maps a flair name to one of the brand accent tokens.
const KEYS = ['teal', 'coral', 'gold', 'plum'];

export default function flairColor(flair, brand) {
  if (!flair) return brand.inkSoft;
  let h = 0;
  for (let i = 0; i < flair.length; i++) h = (h * 31 + flair.charCodeAt(i)) >>> 0;
  return brand[KEYS[h % KEYS.length]];
}
