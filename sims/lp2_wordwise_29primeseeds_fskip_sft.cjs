'use strict';

/**
 * Exact full-word source gate for every independent p56 prime-totient key
 * start ordinal 0..28, with genuine plaintext-F bypass/no key consumption.
 * Both arithmetic signs admitted independently at each original word.
 * Native-GP words at all original word lengths test the decoder positively.
 * The 2016 signed word/number clue motivates word-index key schedules,
 * but neither that source nor p56 authenticates resets per word.
 * Windows 11 / Node 22, single-file SFT.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const book = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/liber-primus/lp2-transcription.txt');
const dictionary = read('resources/control/english_wordfreq_textblob.txt');
const runeSet = new Set(book.runes);
const words = transcript.replace(/[\/\n%&$§]/g, '').split(/[-.]/)
  .map((word) => [...word].filter((r) => runeSet.has(r))
    .map((r) => book.runes.indexOf(r)))
  .filter((word) => word.length).slice(0, 2896);
const sourceTape = book.pages.filter((p) => p.page <= 55)
  .flatMap((p) => p.indices);
assert.equal(words.length, 2896);
assert.equal(sourceTape.length, 12956);
assert.deepEqual(words.flat(), sourceTape);

const gpTokens = [
  ['ING', 21], ['NG', 21], ['IO', 27],
  ...book.translit.map((s, i) => [s, i]).filter(([s]) => s !== 'IA'),
].sort((a, b) => b[0].length - a[0].length);
/**
 * @param {string} word
 * @returns {number[] | null}
 */
function encodeGp(word) {
  const s = word.toUpperCase().replace(/QU/g, 'CW')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const out = [];
  for (let i = 0; i < s.length;) {
    const token = gpTokens.find(([name]) => s.startsWith(name, i));
    if (!token) return null;
    out.push(token[1]);
    i += token[0].length;
  }
  return out;
}
const lexical = new Set();
const byLength = new Map();
for (const line of dictionary.split(/\r?\n/)) {
  const parsed = /^([a-z]+)\s+(\d+)$/.exec(line);
  if (!parsed) continue;
  const gp = encodeGp(parsed[1]);
  if (!gp || gp.length > 14) continue;
  lexical.add(gp.join(','));
  if (!byLength.has(gp.length)) byLength.set(gp.length, []);
  byLength.get(gp.length).push(gp);
}
assert.equal([...byLength.values()].reduce((s, a) => s + a.length, 0), 29088);

const primes = [];
for (let p = 2; primes.length < 60; p += 1) {
  let prime = true;
  for (let d = 2; d * d <= p; d += 1) {
    if (p % d === 0) { prime = false; break; }
  }
  if (prime) primes.push(p);
}
const mod29 = (x) => (x % 29 + 29) % 29;

/**
 * Exhaust every legal p56 plaintext-F bypass interpretation. Ciphertext F
 * may be an encrypted non-F or a genuine unencrypted F; other ciphertext
 * values MUST consume a key and yield non-F plaintext.
 * @param {number[]} cipher Original rune indices for one printed word
 * @param {1 | -1} sign Encryption additive sign
 * @returns {number} Number of distinct prime-start ordinals yielding at
 * least one exact complete English word under any legal skip mask
 */
function matchingStarts(cipher, sign) {
  let matches = 0;
  for (let start = 0; start < 29; start += 1) {
    let states = [{ plaintext: [], used: 0 }];
    for (const c of cipher) {
      const next = [];
      for (const state of states) {
        if (c === 0) next.push({
          plaintext: [...state.plaintext, 0],
          used: state.used,
        });
        const decoded = mod29(c - sign * (primes[start + state.used] - 1));
        if (decoded !== 0) next.push({
          plaintext: [...state.plaintext, decoded],
          used: state.used + 1,
        });
      }
      states = next;
      if (states.length === 0) break;
    }
    if (states.some((s) => lexical.has(s.plaintext.join(',')))) matches += 1;
  }
  return matches;
}

const outcomes = new Map();
let failPlus = 0;
let failMinus = 0;
for (const word of words) {
  if (!outcomes.has(word.length)) outcomes.set(word.length, {
    length: word.length, original: 0, plus: 0, minus: 0, either: 0,
  });
  const p = matchingStarts(word, 1);
  const m = matchingStarts(word, -1);
  const row = outcomes.get(word.length);
  row.original += 1;
  row.plus += Number(p > 0);
  row.minus += Number(m > 0);
  row.either += Number(p > 0 || m > 0);
  failPlus += Number(p === 0);
  failMinus += Number(m === 0);
}
assert.equal(failPlus, 1869);
assert.equal(failMinus, 1889);
for (let len = 6; len <= 14; len += 1) {
  assert.equal(outcomes.get(len).either, 0);
}

// Complete 12,956-rune positive word-length matched authentic F-transparent
// emitter with a different start ordinal at every word, including F words.
let plantedPlain = 0;
for (let i = 0; i < words.length; i += 1) {
  const pool = byLength.get(words[i].length);
  const plain = pool[(11 * i + 7) % pool.length];
  const start = (7 * i + 2) % 29;
  const cipher = [];
  let consumed = 0;
  for (const p of plain) {
    if (p === 0) cipher.push(0);
    else cipher.push(mod29(p + primes[start + consumed++] - 1));
  }
  assert.ok(matchingStarts(cipher, 1) > 0,
    'The true planted prime index must survive exact F-transparent inversion');
  plantedPlain += plain.length;
}
assert.equal(plantedPlain, 12956);
console.log(JSON.stringify({
  hypothesis: 'p56 phi(prime) full-word clock, 29 arbitrary starts per word and both signs; genuine literal-F bypass',
  inputOriginalRunes: sourceTape.length,
  originalWords: words.length,
  sourceEnglishGpWords: 29088,
  noOriginalEnglishDecoderPlus: failPlus,
  noOriginalEnglishDecoderMinus: failMinus,
  everyOriginalWordLengthSixOrMoreUnmatched: true,
  byLength: [...outcomes.values()].sort((a, b) => a.length - b.length),
  nativeControlGpRuneRecoveries: plantedPlain,
  conclusion: 'Complete per-word reset of the authentic p56 prime-totient cipher to any of the first 29 prime-start ordinals is nonprose under this English register. This does not exclude other starts, changing clocks, or missing segmentation.',
}, null, 2));
