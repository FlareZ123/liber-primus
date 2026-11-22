'use strict';
/**
 * Exact page-local inverse for the authentic p56 prime/totient cipher, followed
 * by the source-motivated but unverified second and third Euler iterations.
 *
 * All original LP2 p0..p55 indices are unchanged. Ciphertext F may be either
 * literal plaintext F (no key consumption) or encrypted non-F; ALL branches
 * are tracked without heuristics. A non-F ciphertext always consumes key and
 * can never decode to plaintext F.
 *
 * Windows: node sims/lp2_prime_iterated_totient_ftransparent_original_sft.cjs
 * Dependencies: Node.js >= 18 built-ins only.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const corpus = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '..', 'resources/liber-primus/lp2-corpus.json'),
  'utf8'
));
const original = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
assert.equal(original.length, 55);
assert.equal(original.reduce((s, p) => s + p.indices.length, 0), 12956);
const mod = n => ((n % 29) + 29) % 29;

/** @param {number} count @returns {number[]} */
function firstPrimes(count) {
  const result = [];
  for (let p = 2; result.length < count; p++) {
    let isPrime = true;
    for (let f = 2; f * f <= p; f++) {
      if (p % f === 0) { isPrime = false; break; }
    }
    if (isPrime) result.push(p);
  }
  return result;
}

/** @param {number} value @returns {number} */
function phi(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 1);
  let n = value, out = value;
  for (let f = 2; f * f <= n; f++) {
    if (n % f === 0) {
      out = (out / f) * (f - 1);
      while (n % f === 0) n /= f;
    }
  }
  if (n > 1) out = (out / n) * (n - 1);
  return out;
}
const primes = firstPrimes(300);
const keys = {
  1: primes.map(p => (p - 1) % 29),
  2: primes.map(p => phi(p - 1) % 29),
  3: primes.map(p => phi(phi(p - 1)) % 29)
};

/**
 * Encode already normalized solved p56 words. Tokenization resets at actual
 * word boundaries: otherwise final TH + next A can falsely make one digraph.
 * @param {string} text @returns {number[]}
 */
function toGpWords(text) {
  const tokens = corpus.translit.map((token, value) => ({token, value}))
    .sort((a, b) => b.token.length - a.token.length);
  const out = [];
  for (const word of text.split(' ')) {
    for (let i = 0; i < word.length;) {
      const candidate = tokens.find(({token}) => word.startsWith(token, i));
      assert.ok(candidate, 'Unknown GP grapheme: ' + word.slice(i));
      out.push(candidate.value);
      i += candidate.token.length;
    }
  }
  return out;
}

/**
 * The known p56 forward operation, with literal plaintext F bypass.
 * @param {number[]} plain @param {number[]} key
 * @returns {{cipher:number[],used:number,literalF:number[]}}
 */
function encrypt(plain, key) {
  let used = 0;
  const literalF = [];
  const cipher = plain.map((p, index) => {
    if (p === 0) { literalF.push(index); return 0; }
    return mod(p + key[used++]);
  });
  return {cipher, used, literalF};
}

/**
 * Exactly enumerate every legal distinct transparent-F choice using cursor
 * states. Counts are BigInt, not floating-point approximations. A witness is
 * retained only for surviving states.
 *
 * @param {number[]} cipher @param {number[]} key
 * @returns {{complete:boolean,deadAt:number|null,paths:bigint,states:number,witness:number[]|null}}
 */
