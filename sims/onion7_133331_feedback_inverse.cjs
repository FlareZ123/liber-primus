"use strict";
/**
 * Original-source exact inverse for a GP29 2-register, quarter-turn,
 * ciphertext-feedback alphabet based on historical onion7 HTML 133/331.
 *
 * Roots 133 mod29 = 17 and 331 mod29 = 12, 17^2=12^2=-1 mod29.
 * A natural diagonal oscillator driven by emitted ciphertext is:
 * u[t+1] = 17*u[t] + C[t], v[t+1] = 12*v[t] + C[t] (mod29);
 * K[t] = u[t]+v[t]. Because 17+12=0 and each square is -1,
 * K[t+2] = 2*C[t+1] - K[t] mod29.
 *
 * Cipher C[t] = P[t] + sign*K[t] mod29, with 2 free GP29 key seeds.
 * The emitter feeds actual published C[t] back into K, so optional sparse
 * anti-doublet repair changes only the emitted position's decoded plaintext.
 *
 * Exhaust 2*29^2 seed/sign candidates on book, 8 sections, 55 pages.
 * Train on the first half of each reset unit; never fit the second half.
 * Independently encrypt and blind-invert held-out English source GP runes.
 *
 * Node.js 22 CommonJS, original inputs, no external dependencies or writes.
 * @module onion7_133331_feedback_inverse
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const read = name => fs.readFileSync(path.join(ROOT, name), "utf8");
const corp = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const html = read("resources/cicada2014-onion7-index.html");
const source = read("resources/control/shakespeare_first300k.txt");
const pages = corp.pages.filter(page => page.page < 56 && page.indices.length);
const glyphs = pages.flatMap(page => page.indices);
const labels = corp.translit.map((symbol, i) => ({ symbol, i }))
  .sort((a, b) => b.symbol.length - a.symbol.length);

assert.equal(glyphs.length, 12956);
assert.equal(pages.length, 55);
assert.equal(Number(/<title>(\d+)<\/title>/u.exec(html)?.[1]), 133);
assert.equal(Number(/<div id="(\d+)">/u.exec(html)?.[1]), 331);
assert.equal([...html.matchAll(/<img src="(\d+)\.jpg"/gu)].length, 58);

/** @param {number} value @returns {number} */
const mod = value => ((value % 29) + 29) % 29;
assert.equal(mod(17 ** 2), 28);
assert.equal(mod(12 ** 2), 28);
assert.equal(mod(17 + 12), 0);
assert.equal(mod(17 * 12), 1);

/**
 * Encode individual words using the established 29 GP transliterations.
 * Source normalizations match the existing Shakespeare GP control.
 * @param {string} raw
 * @returns {number[]}
 */
function encode(raw) {
  const out = [];
  for (let word of raw.toUpperCase().match(/[A-Z]+/gu) || []) {
    word = word.replace(/QU/gu, "CW").replace(/V/gu, "U")
      .replace(/K/gu, "C").replace(/Z/gu, "S")
      .replace(/ING/gu, "NG");
    for (let i = 0; i < word.length;) {
      const match = labels.find(label => word.startsWith(label.symbol, i));
      assert.ok(match, "Unencodable control word " + word);
      out.push(match.i);
      i += match.symbol.length;
    }
  }
  return out;
}

const trained = encode(source.slice(0, 240000));
const holdout = encode(source.slice(240000)).slice(-glyphs.length);
assert.equal(trained.length, 174207);
assert.equal(holdout.length, glyphs.length);
const counts = new Float64Array(29).fill(0.5);
for (const glyph of trained) counts[glyph]++;
const total = counts.reduce((sum, x) => sum + x, 0);
const logRatio = Array.from(counts, x => Math.log(29 * x / total));

