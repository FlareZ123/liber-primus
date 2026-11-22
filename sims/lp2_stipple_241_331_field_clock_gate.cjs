"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ROOT = path.resolve(__dirname, "..");
const readText = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const readJSON = p => JSON.parse(readText(p));
const mod = x => ((x % 29) + 29) % 29;
const add = (x, y) => [mod(x[0] + y[0]), mod(x[1] + y[1])];
const sub = (x, y) => [mod(x[0] - y[0]), mod(x[1] - y[1])];

// p3's marked irreducible: u^2 = 8 + 3u.
function mul(x, y) {
  const [a, b] = x, [c, d] = y;
  return [mod(a * c + 8 * b * d), mod(a * d + b * c + 3 * b * d)];
}
function pow(x, n) {
  let y = [1, 0], a = x;
  while (n) {
    if (n & 1) y = mul(y, a);
    a = mul(a, a);
    n >>= 1;
  }
  return y;
}
function fieldOrder(x) {
  let y = [1, 0];
  for (let n = 1; n <= 840; n++) {
    y = mul(y, x);
    if (y[0] === 1 && y[1] === 0) return n;
  }
  return null;
}
function fieldInv(x) {
  assert.notDeepEqual(x, [0, 0]);
  return pow(x, 839);
}
function matMul(A, B) {
  return [
    [mod(A[0][0] * B[0][0] + A[0][1] * B[1][0]), mod(A[0][0] * B[0][1] + A[0][1] * B[1][1])],
    [mod(A[1][0] * B[0][0] + A[1][1] * B[1][0]), mod(A[1][0] * B[0][1] + A[1][1] * B[1][1])]
  ];
}
function matrixOrder(M) {
  let A = [[1, 0], [0, 1]];
  for (let n = 1; n <= 1000; n++) {
    A = matMul(A, M);
    if (A[0][0] === 1 && A[0][1] === 0 && A[1][0] === 0 && A[1][1] === 1) return n;
  }
  return null;
}
function nthPrime(n) {
  const ps = [];
  for (let x = 2; ps.length < n; x++) {
    let prime = true;
    for (let d = 2; d * d <= x; d++) if (x % d === 0) { prime = false; break; }
    if (prime) ps.push(x);
  }
  return ps[n - 1];
}
function quotientPairs(bytes) {
  assert.equal(bytes.length, 256);
  const w = bytes.map(mod), q = [];
  // Divide the original forward-row-major base60 polynomial by (X-24)^2.
  // (X-24)^2 = X^2 + 10X + 25 over F29.
  for (let i = 0; i < 254; i++) {
    const x = w[i];
    q.push(x);
    w[i + 1] = mod(w[i + 1] - 10 * x);
    w[i + 2] = mod(w[i + 2] - 25 * x);
  }
  assert.deepEqual(w.slice(254), [0, 0]);
  return Array.from({ length: 127 }, (_, i) => [q[2 * i], q[2 * i + 1]]);
}
function nativeGP(raw, translit) {
  const map = translit.map((s, i) => ({ s, i })).sort((a, b) => b.s.length - a.s.length);
  const words = raw.toUpperCase().replace(/QU/g, "CW").replace(/V/g, "U")
    .replace(/K/g, "C").replace(/Z/g, "S").replace(/ING/g, "NG").match(/[A-Z]+/g) || [];
  const out = [];
  for (const word of words) {
    const a = [];
    for (let j = 0; j < word.length;) {
      const x = map.find(z => word.startsWith(z.s, j));
      if (!x) { a.length = 0; break; }
      a.push(x.i);
      j += x.s.length;
    }
    out.push(...a);
  }
  return out;
}
function train(a) {
  const h = new Map();
  let n = 0;
  for (let i = 0; i + 2 < a.length; i++) {
    const k = a[i] * 841 + a[i + 1] * 29 + a[i + 2];
    h.set(k, (h.get(k) || 0) + 1);
    n++;
  }
  return { h, n };
}
function score(a, model) {
  const denom = model.n + 0.1 * 29 ** 3;
  let s = 0;
  for (let i = 0; i + 2 < a.length; i++) {
    const k = a[i] * 841 + a[i + 1] * 29 + a[i + 2];
    s += Math.log(((model.h.get(k) || 0) + 0.1) / denom);
  }
  return s / (a.length - 2);
}
function ioc(a) {
  const h = Array(29).fill(0);
  for (const x of a) h[x]++;
  return h.reduce((s, n) => s + n * (n - 1), 0) / (a.length * (a.length - 1));
}
function windowStats(a, model, n) {
  const v = [];
  for (let i = 0; i < 300; i++) {
    const j = Math.floor(i * (a.length - n) / 299);
    v.push(score(a.slice(j, j + n), model));
  }
  v.sort((x, y) => x - y);
  return { min: v[0], median: v[149], max: v[299] };
}

