import { AVATAR_OPTIONS } from './avatarSchema';

// Human-friendly names for catalog values, used in chips, replies and the fine-tune panel.
export const OPTION_LABELS = {
  tradition: {
    florentine: 'Florentine', venetian: 'Venetian', flemish: 'Flemish', tudor: 'Tudor England',
    ming: 'Ming China', edo: 'Edo Japan', mughal: 'Mughal India', joseon: 'Joseon Korea',
  },
  skinTone: { porcelain: 'Porcelain', fair: 'Fair', olive: 'Olive', tan: 'Tan', brown: 'Brown', deep: 'Deep brown' },
  hairStyle: {
    short: 'Short', wavy: 'Wavy', long: 'Long', curly: 'Curly', braided: 'Braided', bun: 'Bun', topknot: 'Topknot', shaved: 'Shaved',
  },
  hairColor: { black: 'Black', brown: 'Brown', auburn: 'Auburn', blonde: 'Blonde', red: 'Red', silver: 'Silver', blue: 'Blue' },
  facialHair: { none: 'Clean-shaven', mustache: 'Mustache', beard: 'Beard', goatee: 'Goatee' },
  headwear: {
    none: 'No hat', beret: 'Velvet beret', coif: 'Linen coif', turban: 'Turban', wreath: 'Flower wreath',
    'scholar-hat': "Scholar's hat", eboshi: 'Eboshi cap', hairpin: 'Jewelled hairpin', veil: 'Veil', gat: 'Gat (horsehair hat)',
  },
  garment: {
    doublet: 'Doublet', gown: 'Brocade gown', robe: "Scholar's robe", hanfu: 'Hanfu', kimono: 'Kimono',
    jama: 'Jama', hanbok: 'Hanbok', cloak: 'Cloak',
  },
  primaryColor: {
    crimson: 'Crimson', ultramarine: 'Ultramarine', emerald: 'Emerald', ochre: 'Ochre', plum: 'Plum',
    ivory: 'Ivory', black: 'Black', teal: 'Teal', rose: 'Rose',
  },
  accentColor: { gold: 'Gold', silver: 'Silver', pearl: 'Pearl', jade: 'Jade', coral: 'Coral' },
  pose: { standing: 'Standing tall', contrapposto: 'Relaxed (contrapposto)', 'hand-on-hip': 'Hand on hip' },
  heldItem: {
    none: 'Nothing', book: 'A book', lute: 'A lute', globe: 'A globe', scroll: 'A scroll', fan: 'A fan',
    quill: 'A quill', teacup: 'A teacup', compass: 'A compass', brush: 'A paintbrush', flower: 'A flower',
  },
  companion: {
    none: 'No companion', dog: 'A loyal dog', cat: 'A cat', falcon: 'A falcon', crane: 'A crane', parrot: 'A parrot', rabbit: 'A rabbit',
  },
  backdrop: {
    drapery: 'Velvet drapery', loggia: 'Arched loggia', study: 'A study', garden: 'A garden',
    mountains: 'Ink-wash mountains', waves: 'Great waves', 'gold-leaf': 'Gold leaf',
  },
  frame: { gilded: 'Gilded frame', lacquer: 'Lacquer frame', ebony: 'Ebony frame', 'scroll-mount': 'Hanging scroll' },
};

export const FIELD_LABELS = {
  tradition: 'Style', skinTone: 'Skin tone', hairStyle: 'Hair', hairColor: 'Hair colour', facialHair: 'Facial hair',
  headwear: 'Headwear', garment: 'Outfit', primaryColor: 'Main colour', accentColor: 'Trim', pose: 'Pose',
  heldItem: 'Holding', companion: 'Companion', backdrop: 'Backdrop', frame: 'Frame',
};

