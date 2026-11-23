'use strict';

/**
 * Source-typed p15 16-cell Fibonacci-prime -> following 16 physical pages
 * using the solved p56 prime-totient additive register.
 * Read-only Windows Node22 SFT: node sims/lp2_p15_16prime_pagekey_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const corpus = JSON.parse(fs.readFileSync(
  path.join(__dirname, '..', 'resources', 'liber-primus', 'lp2-corpus.json'), 'utf8'
));
assert.equal(corpus.schema, 1);
assert.equal(corpus.pages.length, 58);
assert.equal(corpus.translit.length, 29);

const spiralNumbers = [
  3299, 3298, 3296, 3294, 3288, 3278, 3258, 3222,
  3152, 3038, 2838, 2472, 1820, 708, 1206, 4516
];
// Distinct Fibonacci ordinal + 1, converted from 1-based to 0-based prime positions.
const starts = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];
const primes = [];
for (let n = 2; primes.length < 2000; ++n) {
  if (primes.every((p) => p * p > n || n % p !== 0)) primes.push(n);
}
for (let i = 0; i < 16; ++i) {
  assert.equal(Math.abs(3301 - primes[starts[i]]), spiralNumbers[i], 'p15 source numeric identity');
}
assert.deepEqual(starts.map((i) => primes[i]),
  [2, 3, 5, 7, 13, 23, 43, 79, 149, 263, 463, 829, 1481, 2593, 4507, 7817]);

/** @param {number[]} tape @param {number} start @param {-1 | 1} sign */
function decode(tape, start, sign) {
  return tape.map((c, i) => {
    assert.ok(Number.isInteger(c) && c >= 0 && c < 29);
    return (c + sign * ((primes[start + i] - 1) % 29) + 29) % 29;
  });
}

/** @param {number[]} tape @param {number} start @param {-1 | 1} sign */
function encode(tape, start, sign) {
  return decode(tape, start, sign === -1 ? 1 : -1);
}

/** @param {number[]} tape */
function ioc(tape) {
  const count = Array(29).fill(0);
  for (const x of tape) count[x]++;
  return count.reduce((s, n) => s + n * (n - 1), 0) /
    (tape.length * (tape.length - 1));
}

/** @param {number[]} tape */
function latin(tape) {
  return tape.map((i) => corpus.translit[i]).join('');
}

// Authentic solved-page positive control: the fixed p56 prime/totient
// direct stream recovers the first 55 known GP29 runes before the first
// actual plaintext F. The separate exhaustive F-transparent test below
// covers every literal-F branch of the genuine p56 mode.
const known = 'ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTY';
const actual = latin(decode(corpus.pages[56].indices.slice(0, 55), 0, -1));
assert.equal(actual, known, 'authentic known p56 control');
console.log('PASS known solved p56 direct register, first 55 runes:', actual);

const native = corpus.pages[57].indices;
let allLength = 0;
const score = { '-1': [], '1': [] };
for (let j = 0; j < 16; j++) {
  const page = corpus.pages[16 + j], C = page.indices, start = starts[j];
  assert.equal(page.status, 'unsolved');
  assert.equal(C.length, page.runic_count);
  allLength += C.length;
  const planted = Array.from({ length: C.length }, (_, i) => native[i % native.length]);
  for (const sign of /** @type {Array<-1 | 1>} */ ([-1, 1])) {
    const P = decode(C, start, sign);
    assert.deepEqual(encode(P, start, sign), C, 'exact original round trip');
    const plantCipher = encode(planted, start, sign);
    assert.deepEqual(decode(plantCipher, start, sign), planted, 'native GP solved-page plant');
    const value = ioc(P);
    score[String(sign)].push(value);
    assert.ok(value < 0.04, 'unexpected native-GP language signal; investigate');
  }
  console.log(
    'p' + page.page,
    'len=' + C.length,
    'start_prime=' + primes[start],
    'sub=' + score['-1'].at(-1).toFixed(8),
    'add=' + score['1'].at(-1).toFixed(8)
  );
}
assert.equal(allLength, 4077);
console.log('PASS complete p16..p31 original GP29 4077-rune inversion and re-encryption');
for (const [sign, values] of Object.entries(score)) {
  console.log('SIGN', sign, 'range', Math.min(...values), Math.max(...values));
}
console.log('No original unknown plaintext, no authenticated 16-page selector; direct transfer rejected.');