function allInverses(cipher, key) {
  /** @type {Map<number,{paths:bigint,witness:number[]}>} */
  let states = new Map([[0, {paths: 1n, witness: []}]]);
  for (let i = 0; i < cipher.length; i++) {
    const c = cipher[i];
    /** @type {Map<number,{paths:bigint,witness:number[]}>} */
    const next = new Map();
    /** @param {number} cursor @param {bigint} count @param {number[]} witness */
    function add(cursor, count, witness) {
      const old = next.get(cursor);
      if (old) old.paths += count;
      else next.set(cursor, {paths: count, witness});
    }
    for (const [cursor, {paths, witness}] of states) {
      assert.ok(cursor < key.length, 'Prime key array too short');
      if (c === 0) add(cursor, paths, witness.concat([0]));
      const p = mod(c - key[cursor]);
      if (p !== 0) add(cursor + 1, paths, witness.concat([p]));
    }
    if (!next.size) {
      return {complete: false, deadAt: i, paths: 0n,
        states: 0, witness: null};
    }
    states = next;
  }
  let paths = 0n, witness = null;
  for (const row of states.values()) {
    paths += row.paths;
    witness ??= row.witness;
  }
  return {complete: true, deadAt: null, paths,
    states: states.size, witness};
}

/* Exact authenticated solved-p56 forward plant, including transparent F. */
const knownP56 = corpus.pages.find(p => p.page === 56).indices;
const solvedWords =
  'AN END WITHIN THE DEEP WEB THERE EXISTS A PAGE THAT HASHES TO ' +
  'IT IS THE DUTY OF EUERY PILGRIM TO SEEC OUT THIS PAGE';
const knownPlain = toGpWords(solvedWords);
assert.equal(knownPlain.length, 85);
assert.equal(knownP56.length, 85);
const solvedForward = encrypt(knownPlain, keys[1]);
assert.deepEqual(solvedForward.literalF, [56]);
assert.equal(solvedForward.used, 84);
assert.deepEqual(solvedForward.cipher, knownP56);
assert.equal(allInverses(knownP56, keys[1]).complete, true);

/* Original full-page decipherment, new page -> first prime p=2 each time. */
const expected = {
  1: {possible: [1, 49], firstDead: 235},
  2: {possible: [43, 51, 53, 55], firstDead: 239,
    paths: {'43': '1', '51': '4', '53': '4', '55': '3'}},
  3: {possible: [0, 55]}
};
const outcomes = [];
for (const iteration of [1, 2, 3]) {
  const pages = original.map(page => ({
    page: page.page, runes: page.indices.length,
    ...allInverses(page.indices, keys[iteration])
  }));
  const possible = pages.filter(p => p.complete).map(p => p.page);
  assert.deepEqual(possible, expected[iteration].possible);
  if (expected[iteration].firstDead !== undefined) {
    assert.equal(pages[0].deadAt, expected[iteration].firstDead);
  }
  for (const [number, paths] of Object.entries(expected[iteration].paths || {})) {
    const result = pages.find(p => p.page === Number(number));
    assert.ok(result);
    assert.equal(String(result.paths), paths);
  }
  for (const page of pages.filter(p => p.complete)) {
    const forward = encrypt(page.witness, keys[iteration]);
    const actual = original.find(p => p.page === page.page).indices;
    assert.deepEqual(forward.cipher, actual);
  }
  outcomes.push({
    iteration,
    candidateKey: iteration === 1 ? 'phi(prime_i)'
      : iteration === 2 ? 'phi(phi(prime_i))' : 'phi(phi(phi(prime_i)))',
    eligibleRunePages: pages.length,
    mathematicallyPossiblePages: possible,
    mathematicallyImpossiblePages: pages.length - possible.length,
    p0FirstDeadZeroBased: pages[0].deadAt,
    survivingPaths: pages.filter(p => p.complete).map(p => ({
      page: p.page, length: p.runes, distinctFChoices: String(p.paths),
      first12Gp: p.witness.slice(0, 12).map(i => corpus.translit[i]).join(' ')
    }))
  });
}
console.log(JSON.stringify({
  claim: 'Page-start p=2 direct GP29 transparent-F prime-totient iterates do NOT decipher all original LP2 pages.',
  source: 'resources/liber-primus/lp2-corpus.json',
  originalRunes: 12956,
  solvedP56ExactForwardMatch: true,
  solvedP56LiteralFOffset: 56,
  solvedP56PrimeKeysConsumed: 84,
  iterationExperiments: outcomes,
  boundary: 'No result rules out other prime clocks, preprocessing, key sources or ciphertext-to-plaintext mechanisms.'
}, null, 2));
