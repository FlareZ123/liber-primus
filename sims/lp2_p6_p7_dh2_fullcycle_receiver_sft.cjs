"use strict";
/**
 * Exact source-selected DH23 shared K=2 as GP29 full-cycle row operand.
 * The original p6 red 11-runic seed followed by 308=11*28 black runes and
 * original p7 five red-word products specify the candidate receiver/state.
 * No adjustable phase, other generator, word reset or English scoring.
 *
 * Windows Node 22: node sims/lp2_p6_p7_dh2_fullcycle_receiver_sft.cjs
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const read = name => fs.readFileSync(path.resolve(__dirname, "..", name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const runeValue = new Map(corpus.runes.map((r, i) => [r, i]));
const vals = chars => [...chars].map(c => {
  assert.ok(runeValue.has(c));
  return runeValue.get(c);
});
const page = n => corpus.pages.find(p => p.page === n).indices;
const mod = n => ((n % 29) + 29) % 29;
const sum = xs => xs.reduce((a, b) => a + b, 0);
const prod = xs => xs.reduce((a, b) => (a * b) % 29, 1);
const ioc = xs => {
  const counts = Array(29).fill(0);
  for (const x of xs) counts[x]++;
  return counts.reduce((a, n) => a + n * (n - 1), 0) / (xs.length * (xs.length - 1));
};
const translit = xs => xs.map(x => corpus.translit[x]).join("");
/** @param {number} n */
const inv = n => {
  assert.notEqual(n, 0);
  for (let i = 1; i < 29; i++) if ((i * n) % 29 === 1) return i;
  throw new Error("No inverse for " + n);
};

const p6Red = ink.pages.find(p => p.page === 6).red_spans[0];
const p7Red = ink.pages.find(p => p.page === 7).red_spans[0];
assert.deepEqual(
  [p6Red.start, p6Red.length, p7Red.start, p7Red.length],
  [71, 11, 194, 14]
);
const seed = vals(p6Red.runes);
const closing = vals(p7Red.runes);
assert.deepEqual(seed, [24, 16, 14, 17, 19, 6, 27, 15, 17, 14, 12]);
assert.deepEqual(closing.slice(-3), [6, 28, 19]);
const lastWordProduct = prod(closing.slice(-3));
assert.equal(lastWordProduct, 2);
assert.equal(seed[4], 19);
assert.equal(sum(seed), 181);
assert.equal(sum(closing), 209);

const receiver = page(6).slice(82).concat(page(7).slice(0, 194));
assert.equal(receiver.length, 11 * 28);
assert.equal((sum(closing) - sum(seed)), 28);
const states = Array.from({length: 28}, (_, r) => {
  let state = 1;
  for (let t = 0; t < r; t++) state = mod(state * lastWordProduct);
  return state;
});
assert.equal(new Set(states).size, 28);
assert.equal(mod(states[27] * lastWordProduct), 1);
assert.deepEqual(states.slice(0, 8), [1, 2, 4, 8, 16, 3, 6, 12]);

/**
 * Three frozen reversible forms. Sign and operand position are fixed:
 * A: C=state*P+redSeed;
 * B: C=P+state*redSeed;
 * C: C=state*redSeed*P.
 * @param {number} type
 * @param {number[]} source
 */
function decode(type, source) {
  return source.map((cipher, i) => {
    const row = Math.floor(i / 11), col = i % 11;
    const state = states[row], k = seed[col];
    if (type === 0) return mod(inv(state) * (cipher - k));
    if (type === 1) return mod(cipher - state * k);
    return mod(cipher * inv(mod(state * k)));
  });
}
/** @param {number} type @param {number[]} plaintext */
function encode(type, plaintext) {
  return plaintext.map((plain, i) => {
    const row = Math.floor(i / 11), col = i % 11;
    const state = states[row], k = seed[col];
    if (type === 0) return mod(state * plain + k);
    if (type === 1) return mod(plain + state * k);
    return mod(state * k * plain);
  });
}
const descriptions = [
  "C[r,j] = (2^r P[r,j] + red11[j]) mod29",
  "C[r,j] = (P[r,j] + 2^r red11[j]) mod29",
  "C[r,j] = (2^r red11[j] P[r,j]) mod29"
];
// Positive solved-source plant: original solved p57 native GP words, repeated
// solely to exercise a 308-rune contiguous receiver with all state phases.
const nativeControl = page(57);
assert.ok(nativeControl.length >= 90);
const plant = Array.from({length: 308}, (_, i) => nativeControl[i % nativeControl.length]);
const results = descriptions.map((operation, type) => {
  const plaintext = decode(type, receiver);
  assert.deepEqual(encode(type, plaintext), receiver, "original exact reencryption");
  const synthetic = encode(type, plant);
  assert.deepEqual(decode(type, synthetic), plant, "native solved-source positive plant");
  return {
    operation, length: plaintext.length,
    gpIoc: ioc(plaintext),
    firstHalfIoc: ioc(plaintext.slice(0, 154)),
    secondHalfIoc: ioc(plaintext.slice(154)),
    originalPlaintextF: plaintext.filter(x => x === 0).length,
    first100: translit(plaintext.slice(0, 100)),
    last70: translit(plaintext.slice(-70))
  };
});
console.log(JSON.stringify({
  claim: "Bounded negative fixed original DH-K=2 row powers, no plaintext or authored clock",
  source: {
    p6Seed: seed, p6Sum: sum(seed),
    p7FinalWord: closing.slice(-3),
    p7FinalProduct: lastWordProduct, p7Sum: sum(closing),
    redSumDifference: 28, originalReceiverLength: receiver.length,
    rowLength: 11, rows: 28,
    statePowers: states, stateIsCompleteF29MultiplicativeCycle: true
  },
  originalCipherIoc: ioc(receiver),
  tested: results
}, null, 2));
