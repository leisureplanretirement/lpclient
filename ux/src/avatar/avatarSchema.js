// Shared avatar vocabulary. The server's AvatarCatalog (Community/Avatar/AvatarCatalog.cs)
// validates against exactly these values, so keep the two lists in sync.

export const AVATAR_OPTIONS = {
  tradition: ['florentine', 'venetian', 'flemish', 'tudor', 'ming', 'edo', 'mughal', 'joseon'],
  skinTone: ['porcelain', 'fair', 'olive', 'tan', 'brown', 'deep'],
  hairStyle: ['short', 'wavy', 'long', 'curly', 'braided', 'bun', 'topknot', 'shaved'],
  hairColor: ['black', 'brown', 'auburn', 'blonde', 'red', 'silver', 'blue'],
  facialHair: ['none', 'mustache', 'beard', 'goatee'],
  headwear: ['none', 'beret', 'coif', 'turban', 'wreath', 'scholar-hat', 'eboshi', 'hairpin', 'veil', 'gat'],
  garment: ['doublet', 'gown', 'robe', 'hanfu', 'kimono', 'jama', 'hanbok', 'cloak'],
  primaryColor: ['crimson', 'ultramarine', 'emerald', 'ochre', 'plum', 'ivory', 'black', 'teal', 'rose'],
  accentColor: ['gold', 'silver', 'pearl', 'jade', 'coral'],
  pose: ['standing', 'contrapposto', 'hand-on-hip'],
  heldItem: ['none', 'book', 'lute', 'globe', 'scroll', 'fan', 'quill', 'teacup', 'compass', 'brush', 'flower'],
  companion: ['none', 'dog', 'cat', 'falcon', 'crane', 'parrot', 'rabbit'],
  backdrop: ['drapery', 'loggia', 'study', 'garden', 'mountains', 'waves', 'gold-leaf'],
  frame: ['gilded', 'lacquer', 'ebony', 'scroll-mount'],
};

// Symbolic objects, in the spirit of Renaissance portrait iconography, that a member earns
// by making prudent money moves. They are never chosen directly — only unlocked by wins.
export const ACCOUTREMENTS = {
  sprig:       { label: 'Olive Sprig',  meaning: 'Started your money journey' },
  ledger:      { label: 'Ledger',       meaning: 'Built a budget that still has room for fun' },
  shield:      { label: 'Shield',       meaning: 'Started an emergency fund' },
  'coin-purse':{ label: 'Coin Purse',   meaning: 'Hit a savings goal' },
  laurel:      { label: 'Laurel Crown', meaning: 'Paid off a debt' },
  keys:        { label: 'Keys',         meaning: 'Made a smart housing move' },
  hourglass:   { label: 'Hourglass',    meaning: 'Started saving for future-you (401k / IRA)' },
  ship:        { label: 'Little Ship',  meaning: 'Saved up for a trip instead of borrowing for it' },
  pearls:      { label: 'Pearls',       meaning: 'Started investing steadily' },
  lantern:     { label: 'Lantern',      meaning: 'Learned something and helped the community' },
};

export const DEFAULT_AVATAR = {
  name: 'A Person of Quiet Means',
  tradition: 'florentine',
  skinTone: 'olive',
  hairStyle: 'wavy',
  hairColor: 'brown',
  facialHair: 'none',
  headwear: 'beret',
  garment: 'doublet',
  primaryColor: 'teal',
  accentColor: 'gold',
  pose: 'contrapposto',
  heldItem: 'book',
  companion: 'none',
  backdrop: 'drapery',
  frame: 'gilded',
  accoutrements: ['sprig'],
};

// Returns a copy of `spec` with every unknown or missing field replaced by the default.
export function normalizeAvatar(spec) {
  const out = { ...DEFAULT_AVATAR };
  if (!spec || typeof spec !== 'object') return out;
  if (typeof spec.name === 'string' && spec.name.trim()) out.name = spec.name.trim().slice(0, 60);
  for (const [field, allowed] of Object.entries(AVATAR_OPTIONS)) {
    if (allowed.includes(spec[field])) out[field] = spec[field];
  }
  if (Array.isArray(spec.accoutrements)) {
    out.accoutrements = [...new Set(spec.accoutrements.filter(a => a in ACCOUTREMENTS))];
  }
  return out;
}