function matrixStateTransform(src, R, Q, seedOrder, decode) {
  const M = [[18, 7], [25, 6]];
  const out = [];
  for (let r = 0; r < 51; r++) {
    let S = seedOrder === "Ac,R" ? [24, R[r]] : [R[r], 24];
    for (let j = 0; j < 127; j++) {
      const i = 254 * r + 2 * j;
      const x = [src[i], src[i + 1]];
      out.push(...(decode ? sub(x, S) : add(x, S)));
      const next = [
        mod(M[0][0] * S[0] + M[0][1] * S[1]),
        mod(M[1][0] * S[0] + M[1][1] * S[1])
      ];
      S = add(next, Q[j]);
    }
  }
  return out;
}

function exponentStateTransform(src, R, Q, alpha, seedOrder, decode) {
  const out = [];
  for (let r = 0; r < 51; r++) {
    let S = seedOrder === "Ac,R" ? [24, R[r]] : [R[r], 24];
    for (let j = 0; j < 127; j++) {
      const i = 254 * r + 2 * j;
      const x = [src[i], src[i + 1]];
      out.push(...(decode ? sub(x, S) : add(x, S)));
      S = add(mul(alpha, S), Q[j]);
    }
  }
  return out;
}
function twoCycleTransform(src, R, Q, zL, zR, rowClock, kind, direction, decode) {
  const out = [];
  for (let r = 0; r < 51; r++) {
    const rowExponent = rowClock === "ordinal" ? r : R[r];
    const left = pow(zL, rowExponent);
    let right = [1, 0];
    for (let j = 0; j < 127; j++) {
      const K = mul(mul(left, right), Q[j]);
      const i = 254 * r + 2 * j;
      const x = [src[i], src[i + 1]];
      let y;
      if (kind === "additive") {
        if (decode) y = direction === "minus" ? sub(x, K) : add(x, K);
        else y = direction === "minus" ? add(x, K) : sub(x, K);
      } else {
        const Ki = fieldInv(K);
        if (decode) y = direction === "divide" ? mul(x, Ki) : mul(x, K);
        else y = direction === "divide" ? mul(x, K) : mul(x, Ki);
      }
      out.push(...y);
      right = mul(right, zR);
    }
  }
  return out;
}

