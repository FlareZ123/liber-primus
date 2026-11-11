"use strict";
/**
 * Postselected test of a speculative 29-adic derivative candidate.
 *
 * The p3 red triad defines u^2 = 3u + 8. Candidate seed z=23+27u is NOT source-selected: corrected p3/p39 offsets are 848 and 9519 (difference 8671 mod840=271; pair difference 4335 mod840=135). It is retained only for a reproducible negative test.
 * The 256 original base60 bytes define P over GF(29), lifted in Z_29[u].
 * This script tests:
 *   (1) the direct GF(29^2) first-jet map C_i = P'(z)_i * M_i + P(z)_i;
 *       because P(z)=0, every zero derivative pair forces C_i=(0,0);
 *   (2) P'(z)'s base-29 coordinate digits as a direct additive GP29 pad,
 *       with both coordinate interleavings, signs, and book/page clocks.
 *
 * It is a bounded hypothesis test, not a claimed decipherment.
 * Run: node sims/lp2_hensel_derivative_stream_sft.cjs
 */
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const MOD = 29n;
const mod = (x, m) => ((x % m) + m) % m;

/** GF(29^2) with u^2 = 3u + 8. */
const mul = (a, b, m) => [
  mod(a[0] * b[0] + 8n * a[1] * b[1], m),
  mod(a[0] * b[1] + a[1] * b[0] + 3n * a[1] * b[1], m)
];
function inv(a, m) {
  let x = mod(a, m), y = m, s = 1n, t = 0n;
  while (y !== 0n) {
    const q = x / y;
    [x, y] = [y, x - q * y];
    [s, t] = [t, s - q * t];
  }
  assert.equal(x, 1n, "expected a unit");
  return mod(s, m);
}
function invPair(z, m) {
  const [a, b] = z;
  const norm = mod(a * a + 3n * a * b - 8n * b * b, m);
  const scale = inv(norm, m);
  return [mod((a + 3n * b) * scale, m), mod(-b * scale, m)];
}

/** Descending polynomial and formal derivative by Horner. */
function jet(coeffs, x, m) {
  let v = [0n, 0n], d = [0n, 0n];
  for (const c of coeffs) {
    const a = mul(d, x, m);
    d = [mod(a[0] + v[0], m), mod(a[1] + v[1], m)];
    const b = mul(v, x, m);
    v = [mod(b[0] + c, m), b[1]];
  }
  return { v, d };
}
function lift(coeffs, count) {
  let x = [23n, 27n], k = 1;
  assert.deepEqual(jet(coeffs, x, MOD).v, [0n, 0n]);
  assert.notDeepEqual(jet(coeffs, x, MOD).d, [0n, 0n]);
  const checks = [];
  while (k < count) {
    const next = Math.min(2 * k, count), m = MOD ** BigInt(next);
    const { v, d } = jet(coeffs, x, m);
    const delta = mul(v, invPair(d, m), m);
    x = [mod(x[0] - delta[0], m), mod(x[1] - delta[1], m)];
    assert.deepEqual(jet(coeffs, x, m).v, [0n, 0n]);
    k = next;
    checks.push(k);
  }
  return { x, checks, derivative: jet(coeffs, x, MOD ** BigInt(count)).d };
}
function digits(x, count) {
  let [a, b] = x;
  const A = [], B = [];
  for (let i = 0; i < count; i++) {
    A.push(Number(a % MOD));
    B.push(Number(b % MOD));
    a /= MOD;
    b /= MOD;
  }
  return { A, B, AB: A.flatMap((v, i) => [v, B[i]]),
    BA: A.flatMap((v, i) => [B[i], v]) };
}
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}

const digraphs = { TH: 2, NG: 21, EO: 12, OE: 22, AE: 25, IA: 27, EA: 28 };
const letters = { A: 24, B: 17, C: 5, D: 23, E: 18, F: 0, G: 6, H: 8,
  I: 10, J: 11, K: 5, L: 20, M: 19, N: 9, O: 3, P: 13, Q: 5, R: 4,
  S: 15, T: 16, U: 1, V: 1, W: 7, X: 14, Y: 26, Z: 15 };