export const STEPS = [
  {
    id: 'tradition', fields: ['tradition'], chipsFor: 'tradition',
    ask: 'First things first: which world should your portrait live in? Renaissance Florence or Venice, a Flemish master, Tudor England — or Ming China, Edo Japan, Mughal India, Joseon Korea?',
  },
  {
    id: 'look', fields: ['skinTone', 'hairStyle', 'hairColor', 'facialHair'], chipsFor: 'hairStyle',
    ask: 'Now, how shall I paint you? Describe yourself however you like — skin tone, hair style and colour, beard or not.',
  },
  {
    id: 'outfit', fields: ['garment', 'primaryColor', 'accentColor', 'headwear'], chipsFor: 'garment',
    ask: "Let's dress you. Doublet, brocade gown, kimono, hanfu, hanbok…? And pick a colour — crimson, ultramarine, emerald, plum — with gold, silver, pearl or jade trim. A hat, too?",
  },
  {
    id: 'held', fields: ['heldItem'], chipsFor: 'heldItem',
    ask: 'Portraits always show what the sitter loves. What will you hold — a book, a lute, a globe for travel, a paintbrush, a teacup?',
  },
  {
    id: 'companion', fields: ['companion'], chipsFor: 'companion',
    ask: 'Any companion at your side? A loyal dog, a cat, a falcon, a crane, a parrot, a rabbit — or just you.',
  },
  {
    id: 'setting', fields: ['backdrop', 'frame'], chipsFor: 'backdrop',
    ask: 'Where are we painting? Velvet drapery, an arched loggia, a study, a garden, ink-wash mountains, great waves, or pure gold leaf?',
  },
  {
    id: 'name', fields: ['name'], chipsFor: null,
    ask: 'Last touch: every great portrait has a title. What should the plaque say? (e.g. "Mira, Keeper of the Emergency Fund")',
  },
];

