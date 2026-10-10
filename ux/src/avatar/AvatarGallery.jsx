import AvatarPortrait from './AvatarPortrait';
import { ACCOUTREMENTS } from './avatarSchema';

// Dev/demo grid for visual QA of AvatarPortrait. Between them the specs cover every
// tradition, garment, backdrop and frame at least once, plus one with every accoutrement.
const SPECS = [
  {
    name: 'The Florentine Saver', tradition: 'florentine', skinTone: 'olive', hairStyle: 'wavy', hairColor: 'brown',
    headwear: 'beret', garment: 'doublet', primaryColor: 'teal', accentColor: 'gold', pose: 'contrapposto',
    heldItem: 'book', companion: 'dog', backdrop: 'loggia', frame: 'gilded', accoutrements: ['sprig', 'ledger'],
  },
  {
    name: 'Lady of the Lagoon', tradition: 'venetian', skinTone: 'fair', hairStyle: 'braided', hairColor: 'auburn',
    headwear: 'none', garment: 'gown', primaryColor: 'crimson', accentColor: 'gold', pose: 'standing',
    heldItem: 'flower', companion: 'parrot', backdrop: 'drapery', frame: 'gilded', accoutrements: ['pearls', 'laurel'],
  },
  {
    name: 'The Careful Merchant', tradition: 'flemish', skinTone: 'porcelain', hairStyle: 'short', hairColor: 'blonde',
    facialHair: 'beard', headwear: 'coif', garment: 'robe', primaryColor: 'black', accentColor: 'pearl', pose: 'standing',
    heldItem: 'compass', companion: 'cat', backdrop: 'study', frame: 'ebony', accoutrements: ['coin-purse', 'hourglass', 'keys'],
  },
  {
    name: 'A Tudor of Means', tradition: 'tudor', skinTone: 'tan', hairStyle: 'curly', hairColor: 'red',
    facialHair: 'goatee', headwear: 'none', garment: 'doublet', primaryColor: 'plum', accentColor: 'gold', pose: 'hand-on-hip',
    heldItem: 'none', companion: 'falcon', backdrop: 'garden', frame: 'gilded', accoutrements: ['sprig', 'laurel', 'shield'],
  },
  {
    name: 'Scholar of the Quiet Hall', tradition: 'ming', skinTone: 'fair', hairStyle: 'topknot', hairColor: 'black',
    facialHair: 'mustache', headwear: 'scholar-hat', garment: 'hanfu', primaryColor: 'ultramarine', accentColor: 'gold',
    pose: 'standing', heldItem: 'scroll', companion: 'crane', backdrop: 'mountains', frame: 'scroll-mount', accoutrements: ['lantern'],
  },
  {
    name: 'Wave Watcher', tradition: 'edo', skinTone: 'porcelain', hairStyle: 'bun', hairColor: 'black',
    headwear: 'hairpin', garment: 'kimono', primaryColor: 'rose', accentColor: 'jade', pose: 'contrapposto',
    heldItem: 'fan', companion: 'none', backdrop: 'waves', frame: 'lacquer', accoutrements: ['ship'],
  },
  {
    name: 'The Jewelled Steward', tradition: 'mughal', skinTone: 'brown', hairStyle: 'short', hairColor: 'black',
    facialHair: 'beard', headwear: 'turban', garment: 'jama', primaryColor: 'ivory', accentColor: 'gold', pose: 'standing',
    heldItem: 'flower', companion: 'none', backdrop: 'gold-leaf', frame: 'gilded', accoutrements: ['pearls', 'coin-purse'],
  },
  {
    name: 'Seonbi at Ease', tradition: 'joseon', skinTone: 'tan', hairStyle: 'topknot', hairColor: 'black',
    facialHair: 'goatee', headwear: 'gat', garment: 'hanbok', primaryColor: 'emerald', accentColor: 'coral', pose: 'standing',
    heldItem: 'brush', companion: 'rabbit', backdrop: 'mountains', frame: 'scroll-mount', accoutrements: ['ledger'],
  },
  {
    name: 'The Night Traveller', tradition: 'venetian', skinTone: 'deep', hairStyle: 'long', hairColor: 'black',
    headwear: 'veil', garment: 'cloak', primaryColor: 'ultramarine', accentColor: 'silver', pose: 'contrapposto',
    heldItem: 'globe', companion: 'none', backdrop: 'loggia', frame: 'ebony', accoutrements: ['lantern', 'ship'],
  },
  {
    name: 'Tea Before Dawn', tradition: 'edo', skinTone: 'olive', hairStyle: 'topknot', hairColor: 'silver',
    headwear: 'eboshi', garment: 'robe', primaryColor: 'ochre', accentColor: 'coral', pose: 'standing',
    heldItem: 'teacup', companion: 'cat', backdrop: 'gold-leaf', frame: 'lacquer', accoutrements: ['hourglass'],
  },
  {
    name: 'Lute in the Garden', tradition: 'florentine', skinTone: 'deep', hairStyle: 'curly', hairColor: 'blue',
    headwear: 'wreath', garment: 'gown', primaryColor: 'emerald', accentColor: 'silver', pose: 'contrapposto',
    heldItem: 'lute', companion: 'rabbit', backdrop: 'garden', frame: 'gilded', accoutrements: [],
  },
  {
    name: 'The Fully Arrived', tradition: 'tudor', skinTone: 'brown', hairStyle: 'shaved', hairColor: 'black',
    facialHair: 'beard', headwear: 'none', garment: 'cloak', primaryColor: 'crimson', accentColor: 'gold', pose: 'hand-on-hip',
    heldItem: 'quill', companion: 'dog', backdrop: 'drapery', frame: 'gilded', accoutrements: Object.keys(ACCOUTREMENTS),
  },
];

export default function AvatarGallery() {
  return (
    <div
      style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 24,
        padding: 24, background: '#f4efe4',
      }}
    >
      {SPECS.map((spec) => (
        <figure key={spec.name} style={{ margin: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AvatarPortrait spec={spec} size={200} />
          <figcaption style={{ fontSize: 11, color: '#5a4a3a', marginTop: 6, textAlign: 'center', fontFamily: 'monospace' }}>
            {spec.tradition} · {spec.garment} · {spec.backdrop} · {spec.frame}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