function main() {
  const corpus = readJSON("resources/liber-primus/lp2-corpus.json");
  const ink = readJSON("resources/liber-primus/lp2-ink-annotations.json");
  const grid = readJSON("resources/liber-primus/lp2-grid-256.json");
  const transcript = readText("resources/lp2-transcription.txt").split("%");

  // Counts are from Agent 31's original-image segmentation of physical p57. A published GIMP Dissolve reconstruction strongly confounds their interpretation; do not treat them as source-selected without a residual-mask comparison.
  // crop x=350..2049/y=1900..3449; 8-connected; thresholds 40..200.
  const stipple = { total: 574, large: 2, small: 572, left: 241, right: 331, radix: 13 };
  assert.equal(stipple.left + stipple.right, stipple.small);
  assert.equal(stipple.total, 7 * (51 + 31));
  assert.deepEqual([Math.floor(stipple.left / 13), stipple.left % 13], [18, 7]);
  assert.deepEqual([Math.floor(stipple.right / 13), stipple.right % 13], [25, 6]);

  const p57 = corpus.pages.find(p => p.page === 57);
  const red57 = (ink.pages.find(p => p.page === 57).red_spans || [])
    .find(s => s.start === 0 && s.length === 7);
  assert.ok(red57);
  const red57Indices = p57.indices.slice(0, 7);
  assert.equal(red57Indices.map(i => corpus.translit[i]).join(""), "PARABLE");
  assert.equal(red57Indices[6], 18);
  const runeSet = new Set(corpus.runes);
  const wordGroups = transcript[56].split(".")
    .map(part => part.split("-").map(word => [...word].filter(r => runeSet.has(r)))
      .filter(word => word.length > 0))
    .filter(group => group.length > 0);
  const wordCounts = wordGroups.map(group => group.length);
  assert.deepEqual(wordCounts, [1, 7, 6, 6]);

  // Reading A: quotient/remainder by the 13-dot marker -> a 2x2 F29 matrix.
  const M = [[Math.floor(stipple.left / 13), stipple.left % 13],
             [Math.floor(stipple.right / 13), stipple.right % 13]];
  assert.deepEqual(M, [[18, 7], [25, 6]]);
  assert.equal(matrixOrder(M), 105);
  assert.equal(mod(M[0][0] * M[1][1] - M[0][1] * M[1][0]), 20);

  // Reading B: 241 and 331 are prime ordinals 53 and 67.
  assert.equal(nthPrime(53), 241);
  assert.equal(nthPrime(67), 331);
  const p32 = corpus.pages.find(p => p.page === 32).indices;
  assert.equal(p32.length, 121);
  assert.deepEqual([Math.floor(53 / 11), 53 % 11], [4, 9]);
  assert.deepEqual([Math.floor(67 / 11), 67 % 11], [6, 1]);
  const zL = [mod(corpus.prime[p32[53]]), mod(corpus.prime[p32[67]])];
  const zR = [mod(corpus.prime[p32[67]]), mod(corpus.prime[p32[53]])];
  assert.deepEqual(zL, [14, 11]); // GP-prime weights 101,11
  assert.deepEqual(zR, [11, 14]);
  const u = [0, 1];
  assert.deepEqual(pow(u, 50), zL);
  assert.deepEqual(pow(u, 588), zR);
  assert.equal(fieldOrder(u), 840);
  assert.equal(fieldOrder(zL), 84);
  assert.equal(fieldOrder(zR), 10);
  const alpha241 = pow(u, 241), alpha331 = pow(u, 331);
  const exponentRatio = mul(alpha331, fieldInv(alpha241));
  assert.deepEqual(alpha241, [0, 20]);
  assert.deepEqual(alpha331, [0, 26]);
  assert.deepEqual(exponentRatio, [10, 0]);
  assert.equal(fieldOrder(exponentRatio), 28);

  const p53 = corpus.pages.find(p => p.page === 53).indices;
  const p54 = corpus.pages.find(p => p.page === 54).indices;
  const p55 = corpus.pages.find(p => p.page === 55).indices;
  const red53 = (ink.pages.find(p => p.page === 53).red_spans || [])
    .find(s => s.start === 128 && s.length === 51);
  assert.ok(red53);
  const R = p53.slice(128);
  assert.equal(R.length, 51);
  assert.equal(p54[0], 24);
  assert.equal(p55.length, 76);

  const all = corpus.pages.filter(p => p.page <= 55).flatMap(p => p.indices);
  assert.equal(all.length, 12956);
  assert.deepEqual(all.slice(0, 2), [15, 8]);
  const payload = all.slice(2);
  assert.equal(payload.length, 12954);
  const Q = quotientPairs(grid.bytes);
  assert.equal(Q.length, 127);
  assert.equal(Q.filter(x => x[0] !== 0 || x[1] !== 0).length, 127);

  const sh = nativeGP(readText("resources/control/shakespeare_first300k.txt"), corpus.translit);
  const gi = nativeGP(readText("resources/control/gibran_prophet_58585.txt"), corpus.translit);
  const em = nativeGP(readText("resources/control/emerson_essays_2944.txt"), corpus.translit);
  const model = train(sh);
  const plant = sh.slice(0, payload.length);
  assert.equal(plant.length, payload.length);

  const matrixStateVariants = [];
  for (const seedOrder of ["Ac,R", "R,Ac"]) {
    const decoded = matrixStateTransform(payload, R, Q, seedOrder, true);
    const encoded = matrixStateTransform(decoded, R, Q, seedOrder, false);
    assert.deepEqual(encoded, payload);
    const plantedCipher = matrixStateTransform(plant, R, Q, seedOrder, false);
    const plantedPlain = matrixStateTransform(plantedCipher, R, Q, seedOrder, true);
    assert.deepEqual(plantedPlain, plant);
    matrixStateVariants.push({
      seedOrder, ioc: ioc(decoded), trigram: score(decoded, model),
      first24: decoded.slice(0, 24).map(i => corpus.translit[i]).join(" "),
      originalReencrypt: true, plantRecovered: plantedPlain.length
    });
  }

  const exponentStateVariants = [];
  for (const [name, alpha] of [["u^241", alpha241], ["u^331", alpha331]]) {
    for (const seedOrder of ["Ac,R", "R,Ac"]) {
      const decoded = exponentStateTransform(payload, R, Q, alpha, seedOrder, true);
      const encoded = exponentStateTransform(decoded, R, Q, alpha, seedOrder, false);
      assert.deepEqual(encoded, payload);
      const plantedCipher = exponentStateTransform(plant, R, Q, alpha, seedOrder, false);
      const plantedPlain = exponentStateTransform(plantedCipher, R, Q, alpha, seedOrder, true);
      assert.deepEqual(plantedPlain, plant);
      exponentStateVariants.push({
        multiplier: name, seedOrder, ioc: ioc(decoded), trigram: score(decoded, model),
        first24: decoded.slice(0, 24).map(i => corpus.translit[i]).join(" "),
        originalReencrypt: true, plantRecovered: plantedPlain.length
      });
    }
  }

  const additiveVariants = [];
  for (const rowClock of ["ordinal", "red-rune"]) {
    for (const direction of ["minus", "plus"]) {
      const decoded = twoCycleTransform(payload, R, Q, zL, zR, rowClock, "additive", direction, true);
      const encoded = twoCycleTransform(decoded, R, Q, zL, zR, rowClock, "additive", direction, false);
      assert.deepEqual(encoded, payload);
      const plantedCipher = twoCycleTransform(plant, R, Q, zL, zR, rowClock, "additive", direction, false);
      const plantedPlain = twoCycleTransform(plantedCipher, R, Q, zL, zR, rowClock, "additive", direction, true);
      assert.deepEqual(plantedPlain, plant);
      additiveVariants.push({
        rowClock, plaintextRule: direction === "minus" ? "P=C-K" : "P=C+K",
        ioc: ioc(decoded), trigram: score(decoded, model),
        first24: decoded.slice(0, 24).map(i => corpus.translit[i]).join(" "),
        originalReencrypt: true, plantRecovered: plantedPlain.length
      });
    }
  }

  const multiplicativeVariants = [];
  for (const rowClock of ["ordinal", "red-rune"]) {
    for (const direction of ["divide", "multiply"]) {
      const decoded = twoCycleTransform(payload, R, Q, zL, zR, rowClock, "multiplicative", direction, true);
      const encoded = twoCycleTransform(decoded, R, Q, zL, zR, rowClock, "multiplicative", direction, false);
      assert.deepEqual(encoded, payload);
      const plantedCipher = twoCycleTransform(plant, R, Q, zL, zR, rowClock, "multiplicative", direction, false);
      const plantedPlain = twoCycleTransform(plantedCipher, R, Q, zL, zR, rowClock, "multiplicative", direction, true);
      assert.deepEqual(plantedPlain, plant);
      multiplicativeVariants.push({
        rowClock, plaintextRule: direction === "divide" ? "P=C/K" : "P=C*K",
        ioc: ioc(decoded), trigram: score(decoded, model),
        first24: decoded.slice(0, 24).map(i => corpus.translit[i]).join(" "),
        originalReencrypt: true, plantRecovered: plantedPlain.length
      });
    }
  }

  const controls = {
    shakespeare: windowStats(sh, model, payload.length),
    gibran: windowStats(gi, model, payload.length),
    emerson: windowStats(em, model, payload.length)
  };
  const allVariants = [...matrixStateVariants, ...exponentStateVariants, ...additiveVariants, ...multiplicativeVariants];
  const best = Math.max(...allVariants.map(x => x.trigram));
  const lowestNativeMinimum = Math.min(controls.shakespeare.min, controls.gibran.min, controls.emerson.min);
  const raw = { ioc: ioc(payload), trigram: score(payload, model) };

  console.log(JSON.stringify({
    source: {
      originalImage: "resources/liber-primus/74.jpg",
      componentMeasurement: stipple,
      crop: "x=350..2049, y=1900..3449; 8-connected; thresholds 40,80,120,160,200",
      574Identity: "7*(51+31)",
      sideCountDecompositionBy13: [[18, 7], [25, 6]],
      matrixM: M, matrixOrder: matrixOrder(M), matrixDeterminant: 20,
      parableWordCounts: wordCounts, p57RedHeading: "PARABLE",
      p32SelectedOffsets: [53, 67], p32Coordinates: [[4, 9], [6, 1]],
      p32PrimeWeights: [101, 11], zL, zR, alpha241, alpha331, exponentRatio,
      fieldBasis: "u^2=8+3u", zLExponent: 50, zLOrder: 84, zRExponent: 588, zROrder: 10,
      register: "2-rune header + 51 rows x 127 adjacent GF(29^2) pairs",
      p53RedSeedCount: R.length, p54Ac: p54[0], quotientPairs: Q.length
    },
    raw, controls, matrixStateVariants, exponentStateVariants, additiveVariants, multiplicativeVariants,
    bestCandidateTrigram: best,
    natsBelowLowestNativeControlMinimum: lowestNativeMinimum - best,
    decision: "All fourteen source-fixed variants re-encrypt the original and recover their matching native-GP plants exactly, but all original outputs remain near-uniform and at least 4.82 nats/rune below the lowest same-length native-control minimum. This rejects only these direct M-state and two-cycle additive/multiplicative uses; it does not reject the 241/331 selector or the untested southeast-diagonal route."
  }, null, 2));
}
if (require.main === module) main();
module.exports = { main, mul, pow, fieldInv, quotientPairs, matrixStateTransform, twoCycleTransform };