// Words people actually type → catalog values. Order matters within a field: first match wins.
const SYNONYMS = {
  tradition: [
    ['florentine', ['florentine', 'florence', 'italian', 'italy', 'medici', 'renaissance']],
    ['venetian', ['venetian', 'venice']],
    ['flemish', ['flemish', 'dutch', 'belgian', 'netherlands', 'flanders']],
    ['tudor', ['tudor', 'english', 'england', 'british', 'elizabethan']],
    ['ming', ['ming', 'chinese', 'china']],
    ['edo', ['edo', 'japan', 'japanese', 'samurai', 'ukiyo']],
    ['mughal', ['mughal', 'india', 'indian', 'persian']],
    ['joseon', ['joseon', 'korea', 'korean']],
  ],
  skinTone: [
    ['porcelain', ['porcelain', 'very pale', 'pale']],
    ['fair', ['fair', 'light skin', 'light-skinned']],
    ['olive', ['olive']],
    ['tan', ['tan', 'tanned', 'golden skin']],
    ['deep', ['deep', 'dark skin', 'dark-skinned', 'dark brown skin', 'black skin']],
    ['brown', ['brown skin', 'brown-skinned', 'medium brown']],
  ],
  hairStyle: [
    ['shaved', ['shaved', 'bald', 'buzz', 'buzzed', 'no hair']],
    ['topknot', ['topknot', 'top knot', 'man bun']],
    ['braided', ['braid', 'braids', 'braided', 'locs', 'dreadlocks', 'cornrows']],
    ['bun', ['bun', 'updo']],
    ['curly', ['curly', 'curls', 'afro', 'coily']],
    ['wavy', ['wavy', 'waves in my hair']],
    ['long', ['long hair', 'long']],
    ['short', ['short hair', 'short', 'pixie', 'crop']],
  ],
  hairColor: [
    ['blonde', ['blonde', 'blond', 'golden hair']],
    ['auburn', ['auburn', 'chestnut']],
    ['silver', ['silver hair', 'grey hair', 'gray hair', 'white hair', 'silver']],
    ['red', ['red hair', 'ginger', 'redhead']],
    ['blue', ['blue hair']],
    ['black', ['black hair', 'dark hair']],
    ['brown', ['brown hair', 'brunette']],
  ],
  facialHair: [
    ['none', ['clean-shaven', 'clean shaven', 'no beard', 'no facial hair']],
    ['goatee', ['goatee']],
    ['mustache', ['mustache', 'moustache', 'tache']],
    ['beard', ['beard', 'bearded', 'stubble']],
  ],
  headwear: [
    ['none', ['no hat', 'no headwear', 'bare head', 'bareheaded']],
    ['scholar-hat', ['scholar hat', "scholar's hat", 'official hat']],
    ['beret', ['beret', 'cap', 'hat']],
    ['coif', ['coif', 'bonnet']],
    ['turban', ['turban', 'pagri']],
    ['wreath', ['wreath', 'flower crown', 'crown']],
    ['eboshi', ['eboshi']],
    ['hairpin', ['hairpin', 'hair pin', 'binyeo', 'kanzashi']],
    ['veil', ['veil', 'headscarf', 'hijab', 'scarf']],
    ['gat', ['gat']],
  ],
  garment: [
    ['gown', ['gown', 'dress', 'brocade']],
    ['doublet', ['doublet', 'suit', 'jacket', 'tunic']],
    ['robe', ['robe', 'scholar']],
    ['hanfu', ['hanfu']],
    ['kimono', ['kimono', 'yukata']],
    ['jama', ['jama', 'sherwani', 'kurta']],
    ['hanbok', ['hanbok']],
    ['cloak', ['cloak', 'cape', 'mantle']],
  ],
  primaryColor: [
    ['crimson', ['crimson', 'red', 'scarlet', 'ruby']],
    ['ultramarine', ['ultramarine', 'blue', 'navy', 'sapphire', 'cobalt']],
    ['emerald', ['emerald', 'green']],
    ['ochre', ['ochre', 'yellow', 'mustard', 'saffron', 'orange']],
    ['plum', ['plum', 'purple', 'violet', 'aubergine']],
    ['ivory', ['ivory', 'white', 'cream']],
    ['black', ['black']],
    ['teal', ['teal', 'turquoise']],
    ['rose', ['rose', 'pink', 'blush']],
  ],
  accentColor: [
    ['gold', ['gold trim', 'gold', 'golden']],
    ['silver', ['silver trim', 'silver']],
    ['pearl', ['pearl', 'pearls']],
    ['jade', ['jade']],
    ['coral', ['coral']],
  ],
  pose: [
    ['hand-on-hip', ['hand on hip', 'hands on hips', 'confident']],
    ['contrapposto', ['contrapposto', 'relaxed', 'casual']],
    ['standing', ['standing tall', 'formal', 'upright']],
  ],
  heldItem: [
    ['none', ['nothing', 'empty-handed', 'empty handed']],
    ['book', ['book', 'reading', 'novel']],
    ['lute', ['lute', 'guitar', 'music', 'instrument']],
    ['globe', ['globe', 'travel', 'map']],
    ['scroll', ['scroll', 'poetry']],
    ['fan', ['fan']],
    ['quill', ['quill', 'pen', 'writing', 'writer']],
    ['teacup', ['tea', 'teacup', 'coffee', 'cup']],
    ['compass', ['compass', 'hiking', 'adventure']],
    ['brush', ['brush', 'paint', 'painting', 'art', 'drawing']],
    ['flower', ['flower', 'flowers', 'bouquet', 'tulip', 'peony', 'lotus']],
  ],
  companion: [
    ['none', ['no pet', 'no companion', 'just me', 'alone']],
    ['dog', ['dog', 'puppy', 'pup', 'hound']],
    ['cat', ['cat', 'kitten', 'kitty']],
    ['falcon', ['falcon', 'hawk', 'eagle']],
    ['crane', ['crane', 'heron']],
    ['parrot', ['parrot', 'bird']],
    ['rabbit', ['rabbit', 'bunny']],
  ],
  backdrop: [
    ['gold-leaf', ['gold leaf', 'gold-leaf', 'gilded background', 'gold background']],
    ['drapery', ['drapery', 'curtain', 'velvet']],
    ['loggia', ['loggia', 'arch', 'columns', 'balcony', 'landscape']],
    ['study', ['study', 'library', 'office', 'desk']],
    ['garden', ['garden', 'park']],
    ['mountains', ['mountain', 'mountains', 'ink wash', 'ink-wash']],
    ['waves', ['wave', 'waves', 'ocean', 'sea', 'beach']],
  ],
  frame: [
    ['scroll-mount', ['hanging scroll', 'scroll mount', 'scroll frame']],
    ['gilded', ['gilded', 'gold frame', 'ornate']],
    ['lacquer', ['lacquer', 'red frame']],
    ['ebony', ['ebony', 'black frame', 'dark wood', 'wooden frame']],
  ],
};

