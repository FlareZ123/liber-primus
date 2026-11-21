"use strict";

/**
 * Source-selected degree-nine table factor with red-title seeds and a hidden
 * repeat-rejection clock. Distinct from the previously tested direct N9 pads
 * and the prime-totient hidden-skip receiver.
 *
 * Authenticated inputs: LP2 p49-51 256-cell grid, p15/p54 red-nine headings,
 * all original GP29 ciphertext, solved p57 GP29 plaintext.
 * Speculative operations: use the primitive table nonic as a linear clock;
 * suppress a repeat output with probability .81 and advance the key.
 *
 * Run: node sims/lp2_nonic_red9_hidden_repeat_skip_sft.cjs
 * Windows Node.js 22, CommonJS, read-only, no dependencies.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");

const root = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(root, name), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const sha256 = data => createHash("sha256").update(data).digest("hex");
assert.equal(sha256(Buffer.from(grid.bytes)),
  "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
assert.equal(grid.bytes.length, 256);
assert.equal(corpus.pages.slice(0, 56).reduce((n, p) => n + p.indices.length, 0), 12956);
const N = 29;
const mod = v => (v % N + N) % N;
// Physical p50 first byte 203 reduces to 0 mod29; divide at degree254.
const p29 = corpus.pages.find(p => p.page === 29).indices;
assert.equal(p29.length, 277);
const dividend = p29.slice();
const divisor = grid.bytes.map(x => x % N).slice(1);
assert.equal(divisor.length, 255);
const inverse = x => {
  for (let y = 1; y < N; y++) if (x * y % N === 1) return y;
  throw Error("noninvertible leading coefficient");
};
const q23 = [];
for (let i = 0; i <= dividend.length - divisor.length; i++) {
  const q = mod(dividend[i] * inverse(divisor[0]));
  q23.push(q);
  for (let j = 0; j < divisor.length; j++)
    dividend[i + j] = mod(dividend[i + j] - q * divisor[j]);
}
assert.deepEqual(q23,
  [27,20,4,17,16,18,16,11,8,28,18,16,5,23,12,10,8,25,14,14,15,20,17]);
assert.deepEqual(dividend.slice(0, 23), Array(23).fill(0));
const redSeeds = [
  { name: "p0-2", start: 0, end: 2, seed: q23, sourceLength: 729 },
  { name: "p32", start: 32, end: 32, seed: q23, sourceLength: 121 }
];
const nativeWordTokens = corpus.translit.map((s, i) => ({ s, i }))
  .sort((a, b) => b.s.length - a.s.length);

/** @param {string} input @returns {number[]} */
function nativeWord(input) {
  const word = input.toUpperCase().replace(/QU/g, "CW")
    .replace(/V/g, "U").replace(/[KQ]/g, "C").replace(/Z/g, "S");
  const out = [];
  for (let i = 0; i < word.length;) {
    if (word.startsWith("ING", i)) { out.push(21); i += 3; }
    else if (word.startsWith("IO", i)) { out.push(27); i += 2; }
    else {
      const token = nativeWordTokens.find(t => word.startsWith(t.s, i));
      assert.ok(token, "Unrecognized GP phoneme in " + input);
      out.push(token.i);
      i += token.s.length;
    }
  }
  return out;
}
/** @param {string} s @returns {number[]} */
function toRunes(s) {
  return (s.match(/[A-Za-z]+/g) || []).flatMap(nativeWord);
}
const ref = toRunes(read("resources/control/shakespeare_first300k.txt"));
const gibran = toRunes(read("resources/control/gibran_prophet_58585.txt"));
assert.equal(ref.length, 217106);
assert.equal(gibran.length, 62492);
const uni = new Uint32Array(N);
const bi = new Uint32Array(N * N);
const tri = new Uint32Array(N * N * N);
for (let i = 0; i < ref.length; i++) {
  uni[ref[i]]++;
  if (i) bi[ref[i - 1] * N + ref[i]]++;
  if (i > 1) tri[(ref[i - 2] * N + ref[i - 1]) * N + ref[i]]++;
}
const lb = Array.from(bi, (n, i) =>
  Math.log((n + 2) / (uni[Math.floor(i / N)] + 2 * N)));
const lt = Array.from(tri, (n, i) =>
  Math.log((n + 1) / (bi[Math.floor(i / N)] + N)));

/**
 * Source-derived 23-periodic Euclid quotient.
 * @param {number[]} seed @param {number} length @returns {number[]}
 */
function key(seed, length) {
  assert.equal(seed.length, 23);
  return Array.from({ length }, (_, i) => seed[i % 23]);
}
/** @param {number} seed @returns {() => number} */
function rng(seed) {
  return () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
}
/**
 * Plant a different-language authentic GP29 passage. The decoder never
 * receives plaintext, rejected trials, final pointer or random generator.
 * @param {number[]} plain @param {number[]} seed
 * @param {1 | -1} sign @param {number} randomSeed
 */
