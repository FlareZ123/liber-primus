'use strict';

/**
 * Source-derived SW -> p49-p51 southwest base-60 value 113 -> GP prime30.
 * Reproduce original byte graph and directly transplant the solved p56
 * prime-totient / plaintext-F bypass, without fitting new ciphertext.
 *
 * Read-only Windows Node.js 22 SFT:
 *   node sims/lp2_cuneiform_sw_113_prime30_original_sft.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
/** @param {string} file */
const get = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const book = JSON.parse(get('resources/liber-primus/lp2-corpus.json'));
const panel = JSON.parse(get('resources/liber-primus/lp2-grid-256.json'));
const physical = get('resources/liber-primus/lp2-transcription.txt').split('%');
/** @param {number} n */
const mod29 = (n) => (n % 29 + 29) % 29;
/** @param {number} n */
function primeQ(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}
const alphabet = panel.alphabet;
assert.equal(alphabet.length, 60);
const tokens = panel.pages.flatMap((p) => p.tokens);
const bytes = tokens.map((t) => 60 * alphabet.indexOf(t[0]) + alphabet.indexOf(t[1]));
assert.equal(tokens.length, 256);
assert(bytes.every((x) => x >= 0 && x < 256));
assert.deepEqual(bytes, panel.bytes);
assert.equal(physical[39].trimStart().slice(0, 3), 'ᛋᚹ-');
assert.deepEqual(book.pages.find((p) => p.page === 39).indices.slice(0, 2), [15, 7]);
const corners = [
  {name: 'NW', index: 0},
  {name: 'NE', index: 7},
  {name: 'SW', index: 248},
  {name: 'SE', index: 255}
].map((p) => ({
  ...p, token: tokens[p.index], value: bytes[p.index],
  prime: primeQ(bytes[p.index])
}));
assert.deepEqual(corners.map((p) => p.value), [203, 183, 113, 80]);
assert.deepEqual(corners.map((p) => p.prime), [false, false, true, false]);
assert.equal(book.prime.length, 29);
assert.deepEqual(book.prime.slice(-3), [103, 107, 109]);
assert(primeQ(113) && ![110, 111, 112].some(primeQ));
assert.equal(60 * alphabet.indexOf('1') + alphabet.indexOf('r'), 113);
const reduced59 = alphabet.replace('f', '');
assert.equal(59 * reduced59.indexOf('1') + reduced59.indexOf('r'), 111);

// Functional graph of the original 256-cell table when values are cell indices.
// The algorithm itself is exploratory and is NOT established as a Cicada clue.
/** @param {number} start */
function walkGraph(start) {
  const where = new Map();
  const address = [];
  let p = start;
  while (!where.has(p)) {
    where.set(p, address.length);
    address.push(p);
    p = bytes[p];
  }
  return {addresses: address, transient: where.get(p),
    cycle: address.slice(where.get(p))};
}
const swGraph = walkGraph(248);
assert.equal(swGraph.addresses.length, 28);
assert.equal(swGraph.transient, 17);
assert.equal(swGraph.cycle.length, 11);
assert.equal(swGraph.addresses[1], 113);
assert.equal(bytes[249], 158);
assert.equal(bytes[158], 249);
const memberships = {};
for (let i = 0; i < 256; i++) {
  const graph = walkGraph(i);
  const id = graph.cycle.includes(158) ? 'two' : 'eleven';
  (memberships[id] ||= []).push(i);
}
assert.deepEqual(memberships.two, [9, 158, 227, 249]);
assert.equal(memberships.eleven.length, 252);
assert.equal(walkGraph(249).cycle.length, 2);

// The only pre-existing native cipher operation selected here is the known
// p56 phi(prime) GP29 key, with plaintext-F bypass. p56 itself starts p1=2.
// Here p50 SW byte113 supplies a hypothetical starting prime p30.
const primes = [];
for (let k = 2; primes.length < 500; k++) if (primeQ(k)) primes.push(k);
assert.equal(primes.length, 500);
assert.equal(primes[29], 113);
/** @param {number} firstIndex @param {number} n */
const phiTape = (firstIndex, n) => primes.slice(firstIndex, firstIndex + n)
  .map((p) => mod29(p - 1));
