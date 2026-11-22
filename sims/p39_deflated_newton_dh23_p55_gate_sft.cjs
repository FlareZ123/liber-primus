"use strict";
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const load = p => JSON.parse(fs.readFileSync(path.join(root, p), "utf8"));
const mod = n => ((n % 29) + 29) % 29;
function inverse(a) {
  assert.notEqual(mod(a), 0, "multiplicative key must be nonzero");
  for (let y = 1; y < 29; y++) if (mod(a * y) === 1) return y;
  throw new Error("no GF(29) inverse");
}
function powMod(a, e, m) {
  let out = 1;
  while (e > 0) {
    if (e % 2) out = (out * a) % m;
    a = (a * a) % m;
    e = Math.floor(e / 2);
  }
  return out;
}
function jet(coeff, x) {
  let value = 0, derivative = 0;
  for (const c of coeff) {
    derivative = mod(derivative * x + value);
    value = mod(value * x + c);
  }
  return { value, derivative };
}
function divide(coeff, divisor) {
  const remainder = coeff.slice();
  const quotient = [];
  for (let i = 0; i <= coeff.length - divisor.length; i++) {
    const leading = remainder[i];
    quotient.push(leading);
    for (let j = 0; j < divisor.length; j++)
      remainder[i + j] = mod(remainder[i + j] - leading * divisor[j]);
  }
  const tail = remainder.slice(-(divisor.length - 1));
  assert(tail.every(x => x === 0), "source polynomial must divide exactly");
  return quotient;
}
function ioc(a) {
  const counts = Array(29).fill(0);
  for (const x of a) counts[x]++;
  return counts.reduce((s, n) => s + n * (n - 1), 0) /
    (a.length * (a.length - 1));
}
function gpEncode(text, translit) {
  const map = new Map(translit.map((s, i) => [s, i]));
  const out = [];
  for (let word of text.toUpperCase().match(/[A-Z]+/g) || []) {
    word = word.replace(/QU/g, "CW").replace(/V/g, "U")
      .replace(/K/g, "C").replace(/Z/g, "S");
    for (let i = 0; i < word.length;) {
      const pair = word.slice(i, i + 2);
      if (map.has(pair)) { out.push(map.get(pair)); i += 2; }
      else { if (map.has(word[i])) out.push(map.get(word[i])); i++; }
    }
  }
  return out;
}
function apply(input, key, operation, sign) {
  return input.map((value, i) => operation === "add"
    ? mod(value + sign * key[i])
    : mod(value * (sign === -1 ? inverse(key[i]) : key[i])));
}
function score(input, lm) {
  let total = 0;
  for (let i = 2; i < input.length; i++)
    total += lm[input[i - 2] * 841 + input[i - 1] * 29 + input[i]];
  return total / (input.length - 2);
}
function main() {
  const grid = load("resources/liber-primus/base60-grid.json");
  const corpus = load("resources/liber-primus/lp2-corpus.json");
  const ink = load("resources/liber-primus/lp2-ink-annotations.json");
  const english = fs.readFileSync(path.join(root, "resources/control/shakespeare_first300k.txt"), "utf8");
  const bytes = grid.byte_rows.flat();
  assert.equal(bytes.length, 256);
  assert.equal(crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
    "3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290");
  const P = bytes.map(mod);
  assert.deepEqual(jet(P, 15), { value: 27, derivative: 5 });
  assert.deepEqual(jet(P, 24), { value: 0, derivative: 0 });
  const p39 = ink.pages.find(p => p.page === 39);
  const p54 = ink.pages.find(p => p.page === 54);
  const red39 = p39.red_spans.find(s => s.start === 119 && s.length === 3);
  const red54 = p54.red_spans.find(s => s.start === 0 && s.length === 9);
  assert.deepEqual([...red39.runes].map(r => corpus.runes.indexOf(r)), [27, 5, 15]);
  assert.equal(corpus.runes.indexOf([...red54.runes][0]), 24);
  const Q = divide(divide(P, [1, 5]), [1, 5]);
  assert.equal(Q.length - 1, 253);
  assert.deepEqual(jet(Q, 15), { value: 10, derivative: 3 });
  assert.deepEqual(jet(Q, 24), { value: 26, derivative: 6 });
  const firstCorrection = mod(jet(Q, 15).value * inverse(jet(Q, 15).derivative));
  const firstSuccessor = mod(15 - firstCorrection);
  assert.equal(firstCorrection, 13);
  assert.equal(firstSuccessor, 2);
  assert.equal(powMod(5, 6, 23), 8);
  assert.equal(powMod(5, 15, 23), 19);
  assert.equal(powMod(19, 6, 23), 2);

  const orbit = [15], corrections = [], seen = new Map([[15, 0]]);
  let state = 15;
  while (true) {
    const j = jet(Q, state);
    assert.notEqual(j.derivative, 0, "Newton orbit hit a critical point");
    const correction = mod(j.value * inverse(j.derivative));
    corrections.push(correction);
    const next = mod(state - correction);
    if (seen.has(next)) { orbit.push(next); break; }
    seen.set(next, orbit.length);
    orbit.push(next);
    state = next;
  }
  const cycleStart = seen.get(orbit[orbit.length - 1]);
  const cycleLength = orbit.length - 1 - cycleStart;
  assert.deepEqual(orbit, [15, 2, 11, 3, 6, 28, 16, 24, 10, 17, 6]);
  assert.deepEqual(corrections, [13, 20, 8, 26, 7, 12, 21, 14, 22, 11]);
  assert.equal(cycleStart, 4);
  assert.equal(cycleLength, 6);
  const stateAt = n => n < orbit.length - 1
    ? orbit[n] : orbit[cycleStart + ((n - cycleStart) % cycleLength)];
  const correctionAt = n => mod(stateAt(n) - stateAt(n + 1));

  const unknownPages = corpus.pages.filter(p => p.page <= 55 && p.indices.length);
  const unknown = unknownPages.flatMap(p => p.indices);
  assert.equal(unknownPages.length, 55);
  assert.equal(unknown.length, 12956);
  const p55 = corpus.pages.find(p => p.page === 55).indices;
  assert.equal(p55.length, 76);
  const p39Start = corpus.pages.filter(p => p.page < 39).reduce((s, p) => s + p.indices.length, 0);
  const p55Start = corpus.pages.filter(p => p.page < 55).reduce((s, p) => s + p.indices.length, 0);
  const anchor = p39Start + red39.start + 2;
  const p55Gap = p55Start - anchor;
  assert.equal(p39Start, 9400);
  assert.equal(anchor, 9521);
  assert.equal(p55Start, 12880);
  assert.equal(p55Gap, 3359);
  const suffix = unknown.slice(anchor + 1);
  assert.equal(suffix.length, 3434);
  const suffixStateKey = Array.from({ length: suffix.length }, (_, i) => stateAt(i + 1));
  const suffixCorrectionKey = Array.from({ length: suffix.length }, (_, i) => correctionAt(i));
  const p55StateKey = Array.from({ length: 76 }, (_, i) => stateAt(p55Gap + i));
  const p55CorrectionKey = Array.from({ length: 76 }, (_, i) => correctionAt(p55Gap - 1 + i));
  assert.deepEqual(p55StateKey.slice(0, 12), [28, 16, 24, 10, 17, 6, 28, 16, 24, 10, 17, 6]);
  assert.deepEqual(p55CorrectionKey.slice(0, 12), [7, 12, 21, 14, 22, 11, 7, 12, 21, 14, 22, 11]);

  const gp = gpEncode(english, corpus.translit);
  assert(gp.length > 162956);
  const tri = new Uint32Array(29 ** 3), bi = new Uint32Array(29 ** 2);
  for (let i = 2; i < 100000; i++) {
    tri[gp[i - 2] * 841 + gp[i - 1] * 29 + gp[i]]++;
    bi[gp[i - 2] * 29 + gp[i - 1]]++;
  }
  const lm = Float64Array.from({ length: 29 ** 3 }, (_, i) =>
    Math.log((tri[i] + 0.25) / (bi[Math.floor(i / 29)] + 7.25)));
  const rawSuffixScore = score(suffix, lm), rawP55Score = score(p55, lm), rawP55IoC = ioc(p55);
  const referenceSuffix = gp.slice(150000, 150000 + suffix.length);
  const referenceP55 = gp.slice(150000, 150000 + 76);

  const tests = [];
  let positiveControls = 0;
  const solvedP57 = corpus.pages.find(p => p.page === 57).indices;
  const plant = Array.from({ length: 76 }, (_, i) => solvedP57[i % solvedP57.length]);
  for (const [readout, suffixKey, p55Key] of [
    ["state", suffixStateKey, p55StateKey],
    ["correction", suffixCorrectionKey, p55CorrectionKey]
  ]) {
    for (const operation of ["add", "mul"]) for (const sign of [-1, 1]) {
      const outSuffix = apply(suffix, suffixKey, operation, sign);
      const outP55 = apply(p55, p55Key, operation, sign);
      const plantedCipher = apply(plant, p55Key, operation, -sign);
      const recovered = apply(plantedCipher, p55Key, operation, sign);
      assert.deepEqual(recovered, plant);
      positiveControls++;
      tests.push({
        readout,
        operation: operation === "add"
          ? (sign === -1 ? "C-K" : "C+K")
          : (sign === -1 ? "C/K" : "C*K"),
        p55Score: score(outP55, lm),
        p55IoC: ioc(outP55),
        suffixScore: score(outSuffix, lm),
        suffixIoC: ioc(outSuffix),
        p55First12Key: p55Key.slice(0, 12)
      });
    }
  }
  assert.equal(positiveControls, 8);
  assert(tests.every(t => t.p55Score < rawP55Score),
    "every fixed p55 candidate must score below raw p55");
  console.log(JSON.stringify({
    classification: "bounded negative for direct deflated-Q Newton state/correction GP29 keys on p55; no unknown plaintext or key",
    source: {
      p50BytesSha256: crypto.createHash("sha256").update(Buffer.from(bytes)).digest("hex"),
      p39Jet: [27, 5, 15], p54RedSpanLength: red54.length, p54FirstRuneIndex: 24,
      p50PolynomialDoubleRoot24: jet(P, 24), quotient: "Q=P/(X-24)^2 over GF(29)",
      quotientDegree: Q.length - 1, Q15: jet(Q, 15),
      firstNewtonCorrection: firstCorrection, firstNewtonSuccessor: firstSuccessor,
      signedDH23: { modulus: 23, generator: 5, clientExponent: 15,
        serverExponent: 6, serverPublic: 8, clientPublic: 19, sharedSecret: 2 }
    },
    orbit: { states: orbit, corrections, cycleStart, cycleLength },
    target: { anchorGlobalOffset: anchor, p55GlobalOffset: p55Start,
      distance: p55Gap, p55Runes: p55.length, suffixRunes: suffix.length,
      p55StateKey, p55CorrectionKey },
    raw: { suffixScore: rawSuffixScore, p55Score: rawP55Score, p55IoC },
    nativeReference: { suffixScore: score(referenceSuffix, lm), p55Score: score(referenceP55, lm) },
    tests, positiveControls: { exactP55PlantsRecovered: positiveControls, passed: true },
    finding: "All eight source-fixed p55 additive/multiplicative state/correction outputs score below raw p55. The first Newton successor matches DH23 shared secret 2, but this operation does not decrypt p55."
  }, null, 2));
}
if (require.main === module) main();
