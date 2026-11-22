"use strict";
/**
 * Signed 2013 BASE29/DH23 examples -> exact LP2 lag-six GP29 echo.
 * The three input parameters originate independently of LP2:
 *   BASE29 3301 -> 3QO ends in GP digit 24;
 *   DH23 g=5, server A=8 -> private exponent 6;
 *   DH23 client B=19 -> shared secret 2.
 *
 * Retrospective candidate association; this is NOT a decipherment.
 * Read-only CJS SFT, no external packages.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {parseLP2Words} = require("./lp2_word_pages.cjs");
const ROOT = path.resolve(__dirname, "..");
const read = p => fs.readFileSync(path.join(ROOT, p), "utf8");
const corpus = JSON.parse(read("resources/liber-primus/lp2-corpus.json"));
const ink = JSON.parse(read("resources/liber-primus/lp2-ink-annotations.json"));
const grid = JSON.parse(read("resources/liber-primus/lp2-grid-256.json"));
const historical = read("resources/external/2013-tcp-server-signed-source.md");
const mod = (x, n) => ((x % n) + n) % n;
function power(base, exponent, modulo) {
  let acc = 1;
  for (let i = 0; i < exponent; i++) acc = acc * base % modulo;
  return acc;
}
function factorRemainder(coefficients, divisor) {
  const num = coefficients.slice(), L = divisor.length - 1;
  let inv = -1;
  for (let k = 1; k < 29; k++) if ((divisor[L] * k) % 29 === 1) inv = k;
  assert.ok(inv !== -1);
  for (let i = num.length - 1; i >= L; i--) {
    const q = mod(num[i] * inv, 29);
    for (let j = 0; j <= L; j++)
      num[i - L + j] = mod(num[i - L + j] - q * divisor[j], 29);
  }
  return num.slice(0, L);
}
const GP29 = new Map(corpus.runes.map((x, i) => [x, i]));
function withinWord(words, lag, slope, intercept) {
  let eligible = 0, matches = 0, firstHalf = 0, secondHalf = 0;
  const split = words.length / 2;
  for (let wIndex = 0; wIndex < words.length; wIndex++) {
    const w = [...words[wIndex].runes].map(x => GP29.get(x));
    for (let i = lag; i < w.length; i++) {
      eligible++;
      if (w[i] !== mod(slope * w[i - lag] + intercept, 29)) continue;
      matches++;
      if (wIndex < split) firstHalf++; else secondHalf++;
    }
  }
  return {lag, slope, intercept, eligible, matches, firstHalf, secondHalf};
}
function main() {
  assert.ok(historical.includes("BASE29 3301 → 3QO"));
  assert.ok(historical.includes("server base 5 and public share 8"));
  assert.ok(historical.includes("client public share 19, shared key 2"));
  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRS";
  const expansion = [..."3QO"].map(d => alphabet.indexOf(d));
  assert.deepEqual(expansion, [3, 26, 24]);
  assert.equal(expansion.reduce((n, d) => 29 * n + d, 0), 3301);

  const groupModulus = 23, generator = 5;
  const serverPublic = 8, clientPublic = 19, shared = 2;
  const a = [...Array(groupModulus - 1).keys()]
    .filter(n => power(generator, n + 1, groupModulus) === serverPublic)
    .map(n => n + 1);
  const b = [...Array(groupModulus - 1).keys()]
    .filter(n => power(generator, n + 1, groupModulus) === clientPublic)
    .map(n => n + 1);
  assert.deepEqual(a, [6]);
  assert.deepEqual(b, [15]);
  assert.equal(power(clientPublic, a[0], groupModulus), shared);
  assert.equal(power(serverPublic, b[0], groupModulus), shared);
  const source = {lag: a[0], slope: mod(-shared, 29), intercept: expansion[2]};
  assert.deepEqual(source, {lag:6, slope:27, intercept:24});

  const p39 = ink.pages.find(p => p.page === 39).red_spans[0];
  const p39cipher = corpus.pages.find(p => p.page === 39).indices;
  const originalTriad = p39cipher.slice(p39.start, p39.start + p39.length);
  const sourceDH = [mod(-shared, 29), generator, b[0]];
  assert.deepEqual(originalTriad, [27,5,15]);
  assert.deepEqual(originalTriad, sourceDH);

  const bytes = grid.pages.flatMap(p => p.bytes);
  assert.deepEqual(grid.pages.map(p => p.bytes.length), [80,104,72]);
  assert.equal(bytes.length, 256);
  const polynomial = bytes.slice().reverse().map(b => b % 29);
  const H = [3,26,24]; // historical BASE29 ascending digits
  const G = originalTriad;
  assert.deepEqual(factorRemainder(polynomial, H), [0,0]);
  assert.deepEqual(factorRemainder(polynomial, G), [0,0]);

  const original = parseLP2Words(read("resources/liber-primus/lp2-transcription.txt"));
  assert.equal(original.words.length, 2896);
  assert.equal(original.runeCount, 12956);
  const live = withinWord(original.words, source.lag, -2, source.intercept);
  assert.deepEqual(live, {
    lag:6, slope:-2, intercept:24, eligible:1290, matches:80,
    firstHalf:40, secondHalf:40
  });
  const sourceLagControls = [2,5,6,8].map(l =>
    withinWord(original.words, l, -2, 24));
  assert.deepEqual(sourceLagControls.map(x => x.matches), [257,59,80,11]);
  assert.deepEqual(sourceLagControls.map(x => x.eligible), [7247,2105,1290,388]);
  const wrongSign = withinWord(original.words, 6, +2, 24);
  assert.equal(wrongSign.matches, 34);

  // Exact forward, source-fixed six-back target on an independent synthetic word.
  const planted = [4,8,12,16,20,24];
  for (let i = 6; i < 29; i++)
    planted.push(mod(-2 * planted[i - 6] + 24, 29));
  for (let i = 6; i < planted.length; i++)
    assert.equal(planted[i], mod(-2 * planted[i - 6] + 24, 29));

  console.log(JSON.stringify({
    source, expansion, dh:{generator, groupModulus, serverPublic,
      clientPublic, serverExponent:a[0], clientExponent:b[0], shared},
    exactOriginalRedTriad:originalTriad,
    originalGridQuadraticRemainders:{BASE29: [0,0], DH:[0,0]},
    sourceLagControls, wrongSign,
    originalWordLag6:live,
    knownPriorFullAffineScan:"lag 6, slope -2, intercept 24 was unique 80-hit maximum among 812 affines; see lp1-p40-cayley-t6-source-bridge.md",
    classification:"retrospective source-to-original match, no plaintext or recovered encryption rule"
  }, null, 2));
  console.log("PASS signed historical parameters, original red triad, both grid factor constraints, source lag contrast, synthetic forward plant");
}
if (require.main === module) main();
module.exports = {factorRemainder,withinWord};