function plant(plain, seed, sign, randomSeed) {
  const K = key(seed, plain.length * 2 + 5009);
  const random = rng(randomSeed);
  const cipher = [];
  let previous = -1, pointer = 23, skips = 0, maxSkips = 0;
  for (const p of plain) {
    let c = mod(p + sign * K[pointer]), local = 0;
    while (c === previous && random() < 0.81) {
      pointer++; local++; skips++;
      c = mod(p + sign * K[pointer]);
    }
    cipher.push(c);
    previous = c;
    pointer++;
    if (local > maxSkips) maxSkips = local;
  }
  return { cipher, pointer, skips, maxSkips };
}
/**
 * Beam-128 hidden-key-clock inverse. Every rejected row must actually
 * reproduce the immediately previous observed ciphertext, exactly.
 * @param {number[]} cipher @param {number[]} seed @param {1 | -1} sign
 */
function decode(cipher, seed, sign) {
  const K = key(seed, cipher.length * 2 + 5009);
  let states = [{ pointer: 23, first: -1, second: -1, score: 0,
    parent: null, plain: -1 }];
  const logReject = Math.log(0.81), logKeep = Math.log(0.19);
  for (let i = 0; i < cipher.length; i++) {
    const previous = i ? cipher[i - 1] : -1;
    const next = new Map();
    for (const s of states) for (let skips = 0; skips <= 3; skips++) {
      const j = s.pointer + skips;
      const p = mod(cipher[i] - sign * K[j]);
      let valid = true;
      for (let k = 0; k < skips; k++) {
        if (mod(p + sign * K[s.pointer + k]) !== previous) {
          valid = false;
          break;
        }
      }
      if (!valid) continue;
      let score = s.score + (s.second < 0
        ? Math.log((uni[p] + 1) / (ref.length + N))
        : 0.55 * lb[s.second * N + p]);
      if (s.first >= 0)
        score += 0.45 * lt[(s.first * N + s.second) * N + p];
      score += skips * logReject;
      if (cipher[i] === previous) score += logKeep;
      const id = (j + 1) + ":" + s.second + ":" + p;
      const old = next.get(id);
      if (!old || score > old.score)
        next.set(id, { pointer: j + 1, first: s.second, second: p,
          score, parent: s, plain: p });
    }
    states = [...next.values()].sort((a, b) => b.score - a.score)
      .slice(0, 128);
    assert.ok(states.length, "No legal inverse at original position " + i);
  }
  const best = states[0];
  const plain = Array(cipher.length);
  let state = best;
  for (let i = plain.length - 1; i >= 0; i--) {
    plain[i] = state.plain;
    state = state.parent;
  }
  return { plain, pointer: best.pointer, score: best.score / cipher.length };
}
const solvedP57 = corpus.pages.find(p => p.page === 57).indices;
assert.equal(solvedP57.length, 95);
const positive = [], originals = [];
for (const source of redSeeds) {
  const original = corpus.pages
    .filter(p => p.page >= source.start && p.page <= source.end)
    .flatMap(p => p.indices);
  assert.equal(original.length, source.sourceLength);
  assert.equal(source.seed.length, 23);
  for (const sign of [-1, 1]) {
    for (const [name, plaintext, randomSeed] of [
      ["authentic-p57", solvedP57, 0x07530abc],
      ["unseen-gibran729", gibran.slice(4000, 4729), 0x3301abcd]
    ]) {
      const synthetic = plant(plaintext, source.seed, sign, randomSeed);
      const inverse = decode(synthetic.cipher, source.seed, sign);
      const hits = inverse.plain.filter((p, i) => p === plaintext[i]).length;
      assert.equal(inverse.pointer, synthetic.pointer);
      assert.ok(hits >= plaintext.length - 4, "Weak positive " + source.name);
      positive.push({ seed: source.name, sign, name,
        length: plaintext.length, exactHits: hits,
        hiddenSkips: synthetic.skips, maxSkips: synthetic.maxSkips,
        score: inverse.score });
    }
    const d = decode(original, source.seed, sign);
    assert.ok(d.score < -3.8, "Unexpected original-language candidate");
    const runeText = d.plain.slice(0, 70)
      .map(x => corpus.translit[x]).join("");
    originals.push({ source: source.name, sign,
      ciphertextLength: original.length, decodedClock: d.pointer,
      nativeGpLanguageScore: d.score, prefix70: runeText });
  }
}
assert.equal(positive.length, 8);
assert.equal(originals.length, 4);
console.log(JSON.stringify({ status: "PASS",
  clue: "original p29/p50 GF29 first Euclidean quotient Q23 + anti-repeat",
  rejectionProbability: 0.81, maxHiddenSkipsPerGlyph: 3,
  beamWidth: 128, training: "Shakespeare source-native GP29",
  testLanguage: "solved p57 and independent Gibran GP29",
  originalSourcePages: "p0-2 and p32; no original rune positions excluded",
  positive, originals,
  conclusion: "No readable unknown LP2 plaintext for the exact Q23-periodic hidden-repeat-skip model; no authored instruction selects the model."
}, null, 2));