const page = (n) => book.pages.find((p) => p.page === n).indices;
assert.equal(page(55).length, 76);
assert.equal(page(39).length, 240);
/** @param {number[]} xs */
function ioc(xs) {
  const f = Array(29).fill(0);
  xs.forEach((x) => f[x]++);
  return f.reduce((s, v) => s + v * (v - 1), 0) / (xs.length * (xs.length - 1));
}
/**
 * Decode every admissible key-use history, exact plaintext-F rule from
 * earlier known Cicada LP solution. Keeping one plaintext per key-use state
 * is sufficient because key-use count determines the future key position.
 * @param {number[]} cipher
 * @param {number[]} tape
 * @param {-1|1} sign
 */
function decodeF(cipher, tape, sign) {
  let states = new Map([[0, []]]);
  let prefix = 0;
  for (let i = 0; i < cipher.length; i++) {
    const next = new Map();
    for (const [used, plain] of states) {
      if (cipher[i] === 0 && !next.has(used)) {
        next.set(used, plain.concat(0));
      }
      const value = mod29(cipher[i] + sign * tape[used]);
      if (value !== 0 && !next.has(used + 1)) {
        next.set(used + 1, plain.concat(value));
      }
    }
    if (!next.size) break;
    states = next;
    prefix++;
  }
  return {prefix, states};
}
/**
 * Exact known-F positive plant.
 * @param {number[]} plain
 * @param {number[]} tape
 * @param {-1|1} sign
 */
function encryptF(plain, tape, sign) {
  let used = 0;
  const cipher = plain.map((p) => {
    if (p === 0) return 0;
    return mod29(p - sign * tape[used++]);
  });
  return {cipher, used};
}
const known = page(57).slice(0, 76), tape = phiTape(29, 300);
assert.equal(primes[0], 2);
const testFirst = page(56).slice(0, 5).map((c, i) =>
  mod29(c - mod29(primes[i] - 1)));
assert.deepEqual(testFirst, [24, 9, 18, 9, 23]); // ANEND
const plant = encryptF(known, tape, -1);
const plantDecode = decodeF(plant.cipher, tape, -1);
assert.equal(plantDecode.prefix, known.length);
assert.deepEqual(plantDecode.states.get(plant.used), known);
const candidates = [];
for (const p of [55, 39]) {
  for (const sign of [-1, 1]) {
    const ciphertext = page(p);
    const d = decodeF(ciphertext, tape, /** @type {-1|1} */(sign));
    const results = Array.from(d.states.values());
    const best = results.reduce((b, a) =>
      !b || ioc(a) > ioc(b) ? a : b, null);
    candidates.push({page:p,sign,prefix:d.prefix,n:ciphertext.length,
      legalCompletions: d.prefix === ciphertext.length ? results.length : 0,
      bestWholeIoC:d.prefix === ciphertext.length ? ioc(best) : null,
      first30:d.prefix === ciphertext.length ?
        best.slice(0, 30).map((v) => book.translit[v]).join('') : null});
  }
}
const p55minus = candidates.find((z) => z.page === 55 && z.sign === -1);
assert.equal(p55minus.prefix, 76);
assert(p55minus.bestWholeIoC < 0.04);
assert(candidates.filter((z) => z.page === 39)
  .every((z) => z.prefix < 240));
console.log(JSON.stringify({
  signal: {
    sourcedBookcode: 'cuneiform section (17,13),(55,1)->SW',
    originalP39FirstWord: 'SW',
    tableCorners: corners,
    gp29LastPrime: 109, nextPrimeNumber: 30, nextPrime: 113,
    base59SWValue:111
  },
  exploratoryGraph: {
    swVisited:swGraph.addresses.length,
    transient:swGraph.transient,
    cycle:swGraph.cycle.length,
    alternateTwoCycle:[158, 249],
    alternateBasinSize:memberships.two.length
  },
  directExistingPhiTest: {
    actualP56FirstTitleDecoded: 'ANEND',
    plantPage57Length: known.length, exactPositive:true,
    candidates, recoveredUnknownPlaintext:false
  },
  caveat: 'No original source selects the table graph or a cipher consumer of the SW value.'
}, null, 2));