// Colour words describe hair when "hair" follows closely; keep them out of the outfit then.
const HAIR_CONTEXT = /\b(red|blue|black|brown|blonde?|silver|grey|gray|white|golden|dark|auburn)\s+hair\b/g;

function containsPhrase(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(text);
}

/** Finds every catalog value the member mentioned. Returns a partial spec. */
export function interpret(rawText) {
  const text = ` ${rawText.toLowerCase()} `;
  const withoutHair = text.replace(HAIR_CONTEXT, ' ');
  const changes = {};
  for (const [field, entries] of Object.entries(SYNONYMS)) {
    const haystack = field === 'primaryColor' || field === 'accentColor' || field === 'skinTone' ? withoutHair : text;
    for (const [value, words] of entries) {
      if (words.some(w => containsPhrase(haystack, w))) {
        changes[field] = value;
        break;
      }
    }
  }
  // "gold" alone is usually trim, not a gold-leaf backdrop or a gilded frame.
  if (changes.primaryColor && changes.accentColor === undefined && /\bgold\b/.test(withoutHair)) changes.accentColor = 'gold';
  return changes;
}

function randomOf(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function describe(changes) {
  const parts = Object.entries(changes)
    .filter(([field]) => field !== 'name')
    .map(([field, value]) => OPTION_LABELS[field]?.[value]?.toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

const CHEERS = ['Lovely', 'Beautiful choice', 'Ooh, yes', 'Perfect', 'Splendid', 'Very distinguished'];

/**
 * One turn of the offline painter. Returns { reply, avatar, stepIndex, done }.
 * `stepIndex` is where the conversation currently is (index into STEPS).
 */
export function localPainterTurn(text, avatar, stepIndex) {
  const step = STEPS[Math.min(stepIndex, STEPS.length - 1)];
  const lower = text.trim().toLowerCase();
  const wantsSkip = /^(skip|next|pass|whatever|any|idk|no idea)\b/.test(lower);
  const wantsSurprise = /surprise|you choose|you pick|random/.test(lower);

  let changes = interpret(text);
  if (wantsSurprise) {
    changes = Object.fromEntries(step.fields.filter(f => f !== 'name').map(f => [f, randomOf(AVATAR_OPTIONS[f])]));
  }
  if (step.id === 'name' && !wantsSkip && !wantsSurprise && text.trim()) {
    changes = { name: text.trim().replace(/^["']|["']$/g, '').slice(0, 60) };
  }

  const updated = { ...avatar, ...changes };
  const touchedStep = step.fields.some(f => f in changes);
  const advance = touchedStep || wantsSkip;
  const nextIndex = advance ? stepIndex + 1 : stepIndex;
  const done = nextIndex >= STEPS.length;

  const described = describe(changes);
  let reply;
  if (step.id === 'name' && changes.name) {
    reply = `"${changes.name}" — it's perfect. Your portrait is finished! Save it, and every sensible money move you make will add a new keepsake to the scene.`;
  } else if (described) {
    reply = `${randomOf(CHEERS)} — ${described}. ${done ? 'Your portrait is finished!' : STEPS[nextIndex].ask}`;
  } else if (wantsSkip) {
    reply = done ? 'All done — your portrait is ready to save.' : `No problem, we'll keep that as is. ${STEPS[nextIndex].ask}`;
  } else {
    reply = `Hmm, I couldn't quite picture that. Try one of the suggestions below, or say "surprise me". ${step.ask}`;
  }
  return { reply, avatar: updated, stepIndex: nextIndex, done };
}
