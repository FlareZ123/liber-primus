/**
 * Source-anchored 761/DH5 terminal-heading experiment.
 * Executes against the canonical physical LP2 rune records.
 * Source inputs: 2013 signed TCP/DH worked example (base 5),
 * 2013 761.MP3 original ID3 title, and solved LP2 pp56–57 headings.
 * No original unknown plaintext, free shift, or searched key is assumed.
 *
 * @typedef {{page:number, indices:number[]}} RunePage
 * @typedef {{translit:string[],prime:number[],pages:RunePage[]}} Corpus
 */
"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
/** @type {Corpus} */
const corpus = JSON.parse(fs.readFileSync(path.join(root, "resources", "liber-primus", "lp2-corpus.json"), "utf8"));
const tcpRecord = fs.readFileSync(path.join(root, "resources", "external", "2013-tcp-server-signed-source.md"), "utf8");
const audioRecord = fs.readFileSync(path.join(root, "im-results", "audio761-original-id3-frame-inventory.md"), "utf8");
assert.match(tcpRecord, /server base 5/);
assert.match(audioRecord, /The Instar Emergence/);

/**
 * Greedy original GP29 lexical encoding; only source-authored unambiguous
 * ASCII headings/title are encoded by this test.
 * @param {string} s
 * @returns {number[]}
 */
function gp(s) {
  const chars = s.toUpperCase().replace(/[^A-Z]/g, "").replace(/K/g, "C").replace(/V/g, "U").replace(/Z/g, "S");
  const alphabet = corpus.translit.map((t, i) => ({ t, i })).sort((a, b) => b.t.length - a.t.length);
  /** @type {number[]} */
  const out = [];
  for (let pos = 0; pos < chars.length;) {
    const symbol = alphabet.find(({ t }) => chars.startsWith(t, pos));
    assert.ok(symbol, `No GP rune matches ${chars.slice(pos)}`);
    out.push(symbol.i);
    pos += symbol.t.length;
  }
  return out;
}

/** @param {number[]} indices @returns {number} */
function primeSum(indices) {
  return indices.reduce((n, i) => n + corpus.prime[i], 0);
}

/** @param {number} n @returns {boolean} */
function isPrime(n) {
  if (n < 2) return false;
  for (let factor = 2; factor * factor <= n; factor++) if (n % factor === 0) return false;
  return true;
}

/** @type {number[]} */
const primes = [];
for (let n = 2; primes.length < 600; n++) if (isPrime(n)) primes.push(n);

/**
 * Exact integer modular exponentiation; all multiplicands are below 761.
 * @param {number} a
 * @param {number} exponent
 * @param {number} modulus
 * @returns {number}
 */
function powmod(a, exponent, modulus) {
  let out = 1;
  let base = a % modulus;
  for (let n = exponent; n > 0; n = Math.floor(n / 2)) {
    if (n % 2) out = (out * base) % modulus;
    base = (base * base) % modulus;
  }
  return out;
}

/** @param {number} page @returns {number[]} */
function pageIndices(page) {
  const result = corpus.pages.find((x) => x.page === page);
  assert.ok(result, `Missing physical page ${page}`);
  return result.indices;
}

/** @param {number[]} indices @returns {string} */
function render(indices) {
  return indices.map((i) => corpus.translit[i]).join("");
}

/** @param {number[]} indices @returns {number} */
function pairCount(indices) {
  const hist = Array(29).fill(0);
  for (const i of indices) hist[i]++;
  return hist.reduce((n, count) => n + count * (count - 1), 0);
}

/**
 * Hypothetical DH-residue to GP29 additive pad; one complete source-frozen
 * source exponent, phase-zero, no F exception, 76 positions.
 * The group-to-rune projection and GP29 addition are proposals, not signed instructions.
 * @param {number[]} input
 * @param {number} startExponent
 * @param {1|-1} direction
 * @returns {number[]}
 */
function transform(input, startExponent, direction) {
  return input.map((r, i) => {
    const k = powmod(5, startExponent + i, 761) % 29;
    return (r + 29 + direction * k) % 29;
  });
}

assert.equal(primeSum(gp("THE INSTAR EMERGENCE")), 761);
assert.equal(primeSum(gp("AN END")), 311);
assert.equal(primeSum(gp("PARABLE")), 449);
assert.equal(311 + 449, 761 - 1);
assert.ok(isPrime(311) && isPrime(449) && isPrime(761));
assert.equal(powmod(5, 38, 761), 1);
assert.notEqual(powmod(5, 19, 761), 1);
assert.notEqual(powmod(5, 2, 761), 1);
assert.equal(powmod(5, 311, 761), 503);
assert.equal(powmod(5, 449, 761), 351);
assert.equal((503 * 351) % 761, 1);

const c55 = pageIndices(55);
const c56 = pageIndices(56);
const p57 = pageIndices(57);
assert.equal(c55.length, 76);
assert.equal(c56.length, 85);
assert.equal(p57.length, 95);
assert.deepEqual(p57.slice(0, 7), gp("PARABLE"));

// Authentic p56 prime-totient / single literal-F known-plaintext positive.
const known56 = [];
let consumed = 0;
for (let i = 0; i < c56.length; i++) {
  if (i === 56) {
    assert.equal(c56[i], 0);
    known56.push(0);
  } else {
    known56.push((c56[i] + 29 - ((primes[consumed++] - 1) % 29)) % 29);
  }
}
const expected56 = "ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE";
assert.equal(render(known56), expected56);
assert.deepEqual(known56.slice(0, 5), gp("AN END"));