function encode(text) {
  const s = text.toUpperCase().replace(/[^A-Z]/g, ""), out = [];
  for (let i = 0; i < s.length; i++) {
    const di = digraphs[s.slice(i, i + 2)];
    if (di !== undefined) { out.push(di); i++; }
    else out.push(letters[s[i]]);
  }
  return out;
}
function train(text) {
  const symbols = encode(text);
  const u = new Uint32Array(29), b = new Uint32Array(29 * 29);
  const t = new Uint32Array(29 * 29 * 29);
  for (let i = 0; i < symbols.length; i++) {
    u[symbols[i]]++;
    if (i) b[symbols[i - 1] * 29 + symbols[i]]++;
    if (i > 1) t[(symbols[i - 2] * 29 + symbols[i - 1]) * 29 + symbols[i]]++;
  }
  const unigram = new Float64Array(29), bigram = new Float64Array(29 * 29);
  const trigram = new Float64Array(29 * 29 * 29);
  for (let c = 0; c < 29; c++) unigram[c] = Math.log((u[c] + 1) / (symbols.length + 29));
  for (let a = 0; a < 29; a++) for (let c = 0; c < 29; c++) {
    const p = (b[a * 29 + c] + 12 * Math.exp(unigram[c])) / (u[a] + 12);
    bigram[a * 29 + c] = Math.log(p);
  }
  for (let a = 0; a < 29; a++) for (let v = 0; v < 29; v++) for (let c = 0; c < 29; c++) {
    const idx = (a * 29 + v) * 29 + c;
    const p = (t[idx] + 9 * Math.exp(bigram[v * 29 + c])) / (b[a * 29 + v] + 9);
    trigram[idx] = Math.log(p);
  }
  return { symbols: symbols.length, trigram };
}
function score(a, model) {
  let total = 0;
  for (let i = 2; i < a.length; i++)
    total += model.trigram[(a[i - 2] * 29 + a[i - 1]) * 29 + a[i]];
  return total / (a.length - 2);
}
function decodeAdditive(pages, key, order, sign, reset) {
  let global = 0;
  const out = [];
  for (const page of pages) {
    for (let i = 0; i < page.indices.length; i++) {
      const j = reset ? i : global + i;
      out.push((page.indices[i] + 29 + sign * key[order][j]) % 29);
    }
    global += page.indices.length;
  }
  return out;
}
function xorshift(seed) {
  let state = seed >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}