const bounds = [0, 3, 8, 16, 23, 27, 33, 40, 56];
const layouts = {
  book: [glyphs],
  section: bounds.slice(0, -1).map((first, j) =>
    pages.filter(p => p.page >= first && p.page < bounds[j + 1])
      .flatMap(page => page.indices)),
  page: pages.map(page => page.indices),
};
assert.deepEqual(layouts.section.map(xs => xs.length),
  [729, 1145, 1888, 1744, 1021, 1433, 1680, 3316]);

/**
 * Compute a true GP29 inverse on a known published stream.
 * The feedback key always uses the ACTUAL printed rune, including rewrites.
 * @param {number[]} cipher
 * @param {number} sign
 * @param {number[]} seed
 * @returns {number[]}
 */
function decrypt(cipher, sign, seed) {
  let even = seed[0], odd = seed[1], prev = 0;
  const result = [];
  for (let i = 0; i < cipher.length; i++) {
    const key = i === 0 ? even : i === 1 ? odd
      : mod(2 * prev - (i & 1 ? odd : even));
    if (i >= 2) {
      if (i & 1) odd = key;
      else even = key;
    }
    result.push(mod(cipher[i] - sign * key));
    prev = cipher[i];
  }
  return result;
}

/**
 * Scramble true native GP source with hidden oscillator seeds and possible
 * ciphertext-only collision rewrites, feeding emitted glyphs back into K.
 * @param {number[]} plain
 * @param {number} sign
 * @param {number[]} seed
 * @param {()=>number} random
 * @param {boolean} repair
 */
function encrypt(plain, sign, seed, random, repair) {
  const cipher = [], keys = [];
  let rewrites = 0;
  for (let i = 0; i < plain.length; i++) {
    const key = i < 2 ? seed[i] : mod(2 * cipher[i - 1] - keys[i - 2]);
    keys.push(key);
    let glyph = mod(plain[i] + sign * key);
    if (repair && i && glyph === cipher[i - 1] && random() < 0.81) {
      glyph = mod(cipher[i - 1] + 1 + Math.floor(random() * 28));
      rewrites++;
    }
    cipher.push(glyph);
  }
  return { cipher, rewrites };
}