// Exact source-authenticated BASE29 serialization hypothesis.
// 29^2=841 > 761: one residue of the cyclic DH5 subgroup fits two GP digits.
// Physical p55 has 76 runes, hence exactly 38 consecutive candidate pairs.
// These four digit transformations are historical Cicada operations, not arbitrary
// secret maps; reversed digit significance is the sole framing alternative.
/** @type {Record<string,(x:number)=>number>} */
const digitTransforms = {
  identity: (x) => x,
  atbash: (x) => 28 - x,
  atbashPlus3: (x) => (28 - x + 3) % 29,
  atbashMinus3: (x) => (28 - x + 26) % 29
};
/**
 * @param {number[]} source
 * @param {(x:number)=>number} digit
 * @param {boolean} lowFirst
 * @returns {number[]}
 */
function base29Pairs(source, digit, lowFirst) {
  assert.equal(source.length % 2, 0);
  const out = [];
  for (let i = 0; i < source.length; i += 2) {
    const hi = digit(source[i + (lowFirst ? 1 : 0)]);
    const lo = digit(source[i + (lowFirst ? 0 : 1)]);
    out.push(hi * 29 + lo);
  }
  return out;
}

// Positive native group-orbit plant, with exact two-digit serialization.
const orbit = Array.from({ length: 38 }, (_, i) => powmod(5, i, 761));
assert.equal(new Set(orbit).size, 38);
const encodedOrbit = orbit.flatMap((n) => [Math.floor(n / 29), n % 29]);
assert.equal(encodedOrbit.length, 76);
assert.deepEqual(base29Pairs(encodedOrbit, digitTransforms.identity, false), orbit);
const originalLiteralPairs = base29Pairs(c55, digitTransforms.identity, false);
// Any stationary bijective encoding of all 38 distinct group states must
// produce 38 distinct 2-rune ciphertext tokens, regardless of secret alphabet.
assert.equal(new Set(originalLiteralPairs).size, 37);
assert.equal(new Set(orbit).size, 38);

assert.equal(orbit.filter((n) => n > 0 && n < 761 && powmod(n, 38, 761) === 1).length, 38);

const pairReadings = [];
const expectedPairCounts = {
  "identity:false": [35, 1], "identity:true": [36, 2],
  "atbash:false": [35, 5], "atbash:true": [33, 2],
  "atbashPlus3:false": [34, 1], "atbashPlus3:true": [35, 1],
  "atbashMinus3:false": [35, 2], "atbashMinus3:true": [36, 0]
};
for (const [mapping, digit] of Object.entries(digitTransforms)) {
  for (const lowFirst of [false, true]) {
    const numbers = base29Pairs(c55, digit, lowFirst);
    const inRange = numbers.filter((n) => n > 0 && n < 761);
    const inOrbit = inRange.filter((n) => powmod(n, 38, 761) === 1);
    assert.deepEqual([inRange.length, inOrbit.length], expectedPairCounts[`${mapping}:${lowFirst}`]);
    pairReadings.push({
      mapping,
      lowFirst,
      validMod761Values: inRange.length,
      membersOfOrder38Subgroup: inOrbit.length,
      ruledOutAsLiteral38ResidueList: inRange.length !== 38 || inOrbit.length !== 38
    });
  }
}

const output = [];
const expectedPairs = {
  "0:-1": 186,
  "0:1": 214,
  "311:-1": 208,
  "311:1": 208,
  "449:-1": 198,
  "449:1": 196
};
for (const exponent of [0, 311, 449]) {
  for (const direction of [-1, 1]) {
    /** @type {1|-1} */
    const sign = direction === -1 ? -1 : 1;
    const decoded = transform(c55, exponent, sign);
    assert.deepEqual(transform(decoded, exponent, /** @type {1|-1} */ (-sign)), c55);
    assert.equal(pairCount(decoded), expectedPairs[`${exponent}:${sign}`]);

    // Source-native 76-rune solved-p57 plant: known GP plaintext must recover.
    const native = p57.slice(0, 76);
    const plant = transform(native, exponent, /** @type {1|-1} */ (-sign));
    assert.deepEqual(transform(plant, exponent, sign), native);

    output.push({
      exponent,
      sign,
      pairCount: pairCount(decoded),
      indexOfCoincidence: pairCount(decoded) / (76 * 75),
      decodedFirst24: render(decoded.slice(0, 24))
    });
  }
}
process.stdout.write(JSON.stringify({
  source: "2013 signed DH5; 2013 761.MP3 original title; solved LP2 AN END/PARABLE",
  arithmetic: { headingPrimeSums: [311, 449], phi761: 760, orderOf5Modulo761: 38, originalPage55Runes: 76 },
  authenticP56RecoveredRunes: known56.length,
  originalP55LiteralBase29PairOrbitGate: pairReadings,
  independentOfAnySecretPairBijection: { rawPairCount: 38, distinctOriginalPairs: 37, distinctOrbitStates: 38 },
  originalP55DirectDecoders: output,
  result: "No candidate authentic plaintext; exact arithmetic is a provisional cross-round hypothesis"
}, null, 2) + "\n");