function main() {
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const grid = load("resources/liber-primus/base60-grid.json");
  const ink = load("resources/liber-primus/lp2-ink-annotations.json");
  const pages = corpus.pages.filter(p => p.status === "unsolved");
  const original = pages.flatMap(p => p.indices);
  assert.equal(original.length, 12956);
  assert.equal(pages.length, 55);
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  const gridSha = crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex");
  assert.equal(gridSha, "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");

  const triads = ink.pages.flatMap(p => (p.red_spans || [])
    .filter(s => s.length === 3)
    .map(s => [p.page, s.start, [...s.runes].map(r => corpus.runes.indexOf(r))]));
  assert.deepEqual(triads, [[3, 119, [13, 23, 2]], [39, 119, [27, 5, 15]]]);

  const P = bytes.map(BigInt);
  const p39 = jet(P, [15n, 0n], MOD);
  assert.deepEqual(p39.v, [27n, 0n]);
  assert.deepEqual(p39.d, [5n, 0n]);
  const count = original.length / 2;
  const lifted = lift(P, count);
  assert.deepEqual(jet(P, lifted.x, MOD ** BigInt(count)).v, [0n, 0n]);
  const key = digits(lifted.derivative, count);
  const rootDigits = digits(lifted.x, count);

  // The literal first-order Taylor map at the lifted root is
  // C_i = P(z) + P'(z)*M_i = P'(z)*M_i because P(z)=0.
  // A zero derivative pair therefore forces the corresponding ciphertext pair to 0.
  const pageStarts = [];
  let cursor = 0;
  for (const page of pages) {
    pageStarts.push({ page: page.page, start: cursor, end: cursor + page.indices.length });
    cursor += page.indices.length;
  }
  const locate = offset => {
    const p = pageStarts.find(x => offset >= x.start && offset < x.end);
    return p ? { page: p.page, local: offset - p.start } : null;
  };
  const zeroBlocks = [];
  for (let i = 0; i < count; i++) {
    if (key.A[i] === 0 && key.B[i] === 0) {
      const offset = 2 * i;
      const cipherPair = [original[offset], original[offset + 1]];
      zeroBlocks.push({
        pair: i, runeOffset: offset, location: locate(offset),
        derivative: [0, 0], cipherPair,
        forcedOutputMatches: cipherPair[0] === 0 && cipherPair[1] === 0
      });
    }
  }
  const firstJet = {
    zeroDerivativeBlocks: zeroBlocks.length,
    forcedOutputMatches: zeroBlocks.filter(x => x.forcedOutputMatches).length,
    blocks: zeroBlocks
  };

  // Test the derivative digits as a direct additive pad, without fitted offsets.
  const shakespeare = train(fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8"));
  const emerson = train(fs.readFileSync(path.join(root, "resources/control/emerson_essays_2944.txt"), "utf8"));
  const variants = [];
  for (const order of ["AB", "BA"]) for (const sign of [-1, 1]) for (const reset of [false, true]) {
    const plain = decodeAdditive(pages, key, order, sign, reset);
    variants.push({
      order, sign, reset, ioc: ioc(plain),
      shakespeare: score(plain, shakespeare),
      emerson: score(plain, emerson),
      first80: plain.slice(0, 80).map(v => corpus.translit[v]).join(" ")
    });
  }
  variants.sort((a, b) => b.shakespeare - a.shakespeare);
  const raw = {
    ioc: ioc(original),
    shakespeare: score(original, shakespeare),
    emerson: score(original, emerson)
  };

  // Pair-preserving permutation null; compare the actual best of all 8
  // source-natural order/sign/clock variants to the same best-of-8 statistic.
  const pairStream = Array.from({ length: count }, (_, i) => [key.A[i], key.B[i]]);
  const rng = xorshift(0x3301c0de);
  const reps = 200, nullBest = [];
  for (let r = 0; r < reps; r++) {
    const shuffled = pairStream.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const shuffledKey = {
      AB: shuffled.flatMap(p => [p[0], p[1]]),
      BA: shuffled.flatMap(p => [p[1], p[0]])
    };
    let best = -Infinity;
    for (const order of ["AB", "BA"]) for (const sign of [-1, 1]) for (const reset of [false, true]) {
      best = Math.max(best, score(decodeAdditive(pages, shuffledKey, order, sign, reset), shakespeare));
    }
    nullBest.push(best);
  }
  const mean = nullBest.reduce((a, b) => a + b, 0) / reps;
  const sd = Math.sqrt(nullBest.reduce((a, b) => a + (b - mean) ** 2, 0) / (reps - 1));
  const p = (1 + nullBest.filter(x => x >= variants[0].shakespeare).length) / (reps + 1);

  // Exact positive control on the known cleartext p57, using the AB additive key.
  const solved = corpus.pages.find(p => p.page === 57).indices;
  const plant = solved.slice(0, 94).map((v, i) => (v - key.AB[i] + 29) % 29);
  const recovered = plant.map((v, i) => (v + key.AB[i]) % 29);
  assert.deepEqual(recovered, solved.slice(0, 94));

  const output = {
    classification: "postselected algebraic negative; root seed not source-selected",
    source: {
      originalUnsolvedPages: pages.length,
      originalRunes: original.length,
      pairBlocks: count,
      gridByteSha256: gridSha,
      redTriads: triads,
      p39OneJet: { P15: Number(p39.v[0]), dP15: Number(p39.d[0]) },
      p3Extension: "u^2 = 3u + 8",
      offsetAudit: { p3GlobalRune: 848, p39GlobalRune: 9519, difference: 8671, differenceMod840: 271, pairDifference: 4335, pairDifferenceMod840: 135, candidateSeedSourceSelected: false },
      liftedRootMod29: [Number(lifted.x[0] % MOD), Number(lifted.x[1] % MOD)],
      precision: count,
      checkedPrecisions: lifted.checks
    },
    firstJet,
    derivativeAdditivePad: {
      keySha256: crypto.createHash("sha256").update(Buffer.from(key.AB)).digest("hex"),
      raw, variants,
      pairPermutationNull: {
        seed: "0x3301c0de", replicates: reps, meanBest: mean, sdBest: sd,
        minBest: Math.min(...nullBest), maxBest: Math.max(...nullBest),
        atLeastAsGood: nullBest.filter(x => x >= variants[0].shakespeare).length,
        empiricalP: p
      }
    },
    positiveControl: { page: 57, runes: 94, exactRecovery: true },
    rootFirst16: rootDigits.A.slice(0, 16).map((v, i) => [v, rootDigits.B[i]]),
    derivativeFirst16: key.A.slice(0, 16).map((v, i) => [v, key.B[i]])
  };
  console.log(JSON.stringify(output, null, 2));
}
if (require.main === module) main();
module.exports = { jet, lift, digits };
