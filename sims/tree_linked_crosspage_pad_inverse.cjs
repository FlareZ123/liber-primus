'use strict';
/**
 * Direct source-image-linked ciphertext-as-key hypothesis.
 *
 * LP2 original 49.jpg (physical page 32) and 72.jpg (physical page 55)
 * carry the same tree silhouette; test whether the former page's rune stream
 * directly masks the latter, preserving the latter's actual word boundaries.
 * For each eligible source page, try both additive signs, both directions,
 * and 46 evenly spaced offsets. This is a source-limited, reversible gate.
 *
 * Train the GP rune word-local trigram scorer on the supplied 300k-character
 * Shakespeare control; reproduce an authentic-language planted p55 text
 * using the page32 key before interpreting any real scores.
 *
 * Run: node sims/tree_linked_crosspage_pad_inverse.cjs
 * Only Node.js built-ins. No plaintext recovery is claimed.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..');
/** @param {string} name @returns {string} */
const read = name => fs.readFileSync(path.join(ROOT, name), 'utf8');
const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcription = read('resources/lp2-transcription.txt');
const shakespeare = read('resources/control/shakespeare_first300k.txt');
const translit = new Map(corpus.translit.map((token, i) => [token, i]));
const runeID = new Map(corpus.runes.map((token, i) => [token, i]));
const ALPHABET = 29, BOS = 29, CONTEXTS = 30 * 30;

/** @param {string} source @returns {number[] | null} */
function encode(source) {
  const word = source.toUpperCase()
    .replace(/QU/g, 'CW').replace(/V/g, 'U')
    .replace(/K/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < word.length;) {
    const dg = translit.get(word.slice(i, i + 2));
    if (dg !== undefined) { out.push(dg); i += 2; }
    else {
      const glyph = translit.get(word[i]);
      if (glyph === undefined) return null;
      out.push(glyph); i++;
    }
  }
  return out;
}

/** @param {number[][]} words */
function makeLanguage(words) {
  const counts = Array.from({length: CONTEXTS},
    () => new Uint32Array(ALPHABET));
  const totals = new Uint32Array(CONTEXTS);
  const firstCounts = Array(ALPHABET).fill(1);
  for (const word of words) {
    let p = BOS, q = BOS;
    for (const x of word) {
      firstCounts[x]++;
      const j = p * 30 + q;
      counts[j][x]++; totals[j]++;
      p = q; q = x;
    }
  }
  const den = firstCounts.reduce((a,b) => a + b, 0);
  const weight = firstCounts.map(x => x / den);
  const alpha = 10;
  return Array.from({length: CONTEXTS}, (_, j) =>
    Array.from({length: ALPHABET}, (_, x) =>
      Math.log((counts[j][x] + alpha * weight[x]) /
        (totals[j] + alpha))));
}

/**
 * @param {number[]} plaintext
 * @param {number[]} lengths
 * @param {number[][]} logProb
 * @returns {number}
 */
function wordLocalTrigram(plaintext, lengths, logProb) {
  let pos = 0, sum = 0;
  for (const length of lengths) {
    let p = BOS, q = BOS;
    for (let i = 0; i < length; i++) {
      const x = plaintext[pos++];
      sum += logProb[p * 30 + q][x];
      p = q; q = x;
    }
  }
  assert.equal(pos, plaintext.length);
  return sum;
}

/**
 * @param {number[]} target
 * @param {Array<{page:number,indices:number[]}>} sources
 * @param {number[]} lengths
 * @param {number[][]} language
 */