/**
 * In the authentic solved p56 plaintext-F-transparent mode, an actual P=F
 * is copied as literal C=F and consumes no prime. At C=F the inverse
 * branches across both valid histories. No cryptanalytic model fitting.
 * @param {number[]} tape
 * @param {number} start
 * @param {-1 | 1} sign
 * @returns {{ survivors: number, ways: number, impossibleAt: number | null }}
 */
function fTransparentStates(tape, start, sign) {
  /** @type {Map<number,number>} consumedPrimeCount => possible histories */
  let states = new Map([[0, 1]]);
  for (let i = 0; i < tape.length; i++) {
    const c = tape[i];
    /** @type {Map<number,number>} */
    const next = new Map();
    for (const [used, ways] of states) {
      const key = (primes[start + used] - 1) % 29;
      // Non-F plaintext must use the additive key and consumes one prime.
      const p = (c + sign * key + 29) % 29;
      if (p !== 0) next.set(used + 1, (next.get(used + 1) || 0) + ways);
      // Literal plaintext-F is possible ONLY at ciphertext F and does not
      // consume a key element. This is a separate genuine inverse branch.
      if (c === 0) next.set(used, (next.get(used) || 0) + ways);
    }
    states = next;
    if (states.size === 0) return { survivors: 0, ways: 0, impossibleAt: i };
  }
  return {
    survivors: states.size,
    ways: [...states.values()].reduce((sum, count) => sum + count, 0),
    impossibleAt: null
  };
}

/** @param {number[]} tape @param {number} start @param {-1 | 1} sign */
function encryptFTransparent(tape, start, sign) {
  let used = 0;
  return tape.map((p) => {
    if (p === 0) return 0;
    const c = (p - sign * ((primes[start + used] - 1) % 29) + 29) % 29;
    used++;
    return c;
  });
}

// Independent authentic full-p56 known-plaintext control from
// sims/authentic_lp2_p56_totient_regression.cjs. This includes the genuine
// literal plaintext F at the historical third ciphertext-F position.
/** @param {string} phrase */
function parseKnownGp(phrase) {
  const longestFirst = corpus.translit.map((token, index) => ({ token, index }))
    .sort((a, b) => b.token.length - a.token.length);
  const knownIndices = [];
  for (const word of phrase.split(' ')) {
    for (let i = 0; i < word.length;) {
      const match = longestFirst.find(({ token }) => word.startsWith(token, i));
      assert.ok(match, 'Unexpected known GP source spelling');
      knownIndices.push(match.index);
      i += match.token.length;
    }
  }
  return knownIndices;
}
const fullSolvedWords = 'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const fullSolved = parseKnownGp(fullSolvedWords);
assert.equal(fullSolved.length, 85);
assert.deepEqual(encryptFTransparent(fullSolved, 0, -1),
  corpus.pages[56].indices, 'authentic complete solved-p56 encryption, exact F bypass');
console.log('PASS 85/85 authentic known p56 plaintext with genuine nonconsuming F rule');

const solvedF = fTransparentStates(corpus.pages[56].indices, 0, -1);
assert.ok(solvedF.survivors > 0, 'authentic solved p56 mode must survive');
console.log('PASS full original p56 F-transparent path count:', solvedF);

const contradictionRows = [];
for (let j = 0; j < 16; j++) {
  const C = corpus.pages[16 + j].indices;
  const nativePlant = Array.from({ length: C.length }, (_, i) => native[i % native.length]);
  const start = starts[j];
  const row = { page: 16 + j, seed: primes[start] };
  for (const sign of /** @type {Array<-1 | 1>} */ ([-1, 1])) {
    const original = fTransparentStates(C, start, sign);
    assert.equal(original.survivors, 0, 'source p15 native F rule must be impossible');
    assert.ok(original.impossibleAt !== null && original.impossibleAt < C.length);
    const plantedCipher = encryptFTransparent(nativePlant, start, sign);
    assert.ok(fTransparentStates(plantedCipher, start, sign).survivors > 0,
      'authentic solved p57 F-transparent plant must survive');
    row[sign === -1 ? 'subtractFirstImpossible' : 'addFirstImpossible'] = original.impossibleAt;
  }
  contradictionRows.push(row);
}
console.log('PASS key-mask-exhaustive genuine F-transparent original gate (0-based):');
for (const row of contradictionRows) console.log(row);
console.log('ALL 32 p15-page prime seeds/signs have ZERO legal F-transparent plaintext histories.');
