'use strict';

/**
 * Exhaustive word-local mixture of source-authentic Cicada GP29 methods.
 * Node.js 22 single runnable test, read-only, no third-party dependencies.
 * Run from the repository root:
 *   node sims/lp2_wordlocal_known_method_mixture_sft.cjs
 *
 * Decision: can a secret selector choose one of six already-solved methods
 * independently for each original printed word and produce native GP English?
 * The complete 29-rune input, original word segmentation, and source-native
 * lexical targets remain unchanged. This is a finite dictionary test, not a
 * universal mathematical exclusion of all English words or other ciphers.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/** @param {string} p Repository-relative source pathname. @returns {string} */
function read(p) {
  return fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
}

const corpus = JSON.parse(read('resources/liber-primus/lp2-corpus.json'));
const transcript = read('resources/lp2-transcription.txt');
const native = JSON.parse(read('resources/external/relikd-solved-gp29-native-v1.json'));
const alphabet = corpus.translit;
const runeIndex = new Map(corpus.runes.map((r, i) => [r, i]));
const digraphs = ['TH', 'NG', 'EO', 'OE', 'AE', 'IA', 'EA'];
const methods = ['direct', 'atbash', 'atbash-plus3', 'divinity', 'circumference', 'prime-totient'];

/** @param {number} n GP index or arithmetic value. @returns {number} */
function mod(n) { return ((n % 29) + 29) % 29; }

/**
 * Source-calibrated GP spelling, with 2014 Cicada's canonical replacements.
 * @param {string} raw One source-language word.
 * @returns {number[] | null}
 */
function encode(raw) {
  const s = raw.toUpperCase()
    .replace(/QU/g, 'CW').replace(/ING/g, 'NG')
    .replace(/V/g, 'U').replace(/[KQ]/g, 'C').replace(/Z/g, 'S');
  const output = [];
  for (let i = 0; i < s.length;) {
    const unit = digraphs.find(x => s.startsWith(x, i)) || s[i];
    const digit = alphabet.indexOf(unit);
    if (digit < 0) return null;
    output.push(digit);
    i += unit.length;
  }
  return output;
}

/** @param {number[]} xs GP values. @returns {string} */
function spell(xs) { return xs.map(x => alphabet[x]).join(''); }

/** @param {number} count Number of needed prime steps. @returns {number[]} */
function primeTotients(count) {
  const primes = [];
  for (let n = 2; primes.length < count; n++) {
    let isPrime = true;
    for (let d = 2; d * d <= n; d++) {
      if (n % d === 0) { isPrime = false; break; }
    }
    if (isPrime) primes.push(mod(n - 1));
  }
  return primes;
}

const key = [encode('DIVINITY'), encode('FIRFUMFERENFE'), primeTotients(130)];
assert(key[0] && key[1]);
assert.deepEqual(key[0], [23, 10, 1, 10, 9, 10, 16, 26]);

// The historical transcript omits rune-free physical p50. The 55 original
// nonempty unsolved pages are the first 55 '%' segments, not the first 56.
const source = transcript.split('%').slice(0, 55).join('').replace(/[/\s]/g, '');
const originalWords = source.split(/[-.&$§]+/).filter(Boolean)
  .filter(w => [...w].every(r => runeIndex.has(r)))
  .map(w => [...w].map(r => runeIndex.get(r)));
const originalRunes = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
assert.equal(originalWords.length, 2896);
assert.equal(originalRunes.length, 12956);
assert.deepEqual(originalWords.flat(), originalRunes);

// Three independently stored public-domain literary/author control sources and
// the separately stored solved LP1 editor reference. The exact native GP
// originals of nine solved sections supplement editorial Latin normalizations.
const sources = [
  'resources/control/shakespeare_first300k.txt',
  'resources/control/gibran_prophet_58585.txt',
  'resources/control/emerson_essays_2944.txt',
  'resources/liber-primus/lp1-plaintext-reference.txt',
];
const lexicon = new Set();
for (const sourcePath of sources) {
  const rawWords = read(sourcePath).match(/[A-Za-z]+/g) || [];
  for (const w of rawWords) {
    const encoded = encode(w);
    if (encoded) lexicon.add(encoded.join(','));
  }
}
const nativeRunePattern = new RegExp('[^' + corpus.runes.join('') + ']+');
for (const record of native.sections) {
  for (const word of record.source_text.split(nativeRunePattern).filter(Boolean)) {
    lexicon.add([...word].map(r => runeIndex.get(r)).join(','));
  }
}
assert.equal(lexicon.size, 12314);

const byLength = new Map();
for (const s of lexicon) {
  const w = s.split(',').map(Number);
  const pool = byLength.get(w.length) || [];
  pool.push(w);
  byLength.set(w.length, pool);
}

/**
 * Decrypt one printed word. For keyed methods, all possible literal-plaintext-F
 * skip histories are kept; a ciphertext F can also be an encrypted non-F.
 * @param {number[]} cipher An original or planted ciphertext word.
 * @param {number} method One of six authentic operations (index 0 through 5).
 * @param {number} phase Initial key cursor, applied only to keyed methods.
 * @param {boolean} bypass If true, apply authentic plaintext-F transparent rule.
 * @returns {number[][]} Every legal complete plaintext output.
 */