/** @param {number} seed @returns {()=>number} */
function prng(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

/**
 * Same frozen GP prior for all source/models; score both original halves.
 * @param {number[]} cipher
 * @param {number} sign
 * @param {number} s0
 * @param {number} s1
 */
function score(cipher, sign, s0, s1) {
  let even = s0, odd = s1, prev = 0, train = 0, heldout = 0;
  const half = Math.floor(cipher.length / 2);
  for (let i = 0; i < cipher.length; i++) {
    const key = i === 0 ? even : i === 1 ? odd
      : mod(2 * prev - (i & 1 ? odd : even));
    if (i >= 2) {
      if (i & 1) odd = key;
      else even = key;
    }
    const value = logRatio[mod(cipher[i] - sign * key)];
    if (i < half) train += value;
    else heldout += value;
    prev = cipher[i];
  }
  return { train: train / half, heldout: heldout / (cipher.length - half) };
}

/**
 * Fully enumerate all 1682 possible sign/key choices.
 * @param {number[]} cipher
 */
function recover(cipher) {
  let best = -Infinity, heldout = -Infinity, seed = null;
  for (const sign of [1, -1])
    for (let s0 = 0; s0 < 29; s0++)
      for (let s1 = 0; s1 < 29; s1++) {
        const s = score(cipher, sign, s0, s1);
        if (s.train > best) {
          best = s.train;
          heldout = s.heldout;
          seed = [sign, s0, s1];
        }
      }
  return { seed, train: best, heldout };
}

/**
 * Exhaustive blind source-key recovery on a chosen physical reset layout.
 * @param {number[][]} groups
 * @param {(()=>number)|null} random
 */
function evaluate(groups, random = null) {
  let selected = 0, totalTrain = 0, totalHeldout = 0;
  let trainN = 0, heldoutN = 0, rewrites = 0, correctSeeds = 0;
  let sourceHits = 0, exactForward = 0, cursor = 0;
  const first = [];
  for (const group of groups) {
    let cipher = group, originalPlain = null, seed = null;
    if (random) {
      originalPlain = holdout.slice(cursor, cursor + group.length);
      seed = [Math.floor(random() * 29), Math.floor(random() * 29)];
      const enciphered = encrypt(originalPlain, 1, seed, random, true);
      rewrites += enciphered.rewrites;
      cipher = enciphered.cipher;
      const inverse = decrypt(cipher, 1, seed);
      // With ciphertext feedback, a rewrite corrupts only its own rune.
      sourceHits += inverse.filter((x, i) => x === originalPlain[i]).length;
      const roundtrip = encrypt(inverse, 1, seed, random, false).cipher;
      assert.deepEqual(roundtrip, cipher);
      exactForward += group.length;
    }
    const result = recover(cipher);
    if (seed && result.seed[0] === 1 &&
        result.seed[1] === seed[0] && result.seed[2] === seed[1])
      correctSeeds++;
    const mid = Math.floor(group.length / 2);
    totalTrain += result.train * mid;
    totalHeldout += result.heldout * (group.length - mid);
    trainN += mid;
    heldoutN += group.length - mid;
    cursor += group.length;
    selected++;
    if (first.length < 3) first.push({ n: group.length, ...result });
  }
  assert.equal(cursor, glyphs.length);
  const out = { modelsExhausted: selected * 1682, units: selected,
    trainPerRune: totalTrain / trainN,
    heldoutPerRune: totalHeldout / heldoutN, first };
  if (random) {
    out.correctSeedCount = correctSeeds;
    out.trueSourceRuneHits = sourceHits;
    out.forwardReproducedCipherRunes = exactForward;
    out.rewrites = rewrites;
  }
  return out;
}

function run() {
  const original = {}, positives = {};
  const random = prng(0x133331);
  for (const [clock, groups] of Object.entries(layouts)) {
    original[clock] = evaluate(groups);
    positives[clock] = evaluate(groups, random);
  }
  assert.ok(Math.abs(original.book.heldoutPerRune + 0.9418544998784139) < 1e-10);
  assert.ok(Math.abs(original.section.heldoutPerRune + 0.9300127938011559) < 1e-10);
  assert.ok(Math.abs(original.page.heldoutPerRune + 0.9212626781748817) < 1e-10);
  assert.deepEqual(Object.values(positives).map(x => x.correctSeedCount),
    [1, 8, 54]);
  assert.deepEqual(Object.values(positives).map(x => x.rewrites),
    [369, 365, 362]);
  for (const x of Object.values(positives)) {
    assert.equal(x.forwardReproducedCipherRunes, 12956);
    assert.equal(x.trueSourceRuneHits, 12956 - x.rewrites);
    assert.ok(x.heldoutPerRune > 0.32);
  }
  return {
    sourceArithmetic: {
      indexTitle: 133, indexId: 331, roots: [17, 12],
      recurrence: "K[t+2]=2*C[t+1]-K[t] (mod29)",
      sourceOscillator: "u'=17u+C, v'=12v+C, K=u+v",
      firstTwoKeySeeds: 29 ** 2, signs: 2,
    },
    original: { runes: glyphs.length, pages: pages.length,
      trainedEnglishRunes: trained.length, ...original },
    planted: { heldoutEnglishRunes: holdout.length,
      unencryptedHeldoutLogRatio: holdout.reduce(
        (sum, x) => sum + logRatio[x], 0) / holdout.length,
      ...positives },
    conclusion: "No true source key or unknown LP2 plaintext recovered. The 2-register ciphertext-feedback root oscillator gives strongly nonlinguistic original heldout GP output under all three reset clocks.",
  };
}
if (require.main === module)
  process.stdout.write(JSON.stringify(run(), null, 2) + "\n");
module.exports = { mod, decrypt, encrypt, score, recover, evaluate, run };