function scan(target, sources, lengths, language) {
  const output = [];
  for (const {page, indices: key} of sources) {
    let best = {page, score: -Infinity, offset: -1, sign: 0, reversed: false};
    const offMax = key.length - target.length;
    for (let v = 0; v < 46; v++) {
      const offset = Math.round(v * offMax / 45);
      for (const reversed of [false, true])
        for (const sign of [-1, 1]) {
          const candidate = target.map((value, i) => (value + 29 + sign *
            key[reversed ? key.length - 1 - (offset + i) : offset + i]) % 29);
          const score = wordLocalTrigram(candidate, lengths, language);
          if (score > best.score) best = {
            page, offset, sign, reversed, score,
            preview: candidate.slice(0,24).map(x => corpus.translit[x]).join('')
          };
        }
    }
    output.push(best);
  }
  return output.sort((a,b) => b.score - a.score);
}

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x = seed >>> 0;
  return () => {x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return x >>> 0;};
}

function main() {
  const words = (shakespeare.toUpperCase().match(/[A-Z]+/g) || [])
    .map(encode).filter(w => w !== null && w.length > 0);
  const model = makeLanguage(words);
  const real = corpus.pages.find(p => p.page === 55).indices;
  const treeKey = corpus.pages.find(p => p.page === 32).indices;
  const p55Tokens = transcription.split('%')[54]
    .split(/[-./\s$&§]+/u)
    .map(s => [...s].filter(ch => runeID.has(ch))
      .map(ch => runeID.get(ch)))
    .filter(w => w.length);
  const lengths = p55Tokens.map(w => w.length);
  assert.equal(real.length, 76);
  assert.deepEqual(p55Tokens.flat(), real);
  assert.deepEqual(lengths,
    [1,4,2,2,6,6,2,1,12,6,4,2,7,7,2,4,2,3,3]);
  assert.equal(treeKey.length, 121);
  assert.equal(words.length, 55407);
  assert.equal(words.reduce((n,w) => n + w.length, 0), 218800);
  const sources = corpus.pages.filter(p => p.page !== 55 &&
    p.indices.length >= 121);
  assert.equal(sources.length, 52);

  const actual = scan(real, sources, lengths, model);
  const tree = actual.find(r => r.page === 32);
  const positiveWords = new Map();
  for (const w of words) {
    if (!positiveWords.has(w.length)) positiveWords.set(w.length, []);
    positiveWords.get(w.length).push(w);
  }
  const random = rng(0x5a3301);
  const plain = lengths.flatMap(n => {
    const pool = positiveWords.get(n);
    assert.ok(pool.length);
    return pool[random() % pool.length];
  });
  const synthetic = plain.map((x,i) => (x + treeKey[17 + i]) % ALPHABET);
  const control = scan(synthetic, sources, lengths, model);
  const recovered = control.find(r => r.page === 32);
  assert.equal(control[0].page, 32);
  assert.equal(recovered.offset, 17);
  assert.equal(recovered.sign, -1);
  assert.equal(recovered.reversed, false);
  assert.ok(Math.abs(recovered.score -
    wordLocalTrigram(plain, lengths, model)) < 1e-9);

  return {
    hypothesis: 'Tree-linked p32 stream as direct additive GP29 key for p55',
    source: {
      pages: [32,55], targetRunes: real.length, targetWords: lengths.length,
      referenceWords: words.length, referenceRunes: 218800,
      sha256: crypto.createHash('sha256')
        .update(transcription).digest('hex')
    },
    search: {
      sourcePages: sources.length, offsetsPerPage: 46, signs: 2,
      directions: 2, totalCandidates: sources.length * 46 * 4
    },
    real: {
      tree, rank: actual.indexOf(tree) + 1,
      top: actual.slice(0, 8), medianScore: actual[26].score,
      interpretation: 'No readable GP-English plaintext was recovered'
    },
    positive: {
      seed: '0x5a3301', treeKeyOffset: 17,
      truePlaintextScore: wordLocalTrigram(plain, lengths, model),
      selected: recovered, rank: control.indexOf(recovered) + 1,
      matchedExactPlantedSourceAndOffset: true
    }
  };
}
if (require.main === module)
  console.log(JSON.stringify(main(), null, 2));
module.exports = {encode, makeLanguage, wordLocalTrigram, scan, main};
