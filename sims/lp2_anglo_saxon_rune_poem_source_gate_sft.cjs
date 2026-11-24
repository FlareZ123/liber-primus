'use strict';

/**
 * Source-specific GP29 / Anglo-Saxon Rune Poem alignment and prime-shift gate.
 * Run from the repository root with Node.js 22:
 *   node sims/lp2_anglo_saxon_rune_poem_source_gate_sft.cjs
 *
 * Fixed source: Bruce Dickins, Runic and Heroic Poems of the Old Teutonic
 * Peoples (Cambridge UP, 1915), "The Anglo-Saxon Rune Poem", pp. 12-23.
 * The 29 rune symbols below are transcribed from the edition's
 * "Anglo-Saxon (a) Runic Poem" alphabet column and poem sequence.
 *
 * The only cipher hypothesis tested is continuous GP29 Vigenere decryption
 * with key[i] = GematriaPrime[i] mod 29, phase zero. No phase/reset/direction
 * sweep is performed. The source selector is independent of LP2 ciphertext.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const raw = read('resources/liber-primus/lp2-transcription.txt');
const donor = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const dictionaryText = read('resources/control/english_wordfreq_textblob.txt');

const sourceRunes = ["ᚠ","ᚢ","ᚦ","ᚩ","ᚱ","ᚳ","ᚷ","ᚹ","ᚻ","ᚾ","ᛁ","ᛄ","ᛇ","ᛈ","ᛉ","ᛋ","ᛏ","ᛒ","ᛖ","ᛗ","ᛚ","ᛝ","ᛟ","ᛞ","ᚪ","ᚫ","ᚣ","ᛡ","ᛠ"];
const stanzaNames = ["Feoh","Ur","Thorn","Os","Rad","Cen","Gyfu","Wenne","Haegl","Nyd","Is","Ger","Eoh","Peorth","Eolh-secg","Sigel","Tir","Beorc","Eh","Mann","Lagu","Ing","Ethel","Daeg","Ac","Aesc","Yr","Iar","Ear"];
const first29Primes = [2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109];

assert.equal(sourceRunes.length, 29);
assert.equal(stanzaNames.length, 29);
assert.deepEqual(corpus.runes, sourceRunes, 'GP29 rune order differs from Dickins 1915 Anglo-Saxon Rune Poem sequence');
assert.deepEqual(corpus.prime, first29Primes, 'Gematria values are not the first 29 primes');
assert.equal(corpus.translit.length, 29);

const key = corpus.prime.map(value => value % 29);
assert.equal(key.length, 29);

const runeId = new Map(corpus.runes.map((rune, index) => [rune, index]));
const pages = raw.split('%').slice(0, 55);
assert.equal(pages.length, 55);

const wordSequences = [];
let currentWord = [];
function finishWord() {
  if (currentWord.length) wordSequences.push(currentWord);
  currentWord = [];
}
for (const character of [...pages.join('%')]) {
  if (runeId.has(character)) currentWord.push(runeId.get(character));
  else if (character === '%' || character === '/' || /\s/u.test(character)) continue;
  else finishWord();
}
finishWord();

const ciphertext = wordSequences.flat();
assert.equal(wordSequences.length, 2896);
assert.equal(ciphertext.length, 12956);

function indexOfCoincidence(symbols) {
  const frequencies = Array(29).fill(0);
  for (const symbol of symbols) frequencies[symbol]++;
  const numerator = frequencies.reduce((sum, count) => sum + count * (count - 1), 0);
  return numerator / (symbols.length * (symbols.length - 1));
}

function decrypt(input, streamKey) {
  return input.map((value, index) =>
    (value - streamKey[index % streamKey.length] + 29) % 29
  );
}

const plaintext = decrypt(ciphertext, key);
let offset = 0;
const decodedWords = wordSequences.map(word => {
  const decoded = plaintext.slice(offset, offset + word.length);
  offset += word.length;
  return decoded;
});
assert.equal(offset, ciphertext.length);

const lexicon = new Set();
const spellings = corpus.translit.map((spelling, index) => [spelling, index]);
spellings.push(['ING', 21], ['IO', 27]);

for (const line of dictionaryText.split(/\r?\n/)) {
  const match = /^([a-z]+)\s+\d+\s*$/.exec(line);
  if (!match) continue;
  const word = match[1].toUpperCase()
    .replace(/QU/g, 'CW')
    .replace(/V/g, 'U')
    .replace(/K/g, 'C')
    .replace(/Z/g, 'S');

  function walk(position, symbols) {
    if (position === word.length) {
      lexicon.add(symbols.join(','));
      return;
    }
    if (symbols.length >= 14) return;
    for (const [token, symbol] of spellings) {
      if (word.startsWith(token, position)) {
        walk(position + token.length, symbols.concat(symbol));
      }
    }
  }
  walk(0, []);
}

const longWords = decodedWords.filter(word => word.length >= 5);
const longHits = longWords.filter(word => lexicon.has(word.join(',')));
const allHits = decodedWords.filter(word => lexicon.has(word.join(',')));
const output = plaintext.map(symbol => corpus.translit[symbol]).join('');
const ioc = indexOfCoincidence(plaintext);

assert.equal(longWords.length, 1132);
assert.equal(longHits.length, 0);
assert.equal(allHits.length, 187);
assert(Math.abs(ioc - 0.034460894) < 1e-9);

/* Native-source positive control for the GP29 Vigenere implementation. */
const donorRunes = donor.sections.flatMap(section =>
  (section.source_text.match(/[ᚠ-᛿]+/gu) || []).flatMap(word =>
    [...word].map(character => runeId.get(character)).filter(Number.isInteger)
  )
);
assert.equal(donorRunes.length, 2979);
const plant = Array.from({length:ciphertext.length}, (_, index) =>
  donorRunes[index % donorRunes.length]
);
const plantedCiphertext = plant.map((value, index) =>
  (value + key[index % key.length]) % 29
);
assert.deepEqual(decrypt(plantedCiphertext, key), plant);

console.log(JSON.stringify({
  source: {
    edition: 'Bruce Dickins, Runic and Heroic Poems of the Old Teutonic Peoples (1915)',
    passage: 'The Anglo-Saxon Rune Poem, pp. 12-23',
    parallelLanguages: ['Old English', 'English'],
    runeOrderExactMatch: true,
    matchedRunes: 29,
    stanzaNames,
    runeSequence: sourceRunes
  },
  gematria: {
    values: corpus.prime,
    vigenereKeyModulo29: key
  },
  original: {
    pages: 55,
    runes: ciphertext.length,
    printedGroups: wordSequences.length,
    continuousPhase: 0,
    period: key.length,
    operation: 'P[i] = C[i] - prime[i mod 29] mod 29',
    ioc: Number(ioc.toFixed(9)),
    dictionaryForms: lexicon.size,
    allDictionaryHits: allHits.length,
    longWordPositions: longWords.length,
    longDictionaryHits: longHits.length,
    outputPrefix240: output.slice(0, 240)
  },
  positiveControl: {
    donorRunes: donorRunes.length,
    plantedRunes: plant.length,
    exactRecovery: true
  }
}, null, 2));