function decode(cipher, method, phase = 0, bypass = false) {
  if (method === 0) return [cipher.slice()];
  if (method === 1) return [cipher.map(v => 28 - v)];
  if (method === 2) return [cipher.map(v => mod(31 - v))];

  const k = key[method - 3];
  let states = [{clock: phase, output: []}];
  for (const c of cipher) {
    const next = [];
    for (const state of states) {
      if (bypass && c === 0) {
        next.push({clock: state.clock, output: [...state.output, 0]});
      }
      const p = mod(c - k[state.clock % k.length]);
      if (!bypass || p !== 0) {
        next.push({clock: state.clock + 1, output: [...state.output, p]});
      }
    }
    states = next;
  }
  return states.map(state => state.output);
}

/**
 * Forward cipher with historically correct plaintext-F transparency.
 * @param {number[]} plain GP29 plaintext word.
 * @param {number} method Six-method index.
 * @returns {number[]} Cipher symbols.
 */
function encrypt(plain, method) {
  if (method === 0) return plain.slice();
  if (method === 1) return plain.map(v => 28 - v);
  if (method === 2) return plain.map(v => mod(31 - v));
  const k = key[method - 3];
  let clock = 0;
  return plain.map(p => {
    if (p === 0) return 0;
    const c = mod(p + k[clock % k.length]);
    clock++;
    return c;
  });
}

/** @param {number[][]} outputs Possible clearwords. @returns {number[][]} */
function lexical(outputs) { return outputs.filter(w => lexicon.has(w.join(','))); }

// The exact original p56 is the genuine 85-rune prime/totient cipher positive,
// with its sole actual transparent F at original offset 56.
const p56 = corpus.pages.find(p => p.page === 56).indices;
assert.equal(p56.length, 85);
let consumed = 0;
const solvedP56 = p56.map((c, i) => {
  if (i === 56) { assert.equal(c, 0); return 0; }
  const p = mod(c - key[2][consumed++]);
  assert.notEqual(p, 0);
  return p;
});
assert.equal(consumed, 84);
assert(spell(solvedP56).startsWith('ANENDWITHINTHEDEEPWEB'));

// Verify the exact inverse for every source-length word in a synthetic mixed
// manuscript, without leaking the planted word identities to the decoder.
let plantedCount = 0;
let plantedFCases = 0;
const eligible = originalWords.filter(w => w.length >= 5);
for (let i = 0; i < eligible.length; i++) {
  const length = eligible[i].length;
  const pool = byLength.get(length);
  assert(pool && pool.length > 0, 'missing positive word length ' + length);
  const clear = pool[(73 * i) % pool.length];
  const method = i % methods.length;
  const crypt = encrypt(clear, method);
  const recovered = decode(crypt, method, 0, method >= 3);
  assert(recovered.some(w => w.join(',') === clear.join(',')));
  assert(lexical(recovered).length > 0);
  if (method >= 3 && clear.includes(0)) plantedFCases++;
  plantedCount++;
}

const exact = [];
const allPhase = [];
let exactEligibleMatched = 0;
let allPhaseEligibleMatched = 0;
const allPhaseExamples = [];
for (let length = 3; length <= 14; length++) {
  const selected = originalWords.filter(w => w.length === length);
  if (!selected.length) continue;
  const count = Array(6).fill(0);
  const bypassCount = Array(3).fill(0);
  let any = 0;
  let phaseAny = 0;

  for (const cipher of selected) {
    let matched = false;
    let phaseMatched = false;
    for (let method = 0; method < 6; method++) {
      const output = decode(cipher, method);
      if (lexical(output).length) {
        count[method]++;
        matched = true;
      }
      if (method >= 3) {
        if (lexical(decode(cipher, method, 0, true)).length) {
          bypassCount[method - 3]++;
          matched = true;
        }
      }
    }
    // Allow every legal key rotation and every possible transparent-F branch.
    // All-phase control is defined only for the two repeated historical keys.
    for (const method of [3, 4]) {
      for (let phase = 0; phase < key[method - 3].length; phase++) {
        for (const bypass of [false, true]) {
          const outputs = lexical(decode(cipher, method, phase, bypass));
          if (outputs.length && length >= 5 && allPhaseExamples.length < 10) {
            allPhaseExamples.push({
              length, cipher: spell(cipher), method: methods[method],
              phase, bypass, plaintext: spell(outputs[0]),
            });
          }
          if (outputs.length) phaseMatched = true;
        }
      }
    }
    if (matched) any++;
    if (phaseMatched || matched) phaseAny++;
  }
  exact.push({length, n: selected.length, directOrKeyedAny: any, byMethod: count, fBypassByKey: bypassCount});
  allPhase.push({length, n: selected.length, anyIncludingEveryPhase: phaseAny});
  if (length >= 5) {
    exactEligibleMatched += any;
    allPhaseEligibleMatched += phaseAny;
  }
}
assert.equal(eligible.length, 1132);
assert.equal(plantedCount, eligible.length);
assert.equal(exactEligibleMatched, 0);
assert.equal(allPhaseEligibleMatched, 1);
assert(allPhaseExamples.some(x => x.plaintext === 'FLAGS' && x.method === 'divinity' && x.phase === 3 && !x.bypass));
assert(allPhaseExamples.every(x => x.length === 5));

console.log(JSON.stringify({
  originalRunes: originalRunes.length,
  originalWords: originalWords.length,
  nativeLexiconSize: lexicon.size,
  historicMethods: methods,
  exact,
  allPhase,
  eligibleLengthAtLeast5: eligible.length,
  exactEligibleMatched,
  allPhaseEligibleMatched,
  allPhaseExamples,
  positives: {genuineP56: solvedP56.length, knownTotientConsumed: consumed, mixedSourceShaped: plantedCount, withExplicitFBypass: plantedFCases},
}, null, 2));
